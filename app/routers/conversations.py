from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import Conversation, Message
from schemas import ConversationCreate, ConversationRead, MessageCreate, MessageRead

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
async def create_conversation(payload: ConversationCreate, session: AsyncSession = Depends(get_session)) -> ConversationRead:
    conv = Conversation(user_id=payload.user_id, role_id=payload.role_id)
    session.add(conv)
    await session.commit()
    await session.refresh(conv)
    return ConversationRead(**{c.name: getattr(conv, c.name) for c in Conversation.__table__.columns})


@router.get("", response_model=List[ConversationRead])
async def list_conversations(user_id: str, session: AsyncSession = Depends(get_session)) -> List[ConversationRead]:
    res = await session.execute(select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.started_at.desc()))
    items = res.scalars().all()
    return [ConversationRead(**{c.name: getattr(x, c.name) for c in Conversation.__table__.columns}) for x in items]


@router.post("/{conversation_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
async def create_message(conversation_id: str, payload: MessageCreate, session: AsyncSession = Depends(get_session)) -> MessageRead:
    conv = await session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg = Message(
        conversation_id=conversation_id,
        sender=payload.sender,
        text=payload.text,
    )
    session.add(msg)
    await session.commit()
    await session.refresh(msg)
    return MessageRead(**{c.name: getattr(msg, c.name) for c in Message.__table__.columns})


@router.get("/{conversation_id}/messages", response_model=List[MessageRead])
async def list_messages(conversation_id: str, session: AsyncSession = Depends(get_session)) -> List[MessageRead]:
    res = await session.execute(select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()))
    items = res.scalars().all()
    return [MessageRead(**{c.name: getattr(m, c.name) for c in Message.__table__.columns}) for m in items]
