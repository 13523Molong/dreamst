from __future__ import annotations

from typing import Optional, Protocol, Tuple


class TTSProviderClient(Protocol):
    async def synthesize(self, text: str, voice_params: Optional[dict] = None) -> Tuple[str, Optional[dict]]:
        """
        合成语音并返回 (audio_url, extra)
        extra 可包含提供商耗时、token 消耗、调试信息等。
        """
        ...


class DummyTTSClient:
    async def synthesize(self, text: str, voice_params: Optional[dict] = None) -> tuple[str, Optional[dict]]:
        # 演示：返回一个伪音频URL
        return f"https://example.com/audio/{hash(text)}.mp3", {"provider": "dummy", "len": len(text)}


class TTSRouter:
    def __init__(self) -> None:
        self._providers: dict[str, TTSProviderClient] = {}
        # 默认注册一个 dummy
        self.register("dummy", DummyTTSClient())

    def register(self, key: str, client: TTSProviderClient) -> None:
        self._providers[key] = client

    def get(self, key: Optional[str]) -> TTSProviderClient:
        if key and key in self._providers:
            return self._providers[key]
        return self._providers["dummy"]


router = TTSRouter()
