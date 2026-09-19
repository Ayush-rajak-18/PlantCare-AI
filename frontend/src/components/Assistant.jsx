import React, { useEffect, useRef, useState } from "react";
import * as Icons from "../icons";
import { api } from "../api";
import { InitialAvatar, SectionLabel, LoadingDots, MiniFeature, TopicChip, Stat, PlantCard, DiagnosisResult, AIResponse, formatInlineText } from "./Helpers";
const { Leaf, LayoutDashboard, Stethoscope, MessageCircle, Plus, LogOut, Upload, Droplets, Sun, Sprout, ShieldCheck, AlertTriangle, CheckCircle2, History, Sparkles, ImageIcon, X, RefreshCw, Send, Trash2, Search, ChevronLeft, ArrowRight, MapPin, Clock3, HeartPulse, Brain, Camera, Menu } = Icons;

function Assistant({ user }) {
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

  const [currentChatId, setCurrentChatId] =
    useState(null);

  const [showHistory, setShowHistory] =
    useState(false);

  const [searchHistory, setSearchHistory] =
    useState("");

  const chatEndRef = useRef(null);

  const quickQuestions = [
    {
      icon: "🍃",
      text: "Why are my graps leaves turning yellow?",
    },
    {
      icon: "💧",
      text: "How often should I water my cherry?",
    },
    {
      icon: "🦠",
      text: "What causes powdery mildew?",
    },
    {
      icon: "☀️",
      text: "How much sunlight does a tomato plant need?",
    },
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

  async function ask(
    e,
    customQuestion = null
  ) {
    e?.preventDefault();

    const question = (
      customQuestion ?? q
    ).trim();

    if (!question || loading) return;

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
      const r = await api("/rag/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
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
      {/* =================================================
          CHAT APP
      ================================================= */}

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden relative h-[calc(100vh-190px)] min-h-[570px] max-h-[850px] flex flex-col">
        {/* HEADER */}

        <div className="px-3 sm:px-5 py-3.5 sm:py-4 border-b bg-gradient-to-r from-white via-white to-emerald-50 shrink-0">
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
              <button
                type="button"
                onClick={() =>
                  setShowHistory(true)
                }
                className="w-9 h-9 sm:w-auto sm:h-auto sm:flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition"
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
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition shadow-sm"
              >
                <Plus size={16} />

                <span className="hidden sm:inline">
                  New Chat
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            HISTORY DRAWER
        ================================================= */}

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

        {/* =================================================
            CHAT AREA
        ================================================= */}

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
                          <AIResponse
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

        {/* =================================================
            INPUT
        ================================================= */}

        <form
          onSubmit={ask}
          className="p-2.5 sm:p-4 border-t bg-white shrink-0"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 p-1.5 sm:p-2 rounded-2xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50 transition">
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
