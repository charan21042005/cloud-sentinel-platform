"""Normalize user roles and constrain the supported role set.

Revision ID: c4d62ae98510
Revises: 7de11d9f64a4
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c4d62ae98510"
down_revision: Union[str, None] = "7de11d9f64a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text("UPDATE users SET role = 'operator' WHERE role = 'analyst'"))
    with op.batch_alter_table("users") as batch_op:
        batch_op.create_check_constraint(
            "ck_users_role", "role IN ('admin', 'operator', 'viewer')"
        )


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_constraint("ck_users_role", type_="check")
