"use client";

import { useEffect, useRef } from "react";
import type { Message, Song } from "@/lib/types";
import MusicCard from "./MusicCard";

interface ChatPanelProps {
  messages: Message[];
  onPlaySong: (song: Song) => void;
  onAiAvatarClick: () => void;
}

export default function ChatPanel({ messages, onPlaySong, onAiAvatarClick }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center pt-20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-berry-200 to-berry-400 flex items-center justify-center text-white text-3xl mb-4">
            🎧
          </div>
          <h3 className="text-gray-700 font-semibold">欢迎来到 AI 电台</h3>
          <p className="text-gray-400 text-sm mt-1">
            告诉我你的心情，或者导入歌单让我了解你的品味
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant" ? (
              <button
                onClick={onAiAvatarClick}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-berry-300 to-berry-500 flex items-center justify-center text-white text-xs flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                title="查看 AI 主页"
              >
                AI
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
                我
              </div>
            )}

            <div>
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-berry-50 text-gray-700 rounded-tr-sm"
                    : "bg-gray-100 text-gray-700 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>

              {msg.songs && msg.songs.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {msg.songs.map((song, idx) => (
                    <MusicCard key={idx} song={song} onPlay={onPlaySong} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
