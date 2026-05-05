"""initial schema

Revision ID: 202605051200
Revises:
Create Date: 2026-05-05

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "202605051200"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "specialties",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_specialties_slug"), "specialties", ["slug"], unique=True)

    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_admin_users_email"), "admin_users", ["email"], unique=True)

    op.create_table(
        "availability_slots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("specialty_id", sa.Integer(), nullable=True),
        sa.Column("slot_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["specialty_id"],
            ["specialties.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_availability_slots_slot_date"), "availability_slots", ["slot_date"], unique=False)
    op.create_index(
        op.f("ix_availability_slots_specialty_id"), "availability_slots", ["specialty_id"], unique=False
    )

    op.create_table(
        "appointment_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("patient_name", sa.String(length=200), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("specialty_id", sa.Integer(), nullable=False),
        sa.Column("preferred_date", sa.Date(), nullable=True),
        sa.Column("preferred_time", sa.String(length=20), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("availability_slot_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["availability_slot_id"],
            ["availability_slots.id"],
        ),
        sa.ForeignKeyConstraint(
            ["specialty_id"],
            ["specialties.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_appointment_requests_specialty_id"), "appointment_requests", ["specialty_id"], unique=False
    )
    op.create_index(
        op.f("ix_appointment_requests_status"), "appointment_requests", ["status"], unique=False
    )
    op.create_index(
        op.f("ix_appointment_requests_availability_slot_id"),
        "appointment_requests",
        ["availability_slot_id"],
        unique=False,
    )

    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("subject", sa.String(length=200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("contact_messages")
    op.drop_index(op.f("ix_appointment_requests_availability_slot_id"), table_name="appointment_requests")
    op.drop_index(op.f("ix_appointment_requests_status"), table_name="appointment_requests")
    op.drop_index(op.f("ix_appointment_requests_specialty_id"), table_name="appointment_requests")
    op.drop_table("appointment_requests")
    op.drop_index(op.f("ix_availability_slots_specialty_id"), table_name="availability_slots")
    op.drop_index(op.f("ix_availability_slots_slot_date"), table_name="availability_slots")
    op.drop_table("availability_slots")
    op.drop_index(op.f("ix_admin_users_email"), table_name="admin_users")
    op.drop_table("admin_users")
    op.drop_index(op.f("ix_specialties_slug"), table_name="specialties")
    op.drop_table("specialties")
