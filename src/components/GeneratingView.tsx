import { Check, Loader2, FileText } from 'lucide-react'
import type { GenerationStep } from '../types'

interface GeneratingViewProps {
  progress: number
  steps: GenerationStep[]
  currentDetail: string
  currentSubDetail: string
}

function GeneratingView({ progress, steps, currentDetail, currentSubDetail }: GeneratingViewProps) {
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-semibold text-title">Lesson PPT Generator</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#2563EB"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-primary">{progress}%</span>
            <span className="text-sm text-body mt-1">AI 正在生成 PPT</span>
            <span className="text-xs text-caption mt-0.5">预计还需 20 秒</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${
                step.status === 'completed'
                  ? 'bg-primary text-white'
                  : step.status === 'running'
                  ? 'bg-primary-light text-primary border border-primary/20'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : step.status === 'running' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-current" />
                )}
                <span className="font-medium">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-px mx-1 ${
                  step.status === 'completed' ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Status Card */}
        <div className="flex items-center gap-4 card p-5 max-w-lg w-full">
          {/* Robot Avatar */}
          <div className="flex items-center justify-center w-14 h-14 bg-primary-light rounded-xl shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="4" width="20" height="16" rx="3" fill="#2563EB" />
              <rect x="9" y="8" width="14" height="8" rx="1" fill="#DBEAFE" />
              <circle cx="12" cy="12" r="1.5" fill="#2563EB" />
              <circle cx="20" cy="12" r="1.5" fill="#2563EB" />
              <rect x="14" y="14" width="4" height="1" rx="0.5" fill="#2563EB" />
              <rect x="13" y="20" width="6" height="8" rx="2" fill="#2563EB" />
              <rect x="10" y="22" width="3" height="4" rx="1" fill="#2563EB" opacity="0.6" />
              <rect x="19" y="22" width="3" height="4" rx="1" fill="#2563EB" opacity="0.6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-title">{currentDetail}</p>
            <p className="text-xs text-caption mt-1">{currentSubDetail}</p>
          </div>
        </div>

        {/* Tip */}
        <p className="mt-6 text-xs text-caption">
          提示：您可以关闭页面，稍后在“历史记录”中查看进度
        </p>
      </main>
    </div>
  )
}

export default GeneratingView
