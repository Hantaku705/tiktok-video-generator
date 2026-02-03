"use client";

import { GeneratedVideo } from "@/types";
import { combinationToString } from "@/lib/generator";

interface OutputListProps {
  videos: GeneratedVideo[];
  progress: { current: number; total: number };
  isGenerating: boolean;
  onDownloadAll: () => void;
}

export default function OutputList({
  videos,
  progress,
  isGenerating,
  onDownloadAll,
}: OutputListProps) {
  const completedCount = videos.filter((v) => v.status === "completed").length;
  const hasVideos = videos.length > 0;

  const handleDownload = (video: GeneratedVideo) => {
    if (video.status === "completed" && video.url) {
      const a = document.createElement("a");
      a.href = video.url;
      a.download = video.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!hasVideos && !isGenerating) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">生成結果</h3>
        {completedCount > 0 && (
          <button
            onClick={onDownloadAll}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span>📦</span>
            <span>一括ダウンロード ({completedCount}本)</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>進捗</span>
            <span>
              {progress.current}/{progress.total} (
              {Math.round((progress.current / progress.total) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`relative aspect-[9/16] rounded-lg border overflow-hidden ${
              video.status === "completed"
                ? "border-green-500"
                : video.status === "error"
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            {video.status === "completed" && video.url ? (
              <>
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(video)}
                    className="px-3 py-1 bg-white text-black rounded text-sm font-medium"
                  >
                    ダウンロード
                  </button>
                </div>
              </>
            ) : video.status === "error" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500">
                <span className="text-2xl">❌</span>
                <span className="text-xs mt-1 px-2 text-center">
                  {video.error || "エラー"}
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                <span className="animate-spin text-2xl">⏳</span>
                <span className="text-xs mt-1">処理中...</span>
              </div>
            )}

            {/* Combination Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 text-center">
              {combinationToString(video.combination)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
