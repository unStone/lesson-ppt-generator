export interface LessonPlan {
  title: string
  unit: string
  grade: string
  duration: number
  goals: {
    knowledge: string
    ability: string
    emotion: string
  }
  keyPoints: string
  difficultPoints: string
  preparation: string[]
  procedures: LessonProcedure[]
  homework: string
  boardDesign: string
}

export interface LessonProcedure {
  stage: string
  teacherActivity: string
  studentActivity: string
  duration: number
  contentSummary: string
}

export type LessonType = 'daily' | 'open' | 'demo' | 'competition' | 'micro' | 'research'

export interface LessonTypeOption {
  value: LessonType
  label: string
  desc: string
  icon: string
}

export interface LessonOverview {
  lessonTitle: string
  grade: string
  unit: string
  lessonType: LessonType
  teachingGoals: TeachingGoal[]
  keyPoints: string
  difficultPoints: string
  teachingMethod: string
  totalSlides: number
  structure: LessonSection[]
  designTheme: string
  colorScheme: ColorScheme
  interactionStyle: string
  animationLevel: 'low' | 'medium' | 'high'
  coreLiteracy: string[]
}

export interface TeachingGoal {
  dimension: 'knowledge' | 'ability' | 'emotion'
  label: string
  content: string
  color: 'blue' | 'green' | 'orange'
}

export interface LessonSection {
  name: string
  slides: number
  method: string
  time: string
}

export interface ColorScheme {
  primary: string
  secondary: string
  background: string
  text: string
}

export interface SlidePlan {
  slideNumber: number
  section: string
  title: string
  content: SlideContent
  visual: SlideVisual
  animation: SlideAnimation
  layout: SlideLayout
}

export interface SlideContent {
  title: string
  bodyText: string[]
  formulas?: string[]
  examples?: MathExample[]
  diagramsNeeded: boolean
}

