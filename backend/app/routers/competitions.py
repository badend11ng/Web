from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import (
    get_competition_service, get_registration_repo,
    require_user, get_user_repo,
)
from app.services.competition_service import CompetitionService
from app.repositories.registration_repo import RegistrationRepository
from app.schemas.schemas import CompetitionOut, CompetitionTypeOut, RegistrationOut
from app.models.models import User

router = APIRouter(prefix="/api/competitions", tags=["competitions"])


@router.get("", response_model=list[CompetitionOut])
async def list_competitions(
    comp_service: CompetitionService = Depends(get_competition_service),
):
    return await comp_service.get_all()


@router.get("/types", response_model=list[CompetitionTypeOut])
async def list_types(
    comp_service: CompetitionService = Depends(get_competition_service),
):
    types = await comp_service.get_types()
    return [{"id": t.id, "name": t.name} for t in types]


@router.get("/{competition_id}", response_model=CompetitionOut)
async def get_competition(
    competition_id: int,
    comp_service: CompetitionService = Depends(get_competition_service),
):
    comp = await comp_service.get_by_id(competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Соревнование не найдено")
    return comp


@router.post("/{competition_id}/register", status_code=201)
async def register_for_competition(
    competition_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
    comp_service: CompetitionService = Depends(get_competition_service),
    reg_repo: RegistrationRepository = Depends(get_registration_repo),
):
    comp = await comp_service.get_by_id(competition_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Соревнование не найдено")
    if not comp["can_register"]:
        raise HTTPException(status_code=400, detail="Регистрация закрыта")
    existing = await reg_repo.get_existing(current_user.id, competition_id)
    if existing:
        raise HTTPException(status_code=409, detail="Вы уже зарегистрированы")
    await reg_repo.create(current_user.id, competition_id)
    await db.commit()
    return {"detail": f"Вы зарегистрированы на «{comp['title']}»"}


@router.get("/my/registrations", response_model=list[RegistrationOut])
async def my_registrations(
    current_user: User = Depends(require_user),
    reg_repo: RegistrationRepository = Depends(get_registration_repo),
):
    from datetime import date
    today = date.today()
    regs = await reg_repo.get_user_registrations(current_user.id)
    result = []
    for r in regs:
        c = r.competition
        result.append(RegistrationOut(
            reg_id=r.id,
            registered_at=r.registered_at,
            competition=CompetitionOut(
                id=c.id,
                title=c.title,
                date_start=c.date_start,
                date_end=c.date_end,
                registration_deadline=c.registration_deadline,
                location=c.location,
                image_url=c.image_url,
                type_name=c.type.name if c.type else "",
                status="active" if today <= c.date_end else "inactive",
                can_register=today <= c.registration_deadline,
                protocol_url=(
                    sorted(c.protocols, key=lambda p: p.published_at, reverse=True)[0].file_url
                    if c.protocols else None
                ),
            ),
        ))
    return result


@router.delete("/my/registrations/{reg_id}", status_code=204)
async def cancel_registration(
    reg_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
    reg_repo: RegistrationRepository = Depends(get_registration_repo),
):
    reg = await reg_repo.get_by_id(reg_id)
    if not reg or reg.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Регистрация не найдена")
    await reg_repo.delete(reg)
    await db.commit()
