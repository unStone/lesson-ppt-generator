"""
CompletenessAgent: Check for missing/ambiguous fields and fill gaps.
Uses hybrid strategy: high-confidence auto-fill, low-confidence mark for confirmation.
"""
from typing import Tuple, List, Dict
from agents.base_agent import BaseAgent
from models.schemas import LessonOverview, TeachingGoal, LessonSection, ColorScheme, LessonType
from utils.llm_client import LLMClient


class CompletenessCheck:
    """Result of completeness check."""
    def __init__(self, field: str, confidence: float, suggestion: str, auto_filled: bool):
        self.field = field
        self.confidence = confidence  # 0-1
        self.suggestion = suggestion
        self.auto_filled = auto_filled


class CompletenessAgent(BaseAgent):
    """
    Check parsed overview for missing/ambiguous fields.
    Auto-fill high-confidence gaps, mark low-confidence for user confirmation.
    """

    def __init__(self, llm: LLMClient):
        super().__init__(llm, name="CompletenessAgent")

    def _system_prompt(self) -> str:
        return """你是一位教案质量审核专家，负责检查AI解析结果的完整性和准确性。

规则：
1. 检查每个字段是否完整、合理
2. 教学环节（structure）应该有5个左右，总页数12-20页
3. 教学目标必须包含三个维度（知识/能力/情感）
4. 核心素养应该匹配当前年级和课题
5. 课件风格应该适合小学数学教学

输出格式：JSON数组，每个元素包含：
- field: 字段名
- confidence: 置信度 (0.0-1.0)
- suggestion: 建议值或修改建议
- action: "auto_fill" 或 "confirm""""

    async def run(self, overview: LessonOverview, raw_text: str) -> Tuple[LessonOverview, List[CompletenessCheck]]:
        """Check overview completeness and return improved version + confirmation list."""
        checks = []

        # Rule-based checks (no LLM needed)
        checks.extend(self._rule_based_checks(overview))

        # LLM-based quality assessment
        llm_checks = await self._llm_quality_check(overview, raw_text)
        checks.extend(llm_checks)

        # Apply auto-fill for high confidence items
        improved = self._apply_improvements(overview, checks)

        # Separate confirmation items
        confirm_items = [c for c in checks if not c.auto_filled]

        return improved, confirm_items

    def _rule_based_checks(self, overview: LessonOverview) -> List[CompletenessCheck]:
        """Apply rule-based completeness checks."""
        checks = []

        # Check total slides consistency
        structure_slides = sum(s.slides for s in overview.structure)
        if overview.total_slides != structure_slides:
            checks.append(CompletenessCheck(
                field="totalSlides",
                confidence=0.95,
                suggestion=f"结构总页数({structure_slides})与标注总页数({overview.total_slides})不一致，建议统一为{structure_slides}",
                auto_filled=True
            ))
            overview.total_slides = structure_slides

        # Check teaching goals count
        if len(overview.teaching_goals) < 3:
            checks.append(CompletenessCheck(
                field="teachingGoals",
                confidence=0.9,
                suggestion="教学目标应包含知识与技能、过程与方法、情感态度与价值观三个维度",
                auto_filled=False
            ))

        # Check structure completeness
        expected_sections = ["导入", "探究", "练习", "小结", "作业"]
        section_names = [s.name for s in overview.structure]
        has_all = any(keyword in " ".join(section_names) for keyword in expected_sections)
        if not has_all:
            checks.append(CompletenessCheck(
                field="structure",
                confidence=0.8,
                suggestion="建议包含：导入新课、探究新知、巩固练习、课堂小结、布置作业等环节",
                auto_filled=False
            ))

        # Check core literacy
        if not overview.core_literacy:
            checks.append(CompletenessCheck(
                field="coreLiteracy",
                confidence=0.85,
                suggestion="建议标注核心素养培养点，如数感、运算能力、推理能力等",
                auto_filled=True
            ))
            overview.core_literacy = ["数感", "运算能力"]

        # Check color scheme
        if not overview.color_scheme or not overview.color_scheme.primary:
            checks.append(CompletenessCheck(
                field="colorScheme",
                confidence=0.9,
                suggestion="primary=#2563EB, secondary=#DBEAFE, background=#FFFFFF, text=#1F2937",
                auto_filled=True
            ))
            overview.color_scheme = ColorScheme(
                primary="#2563EB", secondary="#DBEAFE",
                background="#FFFFFF", text="#1F2937"
            )

        return checks

    async def _llm_quality_check(self, overview: LessonOverview, raw_text: str) -> List[CompletenessCheck]:
        """Use LLM to assess quality and suggest improvements."""
        schema = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "field": {"type": "string"},
                    "confidence": {"type": "number"},
                    "suggestion": {"type": "string"},
                    "action": {"type": "string", "enum": ["auto_fill", "confirm"]}
                }
            }
        }

        overview_json = overview.model_dump_json(indent=2, by_alias=True)
        prompt = f"""请审核以下教案解析结果的质量。

原始教案文本（前2000字）：
{raw_text[:2000]}

解析结果：
{overview_json}

请检查：
1. 课题名称是否准确反映了教学内容
2. 年级和单元是否匹配
3. 教学重难点是否抓住了核心
4. 教学方法是否适合该年级和课题
5. 核心素养是否与课题匹配
6. 课件页数分配是否合理
7. 是否有明显遗漏或错误

对每个发现的问题，给出 field、confidence(0-1)、suggestion、action("auto_fill"或"confirm")。
置信度>0.85的建议auto_fill，否则标记为confirm。"""

        try:
            result = await self._chat_structured(prompt, schema)
            checks = []
            for item in result:
                checks.append(CompletenessCheck(
                    field=item.get("field", ""),
                    confidence=item.get("confidence", 0.5),
                    suggestion=item.get("suggestion", ""),
                    auto_filled=item.get("action") == "auto_fill" and item.get("confidence", 0) > 0.85
                ))
            return checks
        except Exception:
            return []

    def _apply_improvements(self, overview: LessonOverview, checks: List[CompletenessCheck]) -> LessonOverview:
        """Apply auto-filled improvements."""
        for check in checks:
            if check.auto_filled:
                if check.field == "coreLiteracy" and check.suggestion:
                    # Parse comma-separated literacy items
                    items = [s.strip() for s in check.suggestion.replace("建议标注核心素养培养点，如", "").replace("等", "").split("、")]
                    overview.core_literacy = [i for i in items if i] or overview.core_literacy

                if check.field == "totalSlides":
                    # Already updated in rule-based check
                    pass

        return overview
