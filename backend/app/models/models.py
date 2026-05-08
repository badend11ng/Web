from datetime import date, datetime
from typing import Optional, List

from sqlalchemy import (
    String, Integer, Date, DateTime, ForeignKey,
    UniqueConstraint, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CompetitionType(Base):
    __tablename__ = "competition_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    competitions: Mapped[List["Competition"]] = relationship(back_populates="type")


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    competitions: Mapped[List["Competition"]] = relationship(back_populates="admin")


class Rank(Base):
    __tablename__ = "ranks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    users: Mapped[List["User"]] = relationship(back_populates="rank")


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    users: Mapped[List["User"]] = relationship(back_populates="team")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    rank_id: Mapped[Optional[int]] = mapped_column(ForeignKey("ranks.id", ondelete="SET NULL"))
    team_id: Mapped[Optional[int]] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    rank: Mapped[Optional["Rank"]] = relationship(back_populates="users")
    team: Mapped[Optional["Team"]] = relationship(back_populates="users")
    registrations: Mapped[List["Registration"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Competition(Base):
    __tablename__ = "competitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    date_start: Mapped[date] = mapped_column(Date, nullable=False)
    date_end: Mapped[date] = mapped_column(Date, nullable=False)
    registration_deadline: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    type_id: Mapped[int] = mapped_column(ForeignKey("competition_types.id"), nullable=False)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id"), nullable=False)

    type: Mapped["CompetitionType"] = relationship(back_populates="competitions")
    admin: Mapped["Admin"] = relationship(back_populates="competitions")
    registrations: Mapped[List["Registration"]] = relationship(back_populates="competition", cascade="all, delete-orphan")
    protocols: Mapped[List["Protocol"]] = relationship(back_populates="competition", cascade="all, delete-orphan")


class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (UniqueConstraint("user_id", "competition_id", name="uq_user_competition"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    competition_id: Mapped[int] = mapped_column(ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="registrations")
    competition: Mapped["Competition"] = relationship(back_populates="registrations")


class Protocol(Base):
    __tablename__ = "protocols"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    competition_id: Mapped[int] = mapped_column(ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False)

    competition: Mapped["Competition"] = relationship(back_populates="protocols")
