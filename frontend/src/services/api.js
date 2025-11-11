const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function fetchResources() {
  const res = await fetch(`${API_BASE_URL}/api/food-resources`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
