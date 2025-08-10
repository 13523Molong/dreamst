# Gume 后端（FastAPI）

本后端用于：
- 管理用户、订阅、角色、对话与消息等结构化数据（MySQL）
- 提供低延时双向通信（WebSocket）
- 依据角色选择对应的 TTS 提供商（路由骨架）

## 快速开始

1. 准备 Python 环境（建议 3.11+）：
```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
```

2. 配置数据库（MySQL 8.0+）
- 启动 MySQL，并创建数据库（例如：gume，字符集 utf8mb4）
- 复制 `env.example` 为 `.env`，按需修改 `DATABASE_URL`（示例：`mysql+asyncmy://root:password@localhost:3306/gume?charset=utf8mb4`）

3. 运行服务
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- 健康检查：GET http://localhost:8000/health
- WebSocket（应用端）：ws://localhost:8000/ws/chat?user_id=<uid>&role_id=<rid>
- WebSocket（硬件端）：ws://localhost:8000/ws/hardware?user_id=<uid>

## 数据库表（简述）

- users：用户基本信息、密码哈希
- roles：角色资料（描述、标签、问候语、TTS 提供商键等；`tags` 使用 JSON）
- subscriptions：订阅信息（计划、状态、起止时间）
- conversations：会话实例（关联用户与角色）
- messages：消息明细（user/role/system 文本与可选音频URL）
- tts_providers：TTS 提供商登记（key 映射到具体实现）
- user_role_metrics：用户-角色维度指标（陪伴天数、消息量等）

备注：`roles.tts_provider_key` 指定该角色使用的 TTS 提供商；如需多对多或优先级，可另建映射表。

## 对接要点

- 前端选定角色后，POST /conversations 创建会话，并建立 /ws/chat；
- 用户端通过 WS 发送文本，服务端根据 `role.tts_provider_key` 选择 TTS 提供商（示例骨架），
  返回文本（用于 APP 展示）与音频任务信息（供硬件端播放/拉取）。

## 迁移与演进

- 当前使用 SQLAlchemy create_all 初始化；生产建议引入 Alembic。
- TTS 提供商实现位于 app/services/tts_service.py，可按需扩展接入各家服务。
