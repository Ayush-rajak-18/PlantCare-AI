const API = "https://plantcare-ai-d8ed.onrender.com/api";

/* =========================================================
   API HELPER
========================================================= */

async function api(path, options = {}) {
  const token = localStorage.getItem("plantcare_token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(API + path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
}

export { API, api };
