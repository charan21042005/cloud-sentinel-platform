"""Create the initial administrator through an interactive local CLI only."""

import asyncio
import json
import ipaddress
import os
import socket
import subprocess
import sys
from dataclasses import dataclass
from getpass import getpass
from pathlib import Path

from dotenv import dotenv_values
from pydantic import ValidationError
from sqlalchemy import func, select, text
from sqlalchemy.engine import make_url

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.models.audit_log import AuditLog
from app.db.models.user import User
from app.db.session import SessionLocal
from app.schemas.auth import UserRegister


class UnsafeBootstrapConfiguration(Exception):
    """The configured environment or database cannot be proven local."""


@dataclass(frozen=True)
class VerifiedComposeTarget:
    api_container_id: str
    database_ip: str


@dataclass(frozen=True)
class BootstrapTarget:
    url: object
    compose_target: VerifiedComposeTarget | None = None


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


def _docker_json(*arguments: str):
    """Read Docker metadata without allowing command output into logs."""
    try:
        result = subprocess.run(
            ["docker", *arguments],
            check=True,
            capture_output=True,
            text=True,
            timeout=15,
        )
        return json.loads(result.stdout)
    except Exception:
        raise UnsafeBootstrapConfiguration(
            "Could not verify the local Docker database target."
        ) from None


def _normal_path(value: str) -> str:
    return os.path.normcase(os.path.realpath(value))


