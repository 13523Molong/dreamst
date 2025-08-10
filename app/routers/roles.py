from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import Role
from schemas import RoleCreate, RoleRead

router = APIRouter(prefix="/roles", tags=["roles"])


@router.post("", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
async def create_role(payload: RoleCreate, session: AsyncSession = Depends(get_session)) -> RoleRead:
    role = Role(
        name=payload.name,
        description=payload.description,
        promote=payload.promote,
        greeting=payload.greeting,
        tags=payload.tags,
        image_url=payload.image_url,
        silhouette_url=payload.silhouette_url,
        is_active=payload.is_active,
        popularity_score=payload.popularity_score,
        tts_provider_key=payload.tts_provider_key,
        voice_params=payload.voice_params,
    )
    session.add(role)
    await session.commit()
    await session.refresh(role)
    return RoleRead(**{c.name: getattr(role, c.name) for c in Role.__table__.columns})


@router.get("", response_model=List[RoleRead])
async def list_roles(session: AsyncSession = Depends(get_session)) -> List[RoleRead]:
    res = await session.execute(select(Role).where(Role.is_active == True).order_by(Role.popularity_score.desc(), Role.name.asc()))
    items = res.scalars().all()
    return [RoleRead(**{c.name: getattr(r, c.name) for c in Role.__table__.columns}) for r in items]


@router.get("/{role_id}", response_model=RoleRead)
async def get_role(role_id: str, session: AsyncSession = Depends(get_session)) -> RoleRead:
    role = await session.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return RoleRead(**{c.name: getattr(role, c.name) for c in Role.__table__.columns})
