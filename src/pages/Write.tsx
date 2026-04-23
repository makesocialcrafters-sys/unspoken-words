import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Feather, Lock, Send, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const RECIPIENTS = [
  "Meine Mutter",
  "Mein früheres Ich",
  "Meinen Chef",
  "Meine beste Freundin",
  "Die Stille",
] as const;

const MOODS = [
  "traurig",
  "wütend",
  "verletzt",
  "vermissend",
  "dankbar",
  "erleichtert",
] as const;

const initialsFrom = (name: string | null | undefined, email: string | null | undefined) => {
  const base = (name || email || "").replace(/@.*$/, "");
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (letters || base.slice(0, 2) || "··").toUpperCase();
};

const salutationFor = (recipient: string | null, custom: string) => {
  const target = (custom.trim() || recipient || "").trim();
  if (!target) return "Liebe/r ...";
  const lower = target.toLowerCase();
  if (lower.startsWith("mein") || lower.startsWith("meine")) {
    // "Meine Mutter" → "Liebe Mutter"; "Mein früheres Ich" → "Liebes früheres Ich"
    const stripped = target.replace(/^mein(e|en|er|es)?\s+/i, "");
    if (/^(mutter|freundin|schwester|tochter|oma|tante)/i.test(stripped)) return `Liebe ${stripped}`;
    if (/^(vater|bruder|sohn|opa|onkel|chef)/i.test(stripped)) return `Lieber ${stripped}`;
    return `Liebes ${stripped}`;
  }
  if (lower === "die stille") return "Liebe Stille";
  return `Liebe/r ${target}`;
};

