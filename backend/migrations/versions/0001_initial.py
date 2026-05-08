from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "competition_types",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
    )
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String(100), unique=True, nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
    )
    op.create_table(
        "ranks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(50), unique=True, nullable=False),
    )
    op.create_table(
        "teams",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("phone", sa.String(20)),
        sa.Column("rank_id", sa.Integer, sa.ForeignKey("ranks.id", ondelete="SET NULL")),
        sa.Column("team_id", sa.Integer, sa.ForeignKey("teams.id", ondelete="SET NULL")),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "competitions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("date_start", sa.Date, nullable=False),
        sa.Column("date_end", sa.Date, nullable=False),
        sa.Column("registration_deadline", sa.Date, nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("image_url", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("type_id", sa.Integer, sa.ForeignKey("competition_types.id"), nullable=False),
        sa.Column("admin_id", sa.Integer, sa.ForeignKey("admins.id"), nullable=False),
    )
    op.create_table(
        "registrations",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("registered_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("competition_id", sa.Integer, sa.ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("user_id", "competition_id", name="uq_user_competition"),
    )
    op.create_table(
        "protocols",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("competition_id", sa.Integer, sa.ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("protocols")
    op.drop_table("registrations")
    op.drop_table("competitions")
    op.drop_table("users")
    op.drop_table("teams")
    op.drop_table("ranks")
    op.drop_table("admins")
    op.drop_table("competition_types")
