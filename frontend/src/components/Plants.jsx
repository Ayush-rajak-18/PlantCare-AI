import React, { useState } from "react";
import * as Icons from "../icons";
import { api, assetUrl } from "../api";
import PlantForm from "./PlantForm";

const { Leaf, Plus, Droplets, Sprout, Trash2, Pencil, Search, MapPin, RefreshCw, Check } = Icons;

/* ---------------------------------------------------------
   Plants page

   - Search + filter (All / Indoor / Outdoor / Balcony)
   - Har plant card: photo, watering status, "Water now", Edit, Delete
   - Add / Edit ka form alag file mein hai: PlantForm.jsx

   Props: plants, reload (plants dobara laao), setToast
--------------------------------------------------------- */

const FILTERS = ["All", "Indoor", "Outdoor", "Balcony"];

// watering status ke rang (full class names taaki Tailwind unhe pehchane)
const STATUS = {
  overdue: { cls: "bg-coral-500 text-white", text: (p) => (p.days_overdue > 0 ? `Overdue by ${p.days_overdue}d` : "Needs water now") },
  today: { cls: "bg-sun-400 text-forest-950", text: () => "Water today" },
  ok: { cls: "bg-white/90 text-forest-700", text: (p) => `Water in ${p.days_left} day${p.days_left === 1 ? "" : "s"}` },
};

function wateredText(iso) {
  if (!iso) return "Not watered yet";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Watered today";
  if (days === 1) return "Watered yesterday";
  return `Watered ${days} days ago`;
}

function Plants({ plants, reload, setToast }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [formPlant, setFormPlant] = useState(undefined); // undefined = band, null = naya, object = edit
  const [busyId, setBusyId] = useState("");

  async function water(plant) {
    setBusyId(plant._id);
    try {
      await api(`/plants/${plant._id}/water`, { method: "POST" });
      await reload();
      setToast(`${plant.name} watered. Next watering in ${plant.watering_days} days.`);
    } catch (e) {
      setToast(e.message);
    } finally {
      setBusyId("");
    }
  }

  async function remove(plant) {
    if (!confirm(`Delete "${plant.name}"?`)) return;
    try {
      await api("/plants/" + plant._id, { method: "DELETE" });
      await reload();
      setToast("Plant deleted.");
    } catch (e) {
      setToast(e.message);
    }
  }

  const q = search.trim().toLowerCase();
  const visible = plants.filter((p) => {
    const matchesFilter = filter === "All" || p.location === filter;
    const matchesSearch = !q || `${p.name} ${p.species}`.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">My Plants</h2>
          <p className="text-sm text-slate-500 mt-1">
            {plants.length} {plants.length === 1 ? "plant" : "plants"} in your collection
          </p>
        </div>
        <button
          onClick={() => setFormPlant(null)}
          className="btn-primary shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full text-sm"
        >
          <Plus size={16} /> Add plant
        </button>
      </div>

      {/* search + filters */}
      {plants.length > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plants..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-sage-200 text-sm outline-none focus:border-forest-400 focus:ring-4 focus:ring-mint-200/60 transition"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition ${
                  filter === f ? "bg-forest-800 text-white shadow-soft" : "bg-white border border-sage-200 text-forest-700 hover:bg-sage-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* cards */}
      {plants.length === 0 ? (
        <div className="mt-6 glass rounded-[2rem] py-16 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-mint-100 grid place-items-center text-forest-600">
            <Sprout size={30} />
          </div>
          <p className="mt-4 font-extrabold">No plants added yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Add your first plant with a photo and watering schedule. We'll remind you when it's time to water.
          </p>
          <button onClick={() => setFormPlant(null)} className="btn-primary mt-5 px-6 py-3 rounded-full text-sm">
            Add your first plant
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-500">No plants match your search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 mt-6">
          {visible.map((p) => {
            const status = STATUS[p.water_status] || STATUS.ok;
            return (
              <article key={p._id} className="glass rounded-[2rem] overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-0.5 transition flex flex-col">
                {/* photo */}
                <div className="relative h-44 bg-gradient-to-br from-mint-100 to-sage-100">
                  {p.photo ? (
                    <img src={assetUrl(p.photo)} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-forest-300">
                      <Leaf size={52} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 text-forest-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full">
                    <MapPin size={11} /> {p.location || "Plant"}
                  </span>
                  <span className={`absolute bottom-3 left-3 inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-soft ${status.cls}`}>
                    <Droplets size={12} /> {status.text(p)}
                  </span>
                </div>

                {/* details */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-lg truncate">{p.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{p.species}</p>

                  <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-semibold text-forest-700">
                    <span className="bg-white/80 border border-white px-2.5 py-1.5 rounded-full">Every {p.watering_days} days</span>
                    <span className="bg-white/80 border border-white px-2.5 py-1.5 rounded-full">{wateredText(p.last_watered)}</span>
                  </div>

                  {p.notes && (
                    <p className="mt-3 text-xs text-slate-500 bg-white/70 rounded-2xl p-3 leading-relaxed line-clamp-3">{p.notes}</p>
                  )}

                  {/* actions */}
                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <button
                      onClick={() => water(p)}
                      disabled={busyId === p._id}
                      className="btn-primary flex-1 h-11 rounded-full text-xs inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {busyId === p._id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                      Water now
                    </button>
                    <button
                      onClick={() => setFormPlant(p)}
                      aria-label={`Edit ${p.name}`}
                      className="w-11 h-11 rounded-full bg-white border border-sage-200 text-forest-700 grid place-items-center hover:bg-sage-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(p)}
                      aria-label={`Delete ${p.name}`}
                      className="w-11 h-11 rounded-full bg-white border border-sage-200 text-coral-500 grid place-items-center hover:bg-coral-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {formPlant !== undefined && (
        <PlantForm
          plant={formPlant}
          onClose={() => setFormPlant(undefined)}
          onSaved={reload}
          setToast={setToast}
        />
      )}
    </div>
  );
}

export default Plants;
