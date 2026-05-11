import type { Song } from "./types";

interface PlaylistDetail {
  name: string;
  songs: Song[];
}

export async function parsePlaylist(url: string): Promise<PlaylistDetail> {
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    throw new Error("无法识别网易云歌单链接，请检查后再试");
  }

  const response = await fetch(
    `https://api.tigerroot.com/music/wy/playlist/detail?id=${playlistId}`,
    { signal: AbortSignal.timeout(10000) }
  );

  if (!response.ok) {
    throw new Error("获取歌单失败，请检查链接是否正确");
  }

  const data = await response.json();
  const playlist = data.playlist || data;

  if (!playlist || !playlist.tracks) {
    throw new Error("歌单数据异常，请尝试其他歌单");
  }

  const songs: Song[] = (playlist.tracks || []).slice(0, 50).map((track: any) => ({
    title: track.name || "未知歌曲",
    artist: (track.ar || []).map((a: any) => a.name).join("/") || "未知歌手",
    album: track.al?.name || "",
  }));

  return {
    name: playlist.name || "未命名歌单",
    songs,
  };
}

function extractPlaylistId(url: string): string | null {
  const patterns = [
    /music\.163\.com\/playlist\/(\d+)/,
    /music\.163\.com\/#\/playlist\?id=(\d+)/,
    /playlist\?id=(\d+)/,
    /^(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function validatePlaylistUrl(url: string): boolean {
  return extractPlaylistId(url) !== null;
}
