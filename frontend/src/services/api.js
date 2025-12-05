// Use empty string for same-origin requests (proxied by Nginx)
// Or set REACT_APP_API_URL for external API
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

// Helper function for all API calls
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// API functions
export async function fetchResources() {
  return apiFetch("/api/food-resources");
}

export async function fetchResourceTypes() {
  return apiFetch("/api/food-resources/types");
}

export async function createResource(data) {
  return apiFetch("/api/food-resources", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateResource(id, data) {
  return apiFetch(`/api/food-resources/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteResource(id) {
  return apiFetch(`/api/food-resources/${id}`, {
    method: "DELETE",
  });
}

export async function login(credentials) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function register(userData) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function logout() {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return apiFetch("/api/auth/me");
}

export async function fetchReports(query = "") {
  return apiFetch(`/api/reports${query}`);
}

export async function createReport(data) {
  return apiFetch("/api/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReportStatus(id, status, adminNotes = "") {
  return apiFetch(`/api/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  });
}

export async function fetchSuggestions(query = "") {
  return apiFetch(`/api/suggestions${query}`);
}

export async function createSuggestion(data) {
  return apiFetch("/api/suggestions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSuggestionStatus(id, status) {
  return apiFetch(`/api/suggestions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteSuggestion(id) {
  return apiFetch(`/api/suggestions/${id}`, {
    method: "DELETE",
  });
}

export async function deleteReport(id) {
  return apiFetch(`/api/reports/${id}`, {
    method: "DELETE",
  });
}

export async function fetchReportStats() {
  return apiFetch("/api/reports/stats");
}

export async function fetchSuggestionStats() {
  return apiFetch("/api/suggestions/stats");
}