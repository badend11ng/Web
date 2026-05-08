from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Admin


class AdminRepository:

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_email(self, email: str) -> Optional[Admin]:
        result = await self._db.execute(
            select(Admin).where(Admin.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, admin_id: int) -> Optional[Admin]:
        result = await self._db.execute(
            select(Admin).where(Admin.id == admin_id)
        )
        return result.scalar_one_or_none()
