export interface Song {
  title: string;
  artist: string;
  album?: string;
  reason?: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  songs?: Song[];
  created_at: string;
}

export interface Playlist {
  id: number;
  name: string;
  songs: Song[];
  taste_tags: string[];
  created_at: string;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  icon: string;
}

export interface ChatRequest {
  message: string;
  mode: "text" | "voice";
}

export interface ChatResponse {
  reply: string;
  songs: Song[];
  taste_tags: string[];
  vibe: string;
}

export interface PlaylistResponse {
  name: string;
  songs: Song[];
  taste_tags: string[];
}
