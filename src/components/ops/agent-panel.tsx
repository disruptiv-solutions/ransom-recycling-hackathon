"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Send, X, Sparkles, User, Bot, Loader2, Menu, Plus, History, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AgentMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

type ChatSession = {
  id: string;
  updatedAt: string;
  firstMessage: string;
};

type AgentPanelProps = {
  onClose: () => void;
};

export const AgentPanel = ({ onClose }: AgentPanelProps) => {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pageContext = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const context: Record<string, string> = {
      path: pathname,
    };
    const participantsIndex = segments.indexOf("participants");
    if (participantsIndex !== -1 && segments[participantsIndex + 1]) {
      context.participantId = segments[participantsIndex + 1];
    }
    const reportsIndex = segments.indexOf("reports");
    if (reportsIndex !== -1 && segments[reportsIndex + 1]) {
      context.reportId = segments[reportsIndex + 1];
    }
    return context;
  }, [pathname]);

  useEffect(() => {
    const existing = window.localStorage.getItem("opsAgentSessionId");
    if (existing) {
      setSessionId(existing);
    } else {
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    if (!sessionId || showHistory) return;
    const loadHistory = async () => {
      const res = await fetch(`/api/ops-agent?sessionId=${sessionId}`);
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    };
    loadHistory();
  }, [sessionId, showHistory]);

  useEffect(() => {
    if (showHistory) {
      const loadSessions = async () => {
        const res = await fetch(`/api/ops-agent?list=true`);
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        }
      };
      loadSessions();
    }
  }, [showHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, showHistory]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleNewChat = () => {
    const id = crypto.randomUUID();
    window.localStorage.setItem("opsAgentSessionId", id);
    setSessionId(id);
    setMessages([]);
    setShowHistory(false);
    setError(null);
  };

  const handleSelectSession = (id: string) => {
    window.localStorage.setItem("opsAgentSessionId", id);
    setSessionId(id);
    setShowHistory(false);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !sessionId) return;
    setLoading(true);
    setError(null);
    const userMessage: AgentMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/ops-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: trimmed,
          pageContext,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Agent failed to respond");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            lastMsg.content = assistantContent;
          }
          return newMessages;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="h-full w-[380px] shrink-0 border-l border-slate-200 bg-slate-50/50 flex lg:w-[440px]">
      <div className="flex h-full w-full flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-200">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ops Agent</h3>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "h-8 w-8 transition-colors",
                showHistory ? "bg-slate-100 text-blue-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
              title="Chat History"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-4 w-[1px] bg-slate-200" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
              aria-label="Close agent panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {/* History View */}
          {showHistory && (
            <div className="absolute inset-0 z-10 flex flex-col bg-white">
              <div className="flex items-center gap-2 border-b border-slate-50 px-4 py-3 bg-slate-50/50">
                <History className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Recent Conversations</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 rounded-full bg-slate-50 p-3">
                      <History className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">No previous chats found</p>
                  </div>
                ) : (
                  sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSession(s.id)}
                      className={cn(
                        "w-full text-left rounded-xl border p-3 transition-all group",
                        sessionId === s.id
                          ? "border-blue-200 bg-blue-50/50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          {format(new Date(s.updatedAt), "MMM d, yyyy • h:mm a")}
                        </span>
                        {sessionId === s.id && (
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed group-hover:text-slate-900">
                        {s.firstMessage}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages View */}
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto bg-slate-50/30 px-4 py-6 scroll-smooth"
          >
            <div className="flex flex-col gap-6">
              {messages.length === 0 ? (
                <div className="mx-auto max-w-[280px] rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Bot className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900">How can I help you?</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Ask me about this page, the participant, or recent operations activity.
                  </p>
                </div>
              ) : null}

              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                const prevMsg = messages[idx - 1];
                const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role;

                return (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={cn(
                      "flex w-full flex-col gap-1.5",
                      isUser ? "items-end" : "items-start"
                    )}
                  >
                    {isFirstInGroup && (
                      <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {isUser ? "You" : "Agent"}
                      </span>
                    )}
                    <div
                      className={cn(
                        "group relative max-w-[90%] rounded-2xl px-4 py-3 text-[13px] shadow-sm transition-all",
                        isUser
                          ? "bg-slate-900 text-white shadow-slate-200"
                          : "border border-slate-100 bg-white text-slate-700 shadow-slate-100"
                      )}
                    >
                      <div className={cn(
                        "prose prose-sm max-w-none break-words",
                        isUser ? "prose-invert" : "prose-slate"
                      )}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-0 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="my-2 list-disc pl-4">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 list-decimal pl-4">{children}</ol>,
                            li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
                            code: ({ children }) => (
                              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] font-mono text-blue-600 dark:bg-slate-800">
                                {children}
                              </code>
                            ),
                            strong: ({ children }) => <strong className="font-bold text-inherit">{children}</strong>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading ? (
                <div className="flex w-full flex-col items-start gap-1.5">
                  <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Agent
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 italic">Processing...</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 bg-white p-4">
          {error ? (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
              {error}
            </div>
          ) : null}
          <div className="relative flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this page..."
              rows={1}
              className="w-full resize-none overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-12 text-[13px] focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className={cn(
                "absolute right-1.5 bottom-2 h-8 w-8 rounded-xl transition-all",
                input.trim() ? "bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700" : "bg-transparent text-slate-300"
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Powered by Pipedream MCP & AI Intelligence
          </p>
        </div>
      </div>
    </aside>
  );
};
