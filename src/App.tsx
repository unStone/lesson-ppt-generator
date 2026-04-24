import { useState } from 'react'
import UploadView from './components/UploadView'
import OverviewEditor from './components/OverviewEditor'
import PreviewView from './components/PreviewView'
import ProgressBar from './components/ProgressBar'

type AppStep = 'upload' | 'overview' | 'generating' | 'preview' | 'done'

function App() {
  const [step, setStep] = useState<AppStep>('upload')
  const [progress, setProgress] = useState(0)
  const [overview, setOverview] = useState<unknown>(null)

  const handleUploadComplete = (parsedData: unknown) => {
    setOverview(parsedData)
    setStep('overview')
  }

  const handleOverviewConfirm = () => {
    setStep('generating')
    // TODO: trigger generation
  }

  const handleGenerationComplete = () => {
    setStep('preview')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">
          📐 浙江小学数学 PPT 智能生成器
        </h1>
        <div className="text-sm text-gray-500">
          v1.0.0 | 人教版一年级新教材
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border-b px-6 py-2">
        <div className="flex items-center gap-2 text-sm">
          {[
            { key: 'upload', label: '① 上传教案' },
            { key: 'overview', label: '② 总览编辑' },
            { key: 'generating', label: '③ 生成PPT' },
            { key: 'preview', label: '④ 预览/下载' },
          ].map((s, i) => (
            <span
              key={s.key}
              className={`px-3 py-1 rounded ${
                step === s.key || (step === 'done' && i <= 3)
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {step === 'upload' && <UploadView onComplete={handleUploadComplete} />}
        {step === 'overview' && (
          <OverviewEditor
            overview={overview}
            onConfirm={handleOverviewConfirm}
          />
        )}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center h-full">
            <ProgressBar progress={progress} />
            <p className="mt-4 text-gray-500">正在生成PPT，请稍候...</p>
          </div>
        )}
        {step === 'preview' && <PreviewView />}
      </main>
    </div>
  )
}

export default App
