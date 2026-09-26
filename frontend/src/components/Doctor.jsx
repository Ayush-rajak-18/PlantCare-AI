import React, { useEffect, useRef, useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, AIResponse, formatInlineText } from "./Helpers";
const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu, FileText, Download } = Icons;

function Doctor({
  setToast,
  onDiagnosis,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const diagnosisStorageKey =
    "plantcare_last_diagnosis_" +
    (localStorage.getItem("plantcare_email") ||
      localStorage.getItem("plantcare_name") ||
      "user").toLowerCase().replace(/[^a-z0-9]/g, "_");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(diagnosisStorageKey);
      if (saved) setResult(JSON.parse(saved));
    } catch {}
  }, [diagnosisStorageKey]);

  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem(diagnosisStorageKey, JSON.stringify(result));
      }
    } catch {}
  }, [result, diagnosisStorageKey]);

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
    try {
      localStorage.removeItem(diagnosisStorageKey);
    } catch {}
  }

  function generateReport() {
    if (!result) return;
    const confidence = Math.max(0, Math.min(100, Number(result.confidence || 0) * 100));
    const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];
    const date = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const popup = window.open("", "_blank", "width=900,height=900");
    if (!popup) { setToast("Please allow pop-ups to generate the report."); return; }
    popup.document.write(`<!doctype html><html><head><title>PlantCare AI Health Report</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;color:#0f172a;margin:0;background:#f5faf6}.page{max-width:760px;margin:30px auto;background:#fff;padding:40px;border-radius:22px}.brand{color:#047857;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px}.title{font-size:34px;margin:8px 0}.muted{color:#64748b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 0}.card{border:1px solid #d1fae5;border-radius:16px;padding:16px}.label{font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700}.value{font-size:20px;font-weight:800;margin-top:6px}.bar{height:10px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-top:10px}.fill{height:100%;background:#059669;width:${confidence}%;border-radius:99px}.section{margin-top:26px}.section h2{font-size:18px}.item{padding:11px 13px;background:#ecfdf5;border-radius:12px;margin:8px 0}.footer{margin-top:35px;padding-top:18px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b}@media print{body{background:#fff}.page{margin:0;max-width:none;border-radius:0;box-shadow:none;padding:24px}}@media(max-width:600px){.page{margin:0;border-radius:0;padding:24px}.grid{grid-template-columns:1fr}}</style></head><body><div class="page"><div class="brand">PlantCare AI</div><div class="title">Plant Health Report</div><p class="muted">Generated on ${escapeHtml(date)}</p><div class="grid"><div class="card"><div class="label">Plant</div><div class="value">${escapeHtml(result.plant || "Unknown")}</div></div><div class="card"><div class="label">Diagnosis</div><div class="value">${escapeHtml(result.disease || "Unknown condition")}</div></div></div><div class="card"><div class="label">AI Model Confidence</div><div class="value">${confidence.toFixed(1)}%</div><div class="bar"><div class="fill"></div></div></div><div class="section"><h2>Recommended Care</h2>${recommendations.length ? recommendations.map((x,i)=>`<div class="item"><b>${i+1}.</b> ${escapeHtml(x)}</div>`).join("") : '<p class="muted">No additional recommendations were returned.</p>'}</div><div class="section"><h2>Important Note</h2><p class="muted">This report is an AI-assisted plant health assessment. Use a clear image and consult a qualified local agriculture professional for uncertain or severe cases.</p></div><div class="footer">PlantCare AI © 2026 Kritika Bunkar</div></div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
    popup.document.close();
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
        <>
          <DiagnosisResult result={result} />
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={generateReport} className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-950 text-white font-black text-sm hover:bg-slate-800 transition shadow-lg">
              <FileText size={17} />
              Generate Health Report
            </button>
            <p className="text-[11px] text-slate-400 self-center">Opens a print-ready report. Choose <b>Save as PDF</b> in the browser print dialog.</p>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   DIAGNOSIS RESULT
========================================================= */

export default Doctor;
