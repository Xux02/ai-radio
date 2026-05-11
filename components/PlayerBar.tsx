"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Song } from "@/lib/types";

interface PlayerBarProps {
  currentSong: Song | null;
  playlist?: Song[];
  onSongChange?: (song: Song) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerBar({ currentSong, playlist, onSongChange }: PlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [noAudio, setNoAudio] = useState(false);

  // Switch song
  useEffect(() => {
    if (!currentSong) return;
    setNoAudio(false);

    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong.audioUrl) {
      audio.src = currentSong.audioUrl;
      audio.load();
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      setNoAudio(true);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentSong]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src || noAudio) return;

    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [noAudio]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
    setNoAudio(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Auto next
    if (playlist && currentSong && onSongChange) {
      const idx = playlist.findIndex((s) => s.title === currentSong.title && s.artist === currentSong.artist);
      if (idx >= 0 && idx < playlist.length - 1) {
        onSongChange(playlist[idx + 1]);
      }
    }
  }, [playlist, currentSong, onSongChange]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || noAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  }, [noAudio]);

  const skip = useCallback((direction: "prev" | "next") => {
    if (!playlist || !currentSong || !onSongChange) return;
    const idx = playlist.findIndex((s) => s.title === currentSong.title && s.artist === currentSong.artist);
    if (idx < 0) return;
    const target = direction === "prev" ? idx - 1 : idx + 1;
    if (target >= 0 && target < playlist.length) {
      onSongChange(playlist[target]);
    }
  }, [playlist, currentSong, onSongChange]);

  if (!currentSong) return null;

  return (
    <div className="border-t border-gray-100 bg-gray-50/80 backdrop-blur px-4 py-2.5">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setNoAudio(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-berry-300 to-berry-500 flex items-center justify-center text-white flex-shrink-0">
          🎵
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-800 truncate">{currentSong.title}</div>
          <div className="text-xs text-gray-400 truncate">
            {currentSong.artist}
            {noAudio && " · 暂无播放源"}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => skip("prev")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full text-white flex items-center justify-center transition-colors ${
              noAudio ? "bg-gray-300 cursor-not-allowed" : "bg-berry-500 hover:bg-berry-600"
            }`}
            disabled={noAudio}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => skip("next")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            ⏭
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-8 text-right">{formatTime(currentTime)}</span>
        <div
          className={`flex-1 h-1.5 rounded-full relative ${noAudio ? "bg-gray-100" : "bg-gray-200 cursor-pointer"}`}
          onClick={handleProgressClick}
        >
          <div
            className={`h-full rounded-full transition-all ${noAudio ? "bg-gray-300" : "bg-berry-500"}`}
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-400 w-8">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
