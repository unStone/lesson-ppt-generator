import { useState } from 'react'
import { X, ImageIcon, Trash2, Layout, LayoutGrid, Type, Columns } from 'lucide-react'
import type { SlidePlan } from '../types'

interface SlideEditorProps {
  slide: SlidePlan | null
  isOpen: boolean
  onClose: () => void
  onSave: (slide: SlidePlan) => void
}

const LAYOUT_TEMPLATES = [
  { id: 'title-content', label: '标题+内容', icon: Layout },
  { id: 'title-two-col', label: '标题+双栏', icon: Columns },
  { id: 'title-only', label: '标题专页', icon: Type },
  { id: 'grid', label: '网格布局', icon: LayoutGrid },
]

function SlideEditor({ slide, isOpen, onClose, onSave }: SlideEditorProps) {
  const [localSlide, setLocalSlide] = useState<SlidePlan | null>(slide)
  const [selectedLayout, setSelectedLayout] = useState(slide?.layout.layoutTemplate || 'title-content')

  if (!isOpen || !localSlide) return null

  const handleSave = () => {
    if (localSlide) {
      onSave(localSlide)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-[420px] h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-title">单页编辑器</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-title mb-1.5 block">页面标题</label>
            <input
              type="text"
              className="input"
              value={localSlide.title}
              onChange={(e) => setLocalSlide({ ...localSlide, title: e.target.value })}
            />
          </div>

          {/* Layout Selection */}
          <div>
            <label className="text-sm font-medium text-title mb-2 block">布局模板</label>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUT_TEMPLATES.map((tpl) => {
                const Icon = tpl.icon
                const isSelected = selectedLayout === tpl.id
                return (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setSelectedLayout(tpl.id)
                      setLocalSlide({
                        ...localSlide,
                        layout: { ...localSlide.layout, layoutTemplate: tpl.id },
                      })
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-light'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isSelected ? 'text-primary font-medium' : 'text-gray-500'}`}>
                      {tpl.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-title mb-1.5 block">页面内容</label>
            <textarea
              className="textarea"
              rows={6}
              value={localSlide.content.bodyText.join('\n')}
              onChange={(e) =>
                setLocalSlide({
                  ...localSlide,
                  content: { ...localSlide.content, bodyText: e.target.value.split('\n') },
                })
              }
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-title mb-2 block">页面图片</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <button className="text-sm text-primary hover:underline">更换图片</button>
                <button className="text-sm text-danger hover:underline flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  删除图片
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary px-5">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default SlideEditor
