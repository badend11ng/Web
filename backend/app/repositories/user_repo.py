from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import User, Rank, Team


class UserRepository:

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self._db.execute(
            select(User)
            .options(selectinload(User.rank), selectinload(User.team))
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self._db.execute(
            select(User)
            .options(selectinload(User.rank), selectinload(User.team))
            .where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        first_name: str,
        last_name: str,
        email: str,
        password_hash: str,
        phone: Optional[str] = None,
        rank_id: Optional[int] = None,
        team_id: Optional[int] = None,
    ) -> User:
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email.lower(),
            password_hash=password_hash,
            phone=phone,
            rank_id=rank_id,
            team_id=team_id,
        )
        self._db.add(user)
        await self._db.flush()
        await self._db.refresh(user, ["rank", "team"])
        return user

    async def get_all_ranks(self) -> list[Rank]:
        result = await self._db.execute(select(Rank).order_by(Rank.id))
        return list(result.scalars().all())

    async def get_all_teams(self) -> list[Team]:
        result = await self._db.execute(select(Team).order_by(Team.name))
        return list(result.scalars().all())

    async def get_or_create_team(self, name: str) -> Team:
        result = await self._db.execute(select(Team).where(Team.name == name))
        team = result.scalar_one_or_none()
        if not team:
            team = Team(name=name)
            self._db.add(team)
            await self._db.flush()
        return team

    async def count_all(self) -> int:
        from sqlalchemy import func, select as sa_select
        result = await self._db.execute(sa_select(func.count()).select_from(User))
        return result.scalar_one()
