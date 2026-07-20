"""统一的大模型供应商适配层。

业务 Agent 只依赖 ``generate_structured_json``，不直接感知 Gemini 或
SiliconFlow 的 SDK 差异。未配置有效密钥时返回禁用的 runtime，由 Agent
继续使用原有本地 mock 降级路径。
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Type

from pydantic import BaseModel


SUPPORTED_PROVIDERS = {"auto", "gemini", "siliconflow"}
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
DEFAULT_SILICONFLOW_MODEL = "THUDM/GLM-4-9B-0414"
DEFAULT_SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1"
DEFAULT_LLM_TIMEOUT_SECONDS = 90.0


@dataclass(frozen=True)
class LLMRuntime:
    provider: str
    model_name: str
    client: Any | None

    @property
    def enabled(self) -> bool:
        return self.client is not None


def _resolve_provider() -> str:
    requested = os.getenv("AI_PROVIDER", "auto").strip().lower() or "auto"
    if requested not in SUPPORTED_PROVIDERS:
        print(
            f"[WARN] 不支持的 AI_PROVIDER={requested!r}，将安全降级为本地演示模式。"
        )
        return "mock"

    if requested != "auto":
        return requested

    # auto 优先使用用户主动配置的硅基流动密钥，便于从受限的 Gemini 平滑迁移。
    if os.getenv("SILICONFLOW_API_KEY", "").strip():
        return "siliconflow"
    if os.getenv("GEMINI_API_KEY", "").strip():
        return "gemini"
    return "mock"


def create_llm_runtime(task: str | None = None) -> LLMRuntime:
    """根据环境变量创建大模型客户端，不在日志中输出任何密钥。"""

    provider = _resolve_provider()

    if provider == "siliconflow":
        api_key = os.getenv("SILICONFLOW_API_KEY", "").strip()
        task_model = (
            os.getenv(f"SILICONFLOW_{task.upper()}_MODEL", "").strip()
            if task
            else ""
        )
        model_name = (
            task_model
            or os.getenv("SILICONFLOW_MODEL", DEFAULT_SILICONFLOW_MODEL).strip()
            or DEFAULT_SILICONFLOW_MODEL
        )
        if not api_key:
            print(
                "[WARN] AI_PROVIDER=硅基流动，但 SILICONFLOW_API_KEY 未配置，"
                "将以演示模式运行。"
            )
            return LLMRuntime(provider=provider, model_name=model_name, client=None)

        from openai import OpenAI

        base_url = (
            os.getenv("SILICONFLOW_BASE_URL", DEFAULT_SILICONFLOW_BASE_URL).strip()
            or DEFAULT_SILICONFLOW_BASE_URL
        )
        timeout_seconds = float(
            os.getenv("SILICONFLOW_TIMEOUT_SECONDS", DEFAULT_LLM_TIMEOUT_SECONDS)
        )
        client = OpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=timeout_seconds,
            # 自动重试会把单次慢请求叠加成数分钟；业务层已有可见的降级响应。
            max_retries=0,
        )
        return LLMRuntime(provider=provider, model_name=model_name, client=client)

    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        task_model = (
            os.getenv(f"GEMINI_{task.upper()}_MODEL", "").strip() if task else ""
        )
        model_name = (
            task_model
            or os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL).strip()
            or DEFAULT_GEMINI_MODEL
        )
        if not api_key:
            print(
                "[WARN] AI_PROVIDER=Gemini，但 GEMINI_API_KEY 未配置，"
                "将以演示模式运行。"
            )
            return LLMRuntime(provider=provider, model_name=model_name, client=None)

        from google import genai

        client = genai.Client(api_key=api_key)
        return LLMRuntime(provider=provider, model_name=model_name, client=client)

    return LLMRuntime(provider="mock", model_name="", client=None)


def generate_structured_json(
    *,
    client: Any,
    provider: str,
    model_name: str,
    system_instruction: str,
    prompt: str,
    response_schema: Type[BaseModel],
    temperature: float,
    max_output_tokens: int,
) -> dict[str, Any]:
    """调用指定供应商并返回经过 Pydantic 校验的结构化数据。"""

    if provider == "siliconflow":
        schema_json = json.dumps(
            response_schema.model_json_schema(), ensure_ascii=False, separators=(",", ":")
        )
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"{system_instruction}\n\n"
                        "你必须只输出一个合法 JSON 对象，不得输出 Markdown 代码块或额外说明。"
                    ),
                },
                {
                    "role": "user",
                    "content": f"{prompt}\n\n[必须遵循的 JSON Schema]:\n{schema_json}",
                },
            ],
            response_format={"type": "json_object"},
            temperature=temperature,
            max_tokens=max_output_tokens,
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("SiliconFlow 返回了空响应")
        raw_data = json.loads(content)

    elif provider == "gemini":
        from google.genai import types

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        if not response.text:
            raise ValueError("Gemini 返回了空响应")
        raw_data = json.loads(response.text)

    else:
        raise RuntimeError(f"大模型供应商 {provider!r} 未启用")

    validated = response_schema.model_validate(raw_data)
    return validated.model_dump()
