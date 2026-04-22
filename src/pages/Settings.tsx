import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Feather, Lock, Download, LogOut, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AGE_GROUPS = ["Unter 18", "18–25", "26–35", "36+"] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

const initialsFrom = (name: string | null | undefined, email: string | null | undefined) => {
  const base = (name || email || "").replace(/@.*$/, "");
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (letters || base.slice(0, 2) || "··").toUpperCase();
};

// --- Local primitives styled to match the Write/dark Frauenmoment theme --------
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    className="mb-6"
    style={{
      fontSize: "0.62rem",
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: "#C4785A",
    }}
  >
    {children}
  </p>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label
    className="block mb-2"
    style={{
      fontSize: "0.65rem",
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: "#9A8880",
    }}
  >
    {children}
  </label>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={
      "w-full bg-transparent border-0 border-b py-2 outline-none transition-colors " +
      "font-serif text-[1rem] " +
      (props.className ?? "")
    }
    style={{
      color: "#FAF7F2",
      borderBottomColor: "rgba(232,196,184,0.15)",
      caretColor: "#C4785A",
      fontStyle: "italic",
      ...(props.style ?? {}),
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderBottomColor = "#C4785A";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderBottomColor = "rgba(232,196,184,0.15)";
      props.onBlur?.(e);
    }}
  />
);

const Chip = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-2 font-serif italic text-[0.95rem] transition-colors"
    style={{
      border: active ? "1px solid #C4785A" : "1px solid rgba(232,196,184,0.15)",
      background: active ? "rgba(196,120,90,0.12)" : "transparent",
      color: active ? "#FAF7F2" : "#9A8880",
    }}
  >
    {children}
  </button>
);

