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
const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu } = Icons;

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

        {page === "project-info" && (
          <ProjectInfo onBack={() => setPage("dashboard")} />
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

                
          <Footer
  onAbout={() => setPage("project-info")}
/>


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

export default App;
