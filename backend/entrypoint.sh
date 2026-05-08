#!/bin/bash
echo "Waiting for PostgreSQL..."
while ! nc -z postgres_2_main 5432; do sleep 0.5; done
echo "PostgreSQL is up!"

echo "Running migrations..."
alembic upgrade head

echo "Starting FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
