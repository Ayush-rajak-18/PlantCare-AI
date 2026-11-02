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

const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu, Smartphone, Download } = Icons;

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

  const mobileLabel = { dashboard: "Home", plants: "Plants", doctor: "Doctor", assistant: "AI" };

  const NavButton = ({ id, label, Icon }) => (
    <button
      key={id}
      onClick={() => setPage(id)}
      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
        page === id
          ? "bg-white/95 text-forest-800 shadow-soft"
          : "text-forest-100 hover:bg-white/10"
      }`}
    >
      <span
        className={`w-9 h-9 rounded-xl grid place-items-center transition ${
          page === id ? "bg-leaf-gradient text-white" : "bg-white/10 text-mint-200"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="font-semibold text-sm">{label}</span>
      {page === id && <ArrowRight size={14} className="ml-auto opacity-60" />}
    </button>
  );

  const mobileItem = (id) => {
    const Icon = nav.find((x) => x[0] === id)[2];
    const active = page === id;
    return (
      <button
        key={id}
        onClick={() => setPage(id)}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all ${
          active ? "text-forest-700" : "text-forest-400 active:scale-95"
        }`}
      >
        <span className={`px-3 py-1 rounded-full transition ${active ? "bg-mint-100" : ""}`}>
          <Icon size={20} />
        </span>
        <span className="text-[10px] font-bold">{mobileLabel[id]}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen text-forest-900 font-sans">

      {/* DESKTOP / TABLET SIDEBAR */}

      <aside className="fixed left-3 top-3 bottom-3 w-64 rounded-4xl bg-gradient-to-b from-forest-900 via-forest-800 to-forest-950 text-white p-5 hidden md:flex flex-col z-30 shadow-card overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-leaf-gradient grid place-items-center shadow-float">
            <Leaf size={22} />
          </div>
          <div>
            <div className="font-display font-extrabold text-xl leading-tight">PlantCare AI</div>
            <div className="text-[10px] text-mint-200">Intelligent plant health</div>
          </div>
        </div>

        <div className="mt-7 px-3.5 py-3 rounded-2xl bg-white/10 border border-white/10 text-xs text-mint-100">
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            AI + RAG Plant Care System
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {nav.map(([id, label, Icon]) => (
            <NavButton key={id} id={id} label={label} Icon={Icon} />
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="bg-white/10 border border-white/10 rounded-3xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <InitialAvatar name={user.name} />
              <div className="min-w-0">
                <div className="text-[10px] text-mint-200 uppercase tracking-wider font-bold">Signed in</div>
                <b className="text-sm text-white block truncate mt-0.5">{user.name}</b>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex gap-2 items-center justify-center py-3 rounded-2xl text-forest-100 hover:text-white hover:bg-white/10 transition text-sm font-semibold"
          >
            <LogOut size={17} />
            Logout
          </button>

          <p className="text-[10px] text-forest-300 text-center mt-4">
            PlantCare AI © 2026 Kritika Bunkar
          </p>
        </div>
      </aside>

      {/* MAIN */}

      <main className="md:ml-72 px-3 sm:px-5 lg:px-8 pb-32 md:pb-8 max-w-[1500px]">

        {/* HEADER */}

        <header className="sticky top-0 z-20 -mx-3 sm:-mx-5 lg:-mx-8 px-3 sm:px-5 lg:px-8 pt-safe">
          <div className="flex justify-between items-center gap-3 py-3 sm:py-4 glass rounded-b-3xl md:rounded-3xl md:mt-3 px-4 shadow-soft">
            <div className="min-w-0">
              <p className="text-mint-600 font-extrabold text-[10px] sm:text-xs uppercase tracking-[0.18em]">
                PlantCare AI
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight truncate">
                {currentPageLabel}
                {page === "dashboard" && user.name ? `, ${user.name}` : ""}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-mint-50 border border-mint-100 text-xs font-semibold text-forest-600">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
                AI System Ready
              </div>

              {installPrompt && (
                <button
                  type="button"
                  onClick={() => setShowInstallPopup(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-leaf-gradient text-white text-[11px] sm:text-xs font-bold active:scale-95 transition shadow-float"
                  title="Install PlantCare AI"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )}

              <InitialAvatar name={user.name} large />
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
          <div className="fixed left-3 right-3 sm:left-auto sm:right-5 bottom-28 md:bottom-5 z-[70] animate-fade-up">
            <div className="max-w-md ml-auto bg-forest-950 text-white px-4 py-3.5 rounded-3xl shadow-card border border-white/10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-mint-500/20 text-mint-300 grid place-items-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <p className="text-sm leading-relaxed pt-1">{toast}</p>
            </div>
          </div>
        )}

        <Footer onAbout={() => setPage("project-info")} />
      </main>

      {/* MOBILE BOTTOM NAV (floating) */}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe pointer-events-none">
        <div className="relative max-w-md mx-auto pointer-events-auto glass rounded-4xl shadow-nav px-2 pt-2 pb-1.5 flex items-center">
          {mobileItem("dashboard")}
          {mobileItem("plants")}

          {/* centre scan button */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setPage("doctor")}
              aria-label="Plant Doctor"
              className={`-mt-9 w-16 h-16 rounded-full grid place-items-center text-white bg-leaf-gradient shadow-float border-4 border-cream-100 active:scale-95 transition ${
                page === "doctor" ? "animate-pulse-ring" : ""
              }`}
            >
              <Camera size={26} />
            </button>
          </div>

          {mobileItem("assistant")}

          <button
            onClick={logout}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-coral-500 active:scale-95 transition"
          >
            <span className="px-3 py-1"><LogOut size={20} /></span>
            <span className="text-[10px] font-bold">Logout</span>
          </button>
        </div>
      </div>

      {/* INSTALL APP POPUP */}

      {showInstallPopup && installPrompt && (
        <div className="fixed inset-0 z-[100] bg-forest-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-cream-50 rounded-4xl shadow-card border border-white overflow-hidden animate-sheet-up">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-mint-100 text-mint-600 grid place-items-center">
                    <Smartphone size={23} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Install PlantCare AI</h3>
                    <p className="text-xs text-forest-500 mt-0.5">Use PlantCare AI like an app</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeInstallPopup}
                  className="w-9 h-9 rounded-xl bg-sage-100 hover:bg-sage-200 text-forest-600 grid place-items-center"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-mint-50 border border-mint-100 p-4">
                <p className="text-sm text-forest-700 leading-6">
                  Install PlantCare AI on your device for quick access, a dedicated app-like
                  experience, and easier launching.
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={closeInstallPopup}
                  className="flex-1 py-3 rounded-full border border-sage-200 bg-white text-forest-600 text-sm font-bold hover:bg-sage-50 transition"
                >
                  Not Now
                </button>
                <button
                  type="button"
                  onClick={installApp}
                  className="flex-1 py-3 rounded-full bg-leaf-gradient text-white text-sm font-bold shadow-float active:scale-95 transition"
                >
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
