import Database from "better-sqlite3";
import path from "path";
import type { Message, Playlist } from "./types";

const DB_PATH = path.join(process.cwd(), "ai-radio.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      songs TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      songs TEXT NOT NULL DEFAULT '[]',
      taste_tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function addMessage(role: "user" | "assistant", content: string, songs: object[] = []): Message {
  const d = getDb();
  const stmt = d.prepare("INSERT INTO messages (role, content, songs) VALUES (?, ?, ?)");
  const result = stmt.run(role, content, JSON.stringify(songs));
  return {
    id: Number(result.lastInsertRowid),
    role,
    content,
    songs: songs as any,
    created_at: new Date().toISOString(),
  };
}

export function getMessages(limit = 50): Message[] {
  const d = getDb();
  const rows = d.prepare("SELECT * FROM messages ORDER BY created_at ASC LIMIT ?").all(limit) as any[];
  return rows.map((r) => ({ ...r, songs: JSON.parse(r.songs || "[]") }));
}

export function addPlaylist(name: string, songs: object[], tasteTags: string[]): Playlist {
  const d = getDb();
  const stmt = d.prepare("INSERT INTO playlists (name, songs, taste_tags) VALUES (?, ?, ?)");
  const result = stmt.run(name, JSON.stringify(songs), JSON.stringify(tasteTags));
  return {
    id: Number(result.lastInsertRowid),
    name,
    songs: songs as any,
    taste_tags: tasteTags,
    created_at: new Date().toISOString(),
  };
}

export function getLatestPlaylist(): Playlist | null {
  const d = getDb();
  const row = d.prepare("SELECT * FROM playlists ORDER BY created_at DESC LIMIT 1").get() as any;
  if (!row) return null;
  return { ...row, songs: JSON.parse(row.songs || "[]"), taste_tags: JSON.parse(row.taste_tags || "[]") };
}

export function getSetting(key: string): string | null {
  const d = getDb();
  const row = d.prepare("SELECT value FROM settings WHERE key = ?").get(key) as any;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const d = getDb();
  d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
}

export function getTasteTags(): string[] {
  const playlist = getLatestPlaylist();
  return playlist?.taste_tags ?? [];
}
