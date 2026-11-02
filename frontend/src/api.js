/* =========================================================
   API SETTINGS

   Backend ka address:
   - Agar frontend/.env mein  VITE_API_URL=http://192.168.1.5:8000/api  likha hai to wahi use hoga
   - Warna jis address se site khuli hai (localhost ya laptop ka IP) usi par port 8000 try hoga.
     Isse phone par bhi chalega (pehle 127.0.0.1 tha, jo phone khud ko dhundhta tha).
========================================================= */
const API =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000/api`;

// "http://host:8000/api"  ->  "http://host:8000"   (photos yahin se aati hain)
const API_ORIGIN = API.replace(/\/api\/?$/, "");

// Backend ka "/uploads/..." path -> poora URL
function assetUrl(path) {
  if (!path) return "";
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return API_ORIGIN + path;
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
    res = await fetch(API + path, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg).join(", ")
      : data.detail;
    throw new Error(detail || "Request failed");
  }

  return data;
}

// JSON bhejne ka chhota shortcut:  apiJson("/plants", "POST", {name: "Tulsi"})
function apiJson(path, method, body) {
  return api(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export { API, api, apiJson, assetUrl };
