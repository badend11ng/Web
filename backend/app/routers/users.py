from fastapi import APIRouter, Depends

from app.dependencies import get_user_service
from app.services.user_service import UserService
from app.schemas.schemas import RankOut, TeamOut

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/ranks", response_model=list[RankOut])
async def list_ranks(user_service: UserService = Depends(get_user_service)):
    ranks = await user_service.get_ranks()
    return [RankOut(id=r.id, name=r.name) for r in ranks]


@router.get("/teams", response_model=list[TeamOut])
async def list_teams(user_service: UserService = Depends(get_user_service)):
    teams = await user_service.get_teams()
    return [TeamOut(id=t.id, name=t.name) for t in teams]
