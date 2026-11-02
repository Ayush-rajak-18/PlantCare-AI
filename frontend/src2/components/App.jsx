import React, { useEffect, useState } from "react";
import { api } from "../api";
import * as Icons from "../icons";
import { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, AIResponse } from "./Helpers";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Plants from "./Plants";
import Doctor from "./Doctor";
import Assistant from "./Assistant";
import Footer from "./Footer";
import ProjectInfo from "./ProjectInfo";

const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu, Smartphone, Download, Bell } = Icons;

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

  const getInitialPage = () => {
    const saved = localStorage.getItem("plantcare_current_page");
    const valid = ["dashboard", "plants", "doctor", "assistant", "project-info"];
    return valid.includes(saved) ? saved : "dashboard";
  };

  const [page, setPageState] = useState(getInitialPage);
  const setPage = (nextPage) => {
    setPageState(nextPage);
    try {
      localStorage.setItem("plantcare_current_page", nextPage);
    } catch {}
  };

  const [plants, setPlants] = useState([]);
  const [toast, setToast] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowInstallPopup(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installApp() {
    if (!installPrompt) return;

    try {
      installPrompt.prompt();

      await installPrompt.userChoice.catch(() => null);

      setInstallPrompt(null);
      setShowInstallPopup(false);
    } catch {
      setShowInstallPopup(false);
    }
  }

  function closeInstallPopup() {
    setShowInstallPopup(false);
  }

  const diagnosisKey =
    "plantcare_diagnosis_count_" +
    (storedEmail || storedName || "user").toLowerCase().replace(/[^a-z0-9]/g, "_");

  const [diagnosisCount, setDiagnosisCount] = useState(() => {
    const saved = localStorage.getItem(diagnosisKey);
    return saved ? Number(saved) || 0 : 0;
  });

  function incrementDiagnosisCount() {
    setDiagnosisCount((count) => {
      const next = count + 1;
      try {
        localStorage.setItem(diagnosisKey, String(next));
      } catch {}
      return next;
    });
  }

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
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [page]);

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
    localStorage.removeItem("plantcare_current_page");
    localStorage.removeItem(diagnosisKey);
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
      : page === "project-info"
      ? "About PlantCare AI"
      : nav.find((x) => x[0] === page)?.[1];

  const mobileLabel = { dashboard: "Home", plants: "Plants", doctor: "Scan", assistant: "AI" };

  const pageSubtitle = {
    dashboard: `${greeting}! Grow something new today`,
    plants: "Your plant collection",
    doctor: "Scan a leaf, detect disease",
    assistant: "Ask anything about plant care",
    "project-info": "Project details",
  }[page];

  const NavButton = ({ id, label, Icon }) => (
    <button
      onClick={() => setPage(id)}
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-left transition-all duration-300 ${
        page === id
          ? "bg-neon-500 text-[#04210f] shadow-[0_10px_30px_-8px_rgba(57,231,95,0.6)]"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span
        className={`w-9 h-9 rounded-full grid place-items-center transition ${
          page === id ? "bg-[#04210f]/15" : "bg-white/8 bg-white/10"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="font-bold text-sm">{label}</span>
      {page === id && <ArrowRight size={15} className="ml-auto" />}
    </button>
  );

  const mobileItem = (id) => {
    const Icon = nav.find((x) => x[0] === id)[2];
    const active = page === id;
    return (
      <button
        key={id}
        onClick={() => setPage(id)}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all active:scale-95 ${
          active ? "text-neon-500" : "text-white/55"
        }`}
      >
        <span className={`w-11 h-11 rounded-full grid place-items-center transition ${active ? "bg-neon-500/15" : ""}`}>
          <Icon size={20} />
        </span>
        <span className="text-[10px] font-bold -mt-1">{mobileLabel[id]}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen text-white font-sans relative">

      {/* ambient glow blobs */}
      <div className="pointer-events-none fixed -top-24 -right-24 w-80 h-80 rounded-full bg-neon-500/10 blur-3xl animate-blob" />
      <div className="pointer-events-none fixed bottom-10 -left-24 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl animate-blob" />

      {/* DESKTOP / TABLET SIDEBAR */}

      <aside className="fixed left-3 top-3 bottom-3 w-64 rounded-[2rem] glass p-5 hidden md:flex flex-col z-30 shadow-card overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-neon-500 text-[#04210f] grid place-items-center shadow-[0_0_30px_rgba(57,231,95,0.55)]">
            <Leaf size={22} />
          </div>
          <div>
            <div className="font-display font-extrabold text-lg leading-tight">PlantCare AI</div>
            <div className="text-[10px] text-white/55">Intelligent plant health</div>
          </div>
        </div>

        <div className="mt-6 px-3.5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-neon-500" />
            AI + RAG Plant Care System
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {nav.map(([id, label, Icon]) => (
            <NavButton key={id} id={id} label={label} Icon={Icon} />
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <InitialAvatar name={user.name} />
              <div className="min-w-0">
                <div className="text-[10px] text-neon-500 uppercase tracking-wider font-bold">Signed in</div>
                <b className="text-sm text-white block truncate mt-0.5">{user.name}</b>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex gap-2 items-center justify-center py-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition text-sm font-semibold"
          >
            <LogOut size={17} />
            Logout
          </button>

          <p className="text-[10px] text-white/35 text-center mt-4">
            PlantCare AI © 2026 Kritika Bunkar
          </p>
        </div>
      </aside>

      {/* MAIN */}

      <main className="relative md:ml-72 px-3 sm:px-5 lg:px-8 pb-36 md:pb-8 max-w-[1500px]">

        {/* HEADER */}

        <header className="sticky top-0 z-20 -mx-3 sm:-mx-5 lg:-mx-8 px-3 sm:px-5 lg:px-8 pt-safe">
          <div className="flex justify-between items-center gap-3 py-3 mt-2 md:mt-3 glass rounded-[2rem] px-4 shadow-soft">
            <div className="flex items-center gap-3 min-w-0">
              <div className="md:hidden shrink-0">
                <InitialAvatar name={user.name} large />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight truncate leading-tight">
                  {page === "dashboard"
                    ? `Hello, ${user.name}`
                    : page === "project-info"
                    ? "About PlantCare AI"
                    : nav.find((x) => x[0] === page)?.[1]}
                </h1>
                <p className="text-xs sm:text-sm text-white/55 truncate">{pageSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
                <span className="w-2 h-2 rounded-full bg-neon-500 animate-pulse" />
                AI System Ready
              </div>

              {installPrompt && (
                <button
                  type="button"
                  onClick={() => setShowInstallPopup(true)}
                  className="btn-neon flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[11px] sm:text-xs"
                  title="Install PlantCare AI"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setToast("No new notifications")}
                aria-label="Notifications"
                className="w-11 h-11 rounded-full bg-white/8 bg-white/10 border border-white/10 grid place-items-center text-white/80 hover:bg-white/15 active:scale-95 transition"
              >
                <Bell size={18} />
              </button>

              <div className="hidden md:block">
                <InitialAvatar name={user.name} large />
              </div>
            </div>
          </div>
        </header>

        {/* PAGES */}

        <div className="mt-5 animate-fade-up" key={page}>
          {page === "dashboard" && (
            <Dashboard plants={plants} diagnosisCount={diagnosisCount} setPage={setPage} />
          )}

          {page === "plants" && (
            <Plants plants={plants} reload={loadPlants} setToast={setToast} />
          )}

          {page === "doctor" && (
            <Doctor setToast={setToast} onDiagnosis={incrementDiagnosisCount} />
          )}

          {page === "assistant" && <Assistant user={user} setToast={setToast} />}

          {page === "project-info" && <ProjectInfo onBack={() => setPage("dashboard")} />}
        </div>

        {/* TOAST */}

        {toast && (
          <div className="fixed left-3 right-3 sm:left-auto sm:right-5 bottom-32 md:bottom-5 z-[70] animate-fade-up">
            <div className="max-w-md ml-auto glass bg-ink-800 px-4 py-3.5 rounded-3xl shadow-card flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-neon-500/20 text-neon-500 grid place-items-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <p className="text-sm leading-relaxed pt-1 text-white">{toast}</p>
            </div>
          </div>
        )}

        <Footer onAbout={() => setPage("project-info")} />
      </main>

      {/* MOBILE BOTTOM NAV */}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe pointer-events-none">
        <div className="relative max-w-md mx-auto pointer-events-auto rounded-[2.25rem] bg-ink-800/80 backdrop-blur-2xl border border-white/10 shadow-[0_-10px_50px_-10px_rgba(0,0,0,0.7)] px-2 pt-1.5 pb-1 flex items-center">
          {mobileItem("dashboard")}
          {mobileItem("plants")}

          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setPage("doctor")}
              aria-label="Plant Doctor - scan a plant"
              className="-mt-10 w-[4.5rem] h-[4.5rem] rounded-full p-1.5 bg-ink-800 border border-white/10 active:scale-95 transition"
            >
              <span className="w-full h-full rounded-full bg-neon-500 text-[#04210f] grid place-items-center animate-glow">
                <Camera size={28} />
              </span>
            </button>
          </div>

          {mobileItem("assistant")}

          <button
            onClick={logout}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-white/55 active:scale-95 transition"
          >
            <span className="w-11 h-11 rounded-full grid place-items-center"><LogOut size={20} /></span>
            <span className="text-[10px] font-bold -mt-1">Logout</span>
          </button>
        </div>
      </div>

      {/* INSTALL APP POPUP */}

      {showInstallPopup && installPrompt && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm glass bg-ink-800 rounded-[2rem] shadow-card overflow-hidden animate-sheet-up">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neon-500/15 text-neon-500 grid place-items-center">
                    <Smartphone size={23} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Install PlantCare AI</h3>
                    <p className="text-xs text-white/55 mt-0.5">Use PlantCare AI like an app</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeInstallPopup}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white/80 grid place-items-center"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-white/75 leading-6">
                  Install PlantCare AI on your device for quick access, a dedicated app-like
                  experience, and easier launching.
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={closeInstallPopup}
                  className="flex-1 py-3 rounded-full border border-white/15 text-white/80 text-sm font-bold hover:bg-white/10 transition"
                >
                  Not Now
                </button>
                <button type="button" onClick={installApp} className="btn-neon flex-1 py-3 rounded-full text-sm">
                  Install App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
