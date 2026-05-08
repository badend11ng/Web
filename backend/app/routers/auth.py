from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_auth_service, get_user_service, require_user
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.schemas.schemas import LoginIn, TokenOut, UserRegisterIn, UserOut
from app.models.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(
    body: UserRegisterIn,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        user = await user_service.register(body.model_dump())
        await db.commit()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    token = auth_service.create_user_token(user.id)
    return TokenOut(access_token=token)


@router.post("/login", response_model=TokenOut)
async def login(
    body: LoginIn,
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.authenticate_user(body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    return TokenOut(access_token=auth_service.create_user_token(user.id))


@router.post("/admin/login", response_model=TokenOut)
async def admin_login(
    body: LoginIn,
    auth_service: AuthService = Depends(get_auth_service),
):
    admin = await auth_service.authenticate_admin(body.email, body.password)
    if not admin:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    return TokenOut(access_token=auth_service.create_admin_token(admin.id))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(require_user)):
    return UserOut(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        phone=current_user.phone,
        rank=current_user.rank.name if current_user.rank else None,
        team=current_user.team.name if current_user.team else None,
        created_at=current_user.created_at,
    )
