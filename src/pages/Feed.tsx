import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Feather, Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type LetterRow = {
  id: string;
  recipient: string | null;
  content: string;
  created_at: string;
  is_public: boolean;
};

type FeedLetter = LetterRow & {
  like_count: number;
  liked_by_me: boolean;
};

const PAGE_SIZE = 18;

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "An meine Mutter", label: "An Mutter" },
  { key: "An mich selbst", label: "An mich selbst" },
  { key: "An meinen Ex", label: "An den Ex" },
  { key: "An die Gesellschaft", label: "An die Gesellschaft" },
  { key: "most_loved", label: "Meistgeliebt" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const initialsFrom = (name: string | null | undefined, email: string | null | undefined) => {
  const base = (name || email || "").replace(/@.*$/, "");
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (letters || base.slice(0, 2) || "··").toUpperCase();
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `vor ${hr} Std`;
  const d = Math.floor(hr / 24);
  return `vor ${d} ${d === 1 ? "Tag" : "Tagen"}`;
};

const recipientLabel = (recipient: string | null) => {
  if (!recipient) return "An jemanden";
  // Already contains "An" prefix? Show as-is, else prefix.
  if (/^an\s/i.test(recipient.trim())) return recipient;
  return `An ${recipient}`;
};

const Feed = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [nickname, setNickname] = useState<string>("");
  const [letters, setLetters] = useState<FeedLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [hasMore, setHasMore] = useState(true);
  const [liveCount] = useState(() => 1200 + Math.floor(Math.random() * 80));
  const [showNewToast, setShowNewToast] = useState(false);
  const lastSeenLatestRef = useRef<string | null>(null);

  useEffect(() => {
    document.title = "Feed – Frauenmoment";
  }, []);

  // Load nickname for avatar
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("nickname")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setNickname(data?.nickname ?? "");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const fetchLetters = useCallback(
    async (currentFilter: FilterKey, offset: number): Promise<FeedLetter[]> => {
      let query = supabase
        .from("letters")
        .select("id, recipient, content, created_at, is_public")
        .eq("is_public", true);

      if (currentFilter !== "all" && currentFilter !== "most_loved") {
        // Match recipient by exact value OR partial (e.g. "Meine Mutter" stored differently)
        const tokens = currentFilter.replace(/^An\s+/i, "").split(/\s+/);
        const main = tokens[tokens.length - 1];
        query = query.ilike("recipient", `%${main}%`);
      }

      // Sort
      if (currentFilter === "most_loved") {
        // We can't sort by aggregate easily; fetch a wider set then reorder by like_count.
        query = query.order("created_at", { ascending: false }).range(0, 99);
      } else {
        query = query
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
      }

      const { data: lettersData, error } = await query;
      if (error) {
        console.error(error);
        toast.error("Konnte Briefe nicht laden.");
        return [];
      }
      const rows = (lettersData ?? []) as LetterRow[];
      if (rows.length === 0) return [];

      const ids = rows.map((r) => r.id);
      const [{ data: counts }, { data: myLikes }] = await Promise.all([
        supabase
          .from("letter_like_counts")
          .select("letter_id, like_count")
          .in("letter_id", ids),
        user
          ? supabase.from("likes").select("letter_id").eq("user_id", user.id).in("letter_id", ids)
          : Promise.resolve({ data: [] as { letter_id: string }[] }),
      ]);

      const countMap = new Map<string, number>();
      (counts ?? []).forEach((c: { letter_id: string; like_count: number }) =>
        countMap.set(c.letter_id, c.like_count),
      );
      const likedSet = new Set<string>(
        ((myLikes ?? []) as { letter_id: string }[]).map((l) => l.letter_id),
      );

      let enriched: FeedLetter[] = rows.map((r) => ({
        ...r,
        like_count: countMap.get(r.id) ?? 0,
        liked_by_me: likedSet.has(r.id),
      }));

      if (currentFilter === "most_loved") {
        enriched = enriched
          .sort((a, b) => b.like_count - a.like_count)
          .slice(0, PAGE_SIZE);
      }

      return enriched;
    },
    [user],
  );

  // Initial / filter change load
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHasMore(true);
    fetchLetters(filter, 0).then((rows) => {
      if (cancelled) return;
      setLetters(rows);
      setLoading(false);
      setHasMore(rows.length === PAGE_SIZE && filter !== "most_loved");
      lastSeenLatestRef.current = rows[0]?.created_at ?? null;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return () => {
      cancelled = true;
    };
  }, [filter, fetchLetters]);

  // Live polling for new letters
  useEffect(() => {
    if (filter !== "all") return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("letters")
        .select("created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const latest = data?.created_at ?? null;
      if (
        latest &&
        lastSeenLatestRef.current &&
        new Date(latest) > new Date(lastSeenLatestRef.current)
      ) {
        setShowNewToast(true);
        setTimeout(() => setShowNewToast(false), 3000);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const more = await fetchLetters(filter, letters.length);
    setLetters((prev) => [...prev, ...more]);
    setHasMore(more.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const reloadFromTop = async () => {
    setShowNewToast(false);
    setLoading(true);
    const rows = await fetchLetters(filter, 0);
    setLetters(rows);
    setLoading(false);
    lastSeenLatestRef.current = rows[0]?.created_at ?? null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleLike = async (letter: FeedLetter) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    const wasLiked = letter.liked_by_me;
    // Optimistic update
    setLetters((prev) =>
      prev.map((l) =>
        l.id === letter.id
          ? {
              ...l,
              liked_by_me: !wasLiked,
              like_count: Math.max(0, l.like_count + (wasLiked ? -1 : 1)),
            }
          : l,
      ),
    );
    if (wasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("letter_id", letter.id);
      if (error) {
        toast.error("Konnte das Herz nicht zurücknehmen.");
        // Revert
        setLetters((prev) =>
          prev.map((l) =>
            l.id === letter.id
              ? { ...l, liked_by_me: true, like_count: l.like_count + 1 }
              : l,
          ),
        );
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, letter_id: letter.id });
      if (error) {
        toast.error("Konnte kein Herz vergeben.");
        setLetters((prev) =>
          prev.map((l) =>
            l.id === letter.id
              ? { ...l, liked_by_me: false, like_count: Math.max(0, l.like_count - 1) }
              : l,
          ),
        );
      }
    }
  };

  const navTabs = useMemo(
    () => [
      { to: "/app", label: "Meine Briefe", active: false },
      { to: "/feed", label: "Feed", active: true },
      { to: "/settings", label: "Einstellungen", active: false },
    ],
    [],
  );

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-deep text-cream relative overflow-x-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-24 -right-24 h-[600px] w-[600px] rounded-full bg-rose/[0.06] blur-3xl" />
        <div className="absolute bottom-24 -left-12 h-[400px] w-[400px] rounded-full bg-blush/[0.05] blur-3xl" />
      </div>

      {/* New letters toast */}
      {showNewToast && (
        <button
          onClick={reloadFromTop}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 bg-rose/90 backdrop-blur text-cream px-5 py-2.5 text-[0.7rem] tracking-[0.18em] uppercase shadow-lg animate-fade-up"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Neue Briefe im Feed
        </button>
      )}

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-deep/70 border-b border-blush/10">
        <div className="flex items-center justify-between px-6 md:px-12 py-5">
          <Link to="/app" className="inline-flex items-center gap-3 no-underline">
            <Feather className="h-4 w-4 text-rose" strokeWidth={1.5} />
            <span className="font-serif text-base tracking-[0.2em] uppercase text-cream">
              Frauen<span className="text-rose">moment</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navTabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={`px-4 py-2 text-[0.65rem] tracking-[0.22em] uppercase transition-colors no-underline ${
                  t.active
                    ? "text-blush"
                    : "text-cream/50 hover:text-blush"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/write"
              className="inline-flex items-center gap-2 bg-rose hover:bg-rose-deep text-cream px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase transition-colors"
            >
              <Feather className="h-3 w-3" strokeWidth={1.5} />
              Schreiben
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

      {/* Header */}
      <header className="relative z-10 px-6 md:px-14 pt-32 pb-10 max-w-[1400px] mx-auto">
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose" />
          </span>
          <span className="text-[0.6rem] tracking-[0.28em] uppercase text-rose">
            {liveCount.toLocaleString("de-DE")} Frauen schreiben gerade
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <h1 className="font-serif text-[2.4rem] md:text-[3.6rem] leading-[1.1] text-cream max-w-[720px] text-balance">
            Worte die{" "}
            <em className="italic font-serif text-blush">endlich existieren.</em>
          </h1>
          <p className="text-[0.85rem] leading-[1.7] text-cream/55 max-w-[280px] md:text-right">
            Alle Briefe sind anonym. Du kannst nur ein Herz geben — kein Kommentar, kein Urteil.
          </p>
        </div>
      </header>

      {/* Filter bar */}
      <div className="relative z-10 px-6 md:px-14 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase border transition-all ${
                  active
                    ? "border-rose text-rose bg-rose/[0.08]"
                    : "border-blush/15 text-cream/55 hover:border-rose/40 hover:text-blush"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed grid */}
      <section className="relative z-10 px-6 md:px-14 max-w-[1400px] mx-auto pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse" />
            <span
              className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse mx-2"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        ) : letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto">
            <p className="font-serif italic text-[1.4rem] text-cream/70 mb-8 leading-relaxed">
              Noch keine Briefe. Werde die Erste — schreib deinen Moment.
            </p>
            <Link
              to="/write"
              className="inline-flex items-center gap-2 bg-rose hover:bg-rose-deep text-cream px-7 py-3.5 text-[0.7rem] tracking-[0.18em] uppercase transition-colors"
            >
              <Feather className="h-3.5 w-3.5" strokeWidth={1.5} />
              Brief schreiben
            </Link>
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
              {letters.map((letter, idx) => (
                <article
                  key={letter.id}
                  style={{
                    animationDelay: `${Math.min(idx, 17) * 70}ms`,
                  }}
                  className="break-inside-avoid mb-5 inline-block w-full bg-cream/[0.025] border border-blush/10 p-7 transition-all duration-300 hover:border-blush/30 hover:bg-cream/[0.045] hover:-translate-y-[3px] animate-fade-up"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-6 bg-rose/60" />
                    <span className="text-[0.6rem] tracking-[0.22em] uppercase text-rose">
                      {recipientLabel(letter.recipient)}
                    </span>
                  </div>

                  <p className="font-serif italic text-[1.05rem] leading-[1.8] text-cream/90 whitespace-pre-wrap mb-6">
                    {letter.content}
                  </p>

                  <div className="flex justify-between items-center pt-3 border-t border-blush/5">
                    <span className="text-[0.65rem] text-cream/35 tracking-wide">
                      {timeAgo(letter.created_at)} · anonym
                    </span>
                    <button
                      onClick={() => toggleLike(letter)}
                      className="group inline-flex items-center gap-1.5 text-[0.7rem] text-cream/60 hover:text-rose transition-colors"
                      aria-label={letter.liked_by_me ? "Herz zurücknehmen" : "Herz vergeben"}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          letter.liked_by_me
                            ? "text-rose scale-[1.5]"
                            : "group-hover:scale-110"
                        }`}
                        fill={letter.liked_by_me ? "currentColor" : "none"}
                        strokeWidth={1.5}
                      />
                      <span className={letter.liked_by_me ? "text-rose" : ""}>
                        {letter.like_count}
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {hasMore && filter !== "most_loved" && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="border border-rose/40 text-rose px-7 py-3 text-[0.7rem] tracking-[0.18em] uppercase transition-all hover:bg-rose/10 disabled:opacity-40"
                >
                  {loadingMore ? "Lädt..." : "Mehr Briefe laden"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default Feed;
