from datetime import date
from typing import Optional

from app.repositories.competition_repo import CompetitionRepository
from app.models.models import Competition


def enrich(comp: Competition) -> dict:
    today = date.today()
    d = {
        "id":                    comp.id,
        "title":                 comp.title,
        "date_start":            comp.date_start,
        "date_end":              comp.date_end,
        "registration_deadline": comp.registration_deadline,
        "location":              comp.location,
        "image_url":             comp.image_url,
        "type_name":             comp.type.name if comp.type else "",
        "status":                "active" if today <= comp.date_end else "inactive",
        "can_register":          today <= comp.registration_deadline,
        "protocol_url": (
            sorted(comp.protocols, key=lambda p: p.published_at, reverse=True)[0].file_url
            if comp.protocols else None
        ),
    }
    return d


class CompetitionService:

    def __init__(self, repo: CompetitionRepository) -> None:
        self._repo = repo

    async def get_all(self) -> list[dict]:
        comps = await self._repo.get_all()
        return [enrich(c) for c in comps]

    async def get_active(self, limit: Optional[int] = None) -> list[dict]:
        all_c = await self.get_all()
        active = [c for c in all_c if c["status"] == "active"]
        return active[:limit] if limit else active

    async def get_by_id(self, competition_id: int) -> Optional[dict]:
        comp = await self._repo.get_by_id(competition_id)
        return enrich(comp) if comp else None

    async def get_types(self):
        return await self._repo.get_all_types()

    async def get_protocols(self, competition_id: int):
        comp = await self._repo.get_by_id(competition_id)
        return comp.protocols if comp else []

    async def create(self, admin_id: int, **data) -> dict:
        comp = await self._repo.create(admin_id=admin_id, **data)
        return enrich(comp)

    async def update(self, competition_id: int, **data) -> Optional[dict]:
        comp = await self._repo.get_by_id(competition_id)
        if not comp:
            return None
        comp = await self._repo.update(comp, **data)
        return enrich(comp)

    async def delete(self, competition_id: int) -> bool:
        comp = await self._repo.get_by_id(competition_id)
        if not comp:
            return False
        await self._repo.delete(comp)
        return True

    async def add_protocol(self, competition_id: int, title: str, file_url: str):
        return await self._repo.add_protocol(competition_id, title, file_url)
