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

export interface LessonOverview {
  lessonTitle: string
  grade: string
  lessonType: 'daily' | 'open' | 'demo' | 'research' | 'competition' | 'micro'
  teachingGoals: string[]
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
