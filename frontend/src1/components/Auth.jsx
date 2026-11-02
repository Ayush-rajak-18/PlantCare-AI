import React, { useEffect, useRef, useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, AIResponse, formatInlineText } from "./Helpers";
const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu } = Icons;

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api(`/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      localStorage.setItem("plantcare_token", data.token);
      localStorage.setItem("plantcare_name", data.name);
      localStorage.setItem(
        "plantcare_email",
        data.email || form.email
      );

      onLogin({
        ...data,
        email: data.email || form.email,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5faf6] lg:grid lg:grid-cols-2">

      {/* =====================================================
          BRANDING PANEL
      ===================================================== */}

      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 text-white px-5 py-7 sm:px-8 sm:py-10 lg:p-14 xl:p-20 min-h-[290px] sm:min-h-[330px] lg:min-h-screen flex items-center">

        {/* Background decorations */}

        <div className="absolute -right-20 -top-20 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-emerald-600/20" />

        <div className="absolute -left-20 -bottom-20 w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full bg-lime-300/10" />

        <div className="absolute right-5 bottom-5 sm:right-10 sm:bottom-10 lg:right-20 lg:bottom-20 opacity-[0.05]">
          <Leaf
            size={180}
            className="sm:w-[220px] sm:h-[220px] lg:w-[260px] lg:h-[260px]"
          />
        </div>

        <div className="relative w-full max-w-2xl mx-auto lg:max-w-xl">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/10 grid place-items-center shrink-0">
              <Leaf size={23} />
            </div>

            <div className="min-w-0">
              <div className="font-black text-xl sm:text-2xl">
                PlantCare AI
              </div>

              <div className="text-[10px] sm:text-xs text-emerald-300">
                Intelligent plant health
              </div>
            </div>

          </div>

          {/* BADGE */}

          <div className="mt-6 sm:mt-7">
            <div className="inline-flex items-center gap-2 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.14em] text-emerald-100 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
              <ShieldCheck size={13} />
              AI + RAG Plant Care System
            </div>
          </div>

          {/* HEADING */}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.05] mt-5 sm:mt-6 lg:mt-7">
            Grow smarter.
            <br />
            Care better.
          </h1>

          {/* DESCRIPTION */}

          <p className="text-emerald-100 text-sm sm:text-base lg:text-lg mt-4 sm:mt-5 lg:mt-6 leading-relaxed max-w-lg">
            Detect possible plant diseases with AI and get
            knowledge-powered plant-care guidance using RAG.
          </p>

          {/* FEATURES */}

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-6 sm:mt-7 lg:mt-9 max-w-lg">

            <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4 backdrop-blur-sm">
              <Stethoscope size={19} />

              <p className="font-bold text-sm sm:text-base mt-2.5 sm:mt-3">
                AI Diagnosis
              </p>

              <p className="text-[10px] sm:text-xs text-emerald-200 mt-1">
                Image-based analysis
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4 backdrop-blur-sm">
              <Brain size={19} />

              <p className="font-bold text-sm sm:text-base mt-2.5 sm:mt-3">
                RAG Assistant
              </p>

              <p className="text-[10px] sm:text-xs text-emerald-200 mt-1">
                Knowledge-based answers
              </p>
            </div>

          </div>

          {/* MOBILE INFO */}

          <div className="mt-5 sm:mt-6 lg:hidden flex items-center gap-2 text-[10px] sm:text-xs text-emerald-200">
            <CheckCircle2 size={14} />
            Personalized plant-care support
          </div>

          {/* FOOTER */}

          <p className="text-[10px] sm:text-xs text-emerald-300 mt-5 sm:mt-6 lg:mt-8">
            PlantCare AI © 2026 Kritika Bunkar
          </p>

        </div>
      </div>

      {/* =====================================================
          LOGIN / REGISTER FORM
      ===================================================== */}

      <div className="flex items-center justify-center px-4 py-7 sm:px-8 sm:py-10 lg:p-10 xl:p-14 min-h-[calc(100vh-290px)] sm:min-h-[calc(100vh-330px)] lg:min-h-screen">

        <form
          onSubmit={submit}
          className="w-full max-w-md bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-emerald-100 shadow-[0_20px_70px_rgba(16,185,129,0.10)] p-5 sm:p-7 lg:p-9"
        >

          {/* FORM BRAND */}

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0">
              <Leaf size={22} />
            </div>

            <div className="min-w-0">
              <div className="font-black text-lg sm:text-xl text-emerald-900">
                PlantCare AI
              </div>

              <div className="text-[10px] sm:text-[11px] text-slate-400">
                Your intelligent plant companion
              </div>
            </div>

          </div>

          {/* TITLE */}

          <div className="mt-7 sm:mt-9">

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="text-slate-500 mt-2 text-xs sm:text-sm leading-relaxed">
              {mode === "login"
                ? "Continue caring for your plants."
                : "Start your personalized plant-care journey."}
            </p>

          </div>

          {/* REGISTER NAME */}

          {mode === "register" && (
            <div className="mt-5 sm:mt-6">

              <label className="text-xs font-bold text-slate-600">
                Full name
              </label>

              <input
                required
                className="w-full mt-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition text-sm"
                placeholder="Your name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

            </div>
          )}

          {/* EMAIL */}

          <div className="mt-4">

            <label className="text-xs font-bold text-slate-600">
              Email address
            </label>

            <input
              required
              className="w-full mt-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition text-sm"
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

          </div>

          {/* PASSWORD */}

          <div className="mt-4">

            <label className="text-xs font-bold text-slate-600">
              Password
            </label>

            <input
              required
              minLength="6"
              className="w-full mt-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition text-sm"
              placeholder="Minimum 6 characters"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-600 text-xs sm:text-sm leading-relaxed">
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            disabled={loading}
            className="w-full mt-5 sm:mt-6 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-60 text-white p-3.5 rounded-xl font-black text-sm transition shadow-lg shadow-emerald-700/10"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login to PlantCare AI"
              : "Create Account"}
          </button>

          {/* SWITCH LOGIN / REGISTER */}

          <button
            type="button"
            className="w-full mt-4 text-emerald-700 font-bold text-xs sm:text-sm hover:text-emerald-900 transition"
            onClick={() => {
              setError("");
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              );
            }}
          >
            {mode === "login"
              ? "Don't have an account? Create one"
              : "Already have an account? Login"}
          </button>

          {/* MOBILE FOOTER */}

          <div className="lg:hidden mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400">
              Secure AI-powered plant care
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default Auth;
