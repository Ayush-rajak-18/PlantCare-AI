import React, { useEffect, useRef, useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, AIResponse, formatInlineText } from "./Helpers";
const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu } = Icons;

function Plants({
  plants,
  reload,
  setToast,
}) {
  const [form, setForm] = useState({
    name: "",
    species: "",
    location: "Indoor",
    watering_days: 3,
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  async function add(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await api("/plants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          watering_days: Number(
            form.watering_days
          ),
        }),
      });

      setForm({
        name: "",
        species: "",
        location: "Indoor",
        watering_days: 3,
        notes: "",
      });

      await reload();
      setToast("Plant added successfully.");
    } catch (e) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this plant?")) {
      return;
    }

    try {
      await api("/plants/" + id, {
        method: "DELETE",
      });

      await reload();
      setToast("Plant deleted.");
    } catch (e) {
      setToast(e.message);
    }
  }

  return (
    <div className="grid xl:grid-cols-[380px_1fr] gap-5 sm:gap-6">
      {/* ADD */}

      <form
        onSubmit={add}
        className="bg-white rounded-[2rem] p-5 sm:p-6 border border-emerald-100 shadow-sm h-fit"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <Plus />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              Add Plant
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Create a care profile
            </p>
          </div>
        </div>

        {["name", "species"].map((k) => (
          <div key={k} className="mt-4">
            <label className="text-xs font-bold text-slate-600">
              {k === "name"
                ? "Plant name"
                : "Species"}
            </label>

            <input
              required
              className="w-full mt-1.5 p-3.5 rounded-xl border bg-slate-50 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition text-sm"
              placeholder={
                k === "name"
                  ? "e.g. My Tomato"
                  : "e.g. Tomato"
              }
              value={form[k]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [k]: e.target.value,
                })
              }
            />
          </div>
        ))}

        <div className="mt-4">
          <label className="text-xs font-bold text-slate-600">
            Location
          </label>

          <select
            className="w-full mt-1.5 p-3.5 rounded-xl border bg-slate-50 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition text-sm"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value,
              })
            }
          >
            <option>Indoor</option>
            <option>Outdoor</option>
            <option>Balcony</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-slate-600">
            Watering interval
          </label>

          <div className="relative mt-1.5">
            <input
              type="number"
              min="1"
              max="60"
              className="w-full p-3.5 pr-20 rounded-xl border bg-slate-50 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition text-sm"
              value={form.watering_days}
              onChange={(e) =>
                setForm({
                  ...form,
                  watering_days: e.target.value,
                })
              }
            />

            <span className="absolute right-4 top-3.5 text-xs text-slate-400">
              days
            </span>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-slate-600">
            Notes
          </label>

          <textarea
            className="w-full mt-1.5 p-3.5 rounded-xl border bg-slate-50 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition text-sm resize-none"
            placeholder="Optional notes about your plant"
            rows="4"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
          />
        </div>

        <button
          disabled={loading}
          className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white p-3.5 rounded-xl font-black transition shadow-lg shadow-emerald-700/10"
        >
          {loading ? (
            <>
              <RefreshCw
                size={16}
                className="inline mr-2 animate-spin"
              />
              Adding...
            </>
          ) : (
            <>
              <Plus
                size={17}
                className="inline mr-1"
              />
              Add Plant
            </>
          )}
        </button>
      </form>

      {/* LIST */}

      <div className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              Your Plants
            </h2>

            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Manage all plants connected to your account.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-black">
            <Sprout size={14} />
            {plants.length}{" "}
            {plants.length === 1
              ? "plant"
              : "plants"}
          </div>
        </div>

        {plants.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 grid place-items-center">
              <Sprout
                size={30}
                className="text-emerald-500"
              />
            </div>

            <p className="mt-4 font-black text-slate-800">
              No plants added yet
            </p>

            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Add a plant from the form to create your personal
              plant-care collection.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {plants.map((p) => (
              <div
                key={p._id}
                className="relative"
              >
                <PlantCard p={p} />

                <button
                  onClick={() =>
                    remove(p._id)
                  }
                  className="absolute right-3 top-3 w-8 h-8 text-red-500 bg-white rounded-xl shadow-sm hover:bg-red-50 transition grid place-items-center"
                  title="Delete plant"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PLANT DOCTOR
========================================================= */

export default Plants;
