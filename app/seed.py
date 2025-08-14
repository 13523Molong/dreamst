from __future__ import annotations

"""
开发环境数据种子脚本

- 创建示例用户：demo-user-001
- 创建示例角色：explorer / scholar
- 创建会话与消息，便于前端历史查询测试

运行：
  python -m app.seed
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select

from db import init_db, AsyncSessionLocal
from models import User, Role, Conversation, Message


async def seed() -> None:
    await init_db()

    async with AsyncSessionLocal() as session:
        # 用户
        user_id = "demo-user-001"
        user = await session.get(User, user_id)
        if not user:
            user = User(id=user_id, email="demo@example.com", username="demo", password_hash="noop")
            session.add(user)

        # 角色（与前端一致的ID，方便按角色过滤）
        role_defs = [
            {
                "id": "explorer",
                "name": "李泽言",
                "greeting": "别走神，专心一点。今天的行程我来安排。",
                "promote": "Zh集团总裁",
                "tags": ["总裁", "理性", "毒舌"],
            },
            {
                "id": "scholar",
                "name": "许墨",
                "greeting": "关于你，我还有很多假设想验证。",
                "promote": "认知科学教授",
                "tags": ["温柔", "智性", "神秘"],
            },
        ]

        roles: list[Role] = []
        for rd in role_defs:
            r = await session.get(Role, rd["id"])  # 以自定义 ID 作为主键
            if not r:
                r = Role(
                    id=rd["id"],
                    name=rd["name"],
                    greeting=rd.get("greeting"),
                    promote=rd.get("promote"),
                    tags=rd.get("tags"),
                    is_active=True,
                )
                session.add(r)
            roles.append(r)

        await session.flush()

        # 为两个角色各创建一个会话（若不存在）
        conversations: list[Conversation] = []
        for r in roles:
            stmt = select(Conversation).where(Conversation.user_id == user_id, Conversation.role_id == r.id)
            res = await session.execute(stmt)
            conv = res.scalars().first()
            if not conv:
                conv = Conversation(user_id=user_id, role_id=r.id, status="active")
                session.add(conv)
                await session.flush()
            conversations.append(conv)

        # 插入消息（若该会话暂无消息）
        now = datetime.utcnow()
        for conv in conversations:
            res = await session.execute(select(Message).where(Message.conversation_id == conv.id))
            has_msgs = res.scalars().first() is not None
            if has_msgs:
                continue

            msgs = [
                Message(
                    conversation_id=conv.id,
                    sender="system",
                    text=f"{next(r for r in roles if r.id == conv.role_id).greeting or '你好！'}",
                    created_at=now - timedelta(minutes=5),
                ),
                Message(
                    conversation_id=conv.id,
                    sender="user",
                    text="你好呀！",
                    created_at=now - timedelta(minutes=4),
                ),
                Message(
                    conversation_id=conv.id,
                    sender="role",
                    text="今天想聊点什么？",
                    created_at=now - timedelta(minutes=3),
                ),
                Message(
                    conversation_id=conv.id,
                    sender="user",
                    text="想听听你的安排。",
                    created_at=now - timedelta(minutes=2),
                ),
            ]
            session.add_all(msgs)

        await session.commit()


async def main() -> None:
    await seed()
    print("Seed data inserted.")


if __name__ == "__main__":
    asyncio.run(main())


