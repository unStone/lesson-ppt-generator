import { useState } from 'react'
import { X, Eye, EyeOff, ExternalLink } from 'lucide-react'
import type { AppSettings } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  settings: AppSettings
  onClose: () => void
  onSave: (settings: AppSettings) => void
}

function SettingsModal({ isOpen, settings, onClose, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [showKey, setShowKey] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[480px] bg-white rounded-card shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-title">设置面板</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* API Provider */}
          <div>
            <label className="text-sm font-medium text-title mb-1.5 block">API Provider</label>
            <select
              className="input"
              value={localSettings.apiProvider}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  apiProvider: e.target.value as AppSettings['apiProvider'],
                })
              }
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="ollama">本地 Ollama</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm font-medium text-title mb-1.5 block">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="input pr-10"
                value={localSettings.apiKey}
                onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                placeholder="请输入 API Key"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              如何获取 API Key？
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-sm font-medium text-title mb-1.5 block">模型选择</label>
            <select
              className="input"
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o-mini</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-card">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary px-5">
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
