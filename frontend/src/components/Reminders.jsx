import React, { useState } from "react";
import * as Icons from "../icons";
import { api, apiJson } from "../api";
import { notificationsSupported } from "../useReminders";
import { inputCls, labelCls, overlayCls, sheetCls } from "../ui";

const { Bell, BellRing, Droplets, Plus, Check, Trash2, Repeat, X, CalendarClock, RefreshCw } = Icons;

/* ---------------------------------------------------------
   Reminders page

   Do tarah ke reminders:
   1. Watering  -> automatic (plant ke watering interval se). "Watered" dabane par agli date set.
   2. Custom    -> aap khud banate ho (jaise "Fertilizer daalna"), repeat bhi ho sakta hai.

   Props:
     plants     -> plants ki list (form mein dropdown ke liye)
     reminders  -> useReminders() ka result { items, counts, reload }
     setToast   -> chhota message dikhane ke liye
     onChanged  -> kuch badalne par (App plants + reminders dobara load karta hai)
--------------------------------------------------------- */

const repeatOptions = [
  { value: 0, label: "Does not repeat" },
  { value: 1, label: "Every day" },
  { value: 3, label: "Every 3 days" },
  { value: 7, label: "Every week" },
  { value: 30, label: "Every month" },
];

function whenText(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  if (mins < 1) return "now";
  const t = mins < 60 ? `${mins} min` : hours < 24 ? `${hours} hr` : `${days} day${days > 1 ? "s" : ""}`;
  return diff < 0 ? `${t} overdue` : `in ${t}`;
}

function exactTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function localInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const statusStyle = {
  overdue: "bg-coral-50 text-coral-600",
  today: "bg-sun-50 text-amber-700",
  upcoming: "bg-mint-50 text-forest-600",
};

function Reminders({ plants, reminders, setToast, onChanged }) {
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [permission, setPermission] = useState(
    notificationsSupported() ? Notification.permission : "unsupported"
  );

  const { items, counts } = reminders;
  const groups = [
    { key: "overdue", title: "Overdue" },
    { key: "today", title: "Due in the next 24 hours" },
    { key: "upcoming", title: "Upcoming" },
  ];

  async function complete(item) {
    setBusyId(item.id);
    try {
      await api(`/reminders/${encodeURIComponent(item.id)}/done`, { method: "POST" });
      setToast(item.kind === "watering" ? `${item.plant_name} marked as watered.` : "Reminder completed.");
      await onChanged();
    } catch (e) {
      setToast(e.message);
    } finally {
      setBusyId("");
    }
  }

  async function remove(item) {
    if (!confirm("Delete this reminder?")) return;
    setBusyId(item.id);
    try {
      await api(`/reminders/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      setToast("Reminder deleted.");
      await onChanged();
    } catch (e) {
      setToast(e.message);
    } finally {
      setBusyId("");
    }
  }

  async function enableNotifications() {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setToast(
        result === "granted"
          ? "Notifications are on. You'll be alerted when a reminder is due."
          : "Notifications were not allowed."
      );
    } catch {
      setToast("Could not turn on notifications in this browser.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Reminders</h2>
          <p className="text-sm text-slate-500 mt-1">Never miss watering or plant-care tasks.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* summary */}
      <div className="grid grid-cols-3 gap-2.5 mt-5">
        {[
          ["Overdue", counts.overdue, "bg-coral-50 text-coral-600"],
          ["Next 24 hrs", counts.today, "bg-sun-50 text-amber-700"],
          ["Upcoming", counts.upcoming, "bg-mint-100 text-forest-700"],
        ].map(([label, value, cls]) => (
          <div key={label} className={`rounded-3xl p-3.5 text-center ${cls}`}>
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-[11px] font-bold">{label}</div>
          </div>
        ))}
      </div>

      {/* notifications */}
      {permission === "default" && (
        <div className="mt-4 glass rounded-3xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-mint-100 text-forest-700 grid place-items-center shrink-0">
            <BellRing size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm">Get alerts on this device</p>
            <p className="text-xs text-slate-500 mt-0.5">Alerts appear while PlantCare AI is open or installed.</p>
          </div>
          <button onClick={enableNotifications} className="btn-primary shrink-0 px-4 py-2.5 rounded-full text-xs">
            Turn on
          </button>
        </div>
      )}
      {permission === "denied" && (
        <p className="mt-4 text-xs text-slate-500 glass rounded-2xl px-4 py-3">
          Notifications are blocked. Allow them from your browser's site settings to get alerts.
        </p>
      )}
      {permission === "granted" && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-forest-600 bg-mint-50 rounded-full px-3 py-1.5">
          <BellRing size={13} /> Notifications are on
        </p>
      )}

      {/* list */}
      {items.length === 0 ? (
        <div className="mt-6 glass rounded-[2rem] py-14 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-mint-100 grid place-items-center text-forest-600">
            <Bell size={28} />
          </div>
          <p className="mt-4 font-extrabold">No reminders yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Watering reminders appear automatically once you add plants. You can also add your own.
          </p>
        </div>
      ) : (
        groups.map(({ key, title }) => {
          const list = items.filter((i) => i.status === key);
          if (list.length === 0) return null;
          return (
            <div key={key} className="mt-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-forest-500 mb-2">{title}</h3>
              <div className="space-y-2.5">
                {list.map((item) => (
                  <div key={item.id} className="glass rounded-3xl p-3.5 flex items-center gap-3 shadow-soft">
                    <div className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${statusStyle[item.status]}`}>
                      {item.kind === "watering" ? <Droplets size={20} /> : <CalendarClock size={20} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        <span className={item.status === "overdue" ? "text-coral-600 font-bold" : "font-semibold"}>
                          {whenText(item.due_at)}
                        </span>
                        {" · "}
                        {exactTime(item.due_at)}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                        {item.plant_name && item.kind === "custom" && <span>{item.plant_name}</span>}
                        {item.kind === "custom" && item.repeat_days > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <Repeat size={10} /> every {item.repeat_days}d
                          </span>
                        )}
                        {item.kind === "watering" && <span>Every {item.repeat_days} days</span>}
                        {item.note && item.kind === "custom" && <span className="truncate">{item.note}</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => complete(item)}
                        disabled={busyId === item.id}
                        className="btn-primary h-10 px-3.5 rounded-full text-xs inline-flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {busyId === item.id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        {item.kind === "watering" ? "Watered" : "Done"}
                      </button>
                      {item.kind === "custom" && (
                        <button
                          onClick={() => remove(item)}
                          disabled={busyId === item.id}
                          aria-label="Delete reminder"
                          className="w-10 h-10 rounded-full bg-white border border-sage-200 text-coral-500 grid place-items-center hover:bg-coral-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {showForm && (
        <ReminderForm
          plants={plants}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            await onChanged();
            setToast("Reminder added.");
          }}
          setToast={setToast}
        />
      )}
    </div>
  );
}

