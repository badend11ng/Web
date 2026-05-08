from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import (
    get_competition_service, get_registration_repo,
    get_user_repo, require_admin,
)
from app.services.competition_service import CompetitionService
from app.repositories.registration_repo import RegistrationRepository
from app.repositories.user_repo import UserRepository
from app.schemas.schemas import (
    CompetitionOut, CompetitionCreateIn, CompetitionUpdateIn,
    ProtocolOut, ProtocolCreateIn, StatsOut,
)
from app.models.models import Admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=StatsOut)
async def get_stats(
    _: Admin = Depends(require_admin),
    comp_service: CompetitionService = Depends(get_competition_service),
    reg_repo: RegistrationRepository = Depends(get_registration_repo),
    user_repo: UserRepository = Depends(get_user_repo),
):
    from app.repositories.competition_repo import CompetitionRepository
    all_comps = await comp_service.get_all()
    return StatsOut(
        total_competitions=len(all_comps),
        active_competitions=sum(1 for c in all_comps if c["status"] == "active"),
        total_users=await user_repo.count_all(),
        total_registrations=await reg_repo.count_all(),
        registrations_by_type=await reg_repo.count_by_type(),
    )


@router.get("/competitions", response_model=list[CompetitionOut])
async def list_competitions(
    _: Admin = Depends(require_admin),
    comp_service: CompetitionService = Depends(get_competition_service),
):
    return await comp_service.get_all()


@router.post("/competitions", response_model=CompetitionOut, status_code=201)
async def create_competition(
    body: CompetitionCreateIn,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(require_admin),
    comp_service: CompetitionService = Depends(get_competition_service),
):
    try:
        comp = await comp_service.create(admin_id=admin.id, **body.model_dump())
        await db.commit()
        return comp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/competitions/{competition_id}", response_model=CompetitionOut)
async def update_competition(
    competition_id: int,
    body: CompetitionUpdateIn,
    db: AsyncSession = Depends(get_db),
    _: Admin = Depends(require_admin),
    comp_service: CompetitionService = Depends(get_competition_service),
):
    comp = await comp_service.update(competition_id, **body.model_dump())
    if not comp:
        raise HTTPException(status_code=404, detail="Соревнование не найдено")
    await db.commit()
    return comp


@router.delete("/competitions/{competition_id}", status_code=204)
async def delete_competition(
    competition_id: int,
    db: AsyncSession = Depends(get_db),
    _: Admin = Depends(require_admin),
    comp_service: CompetitionService = Depends(get_competition_service),
):
    deleted = await comp_service.delete(competition_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Соревнование не найдено")
    await db.commit()


@router.get("/competitions/{competition_id}/protocols", response_model=list[ProtocolOut])
async def list_protocols(
    competition_id: int,
    _: Admin = Depends(require_admin),
    comp_service: CompetitionService = Depends(get_competition_service),
):
    protocols = await comp_service.get_protocols(competition_id)
    return [
        ProtocolOut(
            id=p.id, title=p.title, file_url=p.file_url,
            published_at=p.published_at, competition_id=p.competition_id,
        )
        for p in protocols
    ]


@router.post("/competitions/{competition_id}/protocols", response_model=ProtocolOut, status_code=201)
async def add_protocol(
    competition_id: int,
    body: ProtocolCreateIn,
    db: AsyncSession = Depends(get_db),
    _: Admin = Depends(require_admin),
    comp_service: CompetitionService = Depends(get_competition_service),
):
    protocol = await comp_service.add_protocol(competition_id, body.title, body.file_url)
    await db.commit()
    return ProtocolOut(
        id=protocol.id, title=protocol.title, file_url=protocol.file_url,
        published_at=protocol.published_at, competition_id=protocol.competition_id,
    )
