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
import ProfileMenu from "./ProfileMenu";
import HomeHero from "./HomeHero";
import WeatherCard from "./WeatherCard";
import Reminders from "./Reminders";
import EditProfile from "./EditProfile";
import useReminders from "../useReminders";

const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu, Smartphone, Download, Bell, User, BellRing } = Icons;

function App() {
  const storedName = localStorage.getItem("plantcare_name");
  const storedEmail = localStorage.getItem("plantcare_email");

  const [user, setUser] = useState(
    storedName
      ? {
          name: storedName,
          email: storedEmail || "",
          avatar: localStorage.getItem("plantcare_avatar") || "",
        }
      : null
  );

  const getInitialPage = () => {
    const saved = localStorage.getItem("plantcare_current_page");
    const valid = ["dashboard", "plants", "doctor", "assistant", "reminders", "project-info"];
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
  const [showProfile, setShowProfile] = useState(false); // profile popup
  const [showEditProfile, setShowEditProfile] = useState(false); // edit profile popup
  const reminders = useReminders(Boolean(user)); // reminders + browser notifications

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
    localStorage.removeItem("plantcare_avatar");

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
    ["reminders", "Reminders", BellRing],
  ];

  // Edit profile save hone par: state + localStorage dono update
  const handleProfileUpdated = (u) => {
    localStorage.setItem("plantcare_name", u.name);
    localStorage.setItem("plantcare_avatar", u.avatar || "");
    setUser((prev) => ({ ...prev, name: u.name, email: u.email || prev.email, avatar: u.avatar || "" }));
  };

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

  /* ---------------------------------------------------------
     NAVIGATION ITEMS
     nav = [id, label, icon]  (upar define hai)
     mobileLabel = mobile bottom bar ke chhote naam
  --------------------------------------------------------- */
  const mobileLabel = { dashboard: "Home", plants: "Plants", assistant: "AI" };

  // Desktop sidebar ka ek button
  const SideButton = ({ id, label, Icon }) => (
    <button
      onClick={() => setPage(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-left transition-all duration-200 ${
        page === id
          ? "bg-forest-800 text-white shadow-soft"
          : "text-forest-700 hover:bg-white/80"
      }`}
    >
      <span
        className={`w-9 h-9 rounded-full grid place-items-center ${
          page === id ? "bg-white/15" : "bg-mint-100 text-forest-600"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="font-bold text-sm">{label}</span>
      {page === id && <ArrowRight size={15} className="ml-auto opacity-70" />}
    </button>
  );

  // Mobile bottom bar ka ek button
  const BottomItem = ({ id, Icon, label, onClick, active }) => (
    <button
      onClick={onClick || (() => setPage(id))}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 active:scale-95 transition"
    >
      <span
        className={`w-11 h-11 rounded-full grid place-items-center transition ${
          active ? "bg-white text-forest-800" : "text-white/75"
        }`}
      >
        <Icon size={20} />
      </span>
      <span className={`text-[10px] font-bold ${active ? "text-white" : "text-white/60"}`}>{label}</span>
    </button>
  );

  const navIcon = (id) => nav.find((x) => x[0] === id)[2];

  return (
    <div className="min-h-screen text-forest-900 font-sans relative">

      {/* soft floating colour blobs (sirf sajawat) */}
      <div className="pointer-events-none fixed -top-24 -right-24 w-80 h-80 rounded-full bg-mint-200/50 blur-3xl animate-blob" />
      <div className="pointer-events-none fixed bottom-10 -left-24 w-72 h-72 rounded-full bg-forest-200/40 blur-3xl animate-blob" />

      {/* =====================================================
          DESKTOP / TABLET SIDEBAR
      ===================================================== */}
      <aside className="fixed left-3 top-3 bottom-3 w-64 rounded-[2rem] glass p-5 hidden md:flex flex-col z-30 shadow-card overflow-y-auto">
        {/* logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-forest-800 text-white grid place-items-center shadow-soft">
            <Leaf size={22} />
          </div>
          <div>
            <div className="font-display font-extrabold text-lg leading-tight">PlantCare AI</div>
            <div className="text-[10px] text-forest-500">Intelligent plant health</div>
          </div>
        </div>

        <div className="mt-6 px-3.5 py-2.5 rounded-full bg-mint-50 border border-mint-100 text-xs text-forest-600">
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            AI + RAG Plant Care System
          </div>
        </div>

        {/* menu */}
        <nav className="mt-6 space-y-2">
          {nav.map(([id, label, Icon]) => (
            <SideButton key={id} id={id} label={label} Icon={Icon} />
          ))}
        </nav>

        {/* profile card: click karne par profile khulta hai */}
        <div className="mt-auto pt-6">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full text-left bg-white/80 border border-white rounded-3xl p-3.5 mb-2 hover:shadow-soft transition"
          >
            <div className="flex items-center gap-3">
              <InitialAvatar name={user.name} src={user.avatar} />
              <div className="min-w-0">
                <div className="text-[10px] text-forest-500 uppercase tracking-wider font-bold">Profile</div>
                <b className="text-sm block truncate mt-0.5">{user.name}</b>
              </div>
              <ArrowRight size={15} className="ml-auto text-forest-400" />
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full flex gap-2 items-center justify-center py-2.5 rounded-full text-forest-600 hover:bg-white/80 transition text-sm font-semibold"
          >
            <LogOut size={16} />
            Logout
          </button>

          <p className="text-[10px] text-forest-400 text-center mt-3">
            PlantCare AI © 2026 Kritika Bunkar
          </p>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}
      <main className="relative md:ml-72 px-3 sm:px-5 lg:px-8 pb-36 md:pb-8 max-w-[1500px]">

        {/* ---------- HEADER: avatar + greeting + bell ---------- */}
        <header className="sticky top-0 z-20 -mx-3 sm:-mx-5 lg:-mx-8 px-3 sm:px-5 lg:px-8 pt-safe">
          <div className="flex justify-between items-center gap-3 py-2.5 mt-2 md:mt-3 glass rounded-[2rem] px-3 shadow-soft">

            {/* avatar + naam: dabane par profile khulta hai */}
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 min-w-0 text-left rounded-full pr-3 hover:bg-white/70 transition"
              aria-label="Open profile"
            >
              <InitialAvatar name={user.name} src={user.avatar} large />
              <div className="min-w-0">
                <p className="text-[11px] text-forest-500 font-semibold leading-none">{greeting}</p>
                <p className="text-base sm:text-lg font-extrabold truncate leading-tight mt-1">{user.name}</p>
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              {installPrompt && (
                <button
                  type="button"
                  onClick={() => setShowInstallPopup(true)}
                  className="btn-primary flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[11px] sm:text-xs"
                  title="Install PlantCare AI"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )}

              {/* bell: reminders page kholta hai, badge = abhi due reminders */}
              <button
                type="button"
                onClick={() => setPage("reminders")}
                aria-label={`Reminders${reminders.counts.due_now ? `, ${reminders.counts.due_now} due` : ""}`}
                className="relative w-11 h-11 rounded-full bg-white border border-sage-200 grid place-items-center text-forest-700 hover:bg-sage-50 active:scale-95 transition"
              >
                <Bell size={18} />
                {reminders.counts.due_now > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-coral-500 text-white text-[10px] font-extrabold grid place-items-center ring-2 ring-white">
                    {reminders.counts.due_now > 9 ? "9+" : reminders.counts.due_now}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ---------- PAGES ---------- */}
        <div className="mt-5 animate-fade-up" key={page}>
          {page === "dashboard" && (
            <>
              <HomeHero setPage={setPage} />
              <WeatherCard plants={plants} />
              <Dashboard plants={plants} diagnosisCount={diagnosisCount} setPage={setPage} />
            </>
          )}

          {page === "plants" && <Plants plants={plants} reload={loadPlants} setToast={setToast} />}

          {page === "doctor" && <Doctor setToast={setToast} onDiagnosis={incrementDiagnosisCount} />}

          {page === "assistant" && <Assistant user={user} setToast={setToast} />}

          {page === "reminders" && (
            <Reminders
              plants={plants}
              reminders={reminders}
              setToast={setToast}
              onChanged={() => Promise.all([reminders.reload(), loadPlants()])}
            />
          )}

          {page === "project-info" && <ProjectInfo onBack={() => setPage("dashboard")} />}
        </div>

        {/* ---------- TOAST (chhota message) ---------- */}
        {toast && (
          <div className="fixed left-3 right-3 sm:left-auto sm:right-5 bottom-32 md:bottom-5 z-[70] animate-fade-up">
            <div className="max-w-md ml-auto bg-forest-900 text-white px-4 py-3.5 rounded-3xl shadow-card flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/15 grid place-items-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <p className="text-sm leading-relaxed pt-1">{toast}</p>
            </div>
          </div>
        )}

        <Footer onAbout={() => setPage("project-info")} />
      </main>

      {/* =====================================================
          MOBILE BOTTOM BAR  (dark green pill, reference jaisa)
          Home | Plants | [Scan] | AI | Profile
      ===================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pointer-events-none">
        <div className="relative max-w-md mx-auto pointer-events-auto rounded-[2.25rem] bg-forest-900/95 backdrop-blur-xl shadow-[0_18px_40px_-10px_rgba(20,48,31,0.65)] px-2 pt-1.5 pb-1 flex items-center">
          <BottomItem id="dashboard" Icon={navIcon("dashboard")} label={mobileLabel.dashboard} active={page === "dashboard"} />
          <BottomItem id="plants" Icon={navIcon("plants")} label={mobileLabel.plants} active={page === "plants"} />

          {/* beech ka bada Scan button -> Plant Doctor */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setPage("doctor")}
              aria-label="Scan a plant"
              className="-mt-9 w-[4.25rem] h-[4.25rem] rounded-full bg-mint-200 text-forest-900 grid place-items-center border-4 border-forest-900 shadow-float active:scale-95 transition"
            >
              <Camera size={27} />
            </button>
          </div>

          <BottomItem id="assistant" Icon={navIcon("assistant")} label={mobileLabel.assistant} active={page === "assistant"} />
          <BottomItem
            Icon={User}
            label="Profile"
            active={showProfile}
            onClick={() => setShowProfile(true)}
          />
        </div>
      </div>

      {/* =====================================================
          PROFILE POPUP
      ===================================================== */}
      <ProfileMenu
        open={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        plantsCount={plants.length}
        scansCount={diagnosisCount}
        onNavigate={setPage}
        onLogout={logout}
        onEdit={() => setShowEditProfile(true)}
      />

      {showEditProfile && (
        <EditProfile
          user={user}
          onClose={() => setShowEditProfile(false)}
          onUpdated={handleProfileUpdated}
          setToast={setToast}
        />
      )}

      {/* =====================================================
          INSTALL APP POPUP
      ===================================================== */}
      {showInstallPopup && installPrompt && (
        <div className="fixed inset-0 z-[100] bg-forest-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-card overflow-hidden animate-sheet-up">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-mint-100 text-forest-700 grid place-items-center">
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
                  className="w-9 h-9 rounded-full bg-sage-100 hover:bg-sage-200 text-forest-600 grid place-items-center"
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
                  className="flex-1 py-3 rounded-full border border-sage-200 text-forest-600 text-sm font-bold hover:bg-sage-50 transition"
                >
                  Not Now
                </button>
                <button type="button" onClick={installApp} className="btn-primary flex-1 py-3 rounded-full text-sm">
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
