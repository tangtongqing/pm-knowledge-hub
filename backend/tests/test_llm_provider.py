import json
from types import SimpleNamespace

import pytest
from pydantic import BaseModel

from agents.llm_provider import (
    _resolve_provider,
    create_llm_runtime,
    generate_structured_json,
)


class ExampleResponse(BaseModel):
    answer: str
    recommendations: list[str]


class FakeSiliconFlowCompletions:
    def __init__(self, content: str):
        self.content = content
        self.last_request = None

    def create(self, **kwargs):
        self.last_request = kwargs
        message = SimpleNamespace(content=self.content)
        return SimpleNamespace(choices=[SimpleNamespace(message=message)])


class FakeSiliconFlowClient:
    def __init__(self, content: str):
        self.completions = FakeSiliconFlowCompletions(content)
        self.chat = SimpleNamespace(completions=self.completions)


def test_auto_provider_prefers_siliconflow(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "auto")
    monkeypatch.setenv("SILICONFLOW_API_KEY", "sk-test")
    monkeypatch.setenv("GEMINI_API_KEY", "gemini-test")

    assert _resolve_provider() == "siliconflow"


def test_explicit_siliconflow_without_key_is_safe_mock(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "siliconflow")
    monkeypatch.delenv("SILICONFLOW_API_KEY", raising=False)

    runtime = create_llm_runtime()

    assert runtime.provider == "siliconflow"
    assert runtime.client is None
    assert runtime.enabled is False


def test_task_specific_siliconflow_model_overrides_default(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "siliconflow")
    monkeypatch.setenv("SILICONFLOW_API_KEY", "sk-test")
    monkeypatch.setenv("SILICONFLOW_MODEL", "default/model")
    monkeypatch.setenv("SILICONFLOW_INTERVIEW_MODEL", "fast-json/model")
    monkeypatch.setattr("openai.OpenAI", lambda **kwargs: object())

    runtime = create_llm_runtime(task="interview")

    assert runtime.model_name == "fast-json/model"


def test_siliconflow_generates_and_validates_json():
    client = FakeSiliconFlowClient(
        json.dumps(
            {"answer": "结构化回答", "recommendations": ["问题 1", "问题 2", "问题 3"]},
            ensure_ascii=False,
        )
    )

    result = generate_structured_json(
        client=client,
        provider="siliconflow",
        model_name="test/model",
        system_instruction="输出专业回答。",
        prompt="什么是需求分析？",
        response_schema=ExampleResponse,
        temperature=0.3,
        max_output_tokens=800,
    )

    assert result["answer"] == "结构化回答"
    assert len(result["recommendations"]) == 3
    request = client.completions.last_request
    assert request["model"] == "test/model"
    assert request["response_format"] == {"type": "json_object"}
    assert request["max_tokens"] == 800
    assert "JSON Schema" in request["messages"][1]["content"]


def test_siliconflow_rejects_invalid_schema_output():
    client = FakeSiliconFlowClient(json.dumps({"answer": "缺少推荐"}, ensure_ascii=False))

    with pytest.raises(ValueError):
        generate_structured_json(
            client=client,
            provider="siliconflow",
            model_name="test/model",
            system_instruction="输出专业回答。",
            prompt="什么是需求分析？",
            response_schema=ExampleResponse,
            temperature=0.3,
            max_output_tokens=800,
        )
