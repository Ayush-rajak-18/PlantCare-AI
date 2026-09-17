import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Leaf,
  LayoutDashboard,
  Stethoscope,
  MessageCircle,
  Plus,
  LogOut,
  Upload,
  Droplets,
  Sun,
  Sprout,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  History,
  Sparkles,
  Image as ImageIcon,
  X,
  RefreshCw,
  Send,
  Trash2,
  Search,
  ChevronLeft,
  ArrowRight,
  MapPin,
  Clock3,
  HeartPulse,
  Brain,
  Camera,
  Menu,
} from "lucide-react";
import "./index.css";

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

/* =========================================================
   SMALL UI HELPERS
========================================================= */

function InitialAvatar({ name, large = false }) {
  return (
    <div
      className={`${
        large ? "w-12 h-12 text-base" : "w-9 h-9 text-sm"
      } rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white grid place-items-center font-black shadow-sm shrink-0`}
    >
      {name?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
      <Icon size={13} />
      {children}
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:240ms]" />
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

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

function App() {
  const storedName = localStorage.getItem("plantcare_name");
  const storedEmail = localStorage.getItem("plantcare_email");

  const [user, setUser] = useState(
    storedName
      ? {
          name: storedName,
          email: storedEmail || "",
        }
      : null
  );

  const [page, setPage] = useState("dashboard");
  const [plants, setPlants] = useState([]);
  const [toast, setToast] = useState("");
  const [diagnosisCount, setDiagnosisCount] = useState(0);

  async function loadPlants() {
    try {
      setPlants(await api("/plants"));
    } catch (e) {
      setToast(e.message);
    }
  }

  useEffect(() => {
    if (user) {
      loadPlants();
    }
  }, [user]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const logout = () => {
    localStorage.removeItem("plantcare_token");
    localStorage.removeItem("plantcare_name");
    localStorage.removeItem("plantcare_email");

    setUser(null);
    setPlants([]);
    setDiagnosisCount(0);
  };

  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["plants", "My Plants", Sprout],
    ["doctor", "Plant Doctor", Stethoscope],
    ["assistant", "AI Assistant", MessageCircle],
  ];

  const hour = new Date().getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? "Good morning"
      : hour >= 12 && hour < 17
      ? "Good afternoon"
      : hour >= 17 && hour < 21
      ? "Good evening"
      : "Good night";

  const currentPageLabel =
    page === "dashboard"
      ? greeting
      : nav.find((x) => x[0] === page)?.[1];

  return (
    <div className="min-h-screen bg-[#f5faf6] text-slate-900">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-emerald-950 text-white p-5 hidden md:flex flex-col z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-800 border border-emerald-700 grid place-items-center shadow-inner">
            <Leaf size={23} />
          </div>

          <div>
            <div className="font-black text-xl">
              PlantCare AI
            </div>

            <div className="text-[10px] text-emerald-300">
              Intelligent plant health
            </div>
          </div>
        </div>

        <div className="mt-8 px-3 py-2.5 rounded-xl bg-emerald-900/70 border border-emerald-800/60 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            AI + RAG Plant Care System
          </div>
        </div>

        <nav className="mt-7 space-y-1.5">
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 ${
                page === id
                  ? "bg-emerald-700 text-white shadow-lg shadow-black/10"
                  : "hover:bg-emerald-900 text-emerald-100"
              }`}
            >
              <Icon size={18} />
              <span className="font-semibold text-sm">
                {label}
              </span>

              {page === id && (
                <ArrowRight
                  size={14}
                  className="ml-auto opacity-70"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="bg-emerald-900/70 border border-emerald-800 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <InitialAvatar name={user.name} />

              <div className="min-w-0">
                <div className="text-[10px] text-emerald-300 uppercase tracking-wide font-bold">
                  Signed in
                </div>

                <b className="text-sm text-white block truncate mt-0.5">
                  {user.name}
                </b>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex gap-2 items-center justify-center py-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900 transition text-sm font-semibold"
          >
            <LogOut size={17} />
            Logout
          </button>

          <p className="text-[10px] text-emerald-500 text-center mt-5">
            PlantCare AI © 2026 Kritika Bunkar
          </p>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="md:ml-64 p-3 sm:p-5 lg:p-8 pb-24 md:pb-8 max-w-[1600px]">
        {/* HEADER */}

        <header className="flex justify-between items-center mb-5 sm:mb-7">
          <div className="min-w-0">
            <p className="text-emerald-700 font-black text-[11px] sm:text-xs uppercase tracking-[0.15em]">
              PlantCare AI
            </p>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mt-1 truncate">
              {currentPageLabel}
              {page === "dashboard" && user.name
                ? `, ${user.name}`
                : ""}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-emerald-100 text-xs font-semibold text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI System Ready
            </div>

            <InitialAvatar
              name={user.name}
              large
            />
          </div>
        </header>

        {/* PAGES */}

        {page === "dashboard" && (
          <Dashboard
            plants={plants}
            diagnosisCount={diagnosisCount}
            setPage={setPage}
          />
        )}

        {page === "plants" && (
          <Plants
            plants={plants}
            reload={loadPlants}
            setToast={setToast}
          />
        )}

        {page === "doctor" && (
          <Doctor
            setToast={setToast}
            onDiagnosis={() =>
              setDiagnosisCount(
                (count) => count + 1
              )
            }
          />
        )}

        {page === "assistant" && (
          <Assistant user={user} />
        )}

        {/* TOAST */}

        {toast && (
          <div className="fixed left-3 right-3 sm:left-auto sm:right-5 bottom-20 md:bottom-5 z-[70]">
            <div className="max-w-md ml-auto bg-slate-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 grid place-items-center shrink-0">
                <ShieldCheck size={15} />
              </div>

              <p className="text-sm leading-relaxed pt-0.5">
                {toast}
              </p>
            </div>
          </div>
        )}

        <footer className="mt-9 pt-5 border-t border-emerald-100 text-center text-[11px] sm:text-xs text-slate-400">
          PlantCare AI © 2026 Kritika Bunkar
        </footer>
      </main>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-emerald-100 p-2 z-50 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`relative flex flex-col items-center justify-center gap-1 min-w-[62px] px-2 py-2 rounded-xl transition-all duration-200 ${
                page === id
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-slate-500 active:bg-slate-50"
              }`}
            >
              <Icon size={19} />

              <span className="text-[9px] font-black">
                {label === "My Plants"
                  ? "Plants"
                  : label === "Plant Doctor"
                  ? "Doctor"
                  : label === "AI Assistant"
                  ? "AI"
                  : "Home"}
              </span>

              {page === id && (
                <span className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-emerald-600" />
              )}
            </button>
          ))}

          <button
            onClick={logout}
            className="flex flex-col items-center justify-center gap-1 text-red-500 active:scale-95 transition"
          >
            <LogOut size={21} />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  plants,
  diagnosisCount,
  setPage,
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 text-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-emerald-900/10">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10" />
        <div className="absolute -left-20 -bottom-28 w-72 h-72 rounded-full bg-lime-300/5" />

        <div className="absolute right-7 bottom-2 opacity-[0.07] hidden sm:block">
          <Leaf size={180} />
        </div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-[10px] sm:text-xs font-black text-emerald-100">
            <Sparkles size={13} />
            SMART PLANT CARE
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mt-4">
            Your plants,
            <br className="hidden sm:block" />
            smarter care.
          </h2>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mt-3 max-w-2xl">
            Diagnose possible plant diseases with AI and ask
            your RAG-powered assistant for practical plant-care
            guidance.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setPage("doctor")}
              className="inline-flex items-center gap-2 bg-white text-emerald-900 px-4 sm:px-5 py-3 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition shadow-lg"
            >
              <Stethoscope size={17} />
              Check Plant Health
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => setPage("assistant")}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-4 sm:px-5 py-3 rounded-xl font-bold text-sm hover:bg-white/15 transition"
            >
              <MessageCircle size={17} />
              Ask AI
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Stat
          title="My Plants"
          value={plants.length}
          icon={Sprout}
          description={
            plants.length === 0
              ? "Start your collection"
              : "Plants in your care"
          }
        />

        <Stat
          title="AI Diagnoses"
          value={diagnosisCount}
          icon={Stethoscope}
          description="This session"
          badge="LIVE"
        />

        <Stat
          title="Plant Health"
          value="AI"
          icon={HeartPulse}
          description="Disease analysis"
        />

        <Stat
          title="Knowledge"
          value="RAG"
          icon={Brain}
          description="Knowledge-powered AI"
        />
      </div>

      {/* INFO STRIP */}

      <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0">
          <ShieldCheck size={19} />
        </div>

        <div>
          <p className="font-black text-emerald-900 text-sm sm:text-base">
            AI-powered plant health support
          </p>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Upload a clear leaf image for disease analysis or
            ask the RAG assistant about plant care.
          </p>
        </div>
      </div>

      {/* FEATURE CARDS */}

      <div className="grid xl:grid-cols-[1.45fr_1fr] gap-5">
        {/* DOCTOR */}

        <section className="relative overflow-hidden rounded-[2rem] bg-white border border-emerald-100 shadow-sm p-6 sm:p-8">
          <div className="absolute right-0 top-0 w-44 h-44 rounded-bl-full bg-emerald-50" />

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center">
                <Stethoscope />
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                AI Vision
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mt-6">
              Plant Doctor
            </h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mt-2 max-w-xl">
              Upload a clear leaf photo and let the trained
              disease-detection model analyze the image.
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
              <MiniFeature icon={Camera} text="Upload" />
              <MiniFeature icon={Brain} text="Analyze" />
              <MiniFeature icon={HeartPulse} text="Care" />
            </div>

            <button
              onClick={() => setPage("doctor")}
              className="mt-6 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-xl font-black text-sm transition shadow-lg shadow-emerald-700/10"
            >
              Open Plant Doctor
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ASSISTANT */}

        <section className="rounded-[2rem] bg-white border border-emerald-100 shadow-sm p-6 sm:p-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center">
            <MessageCircle />
          </div>

          <SectionLabel icon={Sparkles}>
            RAG AI Assistant
          </SectionLabel>

          <h2 className="text-2xl font-black mt-4">
            Ask your plant expert.
          </h2>

          <p className="text-slate-500 text-sm leading-relaxed mt-2">
            Get answers using your project's plant-care
            knowledge base.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <TopicChip text="🌱 Plant Care" />
            <TopicChip text="🦠 Diseases" />
            <TopicChip text="💧 Watering" />
            <TopicChip text="☀️ Sunlight" />
          </div>

          <button
            onClick={() => setPage("assistant")}
            className="w-full mt-5 flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition"
          >
            <MessageCircle size={17} />
            Open AI Assistant
          </button>
        </section>
      </div>

      {/* PLANTS */}

      <section className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
                <Sprout size={18} />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black">
                  My Plants
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Your registered plants and care profiles.
            </p>
          </div>

          <button
            onClick={() => setPage("plants")}
            className="text-emerald-700 font-black text-sm hover:text-emerald-900 flex items-center gap-1"
          >
            Manage
            <ArrowRight size={15} />
          </button>
        </div>

        {plants.length === 0 ? (
          <div className="py-12 sm:py-14 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <Sprout size={29} />
            </div>

            <p className="font-black mt-4 text-slate-800">
              Your plant collection is empty
            </p>

            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Add your first plant to start building your
              personal plant-care collection.
            </p>

            <button
              onClick={() => setPage("plants")}
              className="mt-5 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
            >
              <Plus size={16} />
              Add your first plant
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {plants.slice(0, 6).map((p) => (
              <PlantCard
                key={p._id}
                p={p}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   DASHBOARD SMALL COMPONENTS
========================================================= */

function MiniFeature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-slate-100">
      <Icon
        size={15}
        className="text-emerald-600 shrink-0"
      />
      <span className="text-[11px] sm:text-xs font-bold text-slate-600">
        {text}
      </span>
    </div>
  );
}

function TopicChip({ text }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600">
      {text}
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
  icon: Icon,
  description,
  badge,
}) {
  return (
    <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-start gap-2">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
          <Icon size={19} />
        </div>

        {badge && (
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-black mt-4">
        {value}
      </div>

      <div className="text-slate-700 font-bold text-sm">
        {title}
      </div>

      <div className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   PLANT CARD
========================================================= */

function PlantCard({ p }) {
  return (
    <div className="group rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-white p-4 sm:p-5 border border-emerald-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white grid place-items-center text-emerald-700 shadow-sm border border-emerald-50">
          <Leaf size={21} />
        </div>

        <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-100 px-2.5 py-1.5 rounded-full flex items-center gap-1">
          <MapPin size={11} />
          {p.location || "Plant"}
        </span>
      </div>

      <h3 className="font-black text-lg mt-4 truncate">
        {p.name}
      </h3>

      <p className="text-slate-500 text-sm truncate">
        {p.species}
      </p>

      <div className="flex flex-wrap gap-2 mt-4 text-[10px]">
        <span className="bg-white px-2.5 py-1.5 rounded-full border border-slate-100 text-slate-600 font-semibold">
          <Droplets
            size={12}
            className="inline mr-1 text-emerald-600"
          />
          Every {p.watering_days || "—"} days
        </span>

        <span className="bg-white px-2.5 py-1.5 rounded-full border border-slate-100 text-slate-600 font-semibold">
          <Sun
            size={12}
            className="inline mr-1 text-emerald-600"
          />
          {p.location || "Not set"}
        </span>
      </div>

      {p.notes && (
        <div className="mt-4 text-xs text-slate-500 bg-white/80 border border-slate-100 rounded-xl p-3 leading-relaxed">
          <b className="text-slate-700">Notes:</b>{" "}
          {p.notes}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PLANTS
========================================================= */

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

function Doctor({
  setToast,
  onDiagnosis,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setToast("Please select a valid image file.");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setToast("Image size must be less than 10 MB.");
      return;
    }

    setFile(selected);
    setResult(null);

    const url = URL.createObjectURL(selected);
    setPreview(url);
  }

  function clearImage() {
    setFile(null);
    setPreview("");
    setResult(null);
  }

  async function diagnose(e) {
    e.preventDefault();

    if (!file) {
      setToast("Please choose a leaf image first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const response = await api("/ai/diagnose", {
        method: "POST",
        body: fd,
      });

      setResult(response);
      onDiagnosis?.();
      setToast("Plant analysis completed.");
    } catch (e) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl">
      {/* DOCTOR HEADER */}

      <div className="mb-5">
        <SectionLabel icon={Stethoscope}>
          AI Plant Doctor
        </SectionLabel>

        <h2 className="text-2xl sm:text-3xl font-black mt-3">
          Check your plant's health
        </h2>

        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Upload a clear leaf image and let the trained AI
          model analyze possible disease patterns.
        </p>
      </div>

      {/* UPLOAD CARD */}

      <div className="bg-white rounded-[2rem] p-4 sm:p-7 border border-emerald-100 shadow-sm">
        <form onSubmit={diagnose}>
          {preview ? (
            <div className="relative rounded-[1.5rem] overflow-hidden border border-emerald-100 bg-slate-100">
              <img
                src={preview}
                alt="Selected leaf preview"
                className="w-full h-[260px] sm:h-[400px] lg:h-[460px] object-contain"
              />

              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-2 bg-slate-950/80 backdrop-blur text-white text-[10px] sm:text-xs px-3 py-2 rounded-xl font-bold">
                  <ImageIcon size={13} />
                  Image selected
                </span>
              </div>

              <button
                type="button"
                onClick={clearImage}
                className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-white/95 text-red-500 grid place-items-center shadow-lg hover:bg-red-50 transition"
                title="Remove image"
              >
                <X size={18} />
              </button>

              <div className="absolute left-3 right-3 bottom-3">
                <div className="bg-white/95 backdrop-blur rounded-xl px-3 py-2.5 shadow-lg border border-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <ImageIcon
                      size={15}
                      className="text-emerald-700 shrink-0"
                    />

                    <span className="font-bold text-xs sm:text-sm truncate">
                      {file?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <label className="group border-2 border-dashed border-emerald-200 rounded-[1.5rem] min-h-[300px] sm:min-h-[390px] flex flex-col items-center justify-center cursor-pointer bg-gradient-to-br from-emerald-50 to-white hover:bg-emerald-50 transition-all duration-200 px-5 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white border border-emerald-100 grid place-items-center text-emerald-700 shadow-sm group-hover:scale-105 transition">
                <Upload size={28} />
              </div>

              <b className="mt-5 text-lg sm:text-xl font-black">
                Upload a leaf image
              </b>

              <span className="text-sm text-slate-500 mt-2">
                Drag & drop or tap to choose a photo
              </span>

              <span className="text-xs text-slate-400 mt-2">
                JPG, JPEG, PNG or WEBP • Maximum 10 MB
              </span>

              <div className="flex items-center gap-2 mt-5 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-100 px-3 py-2 rounded-xl">
                <Camera size={13} />
                Clear, well-lit leaf photos work best
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={15}
                  className="text-emerald-600"
                />
                <span className="text-xs font-black text-slate-700">
                  Better image quality
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                Keep the leaf visible and well lit.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Brain
                  size={15}
                  className="text-emerald-600"
                />
                <span className="text-xs font-black text-slate-700">
                  AI analysis
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                Results depend on image quality and model confidence.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              type="submit"
              disabled={!file || loading}
              className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-black text-sm transition shadow-lg shadow-emerald-700/10"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="inline mr-2 animate-spin"
                  />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <Stethoscope
                    size={17}
                    className="inline mr-2"
                  />
                  Analyze with AI
                </>
              )}
            </button>

            {file && !loading && (
              <button
                type="button"
                onClick={clearImage}
                className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
              >
                Choose another image
              </button>
            )}
          </div>
        </form>
      </div>

      {result && (
        <DiagnosisResult result={result} />
      )}
    </div>
  );
}

/* =========================================================
   DIAGNOSIS RESULT
========================================================= */

function DiagnosisResult({ result }) {
  const confidence = Number(result.confidence || 0);

  const percentage = Math.max(
    0,
    Math.min(100, confidence * 100)
  );

  const diseaseText = String(
    result.disease || ""
  ).toLowerCase();

  const isHealthy =
    diseaseText.includes("healthy") ||
    result.healthy === true;

  const isUncertain =
    result.uncertain === true ||
    diseaseText.includes("uncertain");

  const status = isUncertain
    ? {
        label: "Uncertain",
        description:
          "The model is not sufficiently confident. Try a clearer leaf image.",
        icon: AlertTriangle,
        box: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
      }
    : isHealthy
    ? {
        label: "Healthy",
        description:
          "The model did not detect a known disease pattern.",
        icon: CheckCircle2,
        box: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-700",
      }
    : {
        label: "Disease Detected",
        description:
          "The model detected a disease pattern that requires attention.",
        icon: AlertTriangle,
        box: "bg-red-50 border-red-200",
        text: "text-red-700",
      };

  const StatusIcon = status.icon;

  return (
    <div className="mt-5 space-y-5">
      {/* RESULT */}

      <div className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
          <div>
            <SectionLabel icon={ShieldCheck}>
              {result.demo
                ? "Demo Model Mode"
                : "AI Model Result"}
            </SectionLabel>

            <h2 className="text-2xl sm:text-4xl font-black mt-4">
              {result.plant || "Plant"}
            </h2>

            <p className="text-lg sm:text-xl text-emerald-700 font-black mt-1">
              {result.disease || "Unknown condition"}
            </p>
          </div>

          <div
            className={`self-start border rounded-2xl px-4 py-3 ${status.box}`}
          >
            <div
              className={`flex items-center gap-2 font-black text-sm ${status.text}`}
            >
              <StatusIcon size={18} />
              {status.label}
            </div>

            <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
              {status.description}
            </p>
          </div>
        </div>

        {/* CONFIDENCE */}

        <div className="mt-7 pt-5 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-black text-sm text-slate-700">
                Model Confidence
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Confidence returned by the AI model
              </p>
            </div>

            <b className="text-emerald-700 text-xl">
              {percentage.toFixed(1)}%
            </b>
          </div>

          <div className="h-3 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}

      <div className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <Leaf size={19} />
          </div>

          <div>
            <h3 className="font-black text-xl">
              Recommended Care
            </h3>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Suggested actions based on the detected condition.
            </p>
          </div>
        </div>

        {result.recommendations?.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {result.recommendations.map(
              (item, index) => (
                <div
                  key={index}
                  className="group bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-4 flex gap-3 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 grid place-items-center shrink-0 font-black text-xs shadow-sm">
                    {index + 1}
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="mt-5 bg-slate-50 rounded-xl p-4 text-sm text-slate-500">
            No additional recommendations were returned for this
            result.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   AI RESPONSE FORMATTER
   Makes plain backend text look like a proper AI response.
========================================================= */

function formatInlineText(text) {
  if (!text) return null;

  const parts = text.split(
    /(\*\*[^*]+\*\*|__[^_]+__)/g
  );

  return parts.map((part, index) => {
    if (
      (part.startsWith("**") &&
        part.endsWith("**")) ||
      (part.startsWith("__") &&
        part.endsWith("__"))
    ) {
      return (
        <strong
          key={index}
          className="font-black text-slate-900"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return (
      <React.Fragment key={index}>
        {part}
      </React.Fragment>
    );
  });
}

function AIResponse({ text }) {
  if (!text) {
    return (
      <p className="text-sm text-slate-500">
        I could not generate an answer.
      </p>
    );
  }

  const lines = String(text)
    .replace(/\r/g, "")
    .split("\n");

  const blocks = [];
  let bulletBuffer = [];

  function flushBullets() {
    if (bulletBuffer.length > 0) {
      blocks.push({
        type: "bullets",
        items: [...bulletBuffer],
      });

      bulletBuffer = [];
    }
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushBullets();
      return;
    }

    const bulletMatch = line.match(
      /^[-•*]\s+(.*)$/
    );

    const numberedMatch = line.match(
      /^\d+[.)]\s+(.*)$/
    );

    if (bulletMatch) {
      bulletBuffer.push({
        text: bulletMatch[1],
        number: null,
      });
      return;
    }

    if (numberedMatch) {
      bulletBuffer.push({
        text: numberedMatch[1],
        number: bulletBuffer.length + 1,
      });
      return;
    }

    flushBullets();

    if (
      line.startsWith("### ") ||
      line.startsWith("## ") ||
      line.startsWith("# ")
    ) {
      blocks.push({
        type: "heading",
        text: line.replace(/^#+\s*/, ""),
      });
      return;
    }

    if (
      line.endsWith(":") &&
      line.length < 90
    ) {
      blocks.push({
        type: "subheading",
        text: line.slice(0, -1),
      });
      return;
    }

    blocks.push({
      type: "paragraph",
      text: line,
      index,
    });
  });

  flushBullets();

  return (
    <div className="space-y-3.5 text-sm sm:text-[15px]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <div key={index} className="pt-1">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                {formatInlineText(block.text)}
              </h4>
            </div>
          );
        }

        if (block.type === "subheading") {
          return (
            <div
              key={index}
              className="pt-1 flex items-center gap-2"
            >
              <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
              <h4 className="font-black text-slate-900">
                {formatInlineText(block.text)}
              </h4>
            </div>
          );
        }

        if (block.type === "bullets") {
          return (
            <div
              key={index}
              className="space-y-2"
            >
              {block.items.map(
                (item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex gap-3 items-start bg-white/80 border border-slate-100 rounded-xl px-3.5 py-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 mt-0.5">
                      {item.number ? (
                        <span className="text-[10px] font-black">
                          {item.number}
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </div>

                    <p className="text-slate-700 leading-6">
                      {formatInlineText(item.text)}
                    </p>
                  </div>
                )
              )}
            </div>
          );
        }

        return (
          <p
            key={index}
            className="text-slate-700 leading-7"
          >
            {formatInlineText(block.text)}
          </p>
        );
      })}
    </div>
  );
}

/* =========================================================
   AI ASSISTANT
========================================================= */

function Assistant({ user }) {
  const historyKey =
    "plantcare_chat_history_" +
    (
      user?.email ||
      localStorage.getItem("plantcare_email") ||
      user?.name ||
      "user"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversations, setConversations] =
    useState(() => {
      try {
        const saved = localStorage.getItem(
          historyKey
        );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  const [currentChatId, setCurrentChatId] =
    useState(null);

  const [showHistory, setShowHistory] =
    useState(false);

  const [searchHistory, setSearchHistory] =
    useState("");

  const chatEndRef = useRef(null);

  const quickQuestions = [
    {
      icon: "🍃",
      text: "Why are my tomato leaves turning yellow?",
    },
    {
      icon: "💧",
      text: "How often should I water my plant?",
    },
    {
      icon: "🦠",
      text: "What causes powdery mildew?",
    },
    {
      icon: "☀️",
      text: "How much sunlight does a tomato plant need?",
    },
  ];

  function saveConversations(updated) {
    setConversations(updated);

    try {
      localStorage.setItem(
        historyKey,
        JSON.stringify(updated)
      );
    } catch (e) {
      console.error(
        "Could not save chat history:",
        e
      );
    }
  }

  const currentChat =
    conversations.find(
      (chat) => chat.id === currentChatId
    ) || null;

  const messages =
    currentChat?.messages || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages.length, loading]);

  function createNewChat() {
    const id =
      Date.now().toString() +
      Math.random().toString(36).slice(2);

    const newChat = {
      id,
      title: "New conversation",
      createdAt: new Date().toISOString(),
      messages: [],
    };

    saveConversations([
      newChat,
      ...conversations,
    ]);

    setCurrentChatId(id);
    setShowHistory(false);
    setQ("");
  }

  function deleteChat(id, e) {
    e?.stopPropagation();

    const updated = conversations.filter(
      (chat) => chat.id !== id
    );

    saveConversations(updated);

    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  }

  function clearAllHistory() {
    if (conversations.length === 0) return;

    const ok = window.confirm(
      "Clear all PlantCare AI chat history?"
    );

    if (!ok) return;

    saveConversations([]);
    setCurrentChatId(null);
    setShowHistory(false);
  }

  function openChat(id) {
    setCurrentChatId(id);
    setShowHistory(false);
  }

  async function ask(
    e,
    customQuestion = null
  ) {
    e?.preventDefault();

    const question = (
      customQuestion ?? q
    ).trim();

    if (!question || loading) return;

    let chatId = currentChatId;

    if (!chatId) {
      chatId =
        Date.now().toString() +
        Math.random().toString(36).slice(2);

      const newChat = {
        id: chatId,
        title:
          question.length > 55
            ? question.slice(0, 55) + "..."
            : question,
        createdAt: new Date().toISOString(),
        messages: [],
      };

      const updated = [
        newChat,
        ...conversations,
      ];

      saveConversations(updated);
      setCurrentChatId(chatId);
    }

    const userMessage = {
      id:
        Date.now().toString() +
        Math.random().toString(36).slice(2),
      role: "user",
      text: question,
      createdAt:
        new Date().toISOString(),
    };

    const beforeRequest =
      conversations.find(
        (chat) => chat.id === chatId
      );

    let baseChat;

    if (beforeRequest) {
      baseChat = beforeRequest;
    } else {
      baseChat = {
        id: chatId,
        title:
          question.length > 55
            ? question.slice(0, 55) + "..."
            : question,
        createdAt:
          new Date().toISOString(),
        messages: [],
      };
    }

    const updatedWithUser =
      conversations.some(
        (chat) => chat.id === chatId
      )
        ? conversations.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  title:
                    chat.title ===
                    "New conversation"
                      ? question.length > 55
                        ? question.slice(0, 55) +
                          "..."
                        : question
                      : chat.title,
                  messages: [
                    ...chat.messages,
                    userMessage,
                  ],
                }
              : chat
          )
        : [
            {
              ...baseChat,
              messages: [userMessage],
            },
            ...conversations,
          ];

    saveConversations(updatedWithUser);

    setQ("");
    setLoading(true);

    try {
      const r = await api("/rag/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const aiMessage = {
        id:
          Date.now().toString() +
          Math.random().toString(36).slice(2),
        role: "ai",
        text:
          r.answer ||
          "I could not generate an answer.",
        sources: r.sources || [],
        createdAt:
          new Date().toISOString(),
      };

      setConversations((current) => {
        const updated = current.map(
          (chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    aiMessage,
                  ],
                }
              : chat
        );

        try {
          localStorage.setItem(
            historyKey,
            JSON.stringify(updated)
          );
        } catch (e) {
          console.error(
            "Could not save AI response:",
            e
          );
        }

        return updated;
      });
    } catch (e) {
      const errorMessage = {
        id:
          Date.now().toString() +
          Math.random().toString(36).slice(2),
        role: "ai",
        text:
          "I couldn't process that request.\n\n" +
          e.message,
        sources: [],
        error: true,
        createdAt:
          new Date().toISOString(),
      };

      setConversations((current) => {
        const updated = current.map(
          (chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    errorMessage,
                  ],
                }
              : chat
        );

        try {
          localStorage.setItem(
            historyKey,
            JSON.stringify(updated)
          );
        } catch {}

        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function formatChatDate(date) {
    if (!date) return "";

    try {
      return new Date(
        date
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  const filteredConversations =
    conversations.filter((chat) =>
      `${chat.title} ${chat.messages
        ?.map((m) => m.text)
        .join(" ")}`
        .toLowerCase()
        .includes(
          searchHistory.toLowerCase()
        )
    );

  return (
    <div className="max-w-6xl">
      {/* =================================================
          CHAT APP
      ================================================= */}

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden relative h-[calc(100vh-190px)] min-h-[570px] max-h-[850px] flex flex-col">
        {/* HEADER */}

        <div className="px-3 sm:px-5 py-3.5 sm:py-4 border-b bg-gradient-to-r from-white via-white to-emerald-50 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                <Leaf size={21} />

                <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-base sm:text-xl truncate">
                    PlantCare AI
                  </h2>

                  <span className="hidden xs:inline-flex sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide bg-emerald-700 text-white px-2 py-1 rounded-full">
                    <Sparkles size={9} />
                    RAG
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-slate-400 text-[10px] sm:text-xs truncate">
                    Plant knowledge assistant
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setShowHistory(true)
                }
                className="w-9 h-9 sm:w-auto sm:h-auto sm:flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition"
                title="Chat history"
              >
                <History size={16} />

                <span className="hidden sm:inline">
                  History
                </span>

                {conversations.length > 0 && (
                  <span className="hidden sm:grid min-w-5 h-5 px-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] place-items-center">
                    {conversations.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={createNewChat}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition shadow-sm"
              >
                <Plus size={16} />

                <span className="hidden sm:inline">
                  New Chat
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            HISTORY DRAWER
        ================================================= */}

        {showHistory && (
          <div className="absolute inset-0 z-50 bg-slate-950/25 backdrop-blur-[2px]">
            <div className="absolute top-0 bottom-0 right-0 w-full sm:w-[390px] bg-white shadow-2xl flex flex-col">
              <div className="p-4 sm:p-5 border-b">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setShowHistory(false)
                    }
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 grid place-items-center transition"
                  >
                    <ChevronLeft size={19} />
                  </button>

                  <div>
                    <h3 className="font-black text-xl">
                      Chat History
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Your saved conversations
                    </p>
                  </div>
                </div>

                {conversations.length > 0 && (
                  <div className="relative mt-5">
                    <Search
                      size={16}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <input
                      value={searchHistory}
                      onChange={(e) =>
                        setSearchHistory(
                          e.target.value
                        )
                      }
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 text-sm transition"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto p-3 sm:p-4">
                {filteredConversations.length ===
                0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
                      <History size={25} />
                    </div>

                    <h4 className="font-black mt-4">
                      No conversations yet
                    </h4>

                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Your AI Assistant conversations will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map(
                      (chat) => (
                        <div
                          key={chat.id}
                          className={`group rounded-2xl border p-3 transition cursor-pointer ${
                            currentChatId ===
                            chat.id
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-slate-100 hover:bg-slate-50 hover:border-emerald-100"
                          }`}
                          onClick={() =>
                            openChat(chat.id)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                              <MessageCircle
                                size={17}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-slate-800 line-clamp-2">
                                {chat.title}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400">
                                  {formatChatDate(
                                    chat.createdAt
                                  )}
                                </span>

                                <span className="text-[10px] text-slate-300">
                                  •
                                </span>

                                <span className="text-[10px] text-slate-400">
                                  {chat.messages
                                    ?.length || 0}{" "}
                                  messages
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) =>
                                deleteChat(
                                  chat.id,
                                  e
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 grid place-items-center transition shrink-0"
                              title="Delete conversation"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 border-t bg-slate-50">
                <button
                  type="button"
                  onClick={clearAllHistory}
                  disabled={
                    conversations.length === 0
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition"
                >
                  <Trash2 size={15} />
                  Clear All History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CHAT AREA
        ================================================= */}

        <div
          id="plantcare-chat-area"
          className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4 sm:py-6 scroll-smooth"
        >
          {/* EMPTY */}

          {messages.length === 0 && (
            <div className="min-h-full flex flex-col justify-center py-6">
              <div className="text-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                  <div className="absolute inset-0 rounded-[1.5rem] bg-emerald-100 animate-pulse opacity-60" />

                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white border border-emerald-100 text-emerald-600 grid place-items-center shadow-sm">
                    <Leaf
                      size={30}
                      className="sm:hidden"
                    />
                    <Leaf
                      size={35}
                      className="hidden sm:block"
                    />
                  </div>
                </div>

                <h3 className="font-black text-xl sm:text-2xl mt-5">
                  How can I help your plant?
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed px-4">
                  Ask about diseases, watering, sunlight,
                  treatment, prevention or general plant care.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-3xl mx-auto mt-7 w-full">
                {quickQuestions.map(
                  (item, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        ask(null, item.text)
                      }
                      className="group text-left p-3.5 sm:p-4 rounded-2xl border border-emerald-100 bg-white hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm transition disabled:opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 group-hover:bg-white grid place-items-center text-base sm:text-lg shrink-0 transition">
                          {item.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed block">
                            {item.text}
                          </span>

                          <span className="text-[10px] text-emerald-600 font-black mt-1.5 block">
                            Ask PlantCare AI →
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* MESSAGES */}

          {messages.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`flex gap-2.5 sm:gap-3 ${
                    m.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* AI */}

                  {m.role === "ai" && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0 mt-1 shadow-sm">
                      <Leaf size={17} />
                    </div>
                  )}

                  <div
                    className={`min-w-0 ${
                      m.role === "user"
                        ? "max-w-[88%] sm:max-w-[75%]"
                        : "max-w-[94%] sm:max-w-[84%]"
                    }`}
                  >
                    {/* MESSAGE HEADER */}

                    <div
                      className={`flex items-center gap-2 mb-1.5 ${
                        m.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span className="text-[10px] sm:text-[11px] font-black text-slate-400">
                        {m.role === "user"
                          ? "You"
                          : "PlantCare AI"}
                      </span>

                      {m.role === "ai" && !m.error && (
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </div>

                    {/* USER MESSAGE */}

                    {m.role === "user" ? (
                      <div className="bg-emerald-700 text-white rounded-[1.25rem] rounded-br-md px-4 py-3.5 shadow-sm">
                        <p className="text-sm sm:text-[15px] leading-6 sm:leading-7 whitespace-pre-wrap break-words">
                          {m.text}
                        </p>
                      </div>
                    ) : (
                      /* AI RESPONSE */
                      <div
                        className={`rounded-[1.35rem] rounded-bl-md border px-4 sm:px-5 py-4 sm:py-5 shadow-sm ${
                          m.error
                            ? "bg-red-50 border-red-100"
                            : "bg-slate-50/80 border-slate-100"
                        }`}
                      >
                        {m.error ? (
                          <div className="text-red-700 text-sm whitespace-pre-wrap leading-6">
                            {m.text}
                          </div>
                        ) : (
                          <AIResponse
                            text={m.text}
                          />
                        )}

                        {/* SOURCES */}

                        {m.sources?.length >
                          0 && (
                          <details className="mt-5 group">
                            <summary className="cursor-pointer list-none select-none">
                              <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 grid place-items-center">
                                    <ShieldCheck
                                      size={14}
                                    />
                                  </div>

                                  <div>
                                    <span className="text-xs font-black block">
                                      Knowledge sources
                                    </span>

                                    <span className="text-[9px] text-slate-400 block mt-0.5">
                                      Retrieved from plant knowledge base
                                    </span>
                                  </div>
                                </div>

                                <span className="min-w-6 h-6 px-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] grid place-items-center font-black">
                                  {
                                    m
                                      .sources
                                      .length
                                  }
                                </span>
                              </div>
                            </summary>

                            <div className="mt-2 space-y-1.5">
                              {m.sources.map(
                                (s, index) => (
                                  <div
                                    key={index}
                                    className="flex gap-2 items-start text-[11px] text-slate-500 bg-white border border-slate-100 rounded-xl px-3 py-2.5"
                                  >
                                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 text-[9px] font-black">
                                      {index + 1}
                                    </span>

                                    <span className="font-semibold text-slate-700 leading-5">
                                      {s.source ||
                                        s.title ||
                                        "PlantCare knowledge base"}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>

                  {/* USER AVATAR */}

                  {m.role === "user" && (
                    <InitialAvatar
                      name={user?.name}
                    />
                  )}
                </div>
              ))}

              {/* LOADING */}

              {loading && (
                <div className="flex gap-2.5 sm:gap-3 justify-start">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                    <Sparkles
                      size={16}
                      className="animate-pulse"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[1.35rem] rounded-bl-md px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-700">
                        PlantCare AI
                      </span>

                      <LoadingDots />
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                      Searching plant-care knowledge...
                    </p>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <form
          onSubmit={ask}
          className="p-2.5 sm:p-4 border-t bg-white shrink-0"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 p-1.5 sm:p-2 rounded-2xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50 transition">
              <input
                className="flex-1 min-w-0 px-2.5 sm:px-3 py-2.5 bg-transparent outline-none text-sm sm:text-base text-slate-800 placeholder:text-slate-400"
                value={q}
                onChange={(e) =>
                  setQ(e.target.value)
                }
                placeholder="Ask about your plant..."
                disabled={loading}
              />

              <button
                type="submit"
                disabled={
                  loading || !q.trim()
                }
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white grid place-items-center transition shrink-0 shadow-sm"
                title="Send message"
              >
                {loading ? (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 px-1 mt-1.5">
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                RAG-based plant knowledge support
              </p>

              {currentChatId && (
                <span className="hidden sm:block text-[10px] text-emerald-600 font-bold whitespace-nowrap">
                  Saved locally
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   START APP
========================================================= */

createRoot(
  document.getElementById("root")
).render(<App />);