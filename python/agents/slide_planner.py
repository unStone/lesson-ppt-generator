"""
SlidePlanner: Generate detailed slide-by-slide plan based on LessonOverview.
Produces SlidePlan array with content, visual, animation, and layout for each slide.
"""
import json
from typing import List
from agents.base_agent import BaseAgent
from models.schemas import (
    LessonOverview, SlidePlan, SlideContent, SlideVisual, SlideAnimation,
    SlideLayout, ImageAsset, MathExample, EntranceAnimation
)
from utils.llm_client import LLMClient


class SlidePlanner(BaseAgent):
    """Plan each slide's content, visuals, animations, and layout."""

    def __init__(self, llm: LLMClient):
        super().__init__(llm, name="SlidePlanner")

    def _system_prompt(self) -> str:
        return """你是一位专业的小学数学课件设计师，擅长将教案转化为精美的PPT逐页规划。

你的设计原则：
1. 小学生注意力集中时间短，每页内容不宜过多
2. 使用大字体、清晰的排版
3. 数学课件需要包含：数学公式、示例题、图表、思维导图
4. 使用幼儿化、温暖的视觉风格
5. 动画效果以"逐个出现"为主，避免过度花哨

布局模板选择：
- title_content: 标题+内容（最常用）
- title_only: 标题页（章节开始页）
- two_column: 两栏布局（对比/分类内容）
- image_text: 图文混排（情境导入）
- formula: 公式专用布局
- chart: 图表专用布局
- mindmap: 思维导图布局（课堂小结）

动画效果选择：
- fade: 淡入
- fly_in: 飞入
- wipe: 擦除
- zoom: 缩放
- appear: 直接出现（适合数学公式）"""

    async def run(self, overview: LessonOverview) -> List[SlidePlan]:
        """Generate slide plans for all slides in the lesson."""
        slides = []
        slide_number = 1

        # 1. Title slide
        slides.append(self._make_title_slide(slide_number, overview))
        slide_number += 1

        # 2. Learning objectives slide
        slides.append(self._make_objectives_slide(slide_number, overview))
        slide_number += 1

        # 3. Process each section
        for section in overview.structure:
            section_slides = await self._plan_section_slides(
                section, slide_number, overview
            )
            slides.extend(section_slides)
            slide_number += len(section_slides)

        # 4. Final "thank you" slide
        slides.append(self._make_closing_slide(slide_number, overview))

        return slides

    def _make_title_slide(self, n: int, overview: LessonOverview) -> SlidePlan:
        return SlidePlan(
            slide_number=n,
            section="封面",
            title=overview.lesson_title,
            content=SlideContent(
                title=overview.lesson_title,
                body_text=[
                    f"浙江省小学数学 | {overview.grade}",
                    f"单元：{overview.unit}",
                ],
            ),
            visual=SlideVisual(
                images=[ImageAsset(description="数学主题装饰图", source="svg")],
                background_style="gradient-blue",
            ),
            animation=SlideAnimation(
                entrance_animations=[
                    EntranceAnimation(element_index=0, animation_type="fade", trigger="auto"),
                    EntranceAnimation(element_index=1, animation_type="fly_in", trigger="click"),
                ],
                transition_type="fade",
            ),
            layout=SlideLayout(layout_template="title_only", elements=[]),
        )

    def _make_objectives_slide(self, n: int, overview: LessonOverview) -> SlidePlan:
        body = ["本课学习目标："]
        for g in overview.teaching_goals:
            body.append(f"• {g.label}：{g.content}")
        body.append("")
        body.append(f"核心素养：{'、'.join(overview.core_literacy)}")

        return SlidePlan(
            slide_number=n,
            section="学习目标",
            title="学习目标",
            content=SlideContent(title="学习目标", body_text=body),
            visual=SlideVisual(
                images=[],
                background_style="white",
            ),
            animation=SlideAnimation(
                entrance_animations=[
                    EntranceAnimation(element_index=0, animation_type="fade", trigger="auto"),
                    EntranceAnimation(element_index=1, animation_type="fly_in", trigger="click"),
                    EntranceAnimation(element_index=2, animation_type="fly_in", trigger="click"),
                    EntranceAnimation(element_index=3, animation_type="fly_in", trigger="click"),
                ],
                transition_type="fade",
            ),
            layout=SlideLayout(layout_template="title_content", elements=[]),
        )

    async def _plan_section_slides(self, section: dict, start_n: int, overview: LessonOverview) -> List[SlidePlan]:
        """Generate slides for a single section."""
        section_name = section.name if hasattr(section, 'name') else section.get('name', '未知环节')
        slide_count = section.slides if hasattr(section, 'slides') else section.get('slides', 1)

        # Use LLM for section-specific slide planning
        schema = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "bodyText": {"type": "array", "items": {"type": "string"}},
                    "layoutTemplate": {"type": "string", "enum": ["title_content", "two_column", "image_text", "formula", "chart", "mindmap"]},
                    "hasFormula": {"type": "boolean"},
                    "hasExample": {"type": "boolean"},
                    "animationType": {"type": "string", "enum": ["fade", "fly_in", "wipe", "zoom", "appear"]},
                    "imageDesc": {"type": "string"},
                },
                "required": ["title", "bodyText", "layoutTemplate"]
            }
        }

        prompt = f"""请为以下教学环节设计{slide_count}页PPT内容。

环节名称：{section_name}
环节介绍：{section.method} | {section.time if hasattr(section, 'time') else section.get('time', '')}
课题：{overview.lesson_title}
年级：{overview.grade}
教学重点：{overview.key_points}
教学难点：{overview.difficult_points}

要求：
1. 每页内容精简，适合小学生阅读
2. 如果是数学计算环节，包含具体的例题
3. 注意使用颜色标注重点：{overview.color_scheme.primary if overview.color_scheme else '#2563EB'}
4. 如果是课堂小结环节，使用思维导图布局
5. 如果是作业环节，列出具体作业题目

请输出JSON数组，每个元素包含title、bodyText、layoutTemplate等字段。"""

        try:
            result = await self._chat_structured(prompt, schema)
        except Exception:
            # Fallback: generate basic slides
            result = self._fallback_section_slides(section_name, slide_count, overview)

        slides = []
        for i, slide_data in enumerate(result):
            n = start_n + i
            body_text = slide_data.get("bodyText", [])
            has_formula = slide_data.get("hasFormula", False)
            has_example = slide_data.get("hasExample", False)

            # Build examples if applicable
            examples = None
            if has_example and len(body_text) >= 2:
                examples = [
                    MathExample(
                        problem=body_text[0] if body_text else "",
                        solution_steps=body_text[1:3] if len(body_text) > 1 else ["见解析"],
                        key_point=overview.key_points[:50],
                        difficulty="medium",
                    )
                ]

            layout = slide_data.get("layoutTemplate", "title_content")
            anim = slide_data.get("animationType", "fade")
            image_desc = slide_data.get("imageDesc", "")

            slides.append(SlidePlan(
                slide_number=n,
                section=section_name,
                title=slide_data.get("title", f"{section_name} - 页{i+1}"),
                content=SlideContent(
                    title=slide_data.get("title", ""),
                    body_text=body_text,
                    formulas=[body_text[0]] if has_formula and body_text else None,
                    examples=examples,
                    diagrams_needed="图表" in section_name or layout == "chart",
                ),
                visual=SlideVisual(
                    images=[ImageAsset(description=image_desc or f"{section_name}插图", source="generate")]
                        if image_desc or layout == "image_text" else [],
                    background_style="white",
                ),
                animation=SlideAnimation(
                    entrance_animations=[
                        EntranceAnimation(element_index=0, animation_type="fade", trigger="auto"),
                        EntranceAnimation(element_index=1, animation_type=anim, trigger="click"),
                    ] if len(body_text) > 0 else [
                        EntranceAnimation(element_index=0, animation_type="fade", trigger="auto"),
                    ],
                    transition_type=anim,
                ),
                layout=SlideLayout(layout_template=layout, elements=[]),
            ))

        return slides

    def _fallback_section_slides(self, section_name: str, count: int, overview: LessonOverview) -> List[dict]:
        """Fallback slide content when LLM fails."""
        slides = []
        for i in range(count):
            slides.append({
                "title": f"{section_name} - 第{i+1}页",
                "bodyText": [f"本页内容待填充...", f"教学环节：{section_name}"],
                "layoutTemplate": "title_content",
                "hasFormula": False,
                "hasExample": False,
                "animationType": "fade",
                "imageDesc": "",
            })
        return slides

    def _make_closing_slide(self, n: int, overview: LessonOverview) -> SlidePlan:
        return SlidePlan(
            slide_number=n,
            section="结束",
            title="课堂总结",
            content=SlideContent(
                title="课堂总结",
                body_text=[
                    "今天我们学习了：",
                    f"• {overview.lesson_title}",
                    "",
                    "作业：",
                    "• 请完成练习题",
                    "• 回家讲给爸妈听",
                ],
            ),
            visual=SlideVisual(
                images=[ImageAsset(description="感谢观看装饰图", source="svg")],
                background_style="gradient-green",
            ),
            animation=SlideAnimation(
                entrance_animations=[
                    EntranceAnimation(element_index=0, animation_type="fade", trigger="auto"),
                ],
                transition_type="fade",
            ),
            layout=SlideLayout(layout_template="title_content", elements=[]),
        )
