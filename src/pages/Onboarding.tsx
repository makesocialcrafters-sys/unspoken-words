import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Feather } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AGE_GROUPS = ["Unter 18", "18–25", "26–35", "36+"] as const;
type AgeGroup = typeof AGE_GROUPS[number];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [nickname, setNickname] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.title = "Willkommen – Frauenmoment";
  }, []);

  // If profile already onboarded, skip to /app
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data?.onboarded_at) {
        navigate("/app", { replace: true });
        return;
      }
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedNickname = nickname.trim().slice(0, 80);
    const trimmedCity = city.trim().slice(0, 120);

    if (!trimmedNickname) {
      toast.error("Bitte gib einen Namen ein.");
      return;
    }
    if (!ageGroup) {
      toast.error("Bitte wähle eine Altersgruppe.");
      return;
    }
    if (!trimmedCity) {
      toast.error("Bitte gib deinen Ort ein.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        nickname: trimmedNickname,
        age_group: ageGroup,
        city: trimmedCity,
        onboarded_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) {
      toast.error("Konnte nicht speichern. Bitte versuch es nochmal.");
      setSubmitting(false);
      return;
    }
    navigate("/write", { replace: true });
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-cream/50">
          Einen Moment
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-deep text-cream flex flex-col">
      <header className="px-6 md:px-14 py-7">
        <Link to="/" className="inline-flex items-center gap-3 no-underline">
          <Feather className="h-4 w-4 text-rose" strokeWidth={1.5} />
          <span className="font-serif text-base tracking-[0.2em] uppercase text-cream">
            Frauen<span className="text-rose">moment</span>
          </span>
        </Link>
      </header>

      <section className="flex-1 px-6 md:px-14 pb-20">
        <div className="max-w-xl mx-auto pt-10 md:pt-16">
          <h1 className="font-serif italic text-4xl md:text-5xl leading-[1.1] text-cream">
            Erzähl uns ein bisschen von dir.
          </h1>
          <p className="mt-5 text-cream/70 text-base md:text-lg leading-relaxed">
            Nur für dich — damit wir dich besser begleiten können.
          </p>

          <form onSubmit={handleSubmit} className="mt-12 space-y-10">
            {/* Q1 — Nickname */}
            <div>
              <label
                htmlFor="nickname"
                className="block text-[0.7rem] tracking-[0.28em] uppercase text-cream/60 mb-3"
              >
                Wie sollen wir dich nennen?
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={80}
                placeholder="z.B. Luna, Mia, oder anonym..."
                className="w-full bg-transparent border-0 border-b border-cream/20 px-0 py-3 text-lg text-cream placeholder:text-cream/30 focus:outline-none focus:border-rose transition-colors"
              />
            </div>

            {/* Q2 — Age group */}
            <div>
              <span className="block text-[0.7rem] tracking-[0.28em] uppercase text-cream/60 mb-4">
                Wie alt bist du?
              </span>
              <div className="flex flex-wrap gap-2.5">
                {AGE_GROUPS.map((group) => {
                  const selected = ageGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setAgeGroup(group)}
                      className={`px-5 py-2.5 rounded-full text-sm border transition-all ${
                        selected
                          ? "bg-rose border-rose text-cream"
                          : "bg-transparent border-cream/25 text-cream/80 hover:border-cream/50"
                      }`}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q3 — City */}
            <div>
              <label
                htmlFor="city"
                className="block text-[0.7rem] tracking-[0.28em] uppercase text-cream/60 mb-3"
              >
                Wo lebst du?
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={120}
                placeholder="z.B. Wien, Berlin, München..."
                className="w-full bg-transparent border-0 border-b border-cream/20 px-0 py-3 text-lg text-cream placeholder:text-cream/30 focus:outline-none focus:border-rose transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-rose hover:bg-rose-deep text-cream py-4 text-sm tracking-[0.2em] uppercase transition-colors disabled:opacity-60"
              >
                {submitting ? "Wird gespeichert..." : "Meinen ersten Moment schreiben"}
              </button>
              <div className="mt-5 text-center">
                <Link
                  to="/app"
                  className="text-xs tracking-[0.2em] uppercase text-cream/50 hover:text-cream/80 transition-colors"
                >
                  Überspringen
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Onboarding;