/* ---------- Naya custom reminder banane ka form ---------- */
function ReminderForm({ plants, onClose, onSaved, setToast }) {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

  const [form, setForm] = useState({
    title: "",
    note: "",
    due: localInputValue(nextHour),
    plant_id: "",
    repeat_days: 0,
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const dueDate = new Date(form.due);
    if (Number.isNaN(dueDate.getTime())) {
      setToast("Please pick a valid date and time.");
      return;
    }

    setSaving(true);
    try {
      await apiJson("/reminders", "POST", {
        title: form.title,
        note: form.note,
        due_at: dueDate.toISOString(),
        plant_id: form.plant_id || null,
        repeat_days: Number(form.repeat_days),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={overlayCls} onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className={sheetCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold">New reminder</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-sage-100 text-forest-600 grid place-items-center">
            <X size={16} />
          </button>
        </div>

        <div className="mt-5">
          <label className={labelCls}>What should we remind you about?</label>
          <input required maxLength={120} className={inputCls} placeholder="e.g. Add fertilizer to tomatoes" value={form.title} onChange={set("title")} />
        </div>

        <div className="mt-4">
          <label className={labelCls}>Date and time</label>
          <input required type="datetime-local" className={inputCls} value={form.due} onChange={set("due")} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelCls}>Plant (optional)</label>
            <select className={inputCls} value={form.plant_id} onChange={set("plant_id")}>
              <option value="">No specific plant</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Repeat</label>
            <select className={inputCls} value={form.repeat_days} onChange={set("repeat_days")}>
              {repeatOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Note (optional)</label>
          <input maxLength={300} className={inputCls} placeholder="Any extra detail" value={form.note} onChange={set("note")} />
        </div>

        <button disabled={saving} className="btn-primary w-full mt-6 py-3.5 rounded-full text-sm disabled:opacity-60">
          {saving ? "Saving..." : "Add reminder"}
        </button>
      </form>
    </div>
  );
}

export default Reminders;
