from typing import Any

from app.rag.generator import generate_structured_analysis


class LLMProvider:
    async def generate_json(self, challenge: dict[str, Any], context: list[dict[str, Any]]) -> dict[str, Any]:
        return await generate_structured_analysis(challenge, context)


llm_provider = LLMProvider()

