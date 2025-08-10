from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db import init_db
from routers.health import router as health_router
from routers.roles import router as roles_router
from routers.conversations import router as conv_router
from routers.tts import router as tts_router
from routers.metrics import router as metrics_router
from ws import ws_router

import uvicorn

app = FastAPI(title="Gume Backend", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(health_router)
app.include_router(roles_router)
app.include_router(conv_router)
app.include_router(tts_router)
app.include_router(metrics_router)
app.include_router(ws_router)


@app.on_event("startup")
async def on_startup():
    await init_db()

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
