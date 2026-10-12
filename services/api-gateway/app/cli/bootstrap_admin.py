"""Create the initial administrator through an interactive local CLI only."""

import asyncio
import ipaddress
import os
import socket
import sys
from getpass import getpass
from pathlib import Path

from dotenv import dotenv_values
from pydantic import ValidationError
from sqlalchemy import func, select, text
from sqlalchemy.engine import make_url

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.models.user import User
from app.db.session import SessionLocal
from app.schemas.auth import UserRegister


class UnsafeBootstrapConfiguration(Exception):
    """The configured environment or database cannot be proven local."""


def _configured_sources() -> tuple[dict[str, str], dict[str, str]]:
    env_file = settings.model_config.get("env_file")
    if not isinstance(env_file, (str, Path)):
        raise UnsafeBootstrapConfiguration(
            "Unsupported settings env-file configuration."
        )
    file_values = {
        key: value
        for key, value in dotenv_values(env_file).items()
        if key in {"ENVIRONMENT", "DATABASE_URL"} and value is not None
    }
    process_values = {
        key: os.environ[key]
        for key in ("ENVIRONMENT", "DATABASE_URL")
        if key in os.environ
    }
    return file_values, process_values


def _resolve_local_database_host(host: str) -> bool:
    """Allow only explicit host-loopback targets; service DNS is ambiguous."""
    if host == "localhost":
        try:
            addresses = {
                ipaddress.ip_address(result[4][0])
                for result in socket.getaddrinfo(host, 5432, type=socket.SOCK_STREAM)
            }
        except (OSError, ValueError):
            return False
        return bool(addresses) and all(address.is_loopback for address in addresses)

    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def validate_bootstrap_target() -> None:
    """Fail closed unless settings resolve unambiguously to local development."""
    try:
        file_values, process_values = _configured_sources()
    except Exception:
        raise SystemExit(
            "Could not verify bootstrap configuration; no account was created."
        ) from None

    for key in ("ENVIRONMENT", "DATABASE_URL"):
        file_value = file_values.get(key)
        process_value = process_values.get(key)
        if (
            file_value is not None
            and process_value is not None
            and file_value.strip() != process_value.strip()
        ):
            raise SystemExit(
                "Conflicting environment and .env bootstrap settings; "
                "no account was created."
            )

        configured_value = process_value if process_value is not None else file_value
        resolved_value = getattr(settings, key)
        if (
            configured_value is None
            or not resolved_value
            or resolved_value.strip() != configured_value.strip()
        ):
            raise SystemExit(
                "Bootstrap settings are missing or do not match the resolved "
                "configuration; no account was created."
            )

    environment = settings.ENVIRONMENT.strip().lower() if settings.ENVIRONMENT else ""
    if environment != "development":
        raise SystemExit(
            "Bootstrap requires an explicitly configured development environment; "
            "no account was created."
        )

    if not settings.DATABASE_URL:
        raise SystemExit(
            "Bootstrap requires an explicitly configured local database URL; "
            "no account was created."
        )

    try:
        url = make_url(settings.DATABASE_URL)
    except (TypeError, ValueError):
        raise SystemExit(
            "Unsupported bootstrap database URL; no account was created."
        ) from None

    if (
        url.drivername != "postgresql+asyncpg"
        or url.host is None
        or url.port != 5432
        or url.database != "cloud_sentinel"
        or url.query
        or not _resolve_local_database_host(url.host.lower())
    ):
        raise SystemExit(
            "Bootstrap database target is not a supported local development "
            "database; no account was created."
        )


async def bootstrap_admin() -> None:
    validate_bootstrap_target()
    if not sys.stdin.isatty() or not sys.stderr.isatty():
        raise SystemExit(
            "Bootstrap requires an interactive terminal; no account was created."
        )
    async with SessionLocal() as session:
        if session.get_bind().dialect.name == "postgresql":
            await session.execute(text("SELECT pg_advisory_xact_lock(734921064)"))
        existing_admins = await session.scalar(
            select(func.count(User.id)).where(User.role == "admin")
        )
        if existing_admins:
            raise SystemExit("An administrator already exists; bootstrap refused.")

        username = input("Initial administrator username: ").strip()
        email = input("Initial administrator email: ").strip()
        password = getpass("Initial administrator password (hidden): ")
        confirmation = getpass("Confirm password (hidden): ")
        if password != confirmation:
            raise SystemExit("Passwords did not match; no account was created.")
        try:
            credentials = UserRegister(
                username=username, email=email, password=password
            )
        except ValidationError as exc:
            fields = ", ".join(sorted({str(error["loc"][0]) for error in exc.errors()}))
            raise SystemExit(
                f"Invalid administrator input ({fields}); no account was created."
            ) from None

        duplicate = await session.scalar(
            select(User.id).where(
                (User.username == credentials.username)
                | (User.email == credentials.email)
            )
        )
        if duplicate:
            raise SystemExit(
                "That username or email is already in use; no account was created."
            )

        session.add(
            User(
                username=credentials.username,
                email=credentials.email,
                hashed_password=get_password_hash(credentials.password),
                role="admin",
                is_active=True,
            )
        )
        await session.commit()

    print(
        "Initial administrator created. Store the password in your approved "
        "password manager."
    )


if __name__ == "__main__":
    asyncio.run(bootstrap_admin())
