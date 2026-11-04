import React, { useEffect, useRef, useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import { SectionLabel, DiagnosisResult } from "./Helpers";
const { Stethoscope, Upload, ShieldCheck, Camera, ImageIcon, X, RefreshCw, Sparkles, Leaf, FileText, Info, ScanLine, CameraOff } = Icons;

function Doctor({ setToast, onDiagnosis }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const galleryRef = useRef(null);
  const captureInputRef = useRef(null); // mobile native camera fallback

  const diagnosisStorageKey =
    "plantcare_last_diagnosis_" +
    (localStorage.getItem("plantcare_email") ||
      localStorage.getItem("plantcare_name") ||
      "user").toLowerCase().replace(/[^a-z0-9]/g, "_");

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

  // camera stream 
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play?.().catch(() => {});
    }
  }, [cameraOn]);

  // page close
  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }

  async function startCamera() {
    clearImage(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      // Purane browser / non-secure page:
      captureInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setToast("Camera permission nahi mili. Gallery se photo chuniye ya camera allow kijiye.");
      captureInputRef.current?.click();
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setToast("Camera abhi ready nahi hai, ek second ruko.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setToast("Photo capture nahi ho paayi. Dobara try karein.");
          return;
        }
        const captured = new File([blob], `leaf-scan-${Date.now()}.jpg`, { type: "image/jpeg" });
        stopCamera();
        selectFile(captured);
      },
      "image/jpeg",
      0.92
    );
  }

  function selectFile(selected) {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setToast("Please select a valid image file.");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setToast("Image size must be less than 10 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setResult(null);
    setPreview(URL.createObjectURL(selected));
  }

  function handleFileChange(e) {
    stopCamera();
    selectFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function clearImage(clearResult = true) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    if (clearResult) {
      setResult(null);
      try {
        localStorage.removeItem(diagnosisStorageKey);
      } catch {}
    }
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
    e?.preventDefault?.();

    if (!file) {
      setToast("Please choose or scan a leaf image first.");
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

  // beech wala bada button: camera kholo -> photo lo -> analyze karo
  function mainAction() {
    if (loading) return;
    if (cameraOn) return takePhoto();
    if (file) return diagnose();
    return startCamera();
  }

  const mainLabel = loading
    ? "Analyzing..."
    : cameraOn
    ? "Capture"
    : file
    ? "Analyze"
    : "Scan";

  const MainIcon = loading ? RefreshCw : cameraOn ? Camera : file ? Sparkles : ScanLine;

  // corner brackets:
  const bracketColor = cameraOn || preview ? "border-white/90" : "border-forest-400/60";
  const bracket = `absolute w-14 h-14 sm:w-20 sm:h-20 ${bracketColor}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <SectionLabel icon={Stethoscope}>AI Plant Doctor</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">Scan your plant</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-xl">
          Take a photo of a leaf using your camera or select one from your gallery. The trained AI model will analyze it for possible disease patterns.        </p>
      </div>

      {/* VIEWFINDER */}

      <div className="relative rounded-[2rem] overflow-hidden border-4 border-white bg-white aspect-[4/5] sm:aspect-[4/3] shadow-card">

        {cameraOn ? (
          <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />
        ) : preview ? (
          <img src={preview} alt="Selected leaf preview" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-gradient-to-b from-mint-50 to-sage-100">
            <div className="w-20 h-20 rounded-full bg-mint-100 border border-mint-200 grid place-items-center text-forest-600 animate-pulse-ring">
              <Leaf size={34} />
            </div>
            <b className="mt-5 text-lg">Point at a leaf</b>
            <span className="text-sm text-slate-500 mt-1">Tap Scan below or choose a photo from your gallery.</span>
            <span className="text-[11px] text-slate-400 mt-2">JPG, PNG or WEBP • Max 10 MB</span>
          </div>
        )}

        {/* soft vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        {/* corner brackets */}
        <div className="pointer-events-none absolute inset-6 sm:inset-10">
          <span className={`${bracket} top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-3xl`} />
          <span className={`${bracket} top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-3xl`} />
          <span className={`${bracket} bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-3xl`} />
          <span className={`${bracket} bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-3xl`} />
        </div>

        {/* scan line while analyzing */}
        {loading && (
          <div className="pointer-events-none absolute inset-x-6 sm:inset-x-10 animate-scan">
            <div className="h-24 -translate-y-full bg-gradient-to-t from-mint-300/50 to-transparent" />
            <div className="h-[3px] bg-mint-300 shadow-[0_0_24px_6px_rgba(114,228,175,0.8)] border-t border-dashed border-white/70" />
          </div>
        )}

        {/* top actions */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <span className="inline-flex items-center gap-2 glass rounded-full px-3 py-2 text-[11px] font-bold">
            {cameraOn ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Live camera
              </>
            ) : file ? (
              <>
                <ImageIcon size={13} className="text-forest-600" /> Image ready
              </>
            ) : (
              <>
                <Camera size={13} className="text-forest-600" /> Ready to scan
              </>
            )}
          </span>

          {(cameraOn || file) && !loading && (
            <button
              type="button"
              onClick={() => (cameraOn ? stopCamera() : clearImage())}
              className="w-10 h-10 rounded-full glass grid place-items-center hover:bg-white transition"
              title={cameraOn ? "Close camera" : "Remove image"}
              aria-label={cameraOn ? "Close camera" : "Remove image"}
            >
              {cameraOn ? <CameraOff size={17} /> : <X size={17} />}
            </button>
          )}
        </div>

        {/* file info (like "Small Potted Plant" card) */}
        {file && !cameraOn && (
          <div className="absolute left-4 right-4 bottom-4 glass rounded-3xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mint-100 text-forest-600 grid place-items-center shrink-0">
              <ImageIcon size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{file.name}</p>
              <p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • ready for AI analysis</p>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS (Gallery | Scan | Photo Tips) */}

      <div className="mt-6 grid grid-cols-3 items-end">
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex flex-col items-center gap-2 text-forest-700 hover:text-forest-900 transition active:scale-95"
        >
          <span className="w-12 h-12 rounded-full bg-white border border-sage-200 shadow-soft grid place-items-center">
            <Upload size={19} className="text-forest-600" />
          </span>
          <span className="text-xs font-semibold">Gallery</span>
        </button>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={mainAction}
            disabled={loading}
            aria-label={mainLabel}
            className="w-20 h-20 rounded-full p-1.5 bg-white border border-sage-200 shadow-soft active:scale-95 transition disabled:opacity-80"
          >
            <span className="w-full h-full rounded-full bg-forest-800 text-white grid place-items-center shadow-float">
              <MainIcon size={30} className={loading ? "animate-spin" : ""} />
            </span>
          </button>
          <span className="text-xs font-bold text-forest-600">{mainLabel}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowTips((v) => !v)}
          className="flex flex-col items-center gap-2 text-forest-700 hover:text-forest-900 transition active:scale-95"
        >
          <span className={`w-12 h-12 rounded-full border grid place-items-center transition ${showTips ? "bg-forest-800 text-white border-forest-800" : "bg-white border-sage-200 shadow-soft"}`}>
            <Info size={19} className={showTips ? "" : "text-forest-600"} />
          </span>
          <span className="text-xs font-semibold">Photo Tips</span>
        </button>
      </div>

      {/* hidden inputs */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={captureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* TIPS */}

      {showTips && (
        <div className="mt-5 glass rounded-3xl p-5 animate-fade-up">
          <div className="flex items-center gap-2 font-extrabold">
            <ShieldCheck size={17} className="text-forest-600" />
            Better photo, better result
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Keep a single leaf fully visible within the frame.</li>
            <li>• Take the photo in good lighting. Avoid flash or harsh sunlight.</li>
            <li>• Hold the camera steady. Blurry photos may lead to less accurate results.</li>
            <li>• Make sure the diseased areas (spots or patches) are clearly visible.</li>
          </ul>
        </div>
      )}

      {/* ANALYZE BUTTON (wide, for desktop clarity) */}

      {file && !cameraOn && (
        <button
          type="button"
          onClick={diagnose}
          disabled={loading}
          className="btn-primary mt-6 w-full py-4 rounded-full text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw size={17} className="animate-spin" /> AI is analyzing...
            </>
          ) : (
            <>
              <Stethoscope size={17} /> Analyze with AI
            </>
          )}
        </button>
      )}

      {result && (
        <>
          <DiagnosisResult result={result} />
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={generateReport}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full glass font-bold text-sm hover:bg-white transition"
            >
              <FileText size={17} className="text-forest-600" />
              Generate Health Report
            </button>
            <p className="text-[11px] text-slate-400 self-center">
              Opens a print-ready report. Choose <b>Save as PDF</b> in the browser print dialog.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Doctor;
