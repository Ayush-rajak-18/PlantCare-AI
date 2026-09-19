import React, { useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, AIResponse, formatInlineText } from "./Helpers";
const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu } = Icons;

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

      {/* PLANT SPACE */}
      <section className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
                <Sprout size={18} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black">Your Plant Space</h2>
                <p className="text-xs text-slate-500 mt-0.5">A quick view of your registered plants.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setPage("plants")}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-emerald-700 font-black text-sm hover:text-emerald-900"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {plants.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white text-emerald-600 grid place-items-center shadow-sm">
              <Sprout size={24} />
            </div>
            <p className="font-black mt-3">Start your plant space</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Add a plant once and manage its profile from My Plants.
            </p>
            <button
              onClick={() => setPage("plants")}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm"
            >
              <Plus size={15} /> Add plant
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            {plants.slice(0, 3).map((p) => (
              <CompactPlant key={p._id} plant={p} />
            ))}
            {plants.length > 3 && (
              <button
                onClick={() => setPage("plants")}
                className="w-full rounded-xl border border-dashed border-emerald-200 py-3 text-xs font-black text-emerald-700 hover:bg-emerald-50 transition"
              >
                + {plants.length - 3} more plants in My Plants
              </button>
            )}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="rounded-[2rem] bg-slate-950 text-white p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] font-black text-emerald-300">Simple workflow</p>
            <h2 className="text-xl sm:text-2xl font-black mt-1">How PlantCare AI works</h2>
          </div>
          <Sparkles className="text-emerald-300 hidden sm:block" size={24} />
        </div>
        <div className="grid md:grid-cols-3 gap-3 mt-5">
          <WorkStep n="01" title="Add your plant" text="Create a simple plant profile in My Plants." />
          <WorkStep n="02" title="Check with AI Doctor" text="Upload a clear leaf image for model-based analysis." />
          <WorkStep n="03" title="Ask & learn" text="Use the RAG assistant for plant-care guidance." />
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  );
}


function CompactPlant({ plant }) {
  return (
    <div className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-100 px-3 sm:px-4 py-3 transition">
      <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 grid place-items-center border border-emerald-100 shrink-0">
        <Leaf size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <b className="text-sm truncate">{plant.name || "Unnamed plant"}</b>
          <span className="hidden sm:inline text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
            {plant.location || "Plant"}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{plant.species || "Plant profile"}</p>
      </div>
      <div className="hidden sm:block text-right shrink-0">
        <span className="text-[10px] text-slate-400">Watering</span>
        <p className="text-xs font-black text-slate-700">{plant.watering_days || "—"} days</p>
      </div>
      <ArrowRight size={15} className="text-slate-300 group-hover:text-emerald-600 shrink-0" />
    </div>
  );
}

function WorkStep({ n, title, text }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <span className="text-xs font-black text-emerald-300">{n}</span>
      <h3 className="font-black mt-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{text}</p>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  const items = [
    ["How does Plant Doctor work?", "Upload a clear leaf image. The trained image model analyzes visual patterns and returns a plant/disease result with confidence and care suggestions."],
    ["What is the AI Assistant?", "The assistant uses the project's retrieval-augmented generation workflow to retrieve relevant plant-care knowledge before generating an answer."],
    ["Can I manage multiple plants?", "Yes. Add and manage your complete collection from My Plants. The Dashboard only shows a small overview so it stays clean."],
    ["How accurate is a diagnosis?", "The result depends on the image and the model's confidence. A clear, well-lit leaf image generally gives the system better visual information."],
    ["What should I do if the result is uncertain?", "Try another clear image with the leaf visible, good lighting, and minimal background clutter. You can also use the AI Assistant for general care guidance."],
  ];
  return (
    <section className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] font-black text-emerald-700">Need a quick answer?</p>
        <h2 className="text-xl sm:text-2xl font-black mt-1">Frequently Asked Questions</h2>
      </div>
      <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
        {items.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 py-4 text-left">
              <span className="text-sm font-black text-slate-800">{q}</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center text-lg shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="pb-4 pr-10 text-xs sm:text-sm text-slate-500 leading-6">{a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   DASHBOARD SMALL COMPONENTS
========================================================= */

export default Dashboard;
