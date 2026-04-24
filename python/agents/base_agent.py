"""
Base agent class for all lesson plan AI agents.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
from utils.llm_client import LLMClient


class BaseAgent(ABC):
    """Base agent with LLM client and system prompt support."""

    def __init__(self, llm: LLMClient, name: str = "Agent"):
        self.llm = llm
        self.name = name

    def _system_prompt(self) -> str:
        """Return the system prompt for this agent. Override in subclass."""
        return "You are a helpful AI assistant."

    def _build_messages(self, user_prompt: str, context: str = "") -> List[Dict[str, str]]:
        """Build message list with system prompt."""
        messages = [{"role": "system", "content": self._system_prompt()}]
        if context:
            messages.append({"role": "system", "content": f"Context:\n{context}"})
        messages.append({"role": "user", "content": user_prompt})
        return messages

    async def _chat(self, user_prompt: str, context: str = "", json_mode: bool = False) -> str:
        """Send a chat request and return text."""
        messages = self._build_messages(user_prompt, context)
        return await self.llm.chat(messages, json_mode=json_mode)

    async def _chat_structured(self, user_prompt: str, schema: dict, context: str = "") -> dict:
        """Send a chat request and return structured JSON."""
        messages = self._build_messages(user_prompt, context)
        return await self.llm.chat_structured(messages, schema)

    @abstractmethod
    async def run(self, *args, **kwargs) -> Any:
        """Execute the agent's main task."""
        pass
