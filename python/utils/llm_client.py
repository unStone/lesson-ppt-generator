"""
Unified LLM client supporting OpenAI, Anthropic, and Ollama.
"""
import os
import json
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass


@dataclass
class LLMConfig:
    provider: str = "openai"  # openai | anthropic | ollama
    api_key: str = ""
    base_url: str = ""
    model: str = "gpt-4o"
    temperature: float = 0.7
    max_tokens: int = 4096


class LLMClient:
    def __init__(self, config: LLMConfig):
        self.config = config
        self._client = None
        self._anthropic = None

    def _get_openai_client(self):
        if self._client is None:
            try:
                from openai import AsyncOpenAI
            except ImportError:
                raise ImportError("openai package not installed. Run: pip install openai")
            base_url = self.config.base_url or None
            self._client = AsyncOpenAI(api_key=self.config.api_key, base_url=base_url)
        return self._client

    def _get_anthropic_client(self):
        if self._anthropic is None:
            try:
                from anthropic import AsyncAnthropic
            except ImportError:
                raise ImportError("anthropic package not installed. Run: pip install anthropic")
            base_url = self.config.base_url or None
            self._anthropic = AsyncAnthropic(api_key=self.config.api_key, base_url=base_url)
        return self._anthropic

    async def chat(self, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        """Send chat completion and return text response."""
        if self.config.provider == "openai":
            return await self._chat_openai(messages, json_mode)
        elif self.config.provider == "anthropic":
            return await self._chat_anthropic(messages, json_mode)
        elif self.config.provider == "ollama":
            return await self._chat_ollama(messages, json_mode)
        else:
            raise ValueError(f"Unknown provider: {self.config.provider}")

    async def _chat_openai(self, messages: List[Dict[str, str]], json_mode: bool) -> str:
        client = self._get_openai_client()
        kwargs = {
            "model": self.config.model,
            "messages": messages,
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""

    async def _chat_anthropic(self, messages: List[Dict[str, str]], json_mode: bool) -> str:
        client = self._get_anthropic_client()
        # Convert OpenAI-style messages to Anthropic format
        system_msg = ""
        anthropic_messages = []
        for m in messages:
            if m["role"] == "system":
                system_msg = m["content"]
            else:
                anthropic_messages.append({"role": m["role"], "content": m["content"]})

        kwargs = {
            "model": self.config.model,
            "messages": anthropic_messages,
            "max_tokens": self.config.max_tokens,
            "temperature": self.config.temperature,
        }
        if system_msg:
            kwargs["system"] = system_msg
        if json_mode:
            kwargs["system"] = (kwargs.get("system", "") + "\n\nYou must respond with valid JSON only.").strip()

        response = await client.messages.create(**kwargs)
        return response.content[0].text if response.content else ""

    async def _chat_ollama(self, messages: List[Dict[str, str]], json_mode: bool) -> str:
        import httpx
        base_url = self.config.base_url or "http://localhost:11434"
        url = f"{base_url}/api/chat"
        payload = {
            "model": self.config.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": self.config.temperature},
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=120)
            resp.raise_for_status()
            data = resp.json()
            return data.get("message", {}).get("content", "")

    async def chat_structured(self, messages: List[Dict[str, str]], schema: dict) -> dict:
        """Chat with structured JSON output using the provided schema."""
        # Add schema instruction to system message
        schema_str = json.dumps(schema, ensure_ascii=False, indent=2)
        schema_instruction = f"\n\nYou must respond with valid JSON matching this schema:\n{schema_str}\n\nRespond ONLY with JSON, no markdown, no explanations."

        # Find and augment system message
        augmented_messages = []
        system_found = False
        for m in messages:
            if m["role"] == "system":
                augmented_messages.append({"role": "system", "content": m["content"] + schema_instruction})
                system_found = True
            else:
                augmented_messages.append(m)
        if not system_found:
            augmented_messages.insert(0, {"role": "system", "content": schema_instruction})

        response_text = await self.chat(augmented_messages, json_mode=True)
        # Clean up markdown code blocks
        text = response_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        return json.loads(text)


# Default client factory
def create_llm_client(settings: dict) -> LLMClient:
    """Create LLM client from AppSettings dict."""
    return LLMClient(LLMConfig(
        provider=settings.get("apiProvider", "openai"),
        api_key=settings.get("apiKey", ""),
        model=settings.get("model", "gpt-4o"),
    ))
