"""
ParserAgent - 教案格式解析和字段提取
"""
import json
import re
from typing import Dict, Any, List, Optional

class ParserAgent:
    """教案解析器"""
    
    def __init__(self):
        self.format_patterns = {
            'detailed': [
                r'教学目标',
                r'教学重难点',
                r'教学过程',
                r'作业设计'
            ],
            'table': [
                r'\|环节\|',
                r'\|教师活动\|',
                r'\|学生活动\|'
            ]
        }
    
    def detect_format(self, text: str) -> str:
        """检测教案格式"""
        text_lower = text.lower()
        
        # 检查表格格式
        if '|' in text and any(re.search(p, text) for p in self.format_patterns['table']):
            return 'table'
        
        # 检查详细型
        score = sum(1 for p in self.format_patterns['detailed'] if re.search(p, text))
        if score >= 3:
            return 'detailed'
        if score >= 1:
            return 'brief'
        
        return 'narrative'
    
    def extract_fields(self, text: str, format_type: str) -> Dict[str, Any]:
        """根据格式提取字段"""
        if format_type == 'detailed':
            return self._extract_detailed(text)
        elif format_type == 'table':
            return self._extract_table(text)
        elif format_type == 'brief':
            return self._extract_brief(text)
        else:
            return self._extract_narrative(text)
    
    def _extract_detailed(self, text: str) -> Dict[str, Any]:
        """提取详细型教案"""
        result = {
            'title': self._extract_pattern(text, r'《?(.+?)》?\s*教案'),
            'goals': {
                'knowledge': self._extract_pattern(text, r'知识与技能[:：](.+?)(?=
\d|
二|过程与)'),
                'ability': self._extract_pattern(text, r'过程与方法[:：](.+?)(?=
\d|
三|情感)'),
                'emotion': self._extract_pattern(text, r'情感态度价值观[:：](.+?)(?=
\d|重点)')
            },
            'key_points': self._extract_pattern(text, r'重点[:：](.+?)(?=
|难点)'),
            'difficult_points': self._extract_pattern(text, r'难点[:：](.+?)(?=
|三)'),
            'procedures': self._extract_procedures(text)
        }
        return result
    
    def _extract_table(self, text: str) -> Dict[str, Any]:
        """提取表格型教案"""
        # TODO: implement table parsing
        return {'format': 'table', 'raw': text}
    
    def _extract_brief(self, text: str) -> Dict[str, Any]:
        """提取简略型教案"""
        return {
            'title': self._extract_pattern(text, r'(.+?)教案'),
            'goals': {
                'knowledge': self._extract_pattern(text, r'目标[:：](.+?)(?=
|重点)')
            },
            'key_points': self._extract_pattern(text, r'重点[:：](.+?)(?=
|难点)'),
            'difficult_points': self._extract_pattern(text, r'难点[:：](.+?)(?=
|过程)')
        }
    
    def _extract_narrative(self, text: str) -> Dict[str, Any]:
        """提取表述型教案"""
        return {
            'format': 'narrative',
            'raw': text,
            'summary': text[:200] + '...' if len(text) > 200 else text
        }
    
    def _extract_pattern(self, text: str, pattern: str) -> str:
        """通用正则提取"""
        match = re.search(pattern, text, re.DOTALL)
        return match.group(1).strip() if match else ''
    
    def _extract_procedures(self, text: str) -> List[Dict]:
        """提取教学环节"""
        procedures = []
        # 匹配环节标题
        pattern = r'(环节\d+|一、|二、|三、|四、|五、)\s*(.+?)(?=(环节\d+|一、|二、|三、|四、|五、)|作业|$)'
        matches = re.finditer(pattern, text, re.DOTALL)
        for match in matches:
            procedures.append({
                'stage': match.group(2).strip()[:50],
                'content': match.group(0).strip()[:500]
            })
        return procedures
    
    def parse(self, text: str) -> Dict[str, Any]:
        """主入口：解析教案"""
        format_type = self.detect_format(text)
        fields = self.extract_fields(text, format_type)
        
        return {
            'format_type': format_type,
            'extracted': fields,
            'completeness': self._check_completeness(fields)
        }
    
    def _check_completeness(self, fields: Dict) -> Dict[str, Any]:
        """检查完整性"""
        required = ['title', 'goals', 'key_points', 'difficult_points']
        missing = []
        
        for field in required:
            value = fields.get(field)
            if not value or (isinstance(value, dict) and not any(value.values())):
                missing.append(field)
        
        return {
            'missing_fields': missing,
            'is_complete': len(missing) == 0,
            'confidence': 1.0 - (len(missing) / len(required))
        }


if __name__ == '__main__':
    # 测试
    test_text = """
《认证10以内的数》教案
一、教学目标
1. 知识与技能：能正确数出10以内物体的个数
2. 过程与方法：经历从具体到抽象的过程
3. 情感态度价值观：体验数学与生活的联系
二、教学重难点
重点：正确数出10以内物体的个数
难点：理解数的有序性
三、教学过程
环节1：情境导入
环节2：探索新知
环节3：巩固练习
四、作业设计
完成练习题1-5
    """
    
    agent = ParserAgent()
    result = agent.parse(test_text)
    print(json.dumps(result, ensure_ascii=False, indent=2))
