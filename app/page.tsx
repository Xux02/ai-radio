"use client";

import { useState, useEffect, useCallback } from "react";
import type { Message, Song, PlaylistResponse } from "@/lib/types";
import ChatPanel from "@/components/ChatPanel";
import InputBar from "@/components/InputBar";
import PlayerBar from "@/components/PlayerBar";
import WeatherBadge from "@/components/WeatherBadge";
import PlaylistModal from "@/components/PlaylistModal";
import AiProfile from "@/components/AiProfile";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAiProfile, setShowAiProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Load history on mount
  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.messages?.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  }, []);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const id = setInterval(updateTime, 10000);
    return () => clearInterval(id);
  }, []);

  const handleSend = useCallback(async (message: string, mode: "text" | "voice") => {
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.error || "抱歉，出了点问题",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
        songs: data.songs,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.songs?.length > 0) {
        setCurrentSong(data.songs[0]);
      }
    } catch {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "网络连接异常，请检查后重试",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlaySong = useCallback((song: Song) => {
    setCurrentSong(song);
  }, []);

  const handlePlaylistImport = useCallback((result: PlaylistResponse) => {
    const msg: Message = {
      id: Date.now(),
      role: "assistant",
      content: `已导入歌单「${result.name}」！共 ${result.songs.length} 首歌。我分析了你的品味：${result.taste_tags.join("、")}。现在告诉我你的心情，我帮你推荐！`,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Build song list from all messages
  const allSongs = messages
    .flatMap((m) => m.songs || [])
    .filter((s) => s.audioUrl);

  return (
    <div className="h-screen flex flex-col bg-white max-w-lg mx-auto shadow-lg relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <WeatherBadge />
        <div className="text-right">
          <div className="text-xs text-gray-400">{currentTime}</div>
          <div className="text-[10px] text-gray-300">AI 电台 · 在线</div>
        </div>
      </div>

      <div className="border-b border-gray-50" />

      {/* Playlist import */}
      <div className="px-4 pt-2 pb-1">
        <button
          onClick={() => setShowPlaylistModal(true)}
          className="text-xs text-gray-400 hover:text-berry-500 transition-colors"
        >
          + 导入歌单
        </button>
      </div>

      {/* Chat */}
      <ChatPanel
        messages={messages}
        onPlaySong={handlePlaySong}
        onAiAvatarClick={() => setShowAiProfile(true)}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-berry-400 animate-bounce" />
          <span className="w-2 h-2 rounded-full bg-berry-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
          <span className="w-2 h-2 rounded-full bg-berry-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
          AI 正在为你找歌...
        </div>
      )}

      {/* Player */}
      <PlayerBar currentSong={currentSong} playlist={allSongs} onSongChange={handlePlaySong} />

      {/* Input */}
      <InputBar onSend={handleSend} disabled={loading} />

      {/* Modals */}
      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onImport={handlePlaylistImport}
      />

      <AiProfile
        isOpen={showAiProfile}
        onClose={() => setShowAiProfile(false)}
      />
    </div>
  );
}