def _verify_local_compose_database(url) -> VerifiedComposeTarget | None:
    """Prove the API and DB are this repository's running local Compose services."""
    repo_root = Path(__file__).resolve().parents[4]
    compose_file = repo_root / "infrastructure" / "docker" / "docker-compose.yml"
    compose_dir = compose_file.parent

    try:
        contexts = _docker_json("context", "inspect")
        endpoints = [
            context.get("Endpoints", {}).get("docker", {}).get("Host", "")
            for context in contexts
        ]
        if not endpoints or any(
            endpoint not in {
                "npipe:////./pipe/docker_engine",
                "unix:///var/run/docker.sock",
                "unix:///run/docker.sock",
            }
            for endpoint in endpoints
        ):
            return False

        # Capture resolved Compose data in memory only; it can contain credentials.
        compose_result = subprocess.run(
            [
                "docker", "compose", "-f", str(compose_file),
                "--project-directory", str(compose_dir), "config", "--format", "json",
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        )
        compose = json.loads(compose_result.stdout)
        db = compose["services"]["postgres"]
        api_service = compose["services"]["api-gateway"]
        environment = db.get("environment", {})
        api_environment = api_service.get("environment", {})
        if not isinstance(environment, dict) or not isinstance(api_environment, dict):
            return False
        if (
            compose.get("name") != "docker"
            or db.get("image") != "postgres:16"
            or db.get("container_name") != "sentinel-postgres"
            or environment.get("POSTGRES_DB") != "cloud_sentinel"
            or environment.get("POSTGRES_USER") != url.username
            or environment.get("POSTGRES_PASSWORD") != url.password
            or make_url(api_environment.get("DATABASE_URL", "")) != url
        ):
            return False
        if (
            compose.get("networks", {})
            .get("cloud-sentinel-network", {})
            .get("name") != "cloud-sentinel-network"
            or compose.get("volumes", {})
            .get("postgres_data", {})
            .get("name") != "sentinel_postgres_data"
            or not any(
                port.get("target") == 5432 and str(port.get("published")) == "5432"
                for port in db.get("ports", [])
            )
            or not any(
                volume.get("source") == "postgres_data"
                and volume.get("target") == "/var/lib/postgresql/data"
                for volume in db.get("volumes", [])
            )
        ):
            return False

        container_list = _docker_json("inspect", "sentinel-postgres")
        if len(container_list) != 1:
            return False
        container = container_list[0]
        labels = container.get("Config", {}).get("Labels", {}) or {}
        config_paths = labels.get("com.docker.compose.project.config_files", "")
        working_dir = labels.get("com.docker.compose.project.working_dir", "")
        if (
            labels.get("com.docker.compose.project") != "docker"
            or labels.get("com.docker.compose.service") != "postgres"
            or not working_dir
            or _normal_path(working_dir) != _normal_path(str(compose_dir))
            or _normal_path(str(compose_file))
            not in {_normal_path(path.strip()) for path in config_paths.split(",")}
        ):
            return False

        state = container.get("State", {})
        if (
            container.get("Config", {}).get("Image") != "postgres:16"
            or not state.get("Running")
            or state.get("Health", {}).get("Status") != "healthy"
        ):
            return False
        container_env = {}
        for entry in container.get("Config", {}).get("Env", []):
            key, separator, value = entry.partition("=")
            if separator:
                container_env[key] = value
        if (
            container_env.get("POSTGRES_DB") != environment.get("POSTGRES_DB")
            or container_env.get("POSTGRES_USER") != environment.get("POSTGRES_USER")
            or container_env.get("POSTGRES_PASSWORD") != environment.get("POSTGRES_PASSWORD")
        ):
            return False
        mounts = container.get("Mounts", [])
        if not any(
            mount.get("Type") == "volume"
            and mount.get("Name") == "sentinel_postgres_data"
            and mount.get("Destination") == "/var/lib/postgresql/data"
            for mount in mounts
        ):
            return False
        network = container.get("NetworkSettings", {}).get("Networks", {}).get(
            "cloud-sentinel-network", {}
        )
        if "postgres" not in network.get("Aliases", []):
            return False
        bindings = container.get("HostConfig", {}).get("PortBindings", {}).get("5432/tcp") or []
        if not any(binding.get("HostPort") == "5432" for binding in bindings):
            return False

        api_list = _docker_json("inspect", "sentinel-api-gateway")
        if len(api_list) != 1:
            return False
        api_container = api_list[0]
        api_labels = api_container.get("Config", {}).get("Labels", {}) or {}
        api_paths = api_labels.get("com.docker.compose.project.config_files", "")
        api_working_dir = api_labels.get("com.docker.compose.project.working_dir", "")
        if (
            api_labels.get("com.docker.compose.project") != "docker"
            or api_labels.get("com.docker.compose.service") != "api-gateway"
            or not api_working_dir
            or _normal_path(api_working_dir) != _normal_path(str(compose_dir))
            or _normal_path(str(compose_file))
            not in {_normal_path(path.strip()) for path in api_paths.split(",")}
            or not api_container.get("State", {}).get("Running")
            or api_container.get("State", {}).get("Health", {}).get("Status")
            != "healthy"
        ):
            return False
        api_env = {}
        for entry in api_container.get("Config", {}).get("Env", []):
            key, separator, value = entry.partition("=")
            if separator:
                api_env[key] = value
        if (
            api_env.get("DATABASE_URL") != api_environment.get("DATABASE_URL")
            or make_url(api_env.get("DATABASE_URL", "")) != url
        ):
            return False
        api_mounts = api_container.get("Mounts", [])
        expected_api_path = repo_root / "services" / "api-gateway"
        if not any(
            mount.get("Type") == "bind"
            and _normal_path(mount.get("Source", "")) == _normal_path(str(expected_api_path))
            and mount.get("Destination") == "/app"
            for mount in api_mounts
        ):
            return False
        api_network = api_container.get("NetworkSettings", {}).get("Networks", {}).get(
            "cloud-sentinel-network", {}
        )
        if "api-gateway" not in api_network.get("Aliases", []):
            return False

        db_ip = network.get("IPAddress", "").split("/", maxsplit=1)[0]
        ip = ipaddress.ip_address(db_ip)
        if not ip.is_private:
            return False
        return VerifiedComposeTarget(
            api_container_id=api_container.get("Id", ""), database_ip=str(ip)
        )
    except Exception:
        # Docker/Compose errors can contain resolved configuration; never print them.
        return False


def validate_bootstrap_target(
    compose_child: VerifiedComposeTarget | None = None,
) -> BootstrapTarget:
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
    ):
        raise SystemExit(
            "Bootstrap database target is not a supported local development "
            "database; no account was created."
        )

    if _resolve_local_database_host(url.host.lower()):
        if compose_child is not None:
            raise SystemExit("Invalid local Compose bootstrap handoff; no account was created.")
        return BootstrapTarget(url=url)
    if url.host.lower() == "postgres":
        if compose_child is not None:
            hostname = os.environ.get("HOSTNAME", "").lower()
            if (
                len(compose_child.api_container_id) < 12
                or not hostname.startswith(compose_child.api_container_id[:12].lower())
                or not ipaddress.ip_address(compose_child.database_ip).is_private
            ):
                raise SystemExit(
                    "Local Compose bootstrap handoff could not be verified; "
                    "no account was created."
                )
            return BootstrapTarget(url=url, compose_target=compose_child)
        verified_target = _verify_local_compose_database(url)
        if verified_target:
            return BootstrapTarget(url=url, compose_target=verified_target)
    raise SystemExit(
        "Bootstrap database target is not a supported local development "
        "database; no account was created."
    )


