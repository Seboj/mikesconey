const API_BASE = import.meta.env.DEV
  ? (process.env.API_URL || "http://localhost:3000")
  : "http://api:3000";

export async function fetchContent<T>(key: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api/content/${key}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch content "${key}": ${res.status}`);
  }
  return res.json() as Promise<T>;
}
