
import React from "react";
import * as Icons from "../icons";

const {
  Leaf,
  ArrowRight,
  GraduationCap,
  Info,
  Sparkles,
  HeartPulse,
} = Icons;

function SafeIcon({ icon: Icon, size = 18, className = "" }) {
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

function Footer({ onAbout }) {
  return (
    <footer className="mt-10">

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div className="bg-emerald-950 text-white rounded-[2rem] overflow-hidden shadow-lg">

        {/* DECORATIVE BACKGROUND */}
        <div className="relative">

          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-emerald-500/10 pointer-events-none" />
          <div className="absolute -left-24 -bottom-32 w-80 h-80 rounded-full bg-green-400/5 pointer-events-none" />

          <div className="relative p-6 sm:p-8 lg:p-9">

            {/* =================================================
                TOP AREA
            ================================================= */}

            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">

              {/* BRAND */}
              <div>

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-emerald-800 border border-emerald-700 grid place-items-center shadow-inner shrink-0">
                    <SafeIcon
                      icon={Leaf}
                      size={23}
                      className="text-emerald-200"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight">
                      PlantCare AI
                    </h2>

                    <p className="text-[10px] sm:text-[11px] text-emerald-300 mt-0.5">
                      Intelligent plant health assistance
                    </p>
                  </div>

                </div>


                <p className="text-xs sm:text-sm text-emerald-100/70 leading-6 mt-5 max-w-md">
                  AI-powered plant disease detection and personalized
                  plant-care assistance using Deep Learning and
                  Retrieval-Augmented Generation.
                </p>


                {/* AI BADGES */}
                <div className="flex flex-wrap gap-2 mt-5">

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-emerald-200">
                    <SafeIcon icon={Sparkles} size={12} />
                    AI Powered
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-emerald-200">
                    <SafeIcon icon={HeartPulse} size={12} />
                    Plant Health
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-emerald-200">
                    RAG Assistant
                  </span>

                </div>

              </div>


              {/* PROJECT */}
              <div className="lg:border-l lg:border-white/10 lg:pl-7">

                <p className="text-[10px] uppercase tracking-[0.16em] font-black text-emerald-400">
                  Project
                </p>

                <h3 className="text-sm font-black mt-2">
                  PlantCare AI
                </h3>

                <div className="mt-4 space-y-2.5">

                  <p className="text-xs text-emerald-100/65">
                    AI Plant Disease Detection
                  </p>

                  <p className="text-xs text-emerald-100/65">
                    Personalized Plant Care
                  </p>

                  <p className="text-xs text-emerald-100/65">
                    RAG-based AI Assistant
                  </p>

                  <p className="text-xs text-emerald-100/65">
                    Plant Management
                  </p>

                </div>

              </div>


              {/* DEVELOPER */}
              <div className="lg:border-l lg:border-white/10 lg:pl-7">

                <p className="text-[10px] uppercase tracking-[0.16em] font-black text-emerald-400">
                  Developed By
                </p>


                <div className="flex items-center gap-3 mt-3">

                  {/* PROFILE */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 grid place-items-center text-white font-black text-sm ring-4 ring-white/5 shrink-0">
                    KB
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-sm font-black truncate">
                      Kritika Bunkar
                    </h3>

                    <p className="text-[10px] text-emerald-300 mt-0.5">
                      B.Tech AI & Data Science
                    </p>

                  </div>

                </div>


                <div className="flex items-start gap-2 mt-4">

                  <SafeIcon
                    icon={GraduationCap}
                    size={14}
                    className="text-emerald-400 mt-0.5 shrink-0"
                  />

                  <p className="text-xs text-emerald-100/65 leading-5">
                    AKS University, Satna
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                ACTION AREA
            ================================================= */}

            <div className="mt-8 pt-6 border-t border-white/10">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>

                  <p className="text-sm font-black">
                    Explore the project
                  </p>

                  <p className="text-[11px] text-emerald-100/55 mt-1">
                    Learn more about PlantCare AI, its technology and
                    supported AI features.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={onAbout}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 active:scale-[0.98] text-xs font-black transition-all shadow-sm"
                >

                  <SafeIcon icon={Info} size={15} />

                  About Project

                  <SafeIcon
                    icon={ArrowRight}
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />

                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              COPYRIGHT BAR
          ================================================= */}

          <div className="border-t border-white/10 bg-black/10 px-5 sm:px-8 py-4">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">

              <p className="text-[10px] text-emerald-100/50">
                © 2026 PlantCare AI
              </p>

              <p className="text-[10px] text-emerald-100/50">
                Developed by{" "}
                <span className="font-bold text-emerald-300">
                  Kritika Bunkar
                </span>
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* SMALL SPACE BELOW FOOTER */}

      <p className="text-center text-[9px] sm:text-[10px] text-slate-400 mt-4 px-4">
        AI-Powered Plant Disease Detection • Personalized Plant Care •
        Retrieval-Augmented Generation
      </p>

    </footer>
  );
}

export default Footer;
