import '../../App.css'

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-solid rounded-full animate-spin border-t-transparent absolute top-0"></div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">Loading Service Desk...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we prepare your workspace</p>
      </div>
    </div>
  )
}

export default Loading
