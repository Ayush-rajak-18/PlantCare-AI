
/* =========================================================
   PLANTCARE AI — LIVE API SETTINGS
========================================================= */

const API = "https://plantcare-ai-d8ed.onrender.com/api";

const API_ORIGIN = API.replace(/\/api\/?$/, "");

// Backend image paths ko complete URL mein convert karta hai.
function assetUrl(path) {
  if (!path) return "";

  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

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

  let res;

  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Please check your internet connection."
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((item) => item.msg).join(", ")
      : data.detail;

    throw new Error(detail || "Request failed");
  }

  return data;
}

/* =========================================================
   JSON REQUEST HELPER
========================================================= */

function apiJson(path, method, body) {
  return api(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/* =========================================================
   EXPORTS
========================================================= */

export { API, api, apiJson, assetUrl };
