import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Feather } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Anmelden – Frauenmoment";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/onboarding", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/onboarding", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/onboarding`,
    });
    if (result.error) {
      toast.error("Anmeldung fehlgeschlagen.");
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    // Try sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError) {
      navigate("/onboarding", { replace: true });
      return;
    }

    // If invalid credentials, try sign up
    if (signInError.message.toLowerCase().includes("invalid")) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }
      toast.success("Konto erstellt. Bitte bestätige deine E-Mail.");
      setLoading(false);
      return;
    }

    toast.error(signInError.message);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-deep text-cream flex flex-col">
      {/* Top: logo */}
      <header className="px-6 md:px-14 py-7 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <Feather className="h-4 w-4 text-rose" strokeWidth={1.5} />
          <span className="font-serif text-base tracking-[0.2em] uppercase text-cream">
            Frauen<span className="text-rose">moment</span>
          </span>
        </Link>
      </header>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-10">
            <h1 className="font-serif text-[2.8rem] md:text-[3.4rem] leading-[1.05] text-cream text-balance">
              Dein sicherer Ort{" "}
              <em className="italic font-serif text-rose">wartet.</em>
            </h1>
            <p className="mt-5 text-[0.9rem] leading-relaxed text-cream/60">
              Anonym. Ohne Urteil. Nur für dich.
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-cream text-deep px-6 py-3.5 text-[0.78rem] tracking-[0.15em] uppercase hover:bg-blush transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google anmelden
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-cream/15" />
            <span className="text-[0.65rem] tracking-[0.25em] uppercase text-cream/50">oder</span>
            <div className="flex-1 h-px bg-cream/15" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="block text-[0.62rem] tracking-[0.22em] uppercase text-cream/55 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-cream/20 px-4 py-3 text-[0.95rem] text-cream placeholder:text-cream/30 focus:outline-none focus:border-rose transition-colors"
                placeholder="du@beispiel.de"
              />
            </div>
            <div>
              <label className="block text-[0.62rem] tracking-[0.22em] uppercase text-cream/55 mb-2">
                Passwort
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-cream/20 px-4 py-3 text-[0.95rem] text-cream placeholder:text-cream/30 focus:outline-none focus:border-rose transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden w-full bg-rose text-cream px-6 py-4 text-[0.78rem] tracking-[0.15em] uppercase mt-2 disabled:opacity-50"
            >
              <span className="relative z-10">
                {loading ? "Einen Moment…" : "Deinen ersten Moment schreiben"}
              </span>
              <span className="absolute inset-0 bg-rose-deep -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            </button>
          </form>

          <p className="mt-6 text-center text-[0.72rem] leading-relaxed text-cream/45">
            Dein Name bleibt anonym. Nur zur Sicherheit deines Kontos.
          </p>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
