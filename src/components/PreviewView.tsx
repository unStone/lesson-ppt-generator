import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Edit3, FileText, Minus, Plus, Maximize2 } from 'lucide-react'
import type { SlidePlan } from '../types'

interface PreviewViewProps {
  slides: SlidePlan[]
  onEditSlide: (index: number) => void
  onDownload: () => void
}

function PreviewView({ slides, onEditSlide, onDownload }: PreviewViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(100)

  const currentSlide = slides[currentIndex]

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) setCurrentIndex(currentIndex + 1)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-semibold text-title">Lesson PPT Generator</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-body">第 {currentIndex + 1} / {slides.length} 页</span>
          <button
            onClick={() => onEditSlide(currentIndex)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary bg-primary-light hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            编辑此页
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            下载 PPT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Thumbnails */}
        <div className="w-52 bg-gray-50 border-r border-gray-200 overflow-y-auto p-3">
          <h3 className="text-xs font-medium text-gray-500 mb-3 px-1">页面缩略图</h3>
          <div className="space-y-2">
            {slides.map((slide, i) => (
              <button
                key={slide.slideNumber}
                onClick={() => setCurrentIndex(i)}
                className={`w-full aspect-video rounded-lg border-2 transition-all ${
                  i === currentIndex
                    ? 'border-primary bg-white shadow-card'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="h-full flex flex-col items-center justify-center p-2">
                  <span className={`text-xs font-medium ${i === currentIndex ? 'text-primary' : 'text-gray-400'}`}>
                    第{i + 1}页
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 truncate w-full text-center">
                    {slide.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Preview Canvas */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-hidden"
              style={{
                width: `${scale}%`,
                maxWidth: '900px',
                aspectRatio: '16/9',
              }}
            >
              {/* Notebook spiral effect */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-primary/10 flex items-center justify-center gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary/30" />
                ))}
              </div>

              {/* Slide Content */}
              <div className="h-full p-8 pt-6">
                {/* Section badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-xs text-emerald-600">★</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">{currentSlide?.section || ''}</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-title mb-4">{currentSlide?.title || ''}</h2>

                {/* Body */}
                <div className="space-y-3">
                  {currentSlide?.content.bodyText.map((text, i) => (
                    <p key={i} className="text-base text-body whitespace-pre-line">{text}</p>
                  ))}
                </div>

                {/* Example box */}
                {currentSlide?.content.examples && currentSlide.content.examples.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-primary mb-3">例题讲解</h3>
                    {currentSlide.content.examples.map((ex, i) => (
                      <div key={i}>
                        <p className="text-base font-medium text-title mb-2">{ex.problem}</p>
                        <div className="space-y-1.5">
                          {ex.solutionSteps.map((step, j) => (
                            <p key={j} className="text-sm text-body">{step}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-4 right-4 text-4xl font-bold text-primary/10">123</div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 text-gray-500 hover:text-primary hover:bg-primary-light rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {slides.map((_, i) => {
                  const isNearCurrent = Math.abs(i - currentIndex) <= 2
                  const isFirst = i === 0
                  const isLast = i === slides.length - 1
                  if (!isNearCurrent && !isFirst && !isLast) {
                    if (i === currentIndex - 3 || i === currentIndex + 3) return <span key={i} className="text-xs text-gray-400 px-1">...</span>
                    return null
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`min-w-[28px] h-7 px-1.5 text-xs rounded-md transition-colors ${
                        i === currentIndex
                          ? 'bg-primary text-white font-medium'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === slides.length - 1}
                className="p-2 text-gray-500 hover:text-primary hover:bg-primary-light rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                <button
                  onClick={() => setScale(Math.max(50, scale - 10))}
                  className="p-1 text-gray-500 hover:text-primary rounded"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-body w-10 text-center">{scale}%</span>
                <button
                  onClick={() => setScale(Math.min(150, scale + 10))}
                  className="p-1 text-gray-500 hover:text-primary rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button className="p-2 text-gray-500 hover:text-primary hover:bg-primary-light rounded-lg transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewView
