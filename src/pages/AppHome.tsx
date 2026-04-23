import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Feather, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const initialsFrom = (user: User | null) => {
  if (!user) return "··";
  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email ||
    "";
  const parts = name.replace(/@.*$/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (letters || name.slice(0, 2)).toUpperCase();
};

const AppHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = "Dein Raum – Frauenmoment";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/signin", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setReady(true);
      if (!session) navigate("/signin", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);


  if (!ready) return null;

  return (
    <main className="min-h-screen bg-background">
      <nav className="flex justify-between items-center px-6 md:px-14 py-7">
        <Link to="/app" className="flex items-center gap-3 no-underline">
          <Feather className="h-4 w-4 text-rose" strokeWidth={1.5} />
          <span className="font-serif text-base tracking-[0.2em] uppercase text-deep">
            Frauen<span className="text-rose">moment</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 border border-rose/40 text-rose px-4 py-2.5 text-[0.65rem] tracking-[0.22em] uppercase hover:bg-rose hover:text-cream transition-all no-underline"
          >
            <Heart className="h-3 w-3" strokeWidth={1.5} />
            Feed
          </Link>
          <Link
            to="/settings"
            title={user?.email ?? "Einstellungen"}
            aria-label="Einstellungen"
            className="h-10 w-10 rounded-full bg-rose text-cream flex items-center justify-center font-serif text-sm tracking-wider hover:opacity-90 transition-opacity no-underline"
          >
            {initialsFrom(user)}
          </Link>
        </div>
      </nav>

      <section className="px-6 md:px-14 py-24 max-w-3xl">
        <p className="eyebrow mb-6">Dein Raum</p>
        <h1 className="font-serif text-[3rem] md:text-[4rem] leading-[1.05] text-deep text-balance">
          Willkommen.{" "}
          <em className="italic font-serif text-rose">Atme tief.</em>
        </h1>
        <p className="mt-6 text-[0.95rem] leading-[1.85] text-muted-warm max-w-[480px]">
          Hier kannst du anfangen zu schreiben — sicher, anonym, ohne Urteil.
          Dein erster Moment wartet.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/write"
            className="inline-flex items-center gap-2 bg-rose hover:bg-rose-deep text-cream px-7 py-4 text-[0.72rem] tracking-[0.18em] uppercase transition-colors"
          >
            <Feather className="h-3.5 w-3.5" strokeWidth={1.5} />
            Brief schreiben
          </Link>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 border border-rose/40 text-rose hover:bg-rose/10 px-7 py-4 text-[0.72rem] tracking-[0.18em] uppercase transition-colors no-underline"
          >
            <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />
            Briefe im Feed lesen
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AppHome;
