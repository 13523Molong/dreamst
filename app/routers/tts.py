from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import TTSProvider
from schemas import TTSProviderCreate, TTSProviderRead

router = APIRouter(prefix="/tts_providers", tags=["tts"])


@router.post("", response_model=TTSProviderRead, status_code=status.HTTP_201_CREATED)
async def create_tts_provider(payload: TTSProviderCreate, session: AsyncSession = Depends(get_session)) -> TTSProviderRead:
    exists = await session.get(TTSProvider, payload.key)
    if exists:
        raise HTTPException(status_code=409, detail="TTS provider key already exists")

    obj = TTSProvider(key=payload.key, name=payload.name, config=payload.config or {})
    session.add(obj)
    await session.commit()
    await session.refresh(obj)
    return TTSProviderRead(key=obj.key, name=obj.name, config=obj.config)


@router.get("", response_model=List[TTSProviderRead])
async def list_tts_providers(session: AsyncSession = Depends(get_session)) -> List[TTSProviderRead]:
    res = await session.execute(select(TTSProvider).order_by(TTSProvider.key))
    items = res.scalars().all()
    return [TTSProviderRead(key=i.key, name=i.name, config=i.config) for i in items]
