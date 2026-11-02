import React from "react";
import { Sprout, Stethoscope, MessageCircle, BellRing, ArrowRight, ScanLine } from "../icons";
import PlantArt from "./PlantArt";

/* ---------------------------------------------------------
   HomeHero: Home page ka upar wala hissa
   1. Bada sawal "What Are We Growing Today?"
   2. "AI Plant Scan" card  (Scan Now -> Plant Doctor page)
   3. 4 quick-action tiles (sab real pages par le jaate hain)

   Props: setPage -> page badalne ka function
--------------------------------------------------------- */
const tiles = [
  { page: "plants", label: "My Plants", icon: Sprout },
  { page: "doctor", label: "Diagnosis", icon: Stethoscope },
  { page: "assistant", label: "AI Chat", icon: MessageCircle },
  { page: "reminders", label: "Reminders", icon: BellRing },
];

function HomeHero({ setPage }) {
  return (
    <section className="mb-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-tight text-forest-900">
        What Are We
        <br />
        <span className="text-forest-500">Growing</span> Today?
      </h2>

      {/* AI Plant Scan card */}
      <div className="relative mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-mint-100 via-white to-sage-100 border border-white shadow-card p-5 sm:p-7">
        <div className="relative z-10 max-w-[60%] sm:max-w-sm">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-forest-600 bg-white/80 rounded-full px-3 py-1">
            <ScanLine size={12} /> AI Plant Scan
          </span>
          <p className="mt-3 text-sm sm:text-base text-forest-700 leading-relaxed">
            Identify your plant and spot possible diseases in seconds with a single photo.
          </p>
          <button
            onClick={() => setPage("doctor")}
            className="btn-primary mt-4 inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full text-sm"
          >
            Scan Now
            <span className="w-8 h-8 rounded-full bg-white/15 grid place-items-center">
              <ArrowRight size={16} />
            </span>
          </button>
        </div>

        <PlantArt className="absolute -right-4 -bottom-6 w-40 sm:w-60 h-auto animate-float" />
      </div>

      {/* quick tiles */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 mt-4">
        {tiles.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className="glass rounded-3xl py-3.5 flex flex-col items-center gap-2 shadow-soft hover:-translate-y-0.5 hover:shadow-card active:scale-95 transition"
          >
            <span className="w-11 h-11 rounded-full bg-mint-100 text-forest-700 grid place-items-center">
              <Icon size={19} />
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-forest-800">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default HomeHero;