const Write = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [nickname, setNickname] = useState<string>("");
  const [checking, setChecking] = useState(true);

  const [recipient, setRecipient] = useState<string | null>(null);
  const [customRecipient, setCustomRecipient] = useState("");
  const [letter, setLetter] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState<string | null>(null);

  const responseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "Dein Moment – Frauenmoment";
  }, []);

  // Ensure onboarded; load nickname
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname, onboarded_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (!data?.onboarded_at) {
        navigate("/onboarding", { replace: true });
        return;
      }
      setNickname(data?.nickname ?? "");
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const charCount = letter.length;
  const salutation = useMemo(
    () => salutationFor(recipient, customRecipient),
    [recipient, customRecipient],
  );
  const canSend = letter.trim().length >= 10 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setReply(null);
    try {
      const { data, error } = await supabase.functions.invoke("letter-respond", {
        body: {
          recipient: customRecipient.trim() || recipient || null,
          mood,
          letter,
          nickname: nickname || null,
        },
      });
      if (error) {
        const msg = (error as { message?: string }).message ?? "Konnte keine Antwort schreiben.";
        toast.error(msg);
        return;
      }
      const reply = (data as { reply?: string; error?: string })?.reply;
      const errMsg = (data as { error?: string })?.error;
      if (errMsg) {
        toast.error(errMsg);
        return;
      }
      if (!reply) {
        toast.error("Keine Antwort erhalten.");
        return;
      }
      setReply(reply);
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (e) {
      console.error(e);
      toast.error("Unerwarteter Fehler.");
    } finally {
      setSending(false);
    }
  };

  const handleNew = () => {
    setReply(null);
    setLetter("");
    setMood(null);
    setRecipient(null);
    setCustomRecipient("");
    setIsPrivate(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-cream/50">Einen Moment</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-deep text-cream relative overflow-x-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -right-24 h-[600px] w-[600px] rounded-full bg-rose/[0.06] blur-3xl" />
        <div className="absolute bottom-24 -left-12 h-[400px] w-[400px] rounded-full bg-blush/[0.05] blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-deep/70 border-b border-blush/10">
        <div className="flex items-center justify-between px-6 md:px-12 py-5">
          <Link to="/app" className="inline-flex items-center gap-3 no-underline">
            <Feather className="h-4 w-4 text-rose" strokeWidth={1.5} />
            <span className="font-serif text-base tracking-[0.2em] uppercase text-cream">
              Frauen<span className="text-rose">moment</span>
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              to="/feed"
              className="text-[0.65rem] tracking-[0.22em] uppercase text-cream/60 hover:text-blush transition-colors no-underline"
            >
              Feed
            </Link>
            <Link
              to="/settings"
              title={user?.email ?? "Einstellungen"}
              aria-label="Einstellungen"
              className="h-9 w-9 rounded-full bg-rose text-cream flex items-center justify-center font-serif text-sm tracking-wider hover:opacity-90 transition-opacity no-underline"
            >
              {initialsFrom(nickname, user?.email)}
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 px-5 md:px-8 pt-32 pb-24">
        <div className="max-w-[680px] mx-auto animate-fade-up">
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose text-center mb-10">
            Dein Moment
          </p>

          {/* Recipient */}
          <div className="mb-8">
            <p className="text-[0.65rem] tracking-[0.22em] uppercase text-cream/50 mb-3">
              An wen schreibst du?
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {RECIPIENTS.map((r) => {
                const active = recipient === r && !customRecipient.trim();
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRecipient(r);
                      setCustomRecipient("");
                    }}
                    className={`px-4 py-2 font-serif italic text-[0.95rem] border transition-all ${
                      active
                        ? "bg-rose/10 border-rose text-cream"
                        : "border-blush/15 text-cream/55 hover:border-rose/40 hover:text-blush"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[0.65rem] tracking-[0.22em] uppercase text-cream/40">
                Oder:
              </span>
              <input
                type="text"
                value={customRecipient}
                onChange={(e) => {
                  setCustomRecipient(e.target.value);
                  if (e.target.value.trim()) setRecipient(null);
                }}
                placeholder="Jemand anderes..."
                maxLength={80}
                className="flex-1 max-w-[260px] bg-transparent border-0 border-b border-blush/15 px-0 py-1.5 font-serif italic text-base text-cream placeholder:text-cream/30 focus:outline-none focus:border-rose transition-colors"
              />
            </div>
          </div>

          {/* Letter paper */}
          <div className="relative bg-cream/[0.02] border border-blush/10 p-7 md:p-12 transition-colors focus-within:border-rose/25">
            {/* Decorative corners */}
            <span className="pointer-events-none absolute top-3 left-3 h-5 w-5 border-t border-l border-rose/30" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-rose/30" />

            <p className="font-serif italic text-xl md:text-[1.3rem] text-blush/80 mb-5 min-h-[28px] transition-all">
              {salutation}
            </p>

            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Schreib, was du sagen möchtest..."
              rows={10}
              maxLength={4000}
              className="w-full min-h-[280px] bg-transparent border-0 outline-none resize-none font-serif text-[1.1rem] md:text-[1.15rem] leading-[1.9] text-cream placeholder:text-cream/35 placeholder:italic caret-rose"
            />

            <div className="mt-8 pt-5 border-t border-blush/10 flex justify-end">
              <p className="font-serif italic text-base text-cream/40">
                {isPrivate ? "— privat" : nickname ? `— ${nickname}` : "— anonym"}
              </p>
            </div>
          </div>

          {/* Mood */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-[0.62rem] tracking-[0.2em] uppercase text-cream/40 shrink-0">
              Stimmung
            </span>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => {
                const active = mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(active ? null : m)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      active
                        ? "border-rose/40 text-blush bg-rose/[0.06]"
                        : "border-blush/10 text-cream/50 hover:border-rose/40 hover:text-blush hover:bg-rose/[0.06]"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <span className="text-[0.65rem] tracking-[0.1em] text-cream/40">
              {charCount} Zeichen
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate((v) => !v)}
                className={`inline-flex items-center gap-2 border px-5 py-3 text-[0.7rem] tracking-[0.14em] uppercase transition-all ${
                  isPrivate
                    ? "border-blush/40 text-blush"
                    : "border-blush/20 text-cream/55 hover:border-blush/40 hover:text-blush"
                }`}
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                Privat lassen
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="inline-flex items-center gap-2.5 bg-rose text-cream px-7 py-3 text-[0.7rem] tracking-[0.16em] uppercase transition-all hover:bg-rose-deep disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                {sending ? "Schickt..." : "Abschicken"}
              </button>
            </div>
          </div>

          {/* Loading */}
          {sending && !reply && (
            <div className="mt-10 flex items-center gap-3 px-2 py-6">
              <span className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse" />
              <span
                className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
              <span className="ml-3 font-serif italic text-base text-cream/55">
                Frauenmoment liest deinen Brief...
              </span>
            </div>
          )}

          {/* Response */}
          {reply && (
            <div ref={responseRef} className="mt-12 animate-fade-up">
              <div className="flex items-center gap-4 mb-7">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blush/20 to-transparent" />
                <span className="text-[0.6rem] tracking-[0.28em] uppercase text-rose shrink-0">
                  Frauenmoment antwortet
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blush/20 to-transparent" />
              </div>

              <div className="relative bg-rose/[0.04] border border-rose/10 p-7 md:p-12">
                <p className="text-[0.62rem] tracking-[0.22em] uppercase text-rose mb-5">
                  Von Frauenmoment
                </p>
                <p className="font-serif italic text-[1.05rem] md:text-[1.1rem] leading-[1.9] text-cream/90 whitespace-pre-wrap">
                  {reply}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isPrivate}
                    onClick={() => toast("Im Feed teilen — kommt bald.")}
                    className="inline-flex items-center gap-2 border border-blush/20 text-cream/60 px-5 py-2.5 text-[0.65rem] tracking-[0.14em] uppercase transition-all hover:border-blush/40 hover:text-blush disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Im Feed teilen
                  </button>
                  <button
                    type="button"
                    onClick={handleNew}
                    className="border border-rose/30 text-rose px-5 py-2.5 text-[0.65rem] tracking-[0.14em] uppercase transition-all hover:bg-rose/10"
                  >
                    Neuen Brief schreiben
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Write;
