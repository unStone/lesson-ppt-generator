"""
ParserAgent: Extract structured lesson plan from raw text.
Handles various formats: plain text, markdown, semi-structured.
"""
import json
from typing import Optional
from agents.base_agent import BaseAgent
from models.schemas import LessonOverview, TeachingGoal, TeachingGoalDimension, TeachingGoalColor, LessonSection, ColorScheme, LessonType
from utils.llm_client import LLMClient


class ParserAgent(BaseAgent):
    """Parse raw lesson plan text into structured LessonOverview."""

    def __init__(self, llm: LLMClient):
        super().__init__(llm, name="ParserAgent")

    def _system_prompt(self) -> str:
        return """你是一位专业的教案解析专家，擅长从各种格式的教案文本中提取结构化信息。
你服务的是中国小学数学教师，特别是浙江省杭州市使用人教版2024版教材的一年级数学教师。

你的任务是：
1. 从教案文本中提取所有关键字段
2. 识别教学目标（知识与技能、过程与方法、情感态度与价值观三个维度）
3. 提取教学重难点
4. 识别教学环节和时间分配
5. 推断适合的教学方法
6. 识别核心素养培养点

输出规则：
- 必须返回有效的JSON格式
- 如果某个字段在原文中找不到，使用合理的默认值或标记为"未明确"
- 教学目标必须包含三个维度
- 教学环节通常包括：导入新课、探究新知、巩固练习、课堂小结、布置作业
- 课件总页数根据教学环节推断，通常12-20页"""

    async def run(self, text: str, lesson_type: str = "daily") -> LessonOverview:
        """Parse lesson plan text into structured overview."""
        schema = {
            "type": "object",
            "properties": {
                "lessonTitle": {"type": "string", "description": "课题名称，如'认识10以内的数'"},
                "grade": {"type": "string", "description": "年级和册别，如'一年级上册'"},
                "unit": {"type": "string", "description": "单元信息，如'第1单元'"},
                "lessonType": {"type": "string", "enum": ["daily", "open", "demo", "competition", "micro", "research"]},
                "teachingGoals": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "dimension": {"type": "string", "enum": ["knowledge", "ability", "emotion"]},
                            "label": {"type": "string"},
                            "content": {"type": "string"},
                            "color": {"type": "string", "enum": ["blue", "green", "orange"]}
                        },
                        "required": ["dimension", "label", "content", "color"]
                    }
                },
                "keyPoints": {"type": "string", "description": "教学重点"},
                "difficultPoints": {"type": "string", "description": "教学难点"},
                "teachingMethod": {"type": "string", "description": "教学方法，如'启发式教学''情境教学法'"},
                "totalSlides": {"type": "integer", "description": "课件总页数，12-20之间"},
                "structure": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "slides": {"type": "integer"},
                            "method": {"type": "string"},
                            "time": {"type": "string"}
                        },
                        "required": ["name", "slides", "method", "time"]
                    }
                },
                "designTheme": {"type": "string", "description": "课件设计风格，如'数学活泼风''清新自然风'"},
                "colorScheme": {
                    "type": "object",
                    "properties": {
                        "primary": {"type": "string"},
                        "secondary": {"type": "string"},
                        "background": {"type": "string"},
                        "text": {"type": "string"}
                    }
                },
                "interactionStyle": {"type": "string", "description": "师生互动方式"},
                "animationLevel": {"type": "string", "enum": ["low", "medium", "high"]},
                "coreLiteracy": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "核心素养，如['数感','运算能力','推理能力']"
                }
            },
            "required": ["lessonTitle", "grade", "teachingGoals", "keyPoints", "difficultPoints", "structure"]
        }

        prompt = f"""请解析以下教案文本，提取结构化信息。

教案文本：
```
{text[:8000]}
```

用户选择的课件类型：{self._lesson_type_desc(lesson_type)}

请严格按照JSON schema输出解析结果。"""

        result = await self._chat_structured(prompt, schema)
        return self._build_overview(result, lesson_type)

    def _lesson_type_desc(self, t: str) -> str:
        mapping = {
            "daily": "日常课（常规教学）",
            "open": "公开课（公开示范教学）",
            "demo": "示范课（教学示范展示）",
            "competition": "比赛课（教学比赛专用）",
            "micro": "微课（录制微课视频）",
            "research": "教研课（教研活动使用）",
        }
        return mapping.get(t, "日常课")

    def _build_overview(self, data: dict, lesson_type: str) -> LessonOverview:
        """Build LessonOverview from parsed JSON dict."""
        # Defaults for missing fields
        goals_data = data.get("teachingGoals", [])
        if len(goals_data) < 3:
            defaults = [
                {"dimension": "knowledge", "label": "知识与技能", "content": "掌握本课核心知识点", "color": "blue"},
                {"dimension": "ability", "label": "过程与方法", "content": "培养数学思维能力", "color": "green"},
                {"dimension": "emotion", "label": "情感态度与价值观", "content": "激发数学学习兴趣", "color": "orange"},
            ]
            for i, d in enumerate(defaults):
                if i >= len(goals_data):
                    goals_data.append(d)

        goals = [TeachingGoal(**g) for g in goals_data[:3]]

        structure_data = data.get("structure", [])
        if not structure_data:
            structure_data = [
                {"name": "导入新课", "slides": 2, "method": "情境导入", "time": "3分钟"},
                {"name": "探究新知", "slides": 6, "method": "小组探究", "time": "15分钟"},
                {"name": "巩固练习", "slides": 5, "method": "分层练习", "time": "12分钟"},
                {"name": "课堂小结", "slides": 2, "method": "思维导图", "time": "5分钟"},
                {"name": "布置作业", "slides": 1, "method": "分层作业", "time": "2分钟"},
            ]

        structure = [LessonSection(**s) for s in structure_data]
        total_slides = data.get("totalSlides", sum(s.slides for s in structure))

        color_data = data.get("colorScheme", {
            "primary": "#2563EB",
            "secondary": "#DBEAFE",
            "background": "#FFFFFF",
            "text": "#1F2937"
        })

        return LessonOverview(
            lesson_title=data.get("lessonTitle", "未命名课题"),
            grade=data.get("grade", "一年级上册"),
            unit=data.get("unit", "第1单元"),
            lesson_type=LessonType(lesson_type),
            teaching_goals=goals,
            key_points=data.get("keyPoints", "未提取到教学重点"),
            difficult_points=data.get("difficultPoints", "未提取到教学难点"),
            teaching_method=data.get("teachingMethod", "启发式教学"),
            total_slides=total_slides,
            structure=structure,
            design_theme=data.get("designTheme", "数学活泼风"),
            color_scheme=ColorScheme(**color_data),
            interaction_style=data.get("interactionStyle", "师生互动"),
            animation_level=data.get("animationLevel", "medium"),
            core_literacy=data.get("coreLiteracy", ["数感", "运算能力"]),
        )
