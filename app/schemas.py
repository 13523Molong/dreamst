from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# 基础返回
class HealthResponse(BaseModel):
    status: str = "ok"


# 用户
class UserCreate(BaseModel):
    email: str
    username: Optional[str] = None
    password: str


class UserRead(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    is_active: bool
    created_at: datetime


# 订阅
class SubscriptionRead(BaseModel):
    id: str
    plan_name: str
    status: str
    started_at: datetime
    expires_at: Optional[datetime]


# 角色
class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    promote: Optional[str] = None
    greeting: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    silhouette_url: Optional[str] = None
    is_active: bool = True
    popularity_score: int = 0
    tts_provider_key: Optional[str] = None
    voice_params: Optional[dict] = None


class RoleRead(BaseModel):
    id: str
    name: str
    description: Optional[str]
    promote: Optional[str]
    greeting: Optional[str]
    tags: Optional[List[str]]
    image_url: Optional[str]
    silhouette_url: Optional[str]
    is_active: bool
    popularity_score: int
    tts_provider_key: Optional[str]
    voice_params: Optional[dict]


# 会话与消息
class ConversationCreate(BaseModel):
    user_id: str
    role_id: str


class ConversationRead(BaseModel):
    id: str
    user_id: str
    role_id: Optional[str]
    status: str
    started_at: datetime
    ended_at: Optional[datetime]


class MessageCreate(BaseModel):
    conversation_id: str
    sender: Literal["user", "role", "system", "hardware"]
    text: Optional[str] = None


class MessageRead(BaseModel):
    id: str
    conversation_id: str
    sender: Literal["user", "role", "system", "hardware"]
    text: Optional[str] = None
    audio_url: Optional[str] = None
    tts_provider_key: Optional[str] = None
    latency_ms: Optional[int] = None
    created_at: datetime


# TTS 提供商
class TTSProviderCreate(BaseModel):
    key: str = Field(..., description="唯一键，用于路由")
    name: str
    config: Optional[dict] = None


class TTSProviderRead(BaseModel):
    key: str
    name: str
    config: Optional[dict]


# 用户-角色指标
class UserRoleMetricRead(BaseModel):
    user_id: str
    role_id: str
    accompany_days: int
    total_messages: int
    last_interaction_at: Optional[datetime]


# WebSocket 消息定义
class WSBase(BaseModel):
    type: str


class WSClientUserMessage(WSBase):
    type: Literal["user_message"] = "user_message"
    conversation_id: str
    text: str


class WSServerRoleMessage(WSBase):
    type: Literal["role_message"] = "role_message"
    conversation_id: str
    text: str
    audio_url: Optional[str] = None


class WSServerError(WSBase):
    type: Literal["error"] = "error"
    message: str


class WSHardwarePlayAudio(WSBase):
    type: Literal["play_audio"] = "play_audio"
    conversation_id: str
    audio_url: str


class WSHardwareAck(WSBase):
    type: Literal["ack"] = "ack"
    message: str = "ok"
