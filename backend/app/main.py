import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import engine, AsyncSessionLocal, Base
from app.routers import auth, competitions, admin, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sportreg")


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        from app.repositories.competition_repo import CompetitionRepository
        repo = CompetitionRepository(db)
        await repo.seed_types()
        await repo.seed_ranks()
        await repo.seed_admin()
        await db.commit()

    logger.info("Database initialized")
    yield
    await engine.dispose()
    logger.info("Engine disposed")


app = FastAPI(
    title="SportReg API",
    description="REST API для регистрации на соревнования по спортивному ориентированию",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5180", "http://frontend"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(competitions.router)
app.include_router(admin.router)
app.include_router(users.router)


@app.get("/api/health")
def health():
    return {"status": "healthy"}
