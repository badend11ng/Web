from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.auth import decode_token
from app.repositories.user_repo import UserRepository
from app.repositories.competition_repo import CompetitionRepository
from app.repositories.registration_repo import RegistrationRepository
from app.repositories.admin_repo import AdminRepository
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.competition_service import CompetitionService
from app.models.models import User, Admin


# репы
def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_competition_repo(db: AsyncSession = Depends(get_db)) -> CompetitionRepository:
    return CompetitionRepository(db)

def get_registration_repo(db: AsyncSession = Depends(get_db)) -> RegistrationRepository:
    return RegistrationRepository(db)

def get_admin_repo(db: AsyncSession = Depends(get_db)) -> AdminRepository:
    return AdminRepository(db)


# сервисы
def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repo),
    admin_repo: AdminRepository = Depends(get_admin_repo),
) -> AuthService:
    return AuthService(user_repo, admin_repo)

def get_user_service(
    repo: UserRepository = Depends(get_user_repo),
    auth: AuthService = Depends(get_auth_service),
) -> UserService:
    return UserService(repo, auth)

def get_competition_service(
    repo: CompetitionRepository = Depends(get_competition_repo),
) -> CompetitionService:
    return CompetitionService(repo)


# текущий пользователь
async def _extract_token(authorization: Optional[str] = Header(default=None)) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    return authorization[7:]


async def get_current_user(
    token: Optional[str] = Depends(_extract_token),
    user_repo: UserRepository = Depends(get_user_repo),
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("role") != "user":
            return None
        return await user_repo.get_by_id(int(payload["sub"]))
    except Exception:
        return None


async def require_user(
    user: Optional[User] = Depends(get_current_user),
) -> User:
    if not user:
        raise HTTPException(status_code=401, detail="Необходима авторизация")
    return user


async def get_current_admin(
    token: Optional[str] = Depends(_extract_token),
    admin_repo: AdminRepository = Depends(get_admin_repo),
) -> Optional[Admin]:
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("role") != "admin":
            return None
        return await admin_repo.get_by_id(int(payload["sub"]))
    except Exception:
        return None


async def require_admin(
    admin: Optional[Admin] = Depends(get_current_admin),
) -> Admin:
    if not admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return admin