async def bootstrap_admin(
    compose_child: VerifiedComposeTarget | None = None,
) -> None:
    validated = validate_bootstrap_target(compose_child)
    if not sys.stdin.isatty() or not sys.stderr.isatty():
        raise SystemExit(
            "Bootstrap requires an interactive terminal; no account was created."
        )
    if validated.compose_target is not None and compose_child is None:
        try:
            worker = (
                "import asyncio,sys; "
                "from app.cli.bootstrap_admin import _bootstrap_verified_compose_child; "
                "asyncio.run(_bootstrap_verified_compose_child(sys.argv[1],sys.argv[2]))"
            )
            result = subprocess.run(
                [
                    "docker", "exec", "-it", "sentinel-api-gateway",
                    "python", "-c", worker,
                    validated.compose_target.api_container_id,
                    validated.compose_target.database_ip,
                ],
                check=False,
            )
        except Exception:
            raise SystemExit(
                "Could not start the verified local Compose bootstrap; "
                "no account was created."
            ) from None
        if result.returncode != 0:
            raise SystemExit(
                "The verified local Compose bootstrap did not complete; "
                "no account was created."
            )
        return

    async with SessionLocal() as session:
        if validated.compose_target is not None:
            row = (
                await session.execute(
                    text(
                        "SELECT current_database(), current_user, "
                        "inet_server_addr()::text"
                    )
                )
            ).one()
            try:
                server_ip = ipaddress.ip_interface(row[2]).ip
                expected_ip = ipaddress.ip_address(
                    validated.compose_target.database_ip
                )
            except (TypeError, ValueError):
                raise SystemExit(
                    "The Compose database identity could not be verified; "
                    "no account was created."
                ) from None
            url = validated.url
            if (
                row[0] != url.database
                or row[1] != url.username
                or server_ip != expected_ip
            ):
                raise SystemExit(
                    "The Compose database identity did not match; "
                    "no account was created."
                )
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
            fields = ", ".join(
                sorted({str(error["loc"][0]) for error in exc.errors()})
            )
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

        admin = User(
            username=credentials.username,
            email=credentials.email,
            hashed_password=get_password_hash(credentials.password),
            role="admin",
            is_active=True,
        )
        session.add(admin)
        await session.flush()
        session.add(
            AuditLog(
                event_type="user.created",
                message="Initial administrator created through local CLI bootstrap",
                outcome="success",
                target_type="user",
                target_id=str(admin.id),
                details={"role": "admin", "creation_source": "local_cli_bootstrap"},
            )
        )
        await session.commit()

    print(
        "Initial administrator created. Store the password in your approved "
        "password manager."
    )


async def _bootstrap_verified_compose_child(
    api_container_id: str, database_ip: str
) -> None:
    """Internal worker called only after the host CLI verifies Compose metadata."""
    await bootstrap_admin(
        VerifiedComposeTarget(
            api_container_id=api_container_id, database_ip=database_ip
        )
    )


if __name__ == "__main__":
    if len(sys.argv) == 1:
        asyncio.run(bootstrap_admin())
    else:
        raise SystemExit("Unsupported bootstrap invocation; no account was created.")
