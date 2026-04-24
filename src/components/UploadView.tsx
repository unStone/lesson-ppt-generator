import { useState, useCallback } from 'react'

interface UploadViewProps {
  onComplete: (parsedData: unknown) => void
}

function UploadView({ onComplete }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [lessonType, setLessonType] = useState('daily')

  const lessonTypes = [
    { value: 'daily', label: '日常课', desc: '简洁实用，重点突出' },
    { value: 'open', label: '公开课', desc: '精美完整，互动丰富' },
    { value: 'demo', label: '示范课', desc: '规范标准，逻辑严密' },
    { value: 'research', label: '教研课', desc: '问题导向，深度思考' },
    { value: 'competition', label: '比赛课', desc: '创意独特，视觉震撼' },
    { value: 'micro', label: '微课', desc: '聚焦核心，精炼高效' },
  ]

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      // TODO: read file content
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      // TODO: read file content
    }
  }, [])

  const handleStart = () => {
    // TODO: call electronAPI.parseLessonPlan()
    onComplete({})
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-xl font-semibold mb-6">上传教案</h2>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-600 mb-2">
            拖拽教案文件到此处，或
            <label className="text-blue-600 cursor-pointer hover:underline">
              点击上传
              <input
                type="file"
                accept=".docx,.doc,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-sm text-gray-400">支持 Word (.docx/.doc) 和 文本 (.txt) 格式</p>
          {fileName && (
            <p className="mt-3 text-sm text-green-600">✅ 已选择: {fileName}</p>
          )}
        </div>

        {/* Lesson Type Selection */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">选择课型</h3>
          <div className="grid grid-cols-3 gap-3">
            {lessonTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setLessonType(type.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  lessonType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!fileName}
          className={`mt-8 w-full py-3 rounded-lg font-medium transition-colors ${
            fileName
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          开始解析教案
        </button>
      </div>
    </div>
  )
}

export default UploadView
