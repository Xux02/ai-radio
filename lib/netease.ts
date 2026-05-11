import type { Song } from "./types";

const API_BASE = "https://api.tigerroot.com/music/wy";

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

// --- Song search & audio URL ---

async function searchSong(keyword: string): Promise<{ id: number; name: string; artists: string } | null> {
  try {
    const q = encodeURIComponent(keyword);
    const res = await fetch(`${API_BASE}/search?keywords=${q}&limit=5`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const songs = data.result?.songs;
    if (!songs?.length) return null;
    const song = songs[0];
    return {
      id: song.id,
      name: song.name,
      artists: (song.ar || []).map((a: any) => a.name).join("/") || "",
    };
  } catch {
    return null;
  }
}

async function getSongUrl(id: number): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/song/url/v1?id=${id}&level=standard`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch {
    return null;
  }
}

export async function findSong(title: string, artist: string): Promise<{ id: number; name: string; artists: string; url: string | null } | null> {
  let result = await searchSong(`${title} ${artist}`);
  if (!result) {
    result = await searchSong(title);
  }
  if (!result) return null;

  const url = await getSongUrl(result.id);

  return {
    id: result.id,
    name: result.name,
    artists: result.artists,
    url,
  };
}
