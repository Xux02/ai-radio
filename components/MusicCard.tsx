"use client";

import type { Song } from "@/lib/types";

interface MusicCardProps {
  song: Song;
  onPlay?: (song: Song) => void;
}

export default function MusicCard({ song, onPlay }: MusicCardProps) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-berry-200 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onPlay?.(song)}
    >
      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-berry-300 to-berry-500 flex items-center justify-center text-white text-lg flex-shrink-0">
        🎵
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 text-sm truncate">{song.title}</div>
        <div className="text-xs text-gray-400 truncate">{song.artist}</div>
        {song.reason && (
          <div className="text-xs text-berry-500 mt-0.5 truncate">💡 {song.reason}</div>
        )}
      </div>
      <div className="text-xs text-gray-300 flex-shrink-0">▶</div>
    </div>
  );
}
