import { useState } from 'react'
import { Pencil, ArrowRight, FileText } from 'lucide-react'
import type { LessonOverview } from '../types'
import { LESSON_TYPE_OPTIONS } from '../types'

interface OverviewEditorProps {
  overview: LessonOverview
  onConfirm: () => void
  onReparse: () => void
}

function OverviewEditor({ overview, onConfirm, onReparse }: OverviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editField, setEditField] = useState<string | null>(null)
  const [localOverview, setLocalOverview] = useState<LessonOverview>(overview)

  const lessonTypeLabel = LESSON_TYPE_OPTIONS.find(t => t.value === localOverview.lessonType)?.label || ''

  const handleGoalEdit = (index: number, newContent: string) => {
    const newGoals = [...localOverview.teachingGoals]
    newGoals[index] = { ...newGoals[index], content: newContent }
    setLocalOverview({ ...localOverview, teachingGoals: newGoals })
  }

  const handleKeyPointEdit = (field: 'keyPoints' | 'difficultPoints', value: string) => {
    setLocalOverview({ ...localOverview, [field]: value })
  }

  const getGoalColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200'
      case 'green': return 'bg-emerald-50 border-emerald-200'
      case 'orange': return 'bg-amber-50 border-amber-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getGoalTagClass = (color: string) => {
    switch (color) {
      case 'blue': return 'tag-blue'
      case 'green': return 'tag-green'
      case 'orange': return 'tag-orange'
      default: return 'tag-blue'
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
          <span className="text-base font-semibold text-title">Lesson PPT Generator</span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary-light rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
          {isEditing ? '完成编辑' : '编辑'}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Title Card */}
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-display text-title">{localOverview.lessonTitle}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-body text-gray-500">{localOverview.grade} 第{localOverview.unit}单元</span>
                  <span className="tag-blue">{lessonTypeLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teaching Goals */}
          <div className="card p-5">
            <h2 className="text-h1 text-title mb-4">教学目标</h2>
            <div className="space-y-3">
              {localOverview.teachingGoals.map((goal, i) => (
                <div key={goal.dimension} className={`p-4 rounded-lg border ${getGoalColorClass(goal.color)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={getGoalTagClass(goal.color)}>{goal.label}</span>
                    {isEditing && (
                      <button
                        onClick={() => setEditField(editField === `goal-${i}` ? null : `goal-${i}`)}
                        className="p-1 text-gray-400 hover:text-primary rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editField === `goal-${i}` ? (
                    <textarea
                      className="textarea"
                      rows={2}
                      value={goal.content}
                      onChange={(e) => handleGoalEdit(i, e.target.value)}
                      onBlur={() => setEditField(null)}
                      autoFocus
                    />
                  ) : (
                    <p className="text-body text-body">{goal.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key & Difficult Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-h1 text-title">教学重点</h2>
                <span className="tag-green">重点</span>
              </div>
              {isEditing && editField === 'keyPoints' ? (
                <textarea
                  className="textarea"
                  rows={3}
                  value={localOverview.keyPoints}
                  onChange={(e) => handleKeyPointEdit('keyPoints', e.target.value)}
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
              ) : (
                <p className="text-body text-body">{localOverview.keyPoints}</p>
              )}
              {isEditing && editField !== 'keyPoints' && (
                <button
                  onClick={() => setEditField('keyPoints')}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  编辑
                </button>
              )}
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-h1 text-title">教学难点</h2>
                <span className="tag-orange">难点</span>
              </div>
              {isEditing && editField === 'difficultPoints' ? (
                <textarea
                  className="textarea"
                  rows={3}
                  value={localOverview.difficultPoints}
                  onChange={(e) => handleKeyPointEdit('difficultPoints', e.target.value)}
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
              ) : (
                <p className="text-body text-body">{localOverview.difficultPoints}</p>
              )}
              {isEditing && editField !== 'difficultPoints' && (
                <button
                  onClick={() => setEditField('difficultPoints')}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  编辑
                </button>
              )}
            </div>
          </div>

          {/* Teaching Structure */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h1 text-title">教学环节设计</h2>
              <span className="text-caption text-gray-400">共 {localOverview.totalSlides} 页，约 {localOverview.structure.reduce((acc, s) => acc + parseInt(s.time), 0)} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              {localOverview.structure.map((section, i) => (
                <div key={section.name} className="flex items-center flex-1">
                  <div className="flex-1 bg-primary-light rounded-lg p-3 text-center">
                    <div className="text-sm font-medium text-primary">{section.name}</div>
                    <div className="text-xs text-primary/70 mt-1">{section.slides}页 / {section.time}</div>
                  </div>
                  {i < localOverview.structure.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-1 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="card p-5">
            <h2 className="text-h1 text-title mb-4">生成设置</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-caption mb-1.5 block">总页数</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="input w-20"
                    value={localOverview.totalSlides}
                    onChange={(e) => setLocalOverview({ ...localOverview, totalSlides: parseInt(e.target.value) || 0 })}
                    min={1}
                    max={50}
                  />
                  <span className="text-sm text-body">页</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-caption mb-1.5 block">主题风格</label>
                <select className="input">
                  <option>数学活泼风</option>
                  <option>简约专业风</option>
                  <option>卡通可爱风</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-caption mb-1.5 block">动画强度</label>
                <select
                  className="input"
                  value={localOverview.animationLevel}
                  onChange={(e) => setLocalOverview({ ...localOverview, animationLevel: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">低</option>
                  <option value="medium">中等</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200">
        <button onClick={onReparse} className="btn-secondary">
          重新解析
        </button>
        <button onClick={onConfirm} className="btn-primary px-6 py-3">
          确认并生成 PPT
        </button>
      </footer>
    </div>
  )
}

export default OverviewEditor
