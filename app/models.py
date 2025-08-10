from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    JSON,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    Integer,
    Boolean,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def _uuid_str() -> str:
    return str(uuid4())


# TTS 提供商（key 作为主键，便于通过字符串路由）
class TTSProvider(Base):
    __tablename__ = "tts_providers"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    config: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(64))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    subscriptions: Mapped[list[Subscription]] = relationship(back_populates="user")
    conversations: Mapped[list[Conversation]] = relationship(back_populates="user")
    role_metrics: Mapped[list[UserRoleMetric]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    plan_name: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(16), default="active")  # active/expired/canceled

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="subscriptions")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    name: Mapped[str] = mapped_column(String(64), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    promote: Mapped[Optional[str]] = mapped_column(String(128))
    greeting: Mapped[Optional[str]] = mapped_column(String(255))
    tags: Mapped[Optional[list[str]]] = mapped_column(JSON)
    # 角色形象：立绘与剪影
    image_url: Mapped[Optional[str]] = mapped_column(String(512))
    silhouette_url: Mapped[Optional[str]] = mapped_column(String(512))

    # 业务控制：是否上架、热门度（用于排序）
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    popularity_score: Mapped[int] = mapped_column(Integer, default=0)

    # 默认 TTS 提供商与参数
    tts_provider_key: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("tts_providers.key", ondelete="SET NULL"), index=True
    )
    voice_params: Mapped[Optional[dict]] = mapped_column(JSON)

    conversations: Mapped[list[Conversation]] = relationship(back_populates="role")
    role_metrics: Mapped[list[UserRoleMetric]] = relationship(back_populates="role", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("roles.id", ondelete="SET NULL"), index=True, nullable=True
    )

    status: Mapped[str] = mapped_column(String(16), default="active")  # active/ended
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="conversations")
    role: Mapped[Role] = relationship(back_populates="conversations")
    messages: Mapped[list[Message]] = relationship(back_populates="conversation", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("id", name="uq_conversation_id"),
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), index=True)

    # user/role/system/hardware
    sender: Mapped[str] = mapped_column(String(16))

    text: Mapped[Optional[str]] = mapped_column(Text)
    audio_url: Mapped[Optional[str]] = mapped_column(String(512))

    # 实际用于记录当时生成音频所用 provider，可用于排障/计费
    tts_provider_key: Mapped[Optional[str]] = mapped_column(String(64))

    latency_ms: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    conversation: Mapped[Conversation] = relationship(back_populates="messages")

    __table_args__ = (
        CheckConstraint("sender in ('user','role','system','hardware')", name="ck_message_sender"),
    )


class UserRoleMetric(Base):
    """按用户-角色维度的指标，如陪伴时长（天数）、消息量等。"""

    __tablename__ = "user_role_metrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role_id: Mapped[str] = mapped_column(String(36), ForeignKey("roles.id", ondelete="CASCADE"), index=True)

    accompany_days: Mapped[int] = mapped_column(Integer, default=0)
    total_messages: Mapped[int] = mapped_column(Integer, default=0)
    last_interaction_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="role_metrics")
    role: Mapped[Role] = relationship(back_populates="role_metrics")

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_role_metric"),
    )
