interface ProgressBarProps {
  progress: number
}

function ProgressBar({ progress }: ProgressBarProps) {
  const steps = [
    { label: '解析教案', done: true },
    { label: '设计总览', done: true },
    { label: '规划内容', done: progress >= 40 },
    { label: '规划素材', done: progress >= 60 },
    { label: '设计动画', done: progress >= 80 },
    { label: '生成PPT', done: progress >= 100 },
  ]

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step.done
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step.done ? '✓' : i + 1}
            </div>
            <span className="text-xs text-gray-500 mt-1">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
