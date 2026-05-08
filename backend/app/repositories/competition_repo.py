from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import Competition, CompetitionType, Protocol, Registration


class CompetitionRepository:

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[Competition]:
        result = await self._db.execute(
            select(Competition)
            .options(
                selectinload(Competition.type),
                selectinload(Competition.protocols),
            )
            .order_by(Competition.date_start.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, competition_id: int) -> Optional[Competition]:
        result = await self._db.execute(
            select(Competition)
            .options(
                selectinload(Competition.type),
                selectinload(Competition.protocols),
            )
            .where(Competition.id == competition_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        admin_id: int,
        title: str,
        date_start,
        date_end,
        registration_deadline,
        location: str,
        type_id: int,
        image_url: Optional[str] = None,
    ) -> Competition:
        comp = Competition(
            admin_id=admin_id,
            title=title,
            date_start=date_start,
            date_end=date_end,
            registration_deadline=registration_deadline,
            location=location,
            type_id=type_id,
            image_url=image_url,
        )
        self._db.add(comp)
        await self._db.flush()
        await self._db.refresh(comp, ["type", "protocols"])
        return comp

    async def update(self, comp: Competition, **fields) -> Competition:
        allowed = {
            "title", "date_start", "date_end",
            "registration_deadline", "location", "image_url", "type_id",
        }
        for k, v in fields.items():
            if k in allowed:
                setattr(comp, k, v)
        await self._db.flush()
        await self._db.refresh(comp, ["type", "protocols"])
        return comp

    async def delete(self, comp: Competition) -> None:
        await self._db.delete(comp)
        await self._db.flush()

    async def get_all_types(self) -> list[CompetitionType]:
        result = await self._db.execute(select(CompetitionType).order_by(CompetitionType.name))
        return list(result.scalars().all())

    async def add_protocol(
        self, competition_id: int, title: str, file_url: str
    ) -> Protocol:
        protocol = Protocol(competition_id=competition_id, title=title, file_url=file_url)
        self._db.add(protocol)
        await self._db.flush()
        return protocol

    async def count_all(self) -> int:
        result = await self._db.execute(select(func.count()).select_from(Competition))
        return result.scalar_one()

    async def seed_types(self) -> None:
        types = [
            "Первенство федерального округа", "Первенство России",
            "Первенство области", "Первенство школы", "Всероссийские",
            "Чемпионат России", "Кубок России", "Тренировочные",
        ]
        for name in types:
            exists = await self._db.execute(
                select(CompetitionType).where(CompetitionType.name == name)
            )
            if not exists.scalar_one_or_none():
                self._db.add(CompetitionType(name=name))
        await self._db.flush()

    async def seed_ranks(self) -> None:
        from app.models.models import Rank
        ranks = ["МСМК", "МС", "КМС", "1 разряд", "2 разряд", "3 разряд", "Б/р"]
        for name in ranks:
            exists = await self._db.execute(
                select(Rank).where(Rank.name == name)
            )
            if not exists.scalar_one_or_none():
                self._db.add(Rank(name=name))
        await self._db.flush()

    async def seed_admin(self) -> None:
        from app.models.models import Admin
        from app.auth import hash_password
        exists = await self._db.execute(
            select(Admin).where(Admin.email == "admin@sportreg.ru")
        )
        if not exists.scalar_one_or_none():
            self._db.add(Admin(
                username="admin",
                email="admin@sportreg.ru",
                password_hash=hash_password("admin123"),
            ))
        await self._db.flush()
