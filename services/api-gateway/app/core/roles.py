"""Canonical application roles shared by schemas and authorization policy."""

from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"


ALL_ROLES = (UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
