from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import UserRoleMetric
from schemas import UserRoleMetricRead

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/user_roles", response_model=List[UserRoleMetricRead])
async def list_user_role_metrics(user_id: str, session: AsyncSession = Depends(get_session)) -> List[UserRoleMetricRead]:
    res = await session.execute(
        select(UserRoleMetric).where(UserRoleMetric.user_id == user_id).order_by(UserRoleMetric.accompany_days.desc())
    )
    items = res.scalars().all()
    return [
        UserRoleMetricRead(
            user_id=i.user_id,
            role_id=i.role_id,
            accompany_days=i.accompany_days,
            total_messages=i.total_messages,
            last_interaction_at=i.last_interaction_at,
        )
        for i in items
    ]
