"""
PPT Builder - 生成 .pptx 文件
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RgbColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import json
import os

class PPTBuilder:
    def __init__(self, overview: dict):
        self.prs = Presentation()
        self.overview = overview
        self.setup_theme()
    
    def setup_theme(self):
        """设置主题"""
        # 16:9 尺寸
        self.prs.slide_width = Inches(13.333)
        self.prs.slide_height = Inches(7.5)
    
    def add_title_slide(self, title: str, subtitle: str = ""):
        """添加标题页"""
        layout = self.prs.slide_layouts[0]  # Title Slide
        slide = self.prs.slides.add_slide(layout)
        slide.shapes.title.text = title
        if subtitle and slide.placeholders[1]:
            slide.placeholders[1].text = subtitle
        return slide
    
    def add_content_slide(self, title: str, content: list):
        """添加内容页"""
        layout = self.prs.slide_layouts[1]  # Title and Content
        slide = self.prs.slides.add_slide(layout)
        slide.shapes.title.text = title
        
        body = slide.placeholders[1]
        tf = body.text_frame
        tf.clear()
        
        for i, text in enumerate(content):
            if i == 0:
                p = tf.paragraphs[0]
            else:
                p = tf.add_paragraph()
            p.text = text
            p.font.size = Pt(24)
            p.space_after = Pt(12)
        
        return slide
    
    def add_formula_slide(self, title: str, formula: str):
        """添加公式页（将LaTeX渲染为图片插入）"""
        # TODO: implement LaTeX to image rendering
        return self.add_content_slide(title, [f"公式: {formula}"])
    
    def save(self, output_path: str):
        """保存文件"""
        self.prs.save(output_path)
        return output_path


def build_ppt(overview: dict, slides: list, output_path: str) -> str:
    """根据总览和逐页规划生成PPT
    """
    builder = PPTBuilder(overview)
    
    # 封面
    builder.add_title_slide(
        overview.get('lesson_title', '未知课题'),
        f"浙江省小学数学 | {overview.get('grade', '')}"
    )
    
    # 每页内容
    for slide_data in slides:
        slide_type = slide_data.get('slide_type', 'content')
        title = slide_data.get('title', '')
        content = slide_data.get('content', [])
        
        if slide_type == 'title':
            builder.add_title_slide(title)
        elif slide_type == 'content':
            builder.add_content_slide(title, content)
        elif slide_type == 'formula':
            formula = slide_data.get('formula', '')
            builder.add_formula_slide(title, formula)
    
    # 结束页
    builder.add_title_slide('谢谢观看！', '请记得完成作业哦~')
    
    return builder.save(output_path)


if __name__ == '__main__':
    # 测试
    overview = {
        'lesson_title': '认证10以内的数',
        'grade': '一年级上册'
    }
    slides = [
        {'slide_type': 'title', 'title': '认证10以内的数'},
        {'slide_type': 'content', 'title': '学习目标', 'content': ['1. 能正确数数', '2. 会写10以内的数']},
    ]
    build_ppt(overview, slides, '/tmp/test.pptx')
    print("测试PPT已生成: /tmp/test.pptx")
