import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-zinc-200">404</h1>
          <div className="relative -mt-8">
            <h2 className="text-3xl font-bold text-zinc-900">页面未找到</h2>
          </div>
        </div>
        <p className="text-lg text-zinc-600 mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在。可能已被移动或删除。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
