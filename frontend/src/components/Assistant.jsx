import React, { useEffect, useRef, useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, AIResponse, formatInlineText } from "./Helpers";
const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu, Volume2, VolumeX, Languages, Copy, Check } = Icons;



function renderInlineText(text, keyPrefix = "inline") {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/\S+)/g);
  return parts.map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={`${keyPrefix}-b-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (/^`[^`]+`$/.test(part)) {
      return <code key={`${keyPrefix}-c-${index}`} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-emerald-700 text-[0.9em] font-semibold">{part.slice(1, -1)}</code>;
    }
    if (/^https?:\/\//.test(part)) {
      return <span key={`${keyPrefix}-u-${index}`} className="break-all">{part}</span>;
    }
    return <React.Fragment key={`${keyPrefix}-t-${index}`}>{part}</React.Fragment>;
  });
}

function RichAIResponse({ text }) {
  const raw = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
  const lines = raw.split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let ordered = [];
  let table = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const value = paragraph.join(" ").trim();
    if (value) blocks.push({ type: "p", value });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "ul", items: list });
    if (ordered.length) blocks.push({ type: "ol", items: ordered });
    list = [];
    ordered = [];
  };
  const flushTable = () => {
    if (table.length) blocks.push({ type: "table", rows: table });
    table = [];
  };

  // Accept normal Markdown tables with or without the outer pipes.
  const isTableRow = (line) => {
    const t = String(line || "").trim();
    return t.includes("|") && t.split("|").length >= 3;
  };
  const isTableDivider = (line) => {
    const t = String(line || "").trim().replace(/^\|/, "").replace(/\|$/, "");
    const cells = t.split("|").map(c => c.trim()).filter(Boolean);
    return cells.length >= 2 && cells.every(c => /^:?-{2,}:?$/.test(c));
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph(); flushList(); flushTable();
      return;
    }

    if (isTableRow(trimmed)) {
      flushParagraph(); flushList();
      if (!isTableDivider(trimmed)) {
        const cells = trimmed
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map(c => c.trim());
        if (cells.length >= 2) table.push(cells);
      }
      return;
    }
    if (table.length) flushTable();

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      blocks.push({ type: "h", level: heading[1].length, value: heading[2] });
      return;
    }

    const bullet = trimmed.match(/^(?:[-*•]|\u2022)\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      ordered.length && flushList();
      list.push(bullet[1]);
      return;
    }

    const number = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (number) {
      flushParagraph();
      list.length && flushList();
      ordered.push(number[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph(); flushList(); flushTable();

  return (
    <div className="space-y-3 text-[13px] sm:text-[14px] leading-6 text-slate-700">
      {blocks.map((block, index) => {
        if (block.type === "h") {
          return (
            <div key={index} className={`${block.level === 1 ? "text-base sm:text-lg" : "text-sm sm:text-[15px]"} font-black text-slate-900 pt-1`}>
              {renderInlineText(block.value, `h-${index}`)}
            </div>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type === "ul" ? "ul" : "ol";
          return (
            <Tag key={index} className={`${block.type === "ul" ? "list-disc" : "list-decimal"} pl-5 space-y-1.5 marker:text-emerald-600`}>
              {block.items.map((item, i) => <li key={i} className="pl-1">{renderInlineText(item, `l-${index}-${i}`)}</li>)}
            </Tag>
          );
        }
        if (block.type === "table") {
          const rows = block.rows;
          if (!rows.length) return null;
          return (
            <div key={index} className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="bg-emerald-50 border-b border-emerald-100">
                    {rows[0].map((cell, i) => <th key={i} className="px-3.5 py-2.5 text-[11px] sm:text-xs font-black text-emerald-800 whitespace-nowrap">{renderInlineText(cell, `th-${index}-${i}`)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, r) => (
                    <tr key={r} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                      {rows[0].map((_, c) => <td key={c} className="px-3.5 py-2.5 text-[11px] sm:text-xs text-slate-600 align-top">{renderInlineText(row[c] || "—", `td-${index}-${r}-${c}`)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={index} className="whitespace-normal">{renderInlineText(block.value, `p-${index}`)}</p>;
      })}
    </div>
  );
}

function Assistant({ user, setToast }) {
  const historyKey =
    "plantcare_chat_history_" +
    (
      user?.email ||
      localStorage.getItem("plantcare_email") ||
      user?.name ||
      "user"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversations, setConversations] =
    useState(() => {
      try {
        const saved = localStorage.getItem(
          historyKey
        );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  const currentChatKey = historyKey + "_current_chat";

  const [currentChatId, setCurrentChatId] =
    useState(() => {
      try {
        return localStorage.getItem(currentChatKey);
      } catch {
        return null;
      }
    });

  const [showHistory, setShowHistory] =
    useState(false);

  const [searchHistory, setSearchHistory] =
    useState("");

  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem(historyKey + "_language") || "English"; } catch { return "English"; }
  });
  const [speakingId, setSpeakingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Stop any speech when leaving the Assistant page or refreshing the app.
  useEffect(() => {
    return () => {
      try { window.speechSynthesis?.cancel?.(); } catch {}
    };
  }, []);

  useEffect(() => {
    try {
      if (currentChatId) {
        localStorage.setItem(currentChatKey, currentChatId);
      } else {
        localStorage.removeItem(currentChatKey);
      }
    } catch {}
  }, [currentChatId, currentChatKey]);

  const chatEndRef = useRef(null);

  const quickQuestions = [
    { icon: "🍃", text: "Why are my plant leaves turning yellow?" },
    { icon: "💧", text: "How often should I water my plant?" },
    { icon: "🦠", text: "What causes powdery mildew?" },
    { icon: "☀️", text: "How much sunlight does a plant need?" },
  ];
  function saveConversations(updated) {
    setConversations(updated);

    try {
      localStorage.setItem(
        historyKey,
        JSON.stringify(updated)
      );
    } catch (e) {
      console.error(
        "Could not save chat history:",
        e
      );
    }
  }

  const currentChat =
    conversations.find(
      (chat) => chat.id === currentChatId
    ) || null;

  const messages =
    currentChat?.messages || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages.length, loading]);

  function createNewChat() {
    const id =
      Date.now().toString() +
      Math.random().toString(36).slice(2);

    const newChat = {
      id,
      title: "New conversation",
      createdAt: new Date().toISOString(),
      messages: [],
    };

    saveConversations([
      newChat,
      ...conversations,
    ]);

    setCurrentChatId(id);
    setShowHistory(false);
    setQ("");
  }

  function deleteChat(id, e) {
    e?.stopPropagation();

    const updated = conversations.filter(
      (chat) => chat.id !== id
    );

    saveConversations(updated);

    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  }

  function clearAllHistory() {
    if (conversations.length === 0) return;

    const ok = window.confirm(
      "Clear all PlantCare AI chat history?"
    );

    if (!ok) return;

    saveConversations([]);
    setCurrentChatId(null);
    setShowHistory(false);
  }

  function openChat(id) {
    setCurrentChatId(id);
    setShowHistory(false);
  }

  function persistLanguage(next) {
    setLanguage(next);
    try { localStorage.setItem(historyKey + "_language", next); } catch {}
  }

  function cleanForSpeech(text) {
    let value = String(text || "");

    // Remove fenced code blocks, URLs and markdown links.
    value = value
      .replace(/```[\s\S]*?```/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

    // Convert markdown tables into natural speech instead of reading |, ---, etc.
    // Example: | Plant | Sunlight | Tip |  ->  "Plant. Sunlight. Tip."
    value = value
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (!t) return "";
        if (/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(t)) return "";
        if (t.includes("|") && (t.startsWith("|") || t.endsWith("|"))) {
          return t
            .replace(/^\s*\|/, "")
            .replace(/\|\s*$/, "")
            .split("|")
            .map((cell) => cell.trim())
            .filter(Boolean)
            .join(". ");
        }
        return line;
      })
      .join("\n");

    return value
      .replace(/^\s*#{1,6}\s+/gm, "")
      .replace(/[*_`~]/g, "")
      .replace(/^\s*>\s?/gm, "")
      .replace(/^\s*[-*•●▪]\s+/gm, "")
      .replace(/^\s*\d+[.)]\s+/gm, "")
      // Never speak Markdown table separators or pipe characters.
      .replace(/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/gm, "")
      .replace(/\|/g, ". ")
      .replace(/[-]{3,}/g, "")
      .replace(/\n+/g, ". ")
      .replace(/\.{2,}/g, ". ")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.!?])/g, "$1")
      .trim();
  }

  function chooseAssistantVoice(targetLang) {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    if (!voices.length) return null;

    const langCode = targetLang === "Hindi" ? "hi" : "en";
    const matching = voices.filter((voice) =>
      String(voice.lang || "").toLowerCase().startsWith(langCode)
    );

    // Prefer natural/neural/Google/Microsoft voices when the device exposes them.
    const preferred = ["neural", "natural", "google", "microsoft", "online"];
    for (const keyword of preferred) {
      const found = matching.find((voice) =>
        `${voice.name} ${voice.voiceURI}`.toLowerCase().includes(keyword)
      );
      if (found) return found;
    }

    // Prefer a male/low-register sounding voice when the browser exposes one.
    const male = matching.find((voice) =>
      /male|david|mark|daniel|guy|ravi|hemant|madhur/i.test(voice.name)
    );
    return male || matching[0] || voices.find((voice) => voice.default) || voices[0];
  }

  function speakAnswer(id, text) {
    if (!("speechSynthesis" in window)) {
      setToast?.("Voice playback is not supported in this browser.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    const spokenText = cleanForSpeech(text);
    if (!spokenText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = language === "Hindi" ? "hi-IN" : "en-IN";
    utterance.rate = language === "Hindi" ? 0.88 : 0.86;
    utterance.pitch = 0.72;
    utterance.volume = 1;

    const voice = chooseAssistantVoice(language);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || utterance.lang;
    }

    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }

  async function copyAnswer(id, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setToast?.("Copy is not available in this browser.");
    }
  }

  function regenerateLast() {
    const chat = conversations.find((c) => c.id === currentChatId);
    const lastUser = [...(chat?.messages || [])].reverse().find((m) => m.role === "user");
    if (lastUser) ask(null, lastUser.text);
  }

  function getSmartLocalReply(question) {
    const text = String(question || "").trim().toLowerCase();
    if (!text) return null;

    const greeting = /^(hi|hii|hello|hey|hey there|namaste|namaskar|good morning|good afternoon|good evening|how are you|how r you)[.!?\s]*$/i.test(text);
    if (greeting) {
      const replies = {
        English: "Hello! 🌿 I’m PlantCare AI. Tell me your plant name, symptoms, or upload a leaf photo and I’ll help you with care, treatment, and prevention.",
        Hindi: "नमस्ते! 🌿 मैं PlantCare AI हूँ। अपने पौधे का नाम, लक्षण बताइए या पत्ते की फोटो भेजिए। मैं care, treatment और prevention में मदद करूँगा।",
        Hinglish: "Hello! 🌿 Main PlantCare AI hoon. Plant ka naam, symptoms batao ya leaf photo upload karo. Main care, treatment aur prevention mein help karunga."
      };
      return replies[language] || replies.English;
    }

    // Ignore accidental one/two-character input instead of sending it to RAG.
    if (text.length < 3 || (/^[a-z]{1,2}$/i.test(text) && !/[aeiou]/i.test(text))) {
      const replies = {
        English: "I didn’t quite understand that. Please tell me the plant name and what you’re noticing.",
        Hindi: "मैं इसे ठीक से समझ नहीं पाया। पौधे का नाम और आपको क्या समस्या दिख रही है, बताइए।",
        Hinglish: "Mujhe ye clear nahi hua. Plant ka naam aur kya problem dikh rahi hai, batao."
      };
      return replies[language] || replies.English;
    }
    return null;
  }

  async function ask(
    e,
    customQuestion = null
  ) {
    e?.preventDefault();

    const question = (
      customQuestion ?? q
    ).trim();

    if (!question || loading) return;

    const localReply = getSmartLocalReply(question);
    if (localReply) {
      const id = currentChatId || Date.now().toString() + Math.random().toString(36).slice(2);
      const existing = conversations.find((chat) => chat.id === id);
      const chat = existing || {
        id,
        title: question.length > 55 ? question.slice(0, 55) + "..." : question,
        createdAt: new Date().toISOString(),
        messages: [],
      };
      const updatedChat = {
        ...chat,
        messages: [
          ...chat.messages,
          { id: Date.now().toString() + "u", role: "user", text: question, createdAt: new Date().toISOString() },
          { id: Date.now().toString() + "a", role: "ai", text: localReply, sources: [], createdAt: new Date().toISOString() },
        ],
      };
      saveConversations(existing ? conversations.map((c) => c.id === id ? updatedChat : c) : [updatedChat, ...conversations]);
      setCurrentChatId(id);
      setQ("");
      return;
    }

    let chatId = currentChatId;

    if (!chatId) {
      chatId =
        Date.now().toString() +
        Math.random().toString(36).slice(2);

      const newChat = {
        id: chatId,
        title:
          question.length > 55
            ? question.slice(0, 55) + "..."
            : question,
        createdAt: new Date().toISOString(),
        messages: [],
      };

      const updated = [
        newChat,
        ...conversations,
      ];

      saveConversations(updated);
      setCurrentChatId(chatId);
    }

    const userMessage = {
      id:
        Date.now().toString() +
        Math.random().toString(36).slice(2),
      role: "user",
      text: question,
      createdAt:
        new Date().toISOString(),
    };

    const beforeRequest =
      conversations.find(
        (chat) => chat.id === chatId
      );

    let baseChat;

    if (beforeRequest) {
      baseChat = beforeRequest;
    } else {
      baseChat = {
        id: chatId,
        title:
          question.length > 55
            ? question.slice(0, 55) + "..."
            : question,
        createdAt:
          new Date().toISOString(),
        messages: [],
      };
    }

    const updatedWithUser =
      conversations.some(
        (chat) => chat.id === chatId
      )
        ? conversations.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  title:
                    chat.title ===
                    "New conversation"
                      ? question.length > 55
                        ? question.slice(0, 55) +
                          "..."
                        : question
                      : chat.title,
                  messages: [
                    ...chat.messages,
                    userMessage,
                  ],
                }
              : chat
          )
        : [
            {
              ...baseChat,
              messages: [userMessage],
            },
            ...conversations,
          ];

    saveConversations(updatedWithUser);

    setQ("");
    setLoading(true);

    try {
      const languageInstruction = language === "English"
        ? "Answer in clear English."
        : language === "Hindi"
        ? "Answer in natural Hindi. Keep plant disease names in English when that is clearer."
        : "Answer in natural Hinglish (Hindi written in Roman script). Keep scientific plant disease names in English.";

      const recentMessages = (baseChat.messages || [])
        .slice(-6)
        .map((m) => `${m.role === "user" ? "User" : "PlantCare AI"}: ${m.text}`)
        .join("\n");

      const contextInstruction = recentMessages
        ? `\n\nConversation context (use only when relevant; do not repeat it unnecessarily):\n${recentMessages}`
        : "";

      const assistantRules = `\n\nResponse rules: Answer the current question directly. Use the conversation context only when it helps resolve references such as “this plant” or “it”. Do not echo the user's question. Do not invent a diagnosis. If evidence is insufficient, say what is uncertain and ask at most one useful follow-up question. Give practical steps in priority order. Keep normal answers concise (about 5-10 short lines). Use simple headings and bullets when helpful. Markdown tables are allowed for comparison, but never output raw pipe characters outside a table.`;

      const requestQuestion = `${languageInstruction}${assistantRules}${contextInstruction}\n\nCURRENT QUESTION: ${question}`;

      const r = await api("/rag/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: requestQuestion,
        }),
      });

      const aiMessage = {
        id:
          Date.now().toString() +
          Math.random().toString(36).slice(2),
        role: "ai",
        text:
          r.answer ||
          "I could not generate an answer.",
        sources: r.sources || [],
        createdAt:
          new Date().toISOString(),
      };

      setConversations((current) => {
        const updated = current.map(
          (chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    aiMessage,
                  ],
                }
              : chat
        );

        try {
          localStorage.setItem(
            historyKey,
            JSON.stringify(updated)
          );
        } catch (e) {
          console.error(
            "Could not save AI response:",
            e
          );
        }

        return updated;
      });
    } catch (e) {
      const errorMessage = {
        id:
          Date.now().toString() +
          Math.random().toString(36).slice(2),
        role: "ai",
        text:
          "I couldn't process that request.\n\n" +
          e.message,
        sources: [],
        error: true,
        createdAt:
          new Date().toISOString(),
      };

      setConversations((current) => {
        const updated = current.map(
          (chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    errorMessage,
                  ],
                }
              : chat
        );

        try {
          localStorage.setItem(
            historyKey,
            JSON.stringify(updated)
          );
        } catch {}

        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function formatChatDate(date) {
    if (!date) return "";

    try {
      return new Date(
        date
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  const filteredConversations =
    conversations.filter((chat) =>
      `${chat.title} ${chat.messages
        ?.map((m) => m.text)
        .join(" ")}`
        .toLowerCase()
        .includes(
          searchHistory.toLowerCase()
        )
    );

  return (
    <div className="max-w-6xl">
      {/*chat */}

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden relative h-[calc(100vh-190px)] min-h-[570px] max-h-[850px] flex flex-col">
        {/* HEADER */}

        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                <Leaf size={21} />

                <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-base sm:text-xl truncate">
                    PlantCare AI
                  </h2>

                  <span className="hidden xs:inline-flex sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide bg-emerald-700 text-white px-2 py-1 rounded-full">
                    <Sparkles size={9} />
                    RAG
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-slate-400 text-[10px] sm:text-xs truncate">
                    Plant knowledge assistant
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-xl sm:rounded-full bg-emerald-50/80 border border-emerald-100 shadow-sm shrink-0">
                <Languages size={14} className="text-emerald-700 shrink-0" />
                <select value={language} onChange={(e) => persistLanguage(e.target.value)} className="appearance-none bg-transparent text-[10px] sm:text-[11px] font-black text-emerald-800 outline-none w-[68px] sm:w-[82px] cursor-pointer" aria-label="AI language">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Hinglish</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() =>
                  setShowHistory(true)
                }
                className="w-9 h-9 sm:w-auto sm:h-auto flex items-center justify-center sm:justify-start gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition"
                title="Chat history"
              >
                <History size={16} />

                <span className="hidden sm:inline">
                  History
                </span>

                {conversations.length > 0 && (
                  <span className="hidden sm:grid min-w-5 h-5 px-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] place-items-center">
                    {conversations.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={createNewChat}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition shadow-sm"
              >
                <Plus size={16} />

                <span className="hidden sm:inline">
                  New Chat
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* HISTORY sectionn*/}

        {showHistory && (
          <div className="absolute inset-0 z-50 bg-slate-950/25 backdrop-blur-[2px]">
            <div className="absolute top-0 bottom-0 right-0 w-full sm:w-[390px] bg-white shadow-2xl flex flex-col">
              <div className="p-4 sm:p-5 border-b">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setShowHistory(false)
                    }
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 grid place-items-center transition"
                  >
                    <ChevronLeft size={19} />
                  </button>

                  <div>
                    <h3 className="font-black text-xl">
                      Chat History
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Your saved conversations
                    </p>
                  </div>
                </div>

                {conversations.length > 0 && (
                  <div className="relative mt-5">
                    <Search
                      size={16}
                      className="absolute left-3 top-3.5 text-slate-400"
                    />

                    <input
                      value={searchHistory}
                      onChange={(e) =>
                        setSearchHistory(
                          e.target.value
                        )
                      }
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 text-sm transition"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto p-3 sm:p-4">
                {filteredConversations.length ===
                0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
                      <History size={25} />
                    </div>

                    <h4 className="font-black mt-4">
                      No conversations yet
                    </h4>

                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Your AI Assistant conversations will
                      appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map(
                      (chat) => (
                        <div
                          key={chat.id}
                          className={`group rounded-2xl border p-3 transition cursor-pointer ${
                            currentChatId ===
                            chat.id
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-slate-100 hover:bg-slate-50 hover:border-emerald-100"
                          }`}
                          onClick={() =>
                            openChat(chat.id)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                              <MessageCircle
                                size={17}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-slate-800 line-clamp-2">
                                {chat.title}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400">
                                  {formatChatDate(
                                    chat.createdAt
                                  )}
                                </span>

                                <span className="text-[10px] text-slate-300">
                                  •
                                </span>

                                <span className="text-[10px] text-slate-400">
                                  {chat.messages
                                    ?.length || 0}{" "}
                                  messages
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) =>
                                deleteChat(
                                  chat.id,
                                  e
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 grid place-items-center transition shrink-0"
                              title="Delete conversation"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 border-t bg-slate-50">
                <button
                  type="button"
                  onClick={clearAllHistory}
                  disabled={
                    conversations.length === 0
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition"
                >
                  <Trash2 size={15} />
                  Clear All History
                </button>
              </div>
            </div>
          </div>
        )}

        {/*
            CHAT AREA*/}

        <div
          id="plantcare-chat-area"
          className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4 sm:py-6 scroll-smooth"
        >
          {/* EMPTY */}

          {messages.length === 0 && (
            <div className="min-h-full flex flex-col justify-center py-6">
              <div className="text-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                  <div className="absolute inset-0 rounded-[1.5rem] bg-emerald-100 animate-pulse opacity-60" />

                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white border border-emerald-100 text-emerald-600 grid place-items-center shadow-sm">
                    <Leaf
                      size={30}
                      className="sm:hidden"
                    />
                    <Leaf
                      size={35}
                      className="hidden sm:block"
                    />
                  </div>
                </div>

                <h3 className="font-black text-xl sm:text-2xl mt-5">
                  How can I help your plant?
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed px-4">
                  Ask about diseases, watering, sunlight,
                  treatment, prevention or general plant care.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-3xl mx-auto mt-7 w-full">
                {quickQuestions.map(
                  (item, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        ask(null, item.text)
                      }
                      className="group text-left p-3.5 sm:p-4 rounded-2xl border border-emerald-100 bg-white hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm transition disabled:opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 group-hover:bg-white grid place-items-center text-base sm:text-lg shrink-0 transition">
                          {item.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed block">
                            {item.text}
                          </span>

                          <span className="text-[10px] text-emerald-600 font-black mt-1.5 block">
                            Ask PlantCare AI →
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* MESSAGES */}

          {messages.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`flex gap-2.5 sm:gap-3 ${
                    m.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* AI */}

                  {m.role === "ai" && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0 mt-1 shadow-sm">
                      <Leaf size={17} />
                    </div>
                  )}

                  <div
                    className={`min-w-0 ${
                      m.role === "user"
                        ? "max-w-[88%] sm:max-w-[75%]"
                        : "max-w-[94%] sm:max-w-[84%]"
                    }`}
                  >
                    {/* MESSAGE HEADER */}

                    <div
                      className={`flex items-center gap-2 mb-1.5 ${
                        m.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span className="text-[10px] sm:text-[11px] font-black text-slate-400">
                        {m.role === "user"
                          ? "You"
                          : "PlantCare AI"}
                      </span>

                      {m.role === "ai" && !m.error && (
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </div>

                    {/* USER MESSAGE */}

                    {m.role === "user" ? (
                      <div className="bg-emerald-700 text-white rounded-[1.25rem] rounded-br-md px-4 py-3.5 shadow-sm">
                        <p className="text-sm sm:text-[15px] leading-6 sm:leading-7 whitespace-pre-wrap break-words">
                          {m.text}
                        </p>
                      </div>
                    ) : (
                      /* AI RESPONSE */
                      <div
                        className={`rounded-[1.35rem] rounded-bl-md border px-4 sm:px-5 py-4 sm:py-5 shadow-sm ${
                          m.error
                            ? "bg-red-50 border-red-100"
                            : "bg-slate-50/80 border-slate-100"
                        }`}
                      >
                        {m.error ? (
                          <div className="text-red-700 text-sm whitespace-pre-wrap leading-6">
                            {m.text}
                          </div>
                        ) : (
                          <RichAIResponse
                            text={m.text}
                          />
                        )}

                        {/* SOURCES */}

                        {m.sources?.length >
                          0 && (
                          <details className="mt-5 group">
                            <summary className="cursor-pointer list-none select-none">
                              <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-white border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 grid place-items-center">
                                    <ShieldCheck
                                      size={14}
                                    />
                                  </div>

                                  <div>
                                    <span className="text-xs font-black block">
                                      Knowledge sources
                                    </span>

                                    <span className="text-[9px] text-slate-400 block mt-0.5">
                                      Retrieved from plant knowledge base
                                    </span>
                                  </div>
                                </div>

                                <span className="min-w-6 h-6 px-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] grid place-items-center font-black">
                                  {
                                    m
                                      .sources
                                      .length
                                  }
                                </span>
                              </div>
                            </summary>

                            <div className="mt-2 space-y-1.5">
                              {m.sources.map(
                                (s, index) => (
                                  <div
                                    key={index}
                                    className="flex gap-2 items-start text-[11px] text-slate-500 bg-white border border-slate-100 rounded-xl px-3 py-2.5"
                                  >
                                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 text-[9px] font-black">
                                      {index + 1}
                                    </span>

                                    <span className="font-semibold text-slate-700 leading-5">
                                      {s.source ||
                                        s.title ||
                                        "PlantCare knowledge base"}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </details>
                        )}

                        {!m.error && (
                          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200/70">
                            <button onClick={() => copyAnswer(m.id, m.text)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition">
                              {copiedId === m.id ? <Check size={12} /> : <Copy size={12} />}
                              {copiedId === m.id ? "Copied" : "Copy"}
                            </button>
                            <button onClick={() => speakAnswer(m.id, m.text)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition">
                              {speakingId === m.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              {speakingId === m.id ? "Stop" : "Listen"}
                            </button>
                            {i === messages.length - 1 && (
                              <button onClick={regenerateLast} disabled={loading} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40">
                                <RefreshCw size={12} /> Regenerate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* USER AVATAR */}

                  {m.role === "user" && (
                    <InitialAvatar
                      name={user?.name}
                    />
                  )}
                </div>
              ))}

              {/* LOADING */}

              {loading && (
                <div className="flex gap-2.5 sm:gap-3 justify-start">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                    <Sparkles
                      size={16}
                      className="animate-pulse"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-[1.35rem] rounded-bl-md px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-700">
                        PlantCare AI
                      </span>

                      <LoadingDots />
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                      Searching plant-care knowledge...
                    </p>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/*  INPUT */}

        <form
          onSubmit={ask}
          className="p-2.5 sm:p-4 border-t bg-white shrink-0"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 p-1.5 sm:p-2 rounded-[1.35rem] border border-slate-200 bg-slate-50/95 focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50 transition shadow-sm">
              <input
                className="flex-1 min-w-0 px-2.5 sm:px-3 py-2.5 bg-transparent outline-none text-sm sm:text-base text-slate-800 placeholder:text-slate-400"
                value={q}
                onChange={(e) =>
                  setQ(e.target.value)
                }
                placeholder="Ask about your plant..."
                disabled={loading}
              />

              <button
                type="submit"
                disabled={
                  loading || !q.trim()
                }
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white grid place-items-center transition shrink-0 shadow-sm"
                title="Send message"
              >
                {loading ? (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 px-1 mt-1.5">
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                RAG-based plant knowledge support
              </p>

              {currentChatId && (
                <span className="hidden sm:block text-[10px] text-emerald-600 font-bold whitespace-nowrap">
                  Saved locally
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Assistant;
