"use client";

import { useState, useCallback } from "react";
import { MAX_COMBINATIONS } from "@/types";

interface GeneratePanelProps {
  isReady: boolean;
  isGenerating: boolean;
  uploadedCount: number;
  totalSlots: number;
  onGenerate: (count: number) => void;
}

export default function GeneratePanel({
  isReady,
  isGenerating,
  uploadedCount,
  totalSlots,
  onGenerate,
}: GeneratePanelProps) {
  const [count, setCount] = useState(10);

  const handleCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        setCount(Math.max(1, Math.min(value, MAX_COMBINATIONS)));
      }
    },
    []
  );

  const handleGenerate = useCallback(() => {
    if (isReady && !isGenerating) {
      onGenerate(count);
    }
  }, [isReady, isGenerating, count, onGenerate]);

  const presets = [1, 5, 10, 50, 100];

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <h3 className="text-sm font-medium">生成設定</h3>

      {/* Status */}
      <div className="text-sm">
        {!isReady ? (
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <span>⚠️</span>
            <span>
              素材をアップロードしてください（{uploadedCount}/{totalSlots}）
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span>✓</span>
            <span>準備完了！</span>
          </div>
        )}
      </div>

      {/* Count Input */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">
          生成本数（最大: {MAX_COMBINATIONS.toLocaleString()}）
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={count}
            onChange={handleCountChange}
            min={1}
            max={MAX_COMBINATIONS}
            disabled={isGenerating}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 disabled:opacity-50"
          />
        </div>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setCount(preset)}
              disabled={isGenerating}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                count === preset
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:border-blue-400"
              } disabled:opacity-50`}
            >
              {preset}本
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!isReady || isGenerating}
        className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
          !isReady || isGenerating
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            生成中...
          </span>
        ) : (
          <span>🎲 ランダム生成</span>
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {count}本の動画を自動生成します
      </p>
    </div>
  );
}
