"""
FastAPI entry point for lesson-ppt-generator backend.
Provides APIs for parsing lesson plans and generating PPTX files.
"""
import os
import sys
import asyncio
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.schemas import (
    ParserInput, LessonOverview, GenerationResult,
    LessonSection, TeachingGoal, ColorScheme
)
from utils.llm_client import LLMClient
from agents.parser_agent import ParserAgent
from agents.completeness_agent import CompletenessAgent, CompletenessCheck
from agents.slide_planner import SlidePlanner
from ppt_builder import PPTBuilder

app = FastAPI(title="Lesson PPT Generator API", version="1.0.0")


# Global LLM client
llm_client = LLMClient()


class ParseRequest(BaseModel):
    raw_text: str
    provider: Optional[str] = "openai"


class ConfirmRequest(BaseModel):
    overview: dict
    confirmations: Optional[list] = None


class GenerateRequest(BaseModel):
    overview: dict
    provider: Optional[str] = "openai"


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/parse")
async def parse_lesson(req: ParseRequest):
    """
    Step 1: Parse raw lesson plan text into structured LessonOverview.
    Returns the overview + any fields needing confirmation.
    """
    try:
        parser = ParserAgent(llm_client)
        overview = await parser.run(req.raw_text, req.provider)

        # Run completeness check
        completer = CompletenessAgent(llm_client)
        improved, confirm_items = await completer.run(overview, req.raw_text)

        # Build confirmation list
        confirmations = []
        for item in confirm_items:
            confirmations.append({
                "field": item.field,
                "confidence": item.confidence,
                "suggestion": item.suggestion,
                "action": "confirm"
            })

        return {
            "overview": improved.model_dump(by_alias=True),
            "confirmations": confirmations,
            "needsConfirmation": len(confirmations) > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse failed: {str(e)}")


@app.post("/generate")
async def generate_ppt(req: GenerateRequest):
    """
    Step 2: Generate PPTX from confirmed LessonOverview.
    Returns the PPTX file as a download.
    """
    try:
        # Reconstruct LessonOverview from dict
        overview = _dict_to_overview(req.overview)

        # Plan slides
        planner = SlidePlanner(llm_client)
        slides = await planner.run(overview)

        # Build PPTX
        builder = PPTBuilder(overview.color_scheme)
        pptx_bytes = builder.build(slides)

        filename = f"{overview.lesson_title.replace(' ', '_')}.pptx"

        return StreamingResponse(
            iter([pptx_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


def _dict_to_overview(d: dict) -> LessonOverview:
    """Reconstruct LessonOverview from a plain dict (from JSON)."""
    # Handle nested dicts for color_scheme
    cs = d.get("colorScheme") or d.get("color_scheme")
    color_scheme = None
    if cs:
        color_scheme = ColorScheme(
            primary=cs.get("primary", "#2563EB"),
            secondary=cs.get("secondary", "#DBEAFE"),
            background=cs.get("background", "#FFFFFF"),
            text=cs.get("text", "#1F2937"),
        )

    # Handle teaching goals
    goals_raw = d.get("teachingGoals") or d.get("teaching_goals", [])
    goals = []
    for g in goals_raw:
        goals.append(TeachingGoal(
            dimension=g.get("dimension", "knowledge"),
            content=g.get("content", ""),
            label=g.get("label", ""),
        ))

    # Handle structure
    struct_raw = d.get("structure", [])
    structure = []
    for s in struct_raw:
        structure.append(LessonSection(
            name=s.get("name", ""),
            slides=s.get("slides", 1),
            method=s.get("method", ""),
            time=s.get("time", ""),
            content_summary=s.get("contentSummary", ""),
        ))

    return LessonOverview(
        lesson_title=d.get("lessonTitle") or d.get("lesson_title", "Untitled"),
        grade=d.get("grade", ""),
        unit=d.get("unit", ""),
        lesson_type=d.get("lessonType") or d.get("lesson_type", "new_lesson"),
        teaching_goals=goals,
        key_points=d.get("keyPoints") or d.get("key_points", ""),
        difficult_points=d.get("difficultPoints") or d.get("difficult_points", ""),
        core_literacy=d.get("coreLiteracy") or d.get("core_literacy", []),
        teaching_methods=d.get("teachingMethods") or d.get("teaching_methods", []),
        teaching_aids=d.get("teachingAids") or d.get("teaching_aids", []),
        structure=structure,
        total_slides=d.get("totalSlides") or d.get("total_slides", 12),
        estimated_duration=d.get("estimatedDuration") or d.get("estimated_duration", "40分钟"),
        color_scheme=color_scheme,
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="127.0.0.1", port=port)
