import React, { useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import PlantArt from "./PlantArt";

const { Leaf, Stethoscope, Brain, ShieldCheck, ArrowRight, ChevronLeft, CheckCircle2 } = Icons;

/* ---------------------------------------------------------
   Auth page = Welcome screen + Login/Register form

   Mobile  : pehle "Future Plant Care" welcome screen,
             "Get Started" dabane par login form khulta hai.
   Desktop : dono side-by-side dikhte hain.
--------------------------------------------------------- */

// Chhota sa floating leaf (sirf sajawat ke liye)
function FloatingLeaf({ className = "", delay = "0s" }) {
  return (
    <svg
      viewBox="0 0 40 60"
      className={`absolute animate-float text-forest-400/70 ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <path d="M20 58 C2 40 2 16 20 2 C38 16 38 40 20 58 Z" fill="currentColor" />
      <path d="M20 58 L20 10" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" ya "register"
  const [showForm, setShowForm] = useState(false); // mobile: welcome -> form

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- LOGIN / REGISTER API call (logic bilkul pehle jaisa) ----
  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api(`/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      localStorage.setItem("plantcare_token", data.token);
      localStorage.setItem("plantcare_name", data.name);
      localStorage.setItem("plantcare_email", data.email || form.email);
      localStorage.setItem("plantcare_avatar", data.avatar || "");

      onLogin({ ...data, email: data.email || form.email });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // input boxes ka common style
  const inputCls =
    "w-full mt-1.5 px-4 py-3.5 rounded-full bg-white/80 border border-sage-200 text-forest-900 placeholder:text-slate-400 outline-none focus:border-forest-400 focus:ring-4 focus:ring-mint-200/60 transition text-sm";

  return (
    <div className="relative min-h-screen min-h-[100dvh] text-forest-900 overflow-hidden lg:grid lg:grid-cols-2">

      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-28 -right-24 w-[26rem] h-[26rem] rounded-full bg-mint-200/60 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 -left-28 w-[24rem] h-[24rem] rounded-full bg-forest-200/40 blur-3xl animate-blob" />

      {/* =====================================================
          1) WELCOME SCREEN  ("Future Plant Care")
      ===================================================== */}
      <section
        className={`relative flex-col min-h-screen min-h-[100dvh] px-6 pt-safe pb-safe lg:p-14 xl:p-20 lg:justify-center ${
          showForm ? "hidden lg:flex" : "flex"
        }`}
      >
        <FloatingLeaf className="w-6 top-24 right-10" delay="0s" />
        <FloatingLeaf className="w-5 top-1/2 left-4" delay="1.5s" />
        <FloatingLeaf className="w-4 bottom-40 right-8" delay="3s" />

        {/* heading */}
        <div className="pt-12 lg:pt-0 animate-fade-up">
          <div className="flex items-center gap-2 text-forest-600 text-xs font-bold">
            <span className="w-8 h-8 rounded-full bg-forest-800 text-white grid place-items-center">
              <Leaf size={16} />
            </span>
            PlantCare AI
          </div>

          <h1 className="mt-5 text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.02] tracking-tight">
            Future
            <br />
            Plant <span className="text-forest-500">Care</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-forest-600 max-w-xs flex items-start gap-2">
            <Leaf size={14} className="mt-1 shrink-0" />
            AI plant ID and care guide on the go.
          </p>
        </div>

        {/* plant picture */}
        <div className="relative flex-1 min-h-[280px] flex items-center justify-center my-3">
          <PlantArt className="w-[78%] max-w-[380px] h-auto animate-float" />
        </div>

        {/* feature cards */}
        <div className="grid grid-cols-2 gap-3 max-w-lg animate-fade-up">
          <div className="glass rounded-3xl p-3.5 shadow-soft">
            <Stethoscope size={19} className="text-forest-600" />
            <p className="font-bold text-sm mt-2">AI Diagnosis</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Image-based analysis</p>
          </div>
          <div className="glass rounded-3xl p-3.5 shadow-soft">
            <Brain size={19} className="text-forest-600" />
            <p className="font-bold text-sm mt-2">RAG Assistant</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Knowledge-based answers</p>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-forest-600 bg-white/70 border border-white px-3 py-1.5 rounded-full self-start">
          <ShieldCheck size={13} />
          AI + RAG Plant Care System
        </div>

        {/* "Get Started" pill (sirf mobile par) */}
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary lg:hidden mt-6 w-full flex items-center rounded-full p-1.5 pl-7"
        >
          <span className="flex-1 text-left text-base">Get Started</span>
          <span className="w-12 h-12 rounded-full bg-white/15 grid place-items-center">
            <ArrowRight size={20} />
          </span>
        </button>

        <p className="text-[10px] text-forest-400 mt-4 text-center lg:text-left">
          PlantCare AI © 2026 Kritika Bunkar
        </p>
      </section>

      {/* =====================================================
          2) LOGIN / REGISTER FORM
      ===================================================== */}
      <section
        className={`relative items-center justify-center px-4 py-8 sm:px-8 lg:p-10 xl:p-14 min-h-screen min-h-[100dvh] ${
          showForm ? "flex" : "hidden lg:flex"
        }`}
      >
        <form
          onSubmit={submit}
          className="w-full max-w-md glass rounded-[2rem] shadow-card p-6 sm:p-8 animate-fade-up"
        >
          {/* mobile: wapas welcome screen par */}
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="lg:hidden mb-4 inline-flex items-center gap-1 text-xs font-bold text-forest-500 hover:text-forest-800"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-forest-800 text-white grid place-items-center shrink-0">
              <Leaf size={22} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-lg">PlantCare AI</div>
              <div className="text-[11px] text-slate-500">Your intelligent plant companion</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              {mode === "login"
                ? "Continue caring for your plants."
                : "Start your personalized plant-care journey."}
            </p>
          </div>

          {mode === "register" && (
            <div className="mt-6">
              <label className="text-xs font-bold text-forest-700">Full name</label>
              <input
                required
                className={inputCls}
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div className="mt-4">
            <label className="text-xs font-bold text-forest-700">Email address</label>
            <input
              required
              className={inputCls}
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="mt-4">
            <label className="text-xs font-bold text-forest-700">Password</label>
            <input
              required
              minLength="6"
              className={inputCls}
              placeholder="Minimum 6 characters"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-coral-50 border border-coral-100 px-4 py-3 text-coral-600 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <button disabled={loading} className="btn-primary w-full mt-6 py-3.5 rounded-full text-sm disabled:opacity-60">
            {loading ? "Please wait..." : mode === "login" ? "Login to PlantCare AI" : "Create Account"}
          </button>

          <button
            type="button"
            className="w-full mt-4 text-forest-600 font-bold text-sm hover:text-forest-900 transition"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? "Don't have an account? Create one" : "Already have an account? Login"}
          </button>

          <div className="mt-6 pt-4 border-t border-sage-200 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 size={13} className="text-forest-500" />
            Secure AI-powered plant care
          </div>
        </form>
      </section>
    </div>
  );
}

export default Auth;
