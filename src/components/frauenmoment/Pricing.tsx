import { Check } from "lucide-react";

const PricingCard = ({
  plan,
  price,
  per,
  features,
  cta,
  featured,
  badge,
}: {
  plan: string;
  price: string;
  per: string;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}) => (
  <div
    className={`relative w-full md:min-w-[300px] md:max-w-[340px] p-12 text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--shadow-lift)] ${
      featured ? "bg-deep text-cream" : "bg-fog"
    }`}
  >
    {badge && (
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose text-cream text-[0.62rem] tracking-[0.2em] uppercase px-4 py-1.5 whitespace-nowrap">
        {badge}
      </div>
    )}
    <div className={`text-[0.68rem] tracking-[0.25em] uppercase mb-4 ${featured ? "text-blush" : "text-rose"}`}>
      {plan}
    </div>
    <div className={`font-serif text-[4.5rem] leading-none ${featured ? "text-cream" : "text-deep"}`}>
      {price}
    </div>
    <div className={`text-[0.72rem] mb-9 mt-1 ${featured ? "text-cream/45" : "text-muted-warm"}`}>
      {per}
    </div>

    <ul className="mb-10 list-none">
      {features.map((f) => (
        <li
          key={f}
          className={`text-[0.85rem] py-2.5 flex gap-3 items-start leading-[1.5] border-b ${
            featured ? "text-cream/65 border-white/10" : "text-muted-warm border-deep/10"
          }`}
        >
          <Check className="w-4 h-4 text-rose flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    <button
      className={`group relative overflow-hidden w-full py-4 text-[0.75rem] tracking-[0.15em] uppercase text-cream ${
        featured ? "bg-rose" : "bg-deep"
      }`}
    >
      <span className="relative z-10">{cta}</span>
      <span
        className={`absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out ${
          featured ? "bg-rose-deep" : "bg-rose"
        }`}
      />
    </button>
  </div>
);

const Pricing = () => (
  <section id="preise" className="px-6 md:px-14 py-24 md:py-32 text-center">
    <div className="section-label mb-4">Mitgliedschaft</div>
    <h2 className="font-serif text-[2.4rem] md:text-[3.8rem] leading-[1.15] mx-auto text-balance">
      Wähle deinen <em className="italic text-rose">Moment.</em>
    </h2>

    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-16">
      <PricingCard
        plan="Kostenlos"
        price="0€"
        per="für immer"
        features={[
          "3 Briefe pro Monat",
          "Antwort von Frauenmoment",
          "Anonymer Feed lesen",
          "Herzen vergeben",
        ]}
        cta="Kostenlos starten"
      />
      <PricingCard
        plan="Premium"
        price="9€"
        per="pro Monat · jederzeit kündbar"
        badge="Beliebt"
        featured
        features={[
          "Unlimitierte Briefe",
          "Frauenmoment kennt deine Geschichte",
          "Antwort als dein Zukunfts-Ich",
          "Priorität im Feed",
          "Private Briefe (nicht sichtbar)",
        ]}
        cta="Jetzt Premium starten"
      />
    </div>
  </section>
);

export default Pricing;
