"use client";

import { useState, useRef, useEffect } from "react";
import type { Song } from "@/lib/types";

interface PlayerBarProps {
  currentSong: Song | null;
}

export default function PlayerBar({ currentSong }: PlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = "4:29";

  useEffect(() => {
    if (currentSong) {
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime("0:00");
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.38;
          if (next >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const totalSecs = 269;
          const currentSecs = Math.floor((next / 100) * totalSecs);
          const mins = Math.floor(currentSecs / 60);
          const secs = currentSecs % 60;
          setCurrentTime(`${mins}:${secs.toString().padStart(2, "0")}`);
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setProgress(Math.min(100, Math.max(0, pct)));
  };

  if (!currentSong) return null;

  return (
    <div className="border-t border-gray-100 bg-gray-50/80 backdrop-blur px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-berry-300 to-berry-500 flex items-center justify-center text-white flex-shrink-0">
          🎵
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-800 truncate">{currentSong.title}</div>
          <div className="text-xs text-gray-400 truncate">{currentSong.artist}</div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            ⏮
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-berry-500 text-white flex items-center justify-center hover:bg-berry-600 transition-colors"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            ⏭
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-8 text-right">{currentTime}</span>
        <div
          className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-berry-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-400 w-8">{totalDuration}</span>
      </div>
    </div>
  );
}
