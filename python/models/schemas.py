"""
Pydantic schemas for lesson plan to PPT generation.
Mirrors the frontend TypeScript types.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum


class LessonType(str, Enum):
    DAILY = "daily"
    OPEN = "open"
    DEMO = "demo"
    COMPETITION = "competition"
    MICRO = "micro"
    RESEARCH = "research"


class TeachingGoalDimension(str, Enum):
    KNOWLEDGE = "knowledge"
    ABILITY = "ability"
    EMOTION = "emotion"


class TeachingGoalColor(str, Enum):
    BLUE = "blue"
    GREEN = "green"
    ORANGE = "orange"


class TeachingGoal(BaseModel):
    dimension: TeachingGoalDimension
    label: str
    content: str
    color: TeachingGoalColor


class ColorScheme(BaseModel):
    primary: str
    secondary: str
    background: str
    text: str


class LessonSection(BaseModel):
    name: str
    slides: int
    method: str
    time: str


class LessonOverview(BaseModel):
    lesson_title: str = Field(..., alias="lessonTitle")
    grade: str
    unit: str
    lesson_type: LessonType = Field(..., alias="lessonType")
    teaching_goals: List[TeachingGoal] = Field(..., alias="teachingGoals")
    key_points: str = Field(..., alias="keyPoints")
    difficult_points: str = Field(..., alias="difficultPoints")
    teaching_method: str = Field(..., alias="teachingMethod")
    total_slides: int = Field(..., alias="totalSlides")
    structure: List[LessonSection]
    design_theme: str = Field(..., alias="designTheme")
    color_scheme: ColorScheme = Field(..., alias="colorScheme")
    interaction_style: str = Field(..., alias="interactionStyle")
    animation_level: Literal["low", "medium", "high"] = Field(..., alias="animationLevel")
    core_literacy: List[str] = Field(..., alias="coreLiteracy")

    class Config:
        populate_by_name = True


class MathExample(BaseModel):
    problem: str
    solution_steps: List[str] = Field(..., alias="solutionSteps")
    key_point: str = Field(..., alias="keyPoint")
    difficulty: Literal["easy", "medium", "hard"]

    class Config:
        populate_by_name = True


class SlideContent(BaseModel):
    title: str
    body_text: List[str] = Field(default_factory=list, alias="bodyText")
    formulas: Optional[List[str]] = None
    examples: Optional[List[MathExample]] = None
    diagrams_needed: bool = Field(default=False, alias="diagramsNeeded")

    class Config:
        populate_by_name = True


class ImageAsset(BaseModel):
    description: str
    source: Literal["generate", "search", "svg", "chart"]
    prompt: Optional[str] = None


class ChartAsset(BaseModel):
    type: str
    data_description: str = Field(..., alias="dataDescription")


class DiagramAsset(BaseModel):
    type: str
    elements: List[str]


class EntranceAnimation(BaseModel):
    element_index: int = Field(..., alias="elementIndex")
    animation_type: str = Field(..., alias="animationType")
    trigger: Literal["auto", "click"]


class SlideAnimation(BaseModel):
    entrance_animations: List[EntranceAnimation] = Field(default_factory=list, alias="entranceAnimations")
    transition_type: str = Field(default="fade", alias="transitionType")


class SlideLayout(BaseModel):
    layout_template: str = Field(..., alias="layoutTemplate")
    elements: List[dict] = Field(default_factory=list)


class SlideVisual(BaseModel):
    images: List[ImageAsset] = Field(default_factory=list)
    charts: Optional[List[ChartAsset]] = None
    diagrams: Optional[List[DiagramAsset]] = None
    background_style: str = Field(default="white", alias="backgroundStyle")


class SlidePlan(BaseModel):
    slide_number: int = Field(..., alias="slideNumber")
    section: str
    title: str
    content: SlideContent
    visual: SlideVisual
    animation: SlideAnimation
    layout: SlideLayout

    class Config:
        populate_by_name = True


class AppSettings(BaseModel):
    api_provider: Literal["openai", "anthropic", "ollama"] = Field(default="openai", alias="apiProvider")
    api_key: str = Field(default="", alias="apiKey")
    model: str = Field(default="gpt-4o")

    class Config:
        populate_by_name = True


class GenerationStep(BaseModel):
    id: str
    label: str
    status: Literal["pending", "running", "completed", "error"] = "pending"


class ParseResult(BaseModel):
    success: bool
    overview: Optional[LessonOverview] = None
    message: Optional[str] = None


class GenerateSlidesResult(BaseModel):
    success: bool
    slides: Optional[List[SlidePlan]] = None
    message: Optional[str] = None


class BuildPPTResult(BaseModel):
    success: bool
    file_path: Optional[str] = None
    message: Optional[str] = None
