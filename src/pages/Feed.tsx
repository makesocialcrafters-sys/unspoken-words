import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Feather } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type LetterRow = {
  id: string;
  recipient: string | null;
  content: string;
  category: string | null;
  is_featured: boolean;
  created_at: string;
};

type FeedLetter = LetterRow & {
  like_count: number;
  liked_by_me: boolean;
};

const PAGE_SIZE = 18;

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "mutter", label: "An Mutter" },
  { key: "selbst", label: "An mich selbst" },
  { key: "ex", label: "An den Ex" },
  { key: "körper", label: "An meinen Körper" },
  { key: "gesellschaft", label: "An die Gesellschaft" },
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

const Feed = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [nickname, setNickname] = useState<string>("");
  const [letters, setLetters] = useState<FeedLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [hasMore, setHasMore] = useState(true);
  const [liveCount, setLiveCount] = useState(() => 1230 + Math.floor(Math.random() * 50));
  const [showNewToast, setShowNewToast] = useState(false);
  const lastSeenLatestRef = useRef<string | null>(null);

  useEffect(() => {
    document.title = "Feed – Frauenmoment";
  }, []);

  // Live count fluctuation
  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount((c) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = c + delta;
        if (next < 1230) return 1230;
        if (next > 1280) return 1280;
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Load nickname
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
        .select("id, recipient, content, category, is_featured, created_at")
        .eq("is_public", true);

      if (currentFilter !== "all" && currentFilter !== "most_loved") {
        query = query.eq("category", currentFilter);
      }

      if (currentFilter === "most_loved") {
        query = query.order("created_at", { ascending: false }).range(0, 99);
      } else {
        query = query
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
      }

      const { data, error } = await query;
      if (error) {
        console.error(error);
        toast.error("Konnte Briefe nicht laden.");
        return [];
      }
      const rows = (data ?? []) as LetterRow[];
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
        enriched = enriched.sort((a, b) => b.like_count - a.like_count).slice(0, PAGE_SIZE);
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

  // Polling for new letters every 60s
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
    <main className="min-h-screen bg-dark text-cream relative overflow-x-hidden font-sans font-light">
      {/* Toast */}
      <button
        onClick={reloadFromTop}
        className={`fixed top-[90px] left-1/2 -translate-x-1/2 z-[200] backdrop-blur-md bg-rose/[0.12] border border-rose/25 px-6 py-2.5 text-[0.7rem] tracking-[0.18em] uppercase text-blush transition-all duration-400 ${
          showNewToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"
        }`}
      >
        ✦ Neue Briefe im Feed
      </button>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between px-6 md:px-12 py-[22px] backdrop-blur-[14px] bg-dark/85 border-b border-blush/[0.06]">
        <Link to="/app" className="flex items-center gap-2.5 no-underline">
          <Feather className="h-4 w-4 text-rose" strokeWidth={1.5} />
          <span className="font-serif text-[1.1rem] tracking-[0.18em] uppercase text-cream">
            Frauen<span className="text-rose">moment</span>
          </span>
        </Link>

        <div className="hidden md:flex border border-blush/10">
          {navTabs.map((t, i) => (
            <Link
              key={t.to}
              to={t.to}
              className={`px-[22px] py-[9px] text-[0.68rem] tracking-[0.14em] uppercase transition-colors no-underline ${
                i < navTabs.length - 1 ? "border-r border-blush/10" : ""
              } ${t.active ? "text-cream bg-rose/[0.12]" : "text-muted-warm hover:text-blush"}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/write"
            className="bg-rose hover:bg-rose-deep text-white px-[22px] py-[9px] text-[0.68rem] tracking-[0.14em] uppercase transition-colors no-underline"
          >
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
      </nav>

      {/* Main content */}
      <div className="px-6 md:px-12 pt-[100px] pb-20 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-10 mb-10">
          <div>
            <div className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-2.5">
              Gemeinsam anonym
            </div>
            <h1 className="font-serif text-[2.4rem] md:text-[2.8rem] leading-[1.1] text-cream">
              Worte die
              <br />
              <em className="italic font-serif text-blush">endlich existieren.</em>
            </h1>
          </div>
          <p className="text-[0.82rem] leading-[1.7] text-muted-warm max-w-[300px] md:text-right">
            Alle Briefe sind anonym. Du kannst nur ein Herz geben — kein Kommentar, kein Urteil.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-9">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-[18px] py-[7px] text-[0.7rem] tracking-[0.1em] uppercase border transition-all ${
                  active
                    ? "bg-rose/10 border-rose text-cream"
                    : "border-blush/[0.12] text-muted-warm hover:border-rose/30 hover:text-blush"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        ) : letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto">
            <p className="font-serif italic text-[1.4rem] text-cream/70 mb-8 leading-relaxed">
              Noch keine Briefe. Werde die Erste — schreib deinen Moment.
            </p>
            <Link
              to="/write"
              className="inline-flex items-center gap-2 bg-rose hover:bg-rose-deep text-cream px-7 py-3.5 text-[0.7rem] tracking-[0.18em] uppercase transition-colors no-underline"
            >
              <Feather className="h-3.5 w-3.5" strokeWidth={1.5} />
              Brief schreiben
            </Link>
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
              {letters.map((letter, idx) => (
                <article
                  key={letter.id}
                  style={{
                    animationDelay: `${Math.min(idx, 17) * 70}ms`,
                    opacity: 0,
                    animation: `fadeCard 0.7s ease ${Math.min(idx, 17) * 70}ms forwards`,
                  }}
                  className={`break-inside-avoid mb-5 p-7 border transition-all duration-[350ms] hover:-translate-y-[3px] ${
                    letter.is_featured
                      ? "bg-rose/[0.05] border-rose/15 hover:border-rose/30"
                      : "bg-white/[0.025] border-blush/[0.08] hover:border-blush/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3.5 text-[0.6rem] tracking-[0.22em] uppercase text-rose">
                    <span className="h-px w-4 bg-rose/50 flex-shrink-0" />
                    {letter.recipient ?? "An jemanden"}
                  </div>

                  <p className="font-serif italic text-[1.05rem] leading-[1.8] text-cream whitespace-pre-wrap mb-5">
                    {letter.content}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-[0.62rem] text-muted-warm/40 tracking-[0.06em]">
                      {timeAgo(letter.created_at)} · anonym
                    </span>
                    <button
                      onClick={() => toggleLike(letter)}
                      className={`flex items-center gap-1.5 text-[0.7rem] px-2.5 py-1 rounded-full transition-all duration-250 hover:bg-rose/[0.08] hover:text-rose ${
                        letter.liked_by_me ? "text-rose" : "text-blush/40"
                      }`}
                      aria-label={letter.liked_by_me ? "Herz zurücknehmen" : "Herz vergeben"}
                    >
                      <span
                        className="text-base leading-none transition-transform duration-300"
                        style={{ transform: letter.liked_by_me ? "scale(1.2)" : "scale(1)" }}
                      >
                        ♥
                      </span>
                      {letter.like_count}
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
                  className="bg-transparent border border-blush/15 text-muted-warm hover:text-cream hover:border-blush/40 px-10 py-3.5 text-[0.72rem] tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
                >
                  {loadingMore ? "Lädt …" : "Mehr Briefe laden"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeCard {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default Feed;
