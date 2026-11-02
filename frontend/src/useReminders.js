import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/* ---------------------------------------------------------
   useReminders: reminders ko backend se laata rehta hai.

   - Har 1 minute mein aur jab tab wapas khule tab refresh
   - Agar user ne notifications allow ki hain to jo reminder
     due ho chuka hai uska browser notification dikhata hai (ek baar)

   Returns: { items, counts, reload }
--------------------------------------------------------- */

const EMPTY = { items: [], counts: { overdue: 0, today: 0, upcoming: 0, due_now: 0 } };
const SEEN_KEY = "plantcare_notified";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function readSeen() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
}

async function showNotification(title, body, tag) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) {
      await reg.showNotification(title, { body, tag, icon: "/icon.svg", badge: "/icon.svg" });
      return;
    }
  } catch {}

  try {
    new Notification(title, { body, tag, icon: "/icon.svg" });
  } catch {}
}

function notifyDue(items) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const seen = readSeen();
  const now = Date.now();
  let changed = false;
  let shown = 0;

  for (const item of items) {
    if (item.status !== "overdue") continue;

    const key = `${item.id}|${item.due_at}`; // due_at badalte hi naya notification
    if (seen[key]) continue;
    if (shown >= 3) break; // ek baar mein 3 se zyada nahi

    showNotification("PlantCare AI", item.title, key);
    seen[key] = now;
    shown += 1;
    changed = true;
  }

  // 7 din se purane records saaf
  for (const key of Object.keys(seen)) {
    if (now - seen[key] > 7 * 24 * 3600 * 1000) {
      delete seen[key];
      changed = true;
    }
  }

  if (changed) {
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch {}
  }
}

export default function useReminders(enabled) {
  const [data, setData] = useState(EMPTY);

  const load = useCallback(async () => {
    try {
      setData(await api("/reminders"));
    } catch {
      // network / token issue: chup-chaap ignore, agli baar dobara try
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setData(EMPTY);
      return undefined;
    }

    load();
    const timer = setInterval(load, 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, load]);

  useEffect(() => {
    notifyDue(data.items);
  }, [data.items]);

  return { ...data, reload: load };
}
