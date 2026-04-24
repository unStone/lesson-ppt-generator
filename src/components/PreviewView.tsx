function PreviewView() {
  return (
    <div className="flex h-full gap-4">
      {/* Thumbnail Sidebar */}
      <div className="w-48 bg-white rounded-xl shadow-sm border p-4 overflow-auto">
        <h3 className="text-sm font-medium mb-3">页面缩略图</h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-100 rounded border hover:border-blue-400 cursor-pointer"
            >
              <div className="p-2 text-xs text-gray-400">第{i + 1}页</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border flex flex-col">
        <div className="border-b p-3 flex items-center justify-between">
          <div className="text-sm font-medium">PPT 预览</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
              编辑此页
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              下载PPT
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">预览区域</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewView
