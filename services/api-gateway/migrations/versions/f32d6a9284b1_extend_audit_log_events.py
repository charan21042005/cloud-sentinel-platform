"""Extend persisted audit events for actors, outcomes, and safe context.

Revision ID: f32d6a9284b1
Revises: c4d62ae98510
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "f32d6a9284b1"
down_revision: Union[str, None] = "c4d62ae98510"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("audit_logs", sa.Column("actor_user_id", sa.UUID(), nullable=True))
    op.add_column(
        "audit_logs",
        sa.Column("outcome", sa.String(length=20), nullable=True),
    )
    op.add_column("audit_logs", sa.Column("target_type", sa.String(length=50), nullable=True))
    op.add_column("audit_logs", sa.Column("target_id", sa.String(length=100), nullable=True))
    op.add_column(
        "audit_logs",
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.create_foreign_key(
        "fk_audit_logs_actor_user_id_users",
        "audit_logs",
        "users",
        ["actor_user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_user_id", table_name="audit_logs")
    op.drop_constraint("fk_audit_logs_actor_user_id_users", "audit_logs", type_="foreignkey")
    op.drop_column("audit_logs", "details")
    op.drop_column("audit_logs", "target_id")
    op.drop_column("audit_logs", "target_type")
    op.drop_column("audit_logs", "outcome")
    op.drop_column("audit_logs", "actor_user_id")
