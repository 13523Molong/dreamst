from __future__ import annotations

import json
from typing import Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import Conversation, Message, Role
from schemas import (
    WSHardwareAck,
    WSHardwarePlayAudio,
    WSClientUserMessage,
    WSServerError,
    WSServerRoleMessage,
)
from services.tts_service import router as tts_router

ws_router = APIRouter()

# 简单管理：每个 user_id 一个硬件连接
hardware_connections: Dict[str, WebSocket] = {}


@ws_router.websocket("/ws/hardware")
async def hardware_ws(websocket: WebSocket, user_id: str):
    await websocket.accept()
    hardware_connections[user_id] = websocket
    try:
        while True:
            _ = await websocket.receive_text()
            await websocket.send_text(json.dumps(WSHardwareAck().dict()))
    except WebSocketDisconnect:
        hardware_connections.pop(user_id, None)


@ws_router.websocket("/ws/chat")
async def chat_ws(websocket: WebSocket, user_id: str, role_id: str, session: AsyncSession = Depends(get_session)):
    await websocket.accept()
    try:
        # 确认角色存在
        role = await session.get(Role, role_id)
        if not role:
            await websocket.send_text(json.dumps(WSServerError(type="error", message="Role not found").dict()))
            await websocket.close()
            return

        # 或者由客户端传入现有会话，这里演示：每个连接创建一个临时会话
        conv = Conversation(user_id=user_id, role_id=role_id)
        session.add(conv)
        await session.commit()
        await session.refresh(conv)

        while True:
            data = await websocket.receive_text()
            try:
                payload = WSClientUserMessage.parse_raw(data)
            except Exception:
                await websocket.send_text(json.dumps(WSServerError(type="error", message="Invalid message").dict()))
                continue

            # 入库用户消息
            user_msg = Message(
                conversation_id=conv.id,
                sender="user",
                text=payload.text,
            )
            session.add(user_msg)
            await session.commit()

            # 选择 TTS 提供商
            client = tts_router.get(role.tts_provider_key)
            audio_url, extra = await client.synthesize(payload.text, voice_params=role.voice_params)

            # 入库角色消息（文本=payload.text 或由NLP生成的文本，这里示例直接回声）
            role_text = payload.text  # 你可以替换为大模型输出
            role_msg = Message(
                conversation_id=conv.id,
                sender="role",
                text=role_text,
                audio_url=audio_url,
                tts_provider_key=role.tts_provider_key or "dummy",
            )
            session.add(role_msg)
            await session.commit()

            # 下发给应用端（文本+音频地址）
            await websocket.send_text(
                json.dumps(
                    WSServerRoleMessage(
                        conversation_id=conv.id, text=role_text, audio_url=audio_url
                    ).dict()
                )
            )

            # 推送给硬件端播放（若在线）
            hw = hardware_connections.get(user_id)
            if hw:
                await hw.send_text(
                    json.dumps(
                        WSHardwarePlayAudio(
                            conversation_id=conv.id, audio_url=audio_url
                        ).dict()
                    )
                )

    except WebSocketDisconnect:
        return
