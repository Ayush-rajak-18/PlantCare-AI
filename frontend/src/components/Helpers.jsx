import React from "react";
import { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu } from "../icons";

function InitialAvatar({ name, large = false }) {
  return (
    <div
      className={`${
        large ? "w-12 h-12 text-base" : "w-9 h-9 text-sm"
      } rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white grid place-items-center font-black shadow-sm shrink-0`}
    >
      {name?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
      <Icon size={13} />
      {children}
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:240ms]" />
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function MiniFeature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-slate-100">
      <Icon
        size={15}
        className="text-emerald-600 shrink-0"
      />
      <span className="text-[11px] sm:text-xs font-bold text-slate-600">
        {text}
      </span>
    </div>
  );
}

function TopicChip({ text }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600">
      {text}
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
  badge,
}) {
  return (
    <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-start gap-2">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
          <Icon size={19} />
        </div>

        {badge && (
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-black mt-4">
        {value}
      </div>

      <div className="text-slate-700 font-bold text-sm">
        {title}
      </div>

      <div className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
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
    <div className="group rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-white p-4 sm:p-5 border border-emerald-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-white grid place-items-center text-emerald-700 shadow-sm border border-emerald-50">
          <Leaf size={21} />
        </div>

        <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-100 px-2.5 py-1.5 rounded-full flex items-center gap-1">
          <MapPin size={11} />
          {p.location || "Plant"}
        </span>
      </div>

      <h3 className="font-black text-lg mt-4 truncate">
        {p.name}
      </h3>

      <p className="text-slate-500 text-sm truncate">
        {p.species}
      </p>

      <div className="flex flex-wrap gap-2 mt-4 text-[10px]">
        <span className="bg-white px-2.5 py-1.5 rounded-full border border-slate-100 text-slate-600 font-semibold">
          <Droplets
            size={12}
            className="inline mr-1 text-emerald-600"
          />
          Every {p.watering_days || "—"} days
        </span>

        <span className="bg-white px-2.5 py-1.5 rounded-full border border-slate-100 text-slate-600 font-semibold">
          <Sun
            size={12}
            className="inline mr-1 text-emerald-600"
          />
          {p.location || "Not set"}
        </span>
      </div>

      {p.notes && (
        <div className="mt-4 text-xs text-slate-500 bg-white/80 border border-slate-100 rounded-xl p-3 leading-relaxed">
          <b className="text-slate-700">Notes:</b>{" "}
          {p.notes}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PLANTS
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
        label: "Uncertain",
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
    <div className="mt-5 space-y-5">
      {/* RESULT */}

      <div className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
          <div>
            <SectionLabel icon={ShieldCheck}>
              {result.demo
                ? "Demo Model Mode"
                : "AI Model Result"}
            </SectionLabel>

            <h2 className="text-2xl sm:text-4xl font-black mt-4">
              {result.plant || "Plant"}
            </h2>

            <p className="text-lg sm:text-xl text-emerald-700 font-black mt-1">
              {result.disease || "Unknown condition"}
            </p>
          </div>

          <div
            className={`self-start border rounded-2xl px-4 py-3 ${status.box}`}
          >
            <div
              className={`flex items-center gap-2 font-black text-sm ${status.text}`}
            >
              <StatusIcon size={18} />
              {status.label}
            </div>

            <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
              {status.description}
            </p>
          </div>
        </div>

        {/* CONFIDENCE */}

        <div className="mt-7 pt-5 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-black text-sm text-slate-700">
                Model Confidence
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Confidence returned by the AI model
              </p>
            </div>

            <b className="text-emerald-700 text-xl">
              {percentage.toFixed(1)}%
            </b>
          </div>

          <div className="h-3 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}

      <div className="bg-white rounded-[2rem] p-5 sm:p-7 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <Leaf size={19} />
          </div>

          <div>
            <h3 className="font-black text-xl">
              Recommended Care
            </h3>

            <p className="text-[11px] text-slate-500 mt-0.5">
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
                  className="group bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-4 flex gap-3 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 grid place-items-center shrink-0 font-black text-xs shadow-sm">
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
   AI RESPONSE FORMATTER
   Makes plain backend text look like a proper AI response.
========================================================= */

function formatInlineText(text) {
  if (!text) return null;

  const parts = text.split(
    /(\*\*[^*]+\*\*|__[^_]+__)/g
  );

  return parts.map((part, index) => {
    if (
      (part.startsWith("**") &&
        part.endsWith("**")) ||
      (part.startsWith("__") &&
        part.endsWith("__"))
    ) {
      return (
        <strong
          key={index}
          className="font-black text-slate-900"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return (
      <React.Fragment key={index}>
        {part}
      </React.Fragment>
    );
  });
}

function AIResponse({ text }) {
  if (!text) {
    return (
      <p className="text-sm text-slate-500">
        I could not generate an answer.
      </p>
    );
  }

  const lines = String(text)
    .replace(/\r/g, "")
    .split("\n");

  const blocks = [];
  let bulletBuffer = [];

  function flushBullets() {
    if (bulletBuffer.length > 0) {
      blocks.push({
        type: "bullets",
        items: [...bulletBuffer],
      });

      bulletBuffer = [];
    }
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushBullets();
      return;
    }

    const bulletMatch = line.match(
      /^[-•*]\s+(.*)$/
    );

    const numberedMatch = line.match(
      /^\d+[.)]\s+(.*)$/
    );

    if (bulletMatch) {
      bulletBuffer.push({
        text: bulletMatch[1],
        number: null,
      });
      return;
    }

    if (numberedMatch) {
      bulletBuffer.push({
        text: numberedMatch[1],
        number: bulletBuffer.length + 1,
      });
      return;
    }

    flushBullets();

    if (
      line.startsWith("### ") ||
      line.startsWith("## ") ||
      line.startsWith("# ")
    ) {
      blocks.push({
        type: "heading",
        text: line.replace(/^#+\s*/, ""),
      });
      return;
    }

    if (
      line.endsWith(":") &&
      line.length < 90
    ) {
      blocks.push({
        type: "subheading",
        text: line.slice(0, -1),
      });
      return;
    }

    blocks.push({
      type: "paragraph",
      text: line,
      index,
    });
  });

  flushBullets();

  return (
    <div className="space-y-3.5 text-sm sm:text-[15px]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <div key={index} className="pt-1">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                {formatInlineText(block.text)}
              </h4>
            </div>
          );
        }

        if (block.type === "subheading") {
          return (
            <div
              key={index}
              className="pt-1 flex items-center gap-2"
            >
              <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
              <h4 className="font-black text-slate-900">
                {formatInlineText(block.text)}
              </h4>
            </div>
          );
        }

        if (block.type === "bullets") {
          return (
            <div
              key={index}
              className="space-y-2"
            >
              {block.items.map(
                (item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex gap-3 items-start bg-white/80 border border-slate-100 rounded-xl px-3.5 py-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 mt-0.5">
                      {item.number ? (
                        <span className="text-[10px] font-black">
                          {item.number}
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </div>

                    <p className="text-slate-700 leading-6">
                      {formatInlineText(item.text)}
                    </p>
                  </div>
                )
              )}
            </div>
          );
        }

        return (
          <p
            key={index}
            className="text-slate-700 leading-7"
          >
            {formatInlineText(block.text)}
          </p>
        );
      })}
    </div>
  );
}

/* =========================================================
   AI ASSISTANT
========================================================= */

export { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, formatInlineText, AIResponse };
