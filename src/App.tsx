import { useState, useCallback } from 'react'
import UploadView from './components/UploadView'
import OverviewEditor from './components/OverviewEditor'
import GeneratingView from './components/GeneratingView'
import PreviewView from './components/PreviewView'
import SlideEditor from './components/SlideEditor'
import SettingsModal from './components/SettingsModal'
import type { AppStep, LessonOverview, SlidePlan, AppSettings, LessonType } from './types'
import { DEFAULT_OVERVIEW, GENERATION_STEPS, MOCK_SLIDES } from './types'

function App() {
  const [step, setStep] = useState<AppStep>('upload')
  const [_fileName, setFileName] = useState('')
  const [_fileContent, setFileContent] = useState('')
  const [_lessonType, setLessonType] = useState<LessonType>('daily')
  const [overview, setOverview] = useState<LessonOverview>(DEFAULT_OVERVIEW)
  const [generationProgress, setGenerationProgress] = useState(75)
  const [generationSteps, setGenerationSteps] = useState(GENERATION_STEPS)
  const [slides, setSlides] = useState<SlidePlan[]>(MOCK_SLIDES)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const [settings, setSettings] = useState<AppSettings>({
    apiProvider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSlideEditorOpen, setIsSlideEditorOpen] = useState(false)

  // Simulate generation progress
  const simulateGeneration = useCallback(() => {
    setStep('generating')
    setGenerationProgress(0)
    const steps = GENERATION_STEPS.map(s => ({ ...s, status: 'pending' as const }))
    setGenerationSteps(steps)

    let currentStep = 0
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const next = Math.min(100, prev + Math.random() * 15 + 5)
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => setStep('preview'), 500)
          return 100
        }
        return next
      })

      setGenerationSteps(prev => {
        const newSteps = [...prev]
        if (currentStep < newSteps.length) {
          newSteps[currentStep] = { ...newSteps[currentStep], status: 'completed' }
          if (currentStep + 1 < newSteps.length) {
            newSteps[currentStep + 1] = { ...newSteps[currentStep + 1], status: 'running' }
          }
          currentStep++
        }
        return newSteps
      })
    }, 800)
  }, [])

  const handleUploadComplete = useCallback((name: string, content: string, type: LessonType) => {
    setFileName(name)
    setFileContent(content)
    setLessonType(type)
    // In real app, would call AI to parse and generate overview
    // For now, use mock overview with updated lesson type
    setOverview({ ...DEFAULT_OVERVIEW, lessonType: type })
    setStep('overview')
  }, [])

  const handleOverviewConfirm = useCallback(() => {
    simulateGeneration()
  }, [simulateGeneration])

  const handleReparse = useCallback(() => {
    setStep('upload')
  }, [])

  const handleDownload = useCallback(() => {
    // In real app, would call Python worker to generate PPT
    alert('下载功能尚未实现，请等待后续更新')
  }, [])

  const handleEditSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index)
    setIsSlideEditorOpen(true)
  }, [])

  const handleSaveSlide = useCallback((slide: SlidePlan) => {
    setSlides(prev => prev.map((s, i) => (i === currentSlideIndex ? slide : s)))
  }, [currentSlideIndex])

  const getGenerationDetail = () => {
    if (generationProgress < 30) return { detail: 'AI 正在分析教案结构...', sub: '提取教学目标、重难点、教学环节' }
    if (generationProgress < 50) return { detail: 'AI 正在设计第 3 页内容...', sub: '根据教学环节规划每页的内容和布局' }
    if (generationProgress < 70) return { detail: 'AI 正在设计第 8 页内容...', sub: '正在生成例题讲解页面的图形与动画效果' }
    if (generationProgress < 90) return { detail: 'AI 正在匹配素材...', sub: '为每页匹配适当的图片和示意图' }
    return { detail: 'AI 正在导出文件...', sub: '正在生成可下载的 PPT 文件' }
  }

  const { detail, sub } = getGenerationDetail()

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg">
      {step === 'upload' && (
        <UploadView
          onComplete={handleUploadComplete}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {step === 'overview' && (
        <OverviewEditor
          overview={overview}
          onConfirm={handleOverviewConfirm}
          onReparse={handleReparse}
        />
      )}

      {step === 'generating' && (
        <GeneratingView
          progress={Math.round(generationProgress)}
          steps={generationSteps}
          currentDetail={detail}
          currentSubDetail={sub}
        />
      )}

      {step === 'preview' && (
        <PreviewView
          slides={slides}
          onEditSlide={handleEditSlide}
          onDownload={handleDownload}
        />
      )}

      {/* Slide Editor Modal */}
      <SlideEditor
        slide={isSlideEditorOpen ? slides[currentSlideIndex] : null}
        isOpen={isSlideEditorOpen}
        onClose={() => setIsSlideEditorOpen(false)}
        onSave={handleSaveSlide}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setSettings}
      />
    </div>
  )
}

export default App
