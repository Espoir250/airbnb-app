import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../shared/currency";
import type { Listing } from "../types";
import styles from "./AiStayAssistant.module.css";

type AiRecommendation = {
  id?: string | number;
  listingId?: string | number;
  title?: string;
  reason?: string;
};

type Message = {
  role: "user" | "ai";
  text: string;
  recommendations?: AiRecommendation[];
};

type AiResponse = {
  response?: string;
  answer?: string;
  message?: string;
  error?: string;
};

function aiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = (import.meta.env.VITE_API_URL as string ?? "").replace(/\/api\/v1\/?$/, "");
  const url = `${base}${path}`;
  return url.replace("/api/v1/api/v1/", "/api/v1/");
}

function listingMatchesRecommendation(listing: Listing, rec: AiRecommendation) {
  const recId = String(rec.id ?? rec.listingId ?? "");
  const recTitle = rec.title?.trim().toLowerCase();
  return (
    (recId && String(listing.id) === recId) ||
    (!!recTitle && listing.title.trim().toLowerCase() === recTitle)
  );
}

export function AiStayAssistant({ listings }: { listings: Listing[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! 👋 I'm your AI stay assistant. Tell me what you're looking for — location, budget, number of guests — and I'll help you find the perfect place.",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const sessionId = useMemo(() => `session-${Date.now()}-${Math.random()}`, []);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const getMatchedListings = (recs: AiRecommendation[]) =>
    recs
      .map((rec) => ({
        rec,
        listing: listings.find((l) => listingMatchesRecommendation(l, rec)),
      }))
      .filter((m): m is { rec: AiRecommendation; listing: Listing } =>
        Boolean(m.listing),
      );

  async function askAi(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = prompt.trim();
    setPrompt("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    const token = localStorage.getItem("token");
    const listingsSummary = listings
      .map(
        (l) =>
          `ID:${l.id} | "${l.title}" | ${l.location} | ${l.type} | $${l.price ?? l.pricePerNight}/night | ${l.guests} guests`,
      )
      .join("\n");

    const payload = {
      sessionId,
      message: `${userMessage}\n\n[Available listings:\n${listingsSummary}]`,
    };

    try {
      const endpoint = import.meta.env.VITE_AI_ENDPOINT ?? "/api/v1/ai/chat";
      const response = await fetch(aiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as AiResponse;

      if (!response.ok) {
        throw new Error(body.error || body.message || "AI request failed.");
      }

      const aiText =
        body.response ?? body.answer ?? body.message ?? "No response from AI.";

      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not reach the AI.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAi(e as unknown as React.FormEvent);
    }
  };

  return (
    <>
      {/* Floating chat bubble */}
      <button className={styles.bubble} onClick={() => setOpen((o) => !o)} aria-label="Open AI assistant">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z"/>
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className={styles.chatBox}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar}>✦</div>
              <div className={styles.headerInfo}>
                <p className={styles.headerTitle}>AirbnbOn Assistant</p>
                <p className={styles.headerSub}>Typically replies within few minutes.</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.chatWindow}>
            {messages.map((msg, i) => {
              const isAi = msg.role === "ai";
              const matched = msg.recommendations
                ? getMatchedListings(msg.recommendations)
                : [];

              return (
                <div key={i} className={`${styles.messageBubble} ${isAi ? "" : styles.user}`}>
                  {isAi && (
                    <div className={styles.avatar}>✦</div>
                  )}

                  <div>
                    <div className={`${styles.msgBubble} ${isAi ? styles.msgBubbleAi : styles.msgBubbleUser}`}>
                      {msg.text}
                    </div>

                    {matched.length > 0 && (
                      <div className={styles.recommendations}>
                        {matched.map(({ listing, rec }) => (
                          <article className={styles.recommendation} key={listing.id}>
                            <img
                              src={listing.img?.[0] ?? "https://placehold.co/120x90?text=Stay"}
                              alt={listing.title}
                            />
                            <div>
                              <h3>{listing.title}</h3>
                              <p>
                                {rec.reason ??
                                  `${listing.location} — ${formatCurrency(listing.price ?? listing.pricePerNight)} / night`}
                              </p>
                            </div>
                            <Link className="appButton" to={`/listing/${listing.id}`}>
                              View
                            </Link>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className={styles.messageBubble}>
                <div className={styles.avatar}>✦</div>
                <div className={styles.typing}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {/* Input area */}
          <form className={styles.inputArea} onSubmit={askAi}>
            <input
              className={styles.input}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply here..."
              disabled={isLoading}
            />
            {/* Attachment icon */}
            <button type="button" className={styles.iconBtn} tabIndex={-1}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 16.7a2 2 0 01-2.83-2.83l8.49-8.49"/>
              </svg>
            </button>
            {/* Emoji icon */}
            <button type="button" className={styles.iconBtn} tabIndex={-1}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>
            <button className={styles.sendBtn} type="submit" disabled={isLoading || !prompt.trim()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}