const Toggle = ({
  checked,
  onChange,
  disabled,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  title?: string;
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    aria-pressed={checked}
    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
    style={{
      background: checked ? "#C4785A" : "rgba(232,196,184,0.15)",
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    <span
      className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
      style={{
        transform: checked ? "translateX(22px)" : "translateX(2px)",
      }}
    />
  </button>
);

const ToggleRow = ({
  label,
  checked,
  onChange,
  disabled,
  hint,
  title,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
  title?: string;
}) => (
  <div className="flex items-center justify-between gap-6 py-3" title={title}>
    <div className="flex-1 min-w-0">
      <p className="font-serif text-[1.05rem]" style={{ color: "#FAF7F2" }}>
        {label}
      </p>
      {hint && (
        <p className="mt-1 text-[0.78rem]" style={{ color: "#9A8880" }}>
          {hint}
        </p>
      )}
    </div>
    <Toggle
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      title={title}
    />
  </div>
);

const RoseButton = ({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className="inline-flex items-center gap-2 px-7 py-3 transition-opacity disabled:opacity-50"
    style={{
      background: "#C4785A",
      color: "white",
      fontSize: "0.72rem",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </button>
);

const GhostButton = ({
  children,
  onClick,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={"inline-flex items-center gap-2 px-5 py-3 transition-colors " + className}
    style={{
      border: "1px solid rgba(232,196,184,0.2)",
      background: "transparent",
      color: "#9A8880",
      fontSize: "0.7rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </button>
);

const Divider = () => (
  <div
    style={{
      height: 1,
      background: "rgba(232,196,184,0.08)",
      margin: "60px 0",
    }}
  />
);

// --- Modal ---------------------------------------------------------------------
const Modal = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.7)", animation: "fadeIn 0.25s ease" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-8 relative"
        style={{
          background: "#1A1210",
          border: "1px solid rgba(196,120,90,0.4)",
          animation: "fadeUp 0.3s ease",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ color: "#9A8880" }}
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
        <h3
          className="font-serif italic text-[1.6rem] mb-5"
          style={{ color: "#FAF7F2" }}
        >
          {title}
        </h3>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
};

// --- Page ----------------------------------------------------------------------
type Plan = "Gratis" | "Basis" | "Premium";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Profile fields
  const [nickname, setNickname] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [city, setCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Privacy
  const [showInFeedDefault, setShowInFeedDefault] = useState(false);

  // Notifications
  const [nWeekly, setNWeekly] = useState(true);
  const [nHeart, setNHeart] = useState(true);
  const [nUpdates, setNUpdates] = useState(false);

  // Loading state for initial data
  const [loaded, setLoaded] = useState(false);

  // Modals
  const [pwOpen, setPwOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Plan (placeholder until billing is wired)
  const plan = "Gratis" as Plan;
  const lettersUsed = 1;
  const lettersLimit = 3;
  const nextBilling: string | null = null;

  useEffect(() => {
    document.title = "Einstellungen – Frauenmoment";
  }, []);

  // Load profile
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "nickname, age_group, city, show_in_feed_default, notify_weekly_reminder, notify_letter_heart, notify_product_updates",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setNickname(data.nickname ?? "");
        setAgeGroup((data.age_group as AgeGroup) ?? null);
        setCity(data.city ?? "");
        setShowInFeedDefault(!!data.show_in_feed_default);
        setNWeekly(data.notify_weekly_reminder ?? true);
        setNHeart(data.notify_letter_heart ?? true);
        setNUpdates(data.notify_product_updates ?? false);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const initials = useMemo(
    () =>
      initialsFrom(
        (user?.user_metadata?.full_name as string) ??
          (user?.user_metadata?.name as string) ??
          nickname,
        user?.email,
      ),
    [user, nickname],
  );

  // --- Saves -------------------------------------------------------------------
  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: nickname.trim() || null,
        age_group: ageGroup,
        city: city.trim() || null,
      })
      .eq("user_id", user.id);
    setSavingProfile(false);
    if (error) {
      toast.error("Konnte nicht gespeichert werden.");
      return;
    }
    toast.success("Gespeichert");
  };

  const saveField = async (
    fields: Partial<{
      show_in_feed_default: boolean;
      notify_weekly_reminder: boolean;
      notify_letter_heart: boolean;
      notify_product_updates: boolean;
    }>,
  ) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(fields)
      .eq("user_id", user.id);
    if (error) toast.error("Speichern fehlgeschlagen.");
    else toast.success("Gespeichert");
  };

  // --- Auth actions ------------------------------------------------------------
  const sendPasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    if (error) toast.error("Konnte E-Mail nicht senden.");
    else toast.success("E-Mail gesendet. Schau in deinen Posteingang.");
  };

  const signOutNow = async () => {
    await supabase.auth.signOut();
    navigate("/signin", { replace: true });
  };

  const downloadLetters = () => {
    // Letters table not yet implemented — graceful placeholder.
    toast("Diese Funktion kommt bald.");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Löschen fehlgeschlagen");
      }
      await supabase.auth.signOut();
      toast.success("Dein Konto wurde gelöscht.");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
      setDelOpen(false);
    }
  };

  if (authLoading || !loaded) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#1A1210" }}
      >
        <div className="font-serif italic" style={{ color: "#9A8880" }}>
          Lade…
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen relative"
      style={{ background: "#1A1210", color: "#FAF7F2", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute"
          style={{
            width: 600,
            height: 600,
            top: -100,
            right: -100,
            background:
              "radial-gradient(circle, rgba(196,120,90,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6"
        style={{
          borderBottom: "1px solid rgba(232,196,184,0.06)",
          backdropFilter: "blur(12px)",
          background: "rgba(26,18,16,0.75)",
        }}
      >
        <Link to="/app" className="flex items-center gap-2.5 no-underline">
          <Feather className="h-4 w-4" style={{ color: "#C4785A" }} strokeWidth={1.5} />
          <span
            className="font-serif uppercase"
            style={{
              fontSize: "1.1rem",
              letterSpacing: "0.18em",
              color: "#FAF7F2",
              fontWeight: 300,
            }}
          >
            Frauen<span style={{ color: "#C4785A" }}>moment</span>
          </span>
        </Link>
        <div
          title={user?.email ?? ""}
          className="h-8 w-8 rounded-full flex items-center justify-center text-[0.75rem]"
          style={{ background: "#C4785A", color: "white", letterSpacing: "0.05em" }}
        >
          {initials}
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-[680px] mx-auto px-6 pt-[140px] pb-24">
        <h1
          className="font-serif italic"
          style={{ fontSize: "3rem", lineHeight: 1.1, color: "#FAF7F2" }}
        >
          Einstellungen
        </h1>
        <p className="mt-3 text-[0.95rem]" style={{ color: "#9A8880" }}>
          Dein Raum. Deine Regeln.
        </p>

        <Divider />

        {/* SECTION 1 — PROFIL */}
        <section>
          <SectionLabel>Profil</SectionLabel>

          <div className="mb-7">
            <FieldLabel>Nickname</FieldLabel>
            <TextInput
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Wie sollen wir dich nennen?"
            />
          </div>

          <div className="mb-7">
            <FieldLabel>Altersgruppe</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((g) => (
                <Chip key={g} active={ageGroup === g} onClick={() => setAgeGroup(g)}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mb-7">
            <FieldLabel>Wohnort</FieldLabel>
            <TextInput
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Stadt oder Region"
            />
          </div>

          <RoseButton onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? "Speichert…" : "Speichern"}
          </RoseButton>
        </section>

        <Divider />

        {/* SECTION 2 — ABO & ZAHLUNG */}
        <section>
          <SectionLabel>Abo & Zahlung</SectionLabel>

          <div className="flex items-center gap-3 mb-5">
            <span
              className="px-3 py-1 font-serif italic text-[0.95rem]"
              style={{
                border: "1px solid #C4785A",
                background: "rgba(196,120,90,0.1)",
                color: "#FAF7F2",
              }}
            >
              {plan}
            </span>
            <span style={{ color: "#9A8880", fontSize: "0.85rem" }}>
              {lettersUsed} von {lettersLimit} Briefen diesen Monat
            </span>
          </div>

          {plan === "Premium" ? (
            <>
              {nextBilling && (
                <p className="mb-4" style={{ color: "#9A8880", fontSize: "0.85rem" }}>
                  Nächste Abrechnung am {nextBilling}
                </p>
              )}
              <GhostButton onClick={() => toast("Bald verfügbar.")}>
                Abo verwalten
              </GhostButton>
            </>
          ) : (
            <RoseButton onClick={() => toast("Upgrade kommt bald.")}>
              Upgrade
            </RoseButton>
          )}
        </section>

        <Divider />

        {/* SECTION 3 — PRIVATSPHÄRE & SICHERHEIT */}
        <section>
          <SectionLabel>Privatsphäre & Sicherheit</SectionLabel>

          <ToggleRow
            label="Meine Briefe standardmäßig im Feed anzeigen"
            checked={showInFeedDefault}
            onChange={(v) => {
              setShowInFeedDefault(v);
              saveField({ show_in_feed_default: v });
            }}
          />
          <ToggleRow
            label="Anonym bleiben"
            checked={true}
            onChange={() => {}}
            disabled
            title="Dein Name wird nie gezeigt"
            hint="Dein Name wird nie gezeigt"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <GhostButton onClick={() => setPwOpen(true)}>
              <Lock className="h-3.5 w-3.5" />
              Passwort ändern
            </GhostButton>
            <GhostButton onClick={sendPasswordReset}>
              Passwort vergessen?
            </GhostButton>
            <GhostButton onClick={downloadLetters}>
              <Download className="h-3.5 w-3.5" />
              Alle meine Briefe herunterladen
            </GhostButton>
          </div>
        </section>

        <Divider />

        {/* SECTION 4 — BENACHRICHTIGUNGEN */}
        <section>
          <SectionLabel>Benachrichtigungen</SectionLabel>
          <ToggleRow
            label="Wöchentliche Erinnerung per E-Mail"
            checked={nWeekly}
            onChange={(v) => {
              setNWeekly(v);
              saveField({ notify_weekly_reminder: v });
            }}
          />
          <ToggleRow
            label="Wenn mein Brief ein Herz bekommt"
            checked={nHeart}
            onChange={(v) => {
              setNHeart(v);
              saveField({ notify_letter_heart: v });
            }}
          />
          <ToggleRow
            label="Neue Features & Updates"
            checked={nUpdates}
            onChange={(v) => {
              setNUpdates(v);
              saveField({ notify_product_updates: v });
            }}
          />
        </section>

        <Divider />

        {/* SECTION 5 — KONTO */}
        <section>
          <SectionLabel>Konto</SectionLabel>
          <div className="flex flex-col gap-4 items-start">
            <GhostButton onClick={signOutNow}>
              <LogOut className="h-3.5 w-3.5" />
              Abmelden
            </GhostButton>
            <button
              onClick={() => setDelOpen(true)}
              className="inline-flex items-center gap-2 mt-4 transition-opacity hover:opacity-80"
              style={{
                color: "#C4785A",
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                background: "transparent",
                border: "none",
                padding: 0,
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Konto löschen
            </button>
          </div>
        </section>

        {/* Footer */}
        <p
          className="mt-20 text-center"
          style={{ color: "#9A8880", fontSize: "0.7rem", opacity: 0.7 }}
        >
          Frauenmoment · Version 1.0
        </p>
      </div>

      {/* Password modal */}
      <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />

      {/* Delete confirmation modal */}
      <Modal open={delOpen} onClose={() => !deleting && setDelOpen(false)} title="Bist du sicher?">
        <p className="mb-7 leading-relaxed" style={{ color: "#9A8880", fontSize: "0.95rem" }}>
          Alle deine Briefe, Herzen und dein Profil werden dauerhaft gelöscht. Das kann nicht rückgängig
          gemacht werden.
        </p>
        <div className="flex justify-end gap-3">
          <GhostButton onClick={() => setDelOpen(false)}>Abbrechen</GhostButton>
          <button
            disabled={deleting}
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-2 px-5 py-3 transition-opacity disabled:opacity-50"
            style={{
              background: "#C4785A",
              color: "white",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {deleting ? "Lösche…" : "Ja, Konto löschen"}
          </button>
        </div>
      </Modal>
    </main>
  );
};

// --- Password change modal -----------------------------------------------------
const PasswordModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }, [open]);

  const submit = async () => {
    if (!current || !next || !confirm) {
      toast.error("Bitte fülle alle Felder aus.");
      return;
    }
    if (next !== confirm) {
      toast.error("Die neuen Passwörter stimmen nicht überein.");
      return;
    }
    if (next.length < 8) {
      toast.error("Mindestens 8 Zeichen.");
      return;
    }
    setBusy(true);
    // Re-authenticate by signing in with current password
    const { data: sess } = await supabase.auth.getSession();
    const email = sess.session?.user.email;
    if (!email) {
      setBusy(false);
      toast.error("Nicht eingeloggt.");
      return;
    }
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (signErr) {
      setBusy(false);
      toast.error("Aktuelles Passwort ist falsch.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Passwort geändert.");
    onClose();
  };

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title="Passwort ändern">
      <div className="space-y-5 mb-7">
        <div>
          <FieldLabel>Aktuelles Passwort</FieldLabel>
          <TextInput
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Neues Passwort</FieldLabel>
          <TextInput
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Neues Passwort bestätigen</FieldLabel>
          <TextInput
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <GhostButton onClick={onClose}>Abbrechen</GhostButton>
        <RoseButton onClick={submit} disabled={busy}>
          {busy ? "Speichert…" : "Ändern"}
        </RoseButton>
      </div>
    </Modal>
  );
};

export default Settings;
