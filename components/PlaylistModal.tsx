"use client";

import { useState } from "react";
import type { PlaylistResponse } from "@/lib/types";

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (result: PlaylistResponse) => void;
}

export default function PlaylistModal({ isOpen, onClose, onImport }: PlaylistModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "导入失败");
        return;
      }

      onImport(data);
      setUrl("");
      onClose();
    } catch {
      setError("网络异常，请检查后重试");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800">导入网易云歌单</h3>
        <p className="text-sm text-gray-400 mt-1">
          粘贴歌单链接或 ID，AI 会分析你的音乐品味
        </p>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://music.163.com/playlist?id=..."
          className="w-full mt-4 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-berry-300 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleImport()}
        />

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !url.trim()}
            className="flex-1 py-2.5 rounded-xl bg-berry-500 text-white text-sm hover:bg-berry-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "分析中..." : "分析歌单"}
          </button>
        </div>
      </div>
    </div>
  );
}
