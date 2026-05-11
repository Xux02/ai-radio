"use client";

import { useEffect, useState } from "react";
import type { Playlist } from "@/lib/types";

interface AiProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiProfile({ isOpen, onClose }: AiProfileProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [stats, setStats] = useState({ songs: 0, playlists: 0, messages: 0 });

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          const assistantMsgs = data.messages.filter(
            (m: any) => m.role === "assistant"
          );
          const songsCount = assistantMsgs.reduce(
            (sum: number, m: any) => sum + (m.songs?.length || 0),
            0
          );
          setStats({
            songs: songsCount,
            playlists: 0,
            messages: assistantMsgs.length,
          });
        }
      })
      .catch(() => {});

    fetch("/api/playlist/recent")
      .then((res) => res.json())
      .then((data) => {
        if (data.playlist) {
          setPlaylist(data.playlist);
          setStats((prev) => ({ ...prev, playlists: 1 }));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const tasteTags = playlist?.taste_tags || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-[90%] max-w-sm p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-berry-300 to-berry-500 flex items-center justify-center text-white text-2xl mx-auto">
            AI
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mt-3">音乐 DJ · 小电</h2>
          <p className="text-sm text-gray-400">你的私人 AI 音乐助手</p>
        </div>

        {tasteTags.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">🎧 当前品味画像</h3>
            <p className="text-xs text-gray-400 mt-0.5">基于你的歌单分析得出</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tasteTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs bg-white border border-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 rounded-xl bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">📊 数据统计</h3>
          <div className="flex justify-around text-center mt-3">
            <div>
              <div className="text-xl font-bold text-berry-500">{stats.songs}</div>
              <div className="text-xs text-gray-400">推荐歌曲</div>
            </div>
            <div>
              <div className="text-xl font-bold text-berry-500">{stats.playlists}</div>
              <div className="text-xs text-gray-400">导入歌单</div>
            </div>
            <div>
              <div className="text-xl font-bold text-berry-500">{stats.messages}</div>
              <div className="text-xs text-gray-400">对话轮次</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">📝 AI 简介</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            我是你的专属音乐 DJ。每次你导入歌单，我都会更了解你的品味。告诉我你现在的心情或想法，我帮你找到最合适的歌。
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
