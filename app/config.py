from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    """全局配置，从环境变量/.env 加载。"""

    DATABASE_URL: str = Field(
        default="mysql+aiomysql://root:password@localhost:3306/gume?charset=utf8mb4",
        description="MySQL 连接串（SQLAlchemy async URL）",
    )

    # 允许跨域来源（字符串形式，支持：空/"*"/逗号分隔/JSON数组）
    ALLOW_ORIGINS: str = Field(
        default="*",
        description="CORS 允许来源。可填 *、逗号分隔，或 JSON 数组字符串。",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    def get_allow_origins(self) -> List[str]:
        raw = (self.ALLOW_ORIGINS or "").strip()
        if not raw or raw == "*":
            return ["*"]
        # 支持 JSON 数组
        if raw.startswith("["):
            try:
                arr = json.loads(raw)
                if isinstance(arr, list) and all(isinstance(x, str) for x in arr):
                    return arr
            except Exception:
                pass
        # 逗号分隔
        return [o.strip() for o in raw.split(",") if o.strip()]


def load_settings() -> "Settings":
    return Settings()


settings = load_settings()
