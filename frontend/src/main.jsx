import React, { useEffect, useState } from "react";
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      {/* LEFT BRAND PANEL */}

      <div className="hidden lg:flex flex-col justify-center p-16 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 text-white relative overflow-hidden">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-emerald-700/30" />

        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-lime-300/10" />

        <div className="relative">
          <div className="flex items-center gap-3 text-2xl font-black">
            <div className="w-12 h-12 rounded-2xl bg-white/10 grid place-items-center">
              <Leaf />
            </div>

            PlantCare AI
          </div>

          <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-100 text-sm">
            <ShieldCheck size={16} />
            AI + RAG Plant Care System
          </div>

          <h1 className="text-6xl font-black leading-tight mt-7">
            Grow smarter.
            <br />
            Care better.
          </h1>

          <p className="text-emerald-100 text-lg mt-6 max-w-lg leading-relaxed">
            AI plant disease detection, RAG-powered plant knowledge
            and personalized care in one intelligent system.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-10 max-w-lg">
            <div className="bg-white/10 rounded-2xl p-4">
              <Stethoscope size={20} />

              <p className="text-sm mt-3">
                AI Diagnosis
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-4">
              <MessageCircle size={20} />

              <p className="text-sm mt-3">
                RAG Assistant
              </p>
            </div>
          </div>

          <p className="text-sm mt-6">
            PlantCare AI © 2026 Kritika Bunkar
          </p>
        </div>
      </div>

      {/* AUTH FORM */}

      <div className="flex items-center justify-center p-5 sm:p-8">
        <form
          onSubmit={submit}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 border border-emerald-100"
        >
          <div className="flex items-center gap-3 font-black text-emerald-800 text-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 grid place-items-center">
              <Leaf />
            </div>

            PlantCare AI
          </div>

          <h2 className="text-3xl font-black mt-8">
            {mode === "login"
              ? "Welcome back"
              : "Create account"}
          </h2>

          <p className="text-slate-500 mt-2">
            Your intelligent plant companion.
          </p>

          {mode === "register" && (
            <input
              required
              className="w-full mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          )}

          <input
            required
            className="w-full mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            required
            minLength="6"
            className="w-full mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Password (6+ chars)"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          {error && (
            <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full mt-6 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white p-3.5 rounded-xl font-black transition"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>

          <button
            type="button"
            className="w-full mt-4 text-emerald-700 font-semibold hover:text-emerald-900"
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
              ? "Create a new account"
              : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const storedName = localStorage.getItem(
    "plantcare_name"
  );

  const storedEmail = localStorage.getItem(
    "plantcare_email"
  );

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

  // Session-only diagnosis count.
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

  /* Auto-hide toast */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 4000);

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

  /* =======================================================
     NAVIGATION
  ======================================================= */

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
    <div className="min-h-screen bg-[#f4faf5]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-emerald-950 text-white p-5 hidden md:flex flex-col z-30">
        <div className="flex items-center gap-3 font-black text-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 grid place-items-center">
            <Leaf />
          </div>

          PlantCare AI
        </div>

        <div className="text-emerald-300 text-xs mt-2 ml-1">
          AI + RAG Plant Care System
        </div>

        <nav className="mt-10 space-y-2">
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition ${
                page === id
                  ? "bg-emerald-700 shadow-lg"
                  : "hover:bg-emerald-900 text-emerald-100"
              }`}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="bg-emerald-900/70 rounded-2xl p-4 mb-4">
            <div className="text-xs text-emerald-300 mb-1">
              Logged in as
            </div>

            <b className="text-white break-words">
              {user.name}
            </b>
          </div>

          <button
            onClick={logout}
            className="flex gap-2 items-center text-emerald-200 hover:text-white transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="md:ml-64 p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 max-w-[1600px]">
        {/* HEADER */}

        <header className="flex justify-between items-center mb-7 sm:mb-8">
          <div className="min-w-0">
            <p className="text-emerald-700 font-bold text-sm">
              PlantCare AI
            </p>

            <h1 className="text-2xl sm:text-4xl font-black truncate">
              {currentPageLabel}
              {page === "dashboard" && user.name
                ? `, ${user.name}`
                : ""}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-700 text-white grid place-items-center font-black shadow-md">
              {user.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* =====================================================
            PAGES
        ===================================================== */}

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

        {/* =====================================================
            TOAST
        ===================================================== */}

        {toast && (
          <div className="fixed left-4 right-4 sm:left-auto sm:right-5 bottom-20 md:bottom-5 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 text-sm sm:text-base">
            {toast}
          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-10 pt-6 border-t border-emerald-100 text-center text-sm text-slate-400">
          PlantCare AI © 2026 Kritika Bunkar
        </footer>
      </main>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-emerald-100 p-2 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[58px] px-2 py-2 rounded-xl transition ${
                page === id
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-slate-500"
              }`}
            >
              <Icon size={20} />

              <span className="text-[10px] font-bold">
                {label === "My Plants"
                  ? "Plants"
                  : label === "Plant Doctor"
                  ? "Doctor"
                  : label === "AI Assistant"
                  ? "AI"
                  : label}
              </span>
            </button>
          ))}
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
    <div className="space-y-6">
      {/* STATS */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          title="My Plants"
          value={plants.length}
          icon={Sprout}
          description={
            plants.length === 0
              ? "Start your plant collection"
              : "Plants in your care"
          }
        />

        <Stat
          title="AI Diagnoses"
          value={diagnosisCount}
          icon={Stethoscope}
          description="This session"
        />

        <Stat
          title="Healthy Plants"
          value="—"
          icon={CheckCircle2}
          description="Available after diagnosis"
        />

        <Stat
          title="Plant Care AI"
          value="RAG"
          icon={Sparkles}
          description="Knowledge-powered answers"
        />
      </div>

      {/* INFO STRIP */}

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 grid place-items-center shrink-0">
          <ShieldCheck size={20} />
        </div>

        <div>
          <p className="font-bold text-emerald-900">
            AI-powered plant health support
          </p>

          <p className="text-sm text-slate-600 mt-0.5">
            Upload a leaf image for disease analysis or ask the
            RAG assistant for plant-care guidance.
          </p>
        </div>
      </div>

      {/* FEATURE CARDS */}

      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-6">
        {/* PLANT DOCTOR */}

        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 text-white rounded-[2rem] p-7 sm:p-8 min-h-80 flex flex-col justify-between shadow-xl">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5" />

          <div className="absolute right-10 bottom-8 opacity-10">
            <Leaf size={110} />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <Stethoscope size={15} />

              <p className="text-emerald-200 font-bold text-xs">
                AI PLANT DOCTOR
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">
              Know what's happening
              <br className="hidden sm:block" />
              with your plant.
            </h2>

            <p className="text-emerald-100 mt-3 max-w-xl leading-relaxed">
              Upload a clear leaf image and let the trained AI model
              analyze possible plant diseases.
            </p>
          </div>

          <button
            onClick={() => setPage("doctor")}
            className="relative bg-white text-emerald-900 font-black px-5 py-3 rounded-xl w-fit mt-6 hover:scale-[1.02] transition shadow-lg"
          >
            Analyze a plant →
          </button>
        </section>

        {/* AI ASSISTANT */}

        <section className="bg-white rounded-[2rem] p-7 border border-emerald-100 shadow-sm flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <MessageCircle />
          </div>

          <p className="font-bold text-emerald-700 mt-5 text-sm">
            RAG AI ASSISTANT
          </p>

          <h2 className="text-2xl font-black mt-2">
            Ask your plant expert.
          </h2>

          <p className="text-slate-500 mt-2 leading-relaxed">
            Get plant-care answers using the project's
            knowledge base with Retrieval-Augmented Generation.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
              🌱 Plant Care
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
              🦠 Disease Help
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
              💧 Watering
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
              ☀️ Sunlight
            </div>
          </div>

          <button
            onClick={() => setPage("assistant")}
            className="mt-6 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-xl font-bold transition"
          >
            <MessageCircle size={18} />
            Open AI Assistant
          </button>
        </section>
      </div>

      {/* MY PLANTS */}

      <section className="bg-white rounded-[2rem] p-6 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sprout
                size={20}
                className="text-emerald-700"
              />

              <h2 className="text-xl sm:text-2xl font-black">
                My Plants
              </h2>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              Your registered plants.
            </p>
          </div>

          <button
            onClick={() => setPage("plants")}
            className="text-emerald-700 font-bold whitespace-nowrap hover:text-emerald-900"
          >
            Manage →
          </button>
        </div>

        {plants.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <Sprout size={30} />
            </div>

            <p className="font-bold mt-4 text-slate-800">
              Your plant collection is empty
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Add your first plant to start building your personal
              plant-care profile.
            </p>

            <button
              onClick={() => setPage("plants")}
              className="mt-5 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold transition"
            >
              <Plus
                size={17}
                className="inline mr-1"
              />
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
   STAT
========================================================= */

function Stat({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex justify-between items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
          <Icon size={20} />
        </div>

        {title === "AI Diagnoses" && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            Live
          </span>
        )}
      </div>

      <div className="text-3xl font-black mt-4">
        {value}
      </div>

      <div className="text-slate-700 font-semibold">
        {title}
      </div>

      <div className="text-xs text-slate-400 mt-1">
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
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-5 border border-emerald-100 hover:shadow-md transition">
      <div className="flex justify-between items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white grid place-items-center text-emerald-700 shadow-sm">
          <Leaf />
        </div>

        <span className="text-xs font-semibold text-emerald-700 bg-white border border-emerald-100 px-2.5 py-1 rounded-full">
          {p.location || "Plant"}
        </span>
      </div>

      <h3 className="font-black text-lg mt-4">
        {p.name}
      </h3>

      <p className="text-slate-500">
        {p.species}
      </p>

      <div className="flex flex-wrap gap-2 mt-4 text-xs">
        <span className="bg-white px-3 py-1.5 rounded-full border border-slate-100">
          <Droplets
            size={13}
            className="inline mr-1 text-emerald-600"
          />
          Every {p.watering_days || "—"} days
        </span>

        <span className="bg-white px-3 py-1.5 rounded-full border border-slate-100">
          <Sun
            size={13}
            className="inline mr-1 text-emerald-600"
          />
          {p.location || "Not set"}
        </span>
      </div>

      {p.notes && (
        <div className="mt-4 text-xs text-slate-500 bg-white/80 rounded-xl p-3">
          <b className="text-slate-700">
            Notes:
          </b>{" "}
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
    <div className="grid xl:grid-cols-[380px_1fr] gap-6">
      {/* ADD PLANT */}

      <form
        onSubmit={add}
        className="bg-white rounded-[2rem] p-6 border border-emerald-100 shadow-sm h-fit"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">
          <Plus />
        </div>

        <h2 className="text-2xl font-black mt-4">
          Add Plant
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Create a personal profile for your plant.
        </p>

        {["name", "species"].map((k) => (
          <input
            required
            key={k}
            className="w-full mt-4 p-3.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder={
              k === "name"
                ? "Plant name"
                : "Species (e.g. Tomato)"
            }
            value={form[k]}
            onChange={(e) =>
              setForm({
                ...form,
                [k]: e.target.value,
              })
            }
          />
        ))}

        <select
          className="w-full mt-4 p-3.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-200"
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

        <label className="block text-sm font-semibold text-slate-600 mt-4 mb-1">
          Watering interval
        </label>

        <div className="relative">
          <input
            type="number"
            min="1"
            max="60"
            className="w-full p-3.5 pr-20 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-200"
            value={form.watering_days}
            onChange={(e) =>
              setForm({
                ...form,
                watering_days: e.target.value,
              })
            }
          />

          <span className="absolute right-4 top-3.5 text-sm text-slate-400">
            days
          </span>
        </div>

        <textarea
          className="w-full mt-4 p-3.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Notes about this plant (optional)"
          rows="4"
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
        />

        <button
          disabled={loading}
          className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white p-3.5 rounded-xl font-bold transition"
        >
          <Plus
            className="inline"
            size={18}
          />

          {" "}

          {loading
            ? "Adding..."
            : "Add Plant"}
        </button>
      </form>

      {/* PLANT LIST */}

      <div className="bg-white rounded-[2rem] p-6 border border-emerald-100 shadow-sm">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-black">
              Your Plants
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Manage all plants connected to your account.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
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

            <p className="mt-4 font-bold text-slate-800">
              No plants added yet
            </p>

            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
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
                  className="absolute right-3 top-3 text-red-500 bg-white p-2 rounded-xl shadow-sm hover:bg-red-50 transition"
                  title="Delete plant"
                >
                  <Trash2 size={17} />
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

    if (!selected) {
      return;
    }

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
      {/* UPLOAD CARD */}

      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-emerald-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0">
            <Stethoscope />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Plant Doctor
            </h2>

            <p className="text-slate-500 mt-1">
              Upload a clear leaf photo for AI-powered analysis.
            </p>
          </div>
        </div>

        <form
          onSubmit={diagnose}
          className="mt-7"
        >
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-100 bg-slate-50">
              <img
                src={preview}
                alt="Selected leaf preview"
                className="w-full max-h-[430px] object-contain bg-slate-100"
              />

              <button
                type="button"
                onClick={clearImage}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/95 text-red-500 grid place-items-center shadow-lg hover:bg-red-50"
                title="Remove image"
              >
                <X size={19} />
              </button>

              <div className="absolute left-4 bottom-4 right-4">
                <div className="bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <ImageIcon
                      size={17}
                      className="text-emerald-700"
                    />

                    <span className="font-bold text-sm break-all">
                      {file?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-emerald-200 rounded-3xl min-h-64 flex flex-col items-center justify-center cursor-pointer bg-emerald-50 hover:bg-emerald-100/60 transition px-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white grid place-items-center text-emerald-700 shadow-sm">
                <Upload size={27} />
              </div>

              <b className="mt-5 text-lg">
                Choose leaf image
              </b>

              <span className="text-sm text-slate-500 mt-2">
                JPG / JPEG / PNG
              </span>

              <span className="text-xs text-slate-400 mt-1">
                Maximum size: 10 MB
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          <div className="mt-4 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-500">
            <b className="text-slate-700">
              Tip:
            </b>{" "}
            Use a clear, well-lit image where the leaf is visible and
            occupies most of the frame.
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="submit"
              disabled={!file || loading}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="inline mr-2 animate-spin"
                  />
                  Analyzing...
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
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
              >
                Choose another
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
        label: "Uncertain Result",
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
    <div className="mt-6 space-y-6">
      {/* MAIN RESULT */}

      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-emerald-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
              <ShieldCheck size={14} />

              {result.demo
                ? "DEMO MODEL MODE"
                : "AI MODEL RESULT"}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black mt-4">
              {result.plant || "Plant"}
            </h2>

            <p className="text-xl text-emerald-700 font-bold mt-1">
              {result.disease || "Unknown condition"}
            </p>
          </div>

          <div
            className={`self-start border rounded-2xl px-4 py-3 ${status.box}`}
          >
            <div
              className={`flex items-center gap-2 font-black ${status.text}`}
            >
              <StatusIcon size={19} />
              {status.label}
            </div>

            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {status.description}
            </p>
          </div>
        </div>

        {/* CONFIDENCE */}

        <div className="mt-7">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">
              Model Confidence
            </span>

            <b className="text-emerald-700 text-lg">
              {percentage.toFixed(1)}%
            </b>
          </div>

          <div className="h-3 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}

      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <Leaf size={20} />
          </div>

          <div>
            <h3 className="font-black text-xl">
              Recommended Care
            </h3>

            <p className="text-xs text-slate-500">
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
                  className="bg-emerald-50 rounded-xl px-4 py-4 flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-white text-emerald-700 grid place-items-center shrink-0 font-black text-sm">
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
   AI ASSISTANT
   - Local chat history
   - New chat
   - Delete chat
   - Clear all
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

  /* =======================================================
     SAVE HISTORY
  ======================================================= */

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

  /* =======================================================
     CURRENT CHAT
  ======================================================= */

  const currentChat =
    conversations.find(
      (chat) => chat.id === currentChatId
    ) || null;

  const messages =
    currentChat?.messages || [];

  /* =======================================================
     CREATE NEW CHAT
  ======================================================= */

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

  /* =======================================================
     DELETE CHAT
  ======================================================= */

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

  /* =======================================================
     CLEAR ALL HISTORY
  ======================================================= */

  function clearAllHistory() {
    if (conversations.length === 0) {
      return;
    }

    const ok = window.confirm(
      "Clear all PlantCare AI chat history?"
    );

    if (!ok) {
      return;
    }

    saveConversations([]);
    setCurrentChatId(null);
    setShowHistory(false);
  }

  /* =======================================================
     OPEN CHAT
  ======================================================= */

  function openChat(id) {
    setCurrentChatId(id);
    setShowHistory(false);
  }

  /* =======================================================
     ASK QUESTION
  ======================================================= */

  async function ask(
    e,
    customQuestion = null
  ) {
    e?.preventDefault();

    const question = (
      customQuestion ?? q
    ).trim();

    if (!question || loading) {
      return;
    }

    let chatId = currentChatId;

    /* Create conversation automatically */

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
        createdAt:
          new Date().toISOString(),
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

  /* =======================================================
     FORMAT DATE
  ======================================================= */

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

  /* =======================================================
     FILTER HISTORY
  ======================================================= */

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
      <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm min-h-[680px] flex flex-col overflow-hidden relative">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-white via-white to-emerald-50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                <MessageCircle />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-lg sm:text-xl truncate">
                    PlantCare AI
                  </h2>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-emerald-700 text-white px-2 py-1 rounded-full">
                    <Sparkles size={10} />
                    RAG
                  </span>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
                  Your intelligent plant-care assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setShowHistory(true)
                }
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm transition"
                title="Chat history"
              >
                <History size={17} />

                <span className="hidden sm:inline">
                  History
                </span>

                {conversations.length > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] grid place-items-center">
                    {conversations.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={createNewChat}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition shadow-sm"
              >
                <Plus size={17} />

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
          <div className="absolute inset-0 z-30 bg-slate-900/20 backdrop-blur-[2px]">
            <div className="absolute top-0 bottom-0 right-0 w-full sm:w-[390px] bg-white shadow-2xl flex flex-col">
              {/* HISTORY HEADER */}

              <div className="p-5 border-b">
                <div className="flex items-center justify-between gap-3">
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
                </div>

                {/* SEARCH */}

                {conversations.length > 0 && (
                  <div className="relative mt-5">
                    <Search
                      size={17}
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* HISTORY LIST */}

              <div className="flex-1 overflow-auto p-4">
                {filteredConversations.length ===
                0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
                      <History size={25} />
                    </div>

                    <h4 className="font-black mt-4">
                      No conversations yet
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
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
                                <span className="text-[11px] text-slate-400">
                                  {formatChatDate(
                                    chat.createdAt
                                  )}
                                </span>

                                <span className="text-[11px] text-slate-300">
                                  •
                                </span>

                                <span className="text-[11px] text-slate-400">
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
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 grid place-items-center transition shrink-0"
                              title="Delete conversation"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* HISTORY FOOTER */}

              <div className="p-4 border-t bg-slate-50">
                <button
                  type="button"
                  onClick={clearAllHistory}
                  disabled={
                    conversations.length === 0
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition"
                >
                  <Trash2 size={16} />
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
          className="flex-1 p-4 sm:p-6 overflow-auto"
        >
          {/* EMPTY CHAT */}

          {messages.length === 0 && (
            <div className="min-h-[500px] flex flex-col justify-center">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-[1.7rem] bg-emerald-100 animate-pulse opacity-60" />

                  <div className="relative w-20 h-20 rounded-[1.7rem] bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 text-emerald-600 grid place-items-center shadow-sm">
                    <Leaf size={34} />
                  </div>
                </div>

                <h3 className="font-black text-2xl mt-6">
                  How can I help your plant?
                </h3>

                <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                  Ask me about plant diseases, watering,
                  sunlight, treatment, prevention, or
                  general plant care.
                </p>
              </div>

              {/* QUICK QUESTIONS */}

              <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto mt-9 w-full">
                {quickQuestions.map(
                  (item, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        ask(null, item.text)
                      }
                      className="group text-left p-4 rounded-2xl border border-emerald-100 bg-white hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm transition disabled:opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-white grid place-items-center text-lg shrink-0 transition">
                          {item.icon}
                        </div>

                        <div className="flex-1">
                          <span className="text-sm font-semibold text-slate-700 leading-relaxed block">
                            {item.text}
                          </span>

                          <span className="text-[11px] text-emerald-600 font-bold mt-2 block opacity-0 group-hover:opacity-100 transition">
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

          {/* CHAT MESSAGES */}

          {messages.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`flex gap-3 ${
                    m.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* AI AVATAR */}

                  {m.role === "ai" && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0 mt-1">
                      <Leaf size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] ${
                      m.role === "user"
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    {/* LABEL */}

                    <div
                      className={`flex items-center gap-2 mb-1.5 ${
                        m.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-400">
                        {m.role === "user"
                          ? "You"
                          : "PlantCare AI"}
                      </span>
                    </div>

                    {/* MESSAGE BUBBLE */}

                    <div
                      className={`rounded-[1.35rem] px-4 py-3.5 shadow-sm ${
                        m.role === "user"
                          ? "bg-emerald-700 text-white rounded-br-md"
                          : m.error
                          ? "bg-red-50 border border-red-100 text-red-700 rounded-bl-md"
                          : "bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-md"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-7 text-sm sm:text-[15px]">
                        {m.text}
                      </div>

                      {/* SOURCES */}

                      {m.sources?.length >
                        0 && (
                        <details className="mt-4 group">
                          <summary className="cursor-pointer list-none select-none">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition">
                              <ShieldCheck
                                size={14}
                              />

                              <span className="text-xs font-bold">
                                Knowledge sources
                              </span>

                              <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded-full font-bold">
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
                                  className="text-[11px] text-slate-500 bg-white border border-slate-100 rounded-lg px-3 py-2"
                                >
                                  <span className="font-semibold text-slate-700">
                                    {s.source ||
                                      s.title ||
                                      "Knowledge base"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>

                  {/* USER AVATAR */}

                  {m.role === "user" && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white grid place-items-center shrink-0 mt-1 font-black text-sm">
                      {user?.name?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                </div>
              ))}

              {/* LOADING */}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                    <Sparkles
                      size={17}
                      className="animate-pulse"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[1.35rem] rounded-bl-md px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700">
                        PlantCare AI is thinking
                      </span>

                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />

                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:120ms]" />

                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:240ms]" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1">
                      Searching your plant-care knowledge base...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            INPUT AREA
        ================================================= */}

        <form
          onSubmit={ask}
          className="p-3 sm:p-4 border-t bg-white"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 p-2 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition">
              <input
                className="flex-1 min-w-0 px-3 py-2.5 bg-transparent outline-none text-sm sm:text-base text-slate-800 placeholder:text-slate-400"
                value={q}
                onChange={(e) =>
                  setQ(e.target.value)
                }
                placeholder="Ask anything about your plant..."
                disabled={loading}
              />

              <button
                type="submit"
                disabled={
                  loading || !q.trim()
                }
                className="w-11 h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white grid place-items-center transition shrink-0 shadow-sm"
                title="Send message"
              >
                {loading ? (
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 px-1 mt-2">
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                PlantCare AI uses RAG-based plant knowledge to
                support its answers.
              </p>

              {currentChatId && (
                <span className="hidden sm:block text-[10px] text-emerald-600 font-semibold whitespace-nowrap">
                  Chat saved locally
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