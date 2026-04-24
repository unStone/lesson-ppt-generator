import { useState, useCallback, useRef } from 'react'
import { BookOpen, Trophy, Star, Award, Play, MessageSquare, Settings, UploadCloud, FileText } from 'lucide-react'
import type { LessonType } from '../types'
import { LESSON_TYPE_OPTIONS } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Trophy,
  Star,
  Award,
  Play,
  MessageSquare,
}

interface UploadViewProps {
  onComplete: (fileName: string, fileContent: string, lessonType: LessonType) => void
  onOpenSettings: () => void
}

function UploadView({ onComplete, onOpenSettings }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [lessonType, setLessonType] = useState<LessonType>('daily')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const readFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(String(e.target?.result || ''))
      reader.readAsText(file)
    })
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      const content = await readFile(file)
      setFileContent(content)
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const content = await readFile(file)
      setFileContent(content)
    }
  }, [])

  const handleStart = () => {
    if (fileName && fileContent) {
      onComplete(fileName, fileContent, lessonType)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-title">Lesson PPT Generator</span>
            <span className="px-2 py-0.5 text-xs text-primary bg-primary-light rounded-full">v1.0.0</span>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center py-14 px-8 rounded-card border-2 border-dashed cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary-light/50'
                : 'border-gray-300 bg-white hover:border-primary/60 hover:bg-gray-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary-light">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <p className="text-base text-body mb-1">
              拖拽文件到这里，或<span className="text-primary font-medium">点击上传</span>
            </p>
            <p className="text-caption text-gray-400">
              支持 Word (.docx) / TXT 文件，大小不超过 20MB
            </p>
            {fileName && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                <FileText className="w-4 h-4" />
                <span>{fileName}</span>
              </div>
            )}
          </div>

          {/* Lesson Type Selection */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-title mb-3">选择课型</h3>
            <div className="grid grid-cols-3 gap-3">
              {LESSON_TYPE_OPTIONS.map((type) => {
                const Icon = ICON_MAP[type.icon]
                const isSelected = lessonType === type.value
                return (
                  <button
                    key={type.value}
                    onClick={() => setLessonType(type.value)}
                    className={`flex flex-col items-center p-4 rounded-card border text-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-light shadow-card'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-card-hover'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 mb-2 rounded-lg ${
                      isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-title'}`}>
                      {type.label}
                    </span>
                    <span className="text-xs text-caption mt-0.5">{type.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-6">
            <button
              onClick={handleStart}
              disabled={!fileName}
              className="w-full btn-primary py-3.5 text-base"
            >
              开始解析
              <svg className="w-4 h-4 ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <p className="mt-2 text-center text-xs text-caption">
              上传后即可开始 AI 解析教案内容
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UploadView