export interface MathExample {
  problem: string
  solutionSteps: string[]
  keyPoint: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface SlideVisual {
  images: ImageAsset[]
  charts?: ChartAsset[]
  diagrams?: DiagramAsset[]
  backgroundStyle: string
}

export interface ImageAsset {
  description: string
  source: 'generate' | 'search' | 'svg' | 'chart'
  prompt?: string
}

export interface ChartAsset {
  type: string
  dataDescription: string
}

export interface DiagramAsset {
  type: string
  elements: string[]
}

export interface SlideAnimation {
  entranceAnimations: EntranceAnimation[]
  transitionType: string
}

export interface EntranceAnimation {
  elementIndex: number
  animationType: string
  trigger: 'auto' | 'click'
}

export interface SlideLayout {
  layoutTemplate: string
  elements: LayoutElement[]
}

export interface LayoutElement {
  type: string
  x: number
  y: number
  width: number
  height: number
}

export interface GenerationStep {
  id: string
  label: string
  status: 'pending' | 'running' | 'completed' | 'error'
}

export interface AppState {
  step: AppStep
  fileName: string
  fileContent: string
  lessonType: LessonType
  overview: LessonOverview | null
  generationProgress: number
  generationSteps: GenerationStep[]
  currentSlideIndex: number
  slides: SlidePlan[]
  settings: AppSettings
}

export type AppStep = 'upload' | 'overview' | 'generating' | 'preview'

export interface AppSettings {
  apiProvider: 'openai' | 'anthropic' | 'ollama'
  apiKey: string
  model: string
}

export const LESSON_TYPE_OPTIONS: LessonTypeOption[] = [
  { value: 'daily', label: '日常课', desc: '日常教学使用', icon: 'BookOpen' },
  { value: 'open', label: '公开课', desc: '公开示范教学', icon: 'Trophy' },
  { value: 'demo', label: '示范课', desc: '教学示范展示', icon: 'Star' },
  { value: 'competition', label: '比赛课', desc: '教学比赛专用', icon: 'Award' },
  { value: 'micro', label: '微课', desc: '录制微课视频', icon: 'Play' },
  { value: 'research', label: '教研课', desc: '教研活动使用', icon: 'MessageSquare' },
]

export const DEFAULT_OVERVIEW: LessonOverview = {
  lessonTitle: '两位数加两位数的进位加法',
  grade: '三年级上册',
  unit: '第5单元',
  lessonType: 'daily',
  teachingGoals: [
    { dimension: 'knowledge', label: '知识与技能', content: '理解两位数加两位数的进位加法算理，掌握竖式计算的正确方法。', color: 'blue' },
    { dimension: 'ability', label: '过程与方法', content: '经历探究算法的过程，培养知识迁移能力和解决问题的能力。', color: 'green' },
    { dimension: 'emotion', label: '情感态度与价值观', content: '感悟数学与生活的联系，培养学习数学的兴趣。', color: 'orange' },
  ],
  keyPoints: '理解进位加法的算理，能正确进行竖式计算。',
  difficultPoints: '理解进位的算理，在计算中正确处理进位后的计算。',
  teachingMethod: '启发式教学',
  totalSlides: 16,
  structure: [
    { name: '导入新课', slides: 2, method: '情境导入', time: '3分钟' },
    { name: '探究新知', slides: 6, method: '小组探究', time: '15分钟' },
    { name: '巩固练习', slides: 5, method: '分层练习', time: '15分钟' },
    { name: '课堂小结', slides: 2, method: '思维导图', time: '5分钟' },
    { name: '布置作业', slides: 1, method: '分层作业', time: '2分钟' },
  ],
  designTheme: '数学活泼风',
  colorScheme: { primary: '#2563EB', secondary: '#DBEAFE', background: '#FFFFFF', text: '#1F2937' },
  interactionStyle: '师生互动',
  animationLevel: 'medium',
  coreLiteracy: ['数感', '运算能力', '推理能力'],
}

export const GENERATION_STEPS: GenerationStep[] = [
  { id: 'parse', label: '解析教案', status: 'completed' },
  { id: 'overview', label: '生成总览', status: 'completed' },
  { id: 'content', label: '内容规划', status: 'running' },
  { id: 'material', label: '素材匹配', status: 'pending' },
  { id: 'animation', label: '动画设计', status: 'pending' },
  { id: 'export', label: '导出文件', status: 'pending' },
]

export const MOCK_SLIDES: SlidePlan[] = [
  {
    slideNumber: 1,
    section: '导入新课',
    title: '情境导入',
    content: {
      title: '情境导入',
      bodyText: ['周末小明和妈妈去超市买东西...'],
      diagramsNeeded: true,
    },
    visual: {
      images: [],
      backgroundStyle: 'light-blue',
    },
    animation: {
      entranceAnimations: [],
      transitionType: 'fade',
    },
    layout: {
      layoutTemplate: 'title-content',
      elements: [],
    },
  },
  {
    slideNumber: 2,
    section: '导入新课',
    title: '复习铺垫',
    content: {
      title: '复习铺垫',
      bodyText: ['口算练习：\n25 + 30 = 55\n46 + 20 = 66\n37 + 40 = 77'],
      diagramsNeeded: false,
    },
    visual: {
      images: [],
      backgroundStyle: 'white',
    },
    animation: {
      entranceAnimations: [],
      transitionType: 'fade',
    },
    layout: {
      layoutTemplate: 'title-content',
      elements: [],
    },
  },
  {
    slideNumber: 3,
    section: '探究新知',
    title: '例题讲解',
    content: {
      title: '例题讲解',
      bodyText: ['相同数位要对齐，\n从个位加起，\n个位满十，向十位进1。'],
      examples: [
        {
          problem: '36 + 58 = ?',
          solutionSteps: ['个位：6 + 8 = 14，写4进1', '十位：3 + 5 + 1 = 9', '所以 36 + 58 = 94'],
          keyPoint: '个位满十要向十位进1',
          difficulty: 'medium',
        },
      ],
      diagramsNeeded: true,
    },
    visual: {
      images: [{ description: '卡通女孩', source: 'generate' }],
      backgroundStyle: 'white',
    },
    animation: {
      entranceAnimations: [],
      transitionType: 'fade',
    },
    layout: {
      layoutTemplate: 'title-content',
      elements: [],
    },
  },
]
