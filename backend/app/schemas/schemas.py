from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserRegisterIn(BaseModel):
    first_name: str
    last_name:  str
    email:      EmailStr
    password:   str
    phone:      Optional[str] = None
    rank_id:    Optional[int] = None
    team:       Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Пароль минимум 6 символов")
        return v


class UserOut(BaseModel):
    id:         int
    first_name: str
    last_name:  str
    email:      str
    phone:      Optional[str]
    rank:       Optional[str]
    team:       Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class RankOut(BaseModel):
    id:   int
    name: str
    model_config = {"from_attributes": True}


class TeamOut(BaseModel):
    id:   int
    name: str
    model_config = {"from_attributes": True}


class CompetitionTypeOut(BaseModel):
    id:   int
    name: str
    model_config = {"from_attributes": True}


class CompetitionOut(BaseModel):
    id:                    int
    title:                 str
    date_start:            date
    date_end:              date
    registration_deadline: date
    location:              str
    image_url:             Optional[str]
    type_name:             str
    status:                str
    can_register:          bool
    protocol_url:          Optional[str] = None

    model_config = {"from_attributes": True}


class CompetitionCreateIn(BaseModel):
    title:                 str
    date_start:            date
    date_end:              date
    registration_deadline: date
    location:              str
    type_id:               int
    image_url:             Optional[str] = None

    @field_validator("date_end")
    @classmethod
    def end_after_start(cls, v: date, info) -> date:
        if info.data.get("date_start") and v < info.data["date_start"]:
            raise ValueError("Дата окончания не может быть раньше начала")
        return v


class CompetitionUpdateIn(CompetitionCreateIn):
    pass


class RegistrationOut(BaseModel):
    reg_id:        int
    registered_at: datetime
    competition:   CompetitionOut

    model_config = {"from_attributes": True}


class ProtocolOut(BaseModel):
    id:             int
    title:          str
    file_url:       str
    published_at:   datetime
    competition_id: int

    model_config = {"from_attributes": True}


class ProtocolCreateIn(BaseModel):
    title:    str
    file_url: str


class StatsOut(BaseModel):
    total_competitions: int
    active_competitions: int
    total_users: int
    total_registrations: int
    registrations_by_type: list[dict]
