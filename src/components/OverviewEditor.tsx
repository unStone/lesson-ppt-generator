import { useState } from 'react'

interface OverviewEditorProps {
  overview: unknown
  onConfirm: () => void
}

function OverviewEditor({ onConfirm }: OverviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false)

  // TODO: replace with real data from overview
  const mockOverview = {
    title: '认证10以内的数',
    unit: '第三单元',
    grade: '一年级上册',
    goals: [
      '知识与技能：正确数出10以内物体的个数，会读、会写10以内的数',
      '过程与方法：经历从具体到抽象的认识过程，发展数感',
      '情感态度：体验数学与生活的联系，激发学习兴趣',
    ],
    keyPoints: '正确数出10以内物体的个数，并会用数表示',
    difficultPoints: '理解数的有序性，能正确比较数的大小',
    structure: [
      { name: '导入', slides: 2, method: '情境导入', time: '3min' },
      { name: '新授', slides: 8, method: '探索式学习', time: '15min' },
      { name: '练习', slides: 4, method: '分层练习', time: '10min' },
      { name: '小结', slides: 2, method: '思维导图', time: '3min' },
      { name: '作业', slides: 2, method: '分层作业', time: '2min' },
    ],
    totalSlides: 18,
    theme: '蓝色科技风',
    animationLevel: '适中',
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">教学总览</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditing ? '完成编辑' : '编辑'}
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500">课题</div>
            <div className="font-medium">{mockOverview.title}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500">单元</div>
            <div className="font-medium">{mockOverview.unit}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500">年级</div>
            <div className="font-medium">{mockOverview.grade}</div>
          </div>
        </div>

        {/* Goals */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">教学目标</h3>
          <div className="space-y-2">
            {mockOverview.goals.map((goal, i) => (
              <div key={i} className="bg-blue-50 rounded-lg p-3 text-sm">
                {goal}
              </div>
            ))}
          </div>
        </div>

        {/* Key & Difficult Points */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">重点</h3>
            <div className="bg-green-50 rounded-lg p-3 text-sm">
              {mockOverview.keyPoints}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">难点</h3>
            <div className="bg-orange-50 rounded-lg p-3 text-sm">
              {mockOverview.difficultPoints}
            </div>
          </div>
        </div>

        {/* Structure */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">教学环节</h3>
          <div className="flex items-center gap-2">
            {mockOverview.structure.map((section, i) => (
              <div key={i} className="flex-1">
                <div className="bg-blue-100 rounded-lg p-3 text-center">
                  <div className="font-medium text-sm">{section.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {section.slides}页 | {section.time}
                  </div>
                </div>
                {i < mockOverview.structure.length - 1 && (
                  <div className="text-center text-gray-300 mt-1">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <div className="text-xs text-gray-500">总页数</div>
            <div className="font-medium text-lg">{mockOverview.totalSlides}页</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">主题风格</div>
            <div className="font-medium">{mockOverview.theme}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">动画强度</div>
            <div className="font-medium">{mockOverview.animationLevel}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            确认并生成PPT
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            重新解析
          </button>
        </div>
      </div>
    </div>
  )
}

export default OverviewEditor
