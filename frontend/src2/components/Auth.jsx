import React, { useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";

const { Leaf, Stethoscope, Brain, ShieldCheck, ArrowRight, ChevronLeft, CheckCircle2 } = Icons;

/* ---------------------------------------------------------
   Hero plant art.
   Agar aap apni real plant photo (transparent PNG) rakhna chahte
   ho to usse  frontend/public/hero-plant.png  naam se save karein,
   wo automatically dikhegi. Warna ye built-in SVG plant dikhega.
--------------------------------------------------------- */
function Leafy({ r, s = 1, x = 200, y = 330, c = 0 }) {
  const fills = ["url(#lg1)", "url(#lg2)", "url(#lg3)"];
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C -52 -70 -40 -190 0 -250 C 40 -190 52 -70 0 0 Z" fill={fills[c % 3]} />
      <path d="M0 0 L0 -236" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" />
      {[-60, -105, -150, -195].map((yy) => (
        <g key={yy} stroke="rgba(255,255,255,0.16)" strokeWidth="1.6">
          <path d={`M0 ${yy} L-26 ${yy - 22}`} />
          <path d={`M0 ${yy} L26 ${yy - 22}`} />
        </g>
      ))}
    </g>
  );
}

function PlantArt() {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src="/hero-plant.png"
        alt="Plant"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]"
      />
    );
  }

  return (
    <svg viewBox="0 0 400 460" className="w-full h-full" role="img" aria-label="Plant illustration">
      <defs>
        <linearGradient id="lg1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0f4a23" />
          <stop offset="1" stopColor="#2f9e4f" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#0a3a1b" />
          <stop offset="1" stopColor="#1f7a3b" />
        </linearGradient>
        <linearGradient id="lg3" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#15572a" />
          <stop offset="1" stopColor="#47c26b" />
        </linearGradient>
        <linearGradient id="pot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9aa7a0" />
          <stop offset="0.45" stopColor="#2b3631" />
          <stop offset="1" stopColor="#0c1411" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#39e75f" stopOpacity="0.28" />
          <stop offset="1" stopColor="#39e75f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="230" rx="200" ry="210" fill="url(#halo)" />

      <Leafy r={-72} s={0.85} c={2} />
      <Leafy r={72} s={0.85} c={1} />
      <Leafy r={-48} s={1.0} c={0} />
      <Leafy r={48} s={1.0} c={2} />
      <Leafy r={-22} s={1.1} c={1} />
      <Leafy r={24} s={1.12} c={0} />
      <Leafy r={0} s={1.2} c={2} />

      {/* pot */}
      <path d="M118 318 H282 L262 352 C256 388 238 414 200 424 C162 414 144 388 138 352 Z" fill="url(#pot)" />
      <ellipse cx="200" cy="318" rx="84" ry="14" fill="#0a120e" />
      <ellipse cx="200" cy="318" rx="84" ry="14" fill="none" stroke="#39e75f" strokeWidth="2.5" opacity="0.9" />
      <path d="M150 366 Q200 386 250 366" stroke="#39e75f" strokeWidth="2" fill="none" opacity="0.75" />
      <rect x="170" y="428" width="60" height="9" rx="4.5" fill="#0d1a13" />
    </svg>
  );
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [showForm, setShowForm] = useState(false); // mobile: hero -> form

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
      localStorage.setItem("plantcare_email", data.email || form.email);

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

  const inputCls =
    "w-full mt-1.5 px-4 py-3.5 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-neon-500/70 focus:bg-white/8 focus:ring-4 focus:ring-neon-500/10 transition text-sm";

  return (
    <div className="relative min-h-screen min-h-[100dvh] text-white overflow-hidden lg:grid lg:grid-cols-2">

      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full bg-neon-500/15 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 -left-32 w-[24rem] h-[24rem] rounded-full bg-emerald-500/10 blur-3xl animate-blob" />

      {/* =====================================================
          HERO  (screen 1 of the reference)
      ===================================================== */}

      <section
        className={`relative flex-col min-h-screen min-h-[100dvh] px-6 pt-safe pb-safe lg:p-14 xl:p-20 lg:justify-center ${
          showForm ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex items-stretch gap-4 pt-10 lg:pt-0 animate-fade-up">
          <div className="flex items-center">
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] tracking-[0.2em] text-white/60 border-r border-white/30 pr-3 py-1">
              AI Smart Plant
            </span>
          </div>

          <h1 className="text-[2.6rem] sm:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight">
            Nature
            <br />
            Your Plant
          </h1>

          <div className="ml-auto self-start hidden sm:block" aria-hidden="true">
            <div className="w-16 h-20 sm:w-24 sm:h-28 flex">
              <div className="w-1/2 h-full bg-gradient-to-br from-neon-500 to-ink-600 rounded-l-[100%_60%] opacity-90" />
              <div className="w-1/2 h-full bg-gradient-to-bl from-neon-500 to-ink-600 rounded-r-[100%_60%] opacity-90 mt-3" />
            </div>
          </div>
        </div>

        {/* plant */}
        <div className="relative flex-1 min-h-[300px] lg:min-h-[380px] flex items-center justify-center my-4">
          <div className="w-[88%] max-w-[420px] aspect-[400/460] animate-float">
            <PlantArt />
          </div>

          <div className="absolute left-0 bottom-6 glass rounded-2xl px-4 py-2.5 animate-fade-up">
            <p className="text-sm font-semibold">AI Plant Doctor</p>
            <p className="text-xs text-white/60">Detect disease from a leaf photo</p>
          </div>
        </div>

        {/* feature chips */}
        <div className="grid grid-cols-2 gap-3 max-w-lg animate-fade-up">
          <div className="glass rounded-3xl p-3.5">
            <Stethoscope size={19} className="text-neon-500" />
            <p className="font-bold text-sm mt-2">AI Diagnosis</p>
            <p className="text-[11px] text-white/55 mt-0.5">Image-based analysis</p>
          </div>
          <div className="glass rounded-3xl p-3.5">
            <Brain size={19} className="text-neon-500" />
            <p className="font-bold text-sm mt-2">RAG Assistant</p>
            <p className="text-[11px] text-white/55 mt-0.5">Knowledge-based answers</p>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/65 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full self-start">
          <ShieldCheck size={13} className="text-neon-500" />
          AI + RAG Plant Care System
        </div>

        {/* Get Started (mobile) */}
        <button
          onClick={() => setShowForm(true)}
          className="lg:hidden group mt-6 relative w-full flex items-center rounded-full bg-ink-800/80 border border-white/10 backdrop-blur-xl p-1.5 active:scale-[0.98] transition"
        >
          <span className="w-14 h-14 rounded-full bg-neon-500 text-[#04210f] grid place-items-center shadow-[0_0_30px_rgba(57,231,95,0.6)] group-hover:translate-x-1 transition">
            <ArrowRight size={22} />
          </span>
          <span className="flex-1 text-center font-semibold">Get Started</span>
          <span className="flex pr-4 text-white/60">
            {[0, 1, 2].map((i) => (
              <ChevronLeft
                key={i}
                size={20}
                className="rotate-180 animate-chevron"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </span>
        </button>

        <p className="text-[10px] text-white/40 mt-4 text-center lg:text-left">
          PlantCare AI © 2026 Kritika Bunkar
        </p>
      </section>

      {/* =====================================================
          LOGIN / REGISTER
      ===================================================== */}

      <section
        className={`relative items-center justify-center px-4 py-8 sm:px-8 lg:p-10 xl:p-14 min-h-screen min-h-[100dvh] ${
          showForm ? "flex" : "hidden lg:flex"
        }`}
      >
        <form
          onSubmit={submit}
          className="w-full max-w-md glass bg-ink-800/60 rounded-[2rem] shadow-card p-6 sm:p-8 animate-fade-up"
        >
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="lg:hidden mb-4 inline-flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-neon-500 text-[#04210f] grid place-items-center shrink-0 shadow-[0_0_28px_rgba(57,231,95,0.5)]">
              <Leaf size={22} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-lg">PlantCare AI</div>
              <div className="text-[11px] text-white/50">Your intelligent plant companion</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-white/55 mt-2 text-sm leading-relaxed">
              {mode === "login"
                ? "Continue caring for your plants."
                : "Start your personalized plant-care journey."}
            </p>
          </div>

          {mode === "register" && (
            <div className="mt-6">
              <label className="text-xs font-bold text-white/70">Full name</label>
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
            <label className="text-xs font-bold text-white/70">Email address</label>
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
            <label className="text-xs font-bold text-white/70">Password</label>
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
            <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-400/30 px-4 py-3 text-red-300 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="btn-neon w-full mt-6 py-3.5 rounded-full text-sm disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login to PlantCare AI"
              : "Create Account"}
          </button>

          <button
            type="button"
            className="w-full mt-4 text-neon-500 font-bold text-sm hover:text-neon-400 transition"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login"
              ? "Don't have an account? Create one"
              : "Already have an account? Login"}
          </button>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-white/45">
            <CheckCircle2 size={13} className="text-neon-500" />
            Secure AI-powered plant care
          </div>
        </form>
      </section>
    </div>
  );
}

export default Auth;
