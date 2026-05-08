from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import Registration, Competition, CompetitionType, Protocol


class RegistrationRepository:

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_user_registrations(self, user_id: int) -> list[Registration]:
        result = await self._db.execute(
            select(Registration)
            .options(
                selectinload(Registration.competition).options(
                    selectinload(Competition.type),
                    selectinload(Competition.protocols),
                )
            )
            .where(Registration.user_id == user_id)
            .order_by(Registration.registered_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, reg_id: int) -> Optional[Registration]:
        result = await self._db.execute(
            select(Registration).where(Registration.id == reg_id)
        )
        return result.scalar_one_or_none()

    async def get_existing(
        self, user_id: int, competition_id: int
    ) -> Optional[Registration]:
        result = await self._db.execute(
            select(Registration).where(
                Registration.user_id == user_id,
                Registration.competition_id == competition_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_user_competition_ids(self, user_id: int) -> set[int]:
        result = await self._db.execute(
            select(Registration.competition_id).where(Registration.user_id == user_id)
        )
        return {row[0] for row in result.all()}

    async def create(self, user_id: int, competition_id: int) -> Registration:
        reg = Registration(user_id=user_id, competition_id=competition_id)
        self._db.add(reg)
        await self._db.flush()
        return reg

    async def delete(self, reg: Registration) -> None:
        await self._db.delete(reg)
        await self._db.flush()

    async def count_all(self) -> int:
        result = await self._db.execute(select(func.count()).select_from(Registration))
        return result.scalar_one()

    async def count_by_type(self) -> list[dict]:
        result = await self._db.execute(
            select(CompetitionType.name, func.count(Registration.id).label("count"))
            .join(Competition, Competition.type_id == CompetitionType.id)
            .join(Registration, Registration.competition_id == Competition.id)
            .group_by(CompetitionType.name)
            .order_by(func.count(Registration.id).desc())
        )
        return [{"type": row[0], "count": row[1]} for row in result.all()]
