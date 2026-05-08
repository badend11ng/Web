from typing import Optional

from app.auth import hash_password, verify_password, create_access_token
from app.repositories.user_repo import UserRepository
from app.repositories.admin_repo import AdminRepository
from app.models.models import User, Admin


class AuthService:

    def __init__(self, user_repo: UserRepository, admin_repo: AdminRepository) -> None:
        self._user_repo = user_repo
        self._admin_repo = admin_repo

    def hash_password(self, password: str) -> str:
        return hash_password(password)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self._user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    def create_user_token(self, user_id: int) -> str:
        return create_access_token({"sub": str(user_id), "role": "user"})

    async def authenticate_admin(self, email: str, password: str) -> Optional[Admin]:
        admin = await self._admin_repo.get_by_email(email)
        if not admin or not verify_password(password, admin.password_hash):
            return None
        return admin

    def create_admin_token(self, admin_id: int) -> str:
        return create_access_token({"sub": str(admin_id), "role": "admin"})