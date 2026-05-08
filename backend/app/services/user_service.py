from app.repositories.user_repo import UserRepository
from app.services.auth_service import AuthService
from app.models.models import User


class UserService:

    def __init__(self, repo: UserRepository, auth: AuthService) -> None:
        self._repo = repo
        self._auth = auth

    async def get_ranks(self):
        return await self._repo.get_all_ranks()

    async def get_teams(self):
        return await self._repo.get_all_teams()

    async def register(self, data: dict) -> User:
        existing = await self._repo.get_by_email(data["email"])
        if existing:
            raise ValueError("Пользователь с таким email уже существует")

        password_hash = self._auth.hash_password(data["password"])

        team_id = None
        if data.get("team"):
            team = await self._repo.get_or_create_team(data["team"].strip())
            team_id = team.id

        return await self._repo.create(
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            email=data["email"].strip().lower(),
            password_hash=password_hash,
            phone=data.get("phone") or None,
            rank_id=data.get("rank_id"),
            team_id=team_id,
        )
