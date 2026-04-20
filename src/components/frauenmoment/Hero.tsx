const LetterCard = ({
  to,
  text,
  foot,
  className,
  delay,
}: {
  to: string;
  text: string;
  foot: string;
  className: string;
  delay: string;
}) => (
  <article
    className={`absolute bg-card p-7 max-w-[290px] shadow-[var(--shadow-letter)] animate-float-in ${className}`}
    style={{ animationDelay: delay }}
  >
    <div className="micro-label text-rose mb-2.5">{to}</div>
    <p className="font-serif text-[1.05rem] italic leading-[1.7] text-deep">
      {text}
    </p>
    <div className="mt-3.5 text-[0.65rem] text-muted-warm flex items-center gap-1.5">
      <span className="text-rose">♥</span> {foot}
    </div>
  </article>
);

const Hero = () => {
  return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
      {/* Left */}
      <div className="flex flex-col justify-center px-6 md:px-14 pt-36 pb-20 relative z-10">
        <div className="eyebrow mb-7 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          Für Frauen &amp; Schülerinnen · Deutschland &amp; Österreich
        </div>

        <h1
          className="font-serif text-[3.8rem] md:text-[5.5rem] xl:text-[6.5rem] leading-[1.04] text-deep animate-fade-up text-balance"
          style={{ animationDelay: '0.5s' }}
        >
          Schreib was<br />
          du nie sagen<br />
          <em className="not-italic font-serif italic text-rose">konntest.</em>
        </h1>

        <p
          className="mt-7 text-[0.95rem] leading-[1.85] text-muted-warm max-w-[360px] animate-fade-up"
          style={{ animationDelay: '0.7s' }}
        >
          Ein anonymer Ort für ungesendete Briefe, unausgesprochene Gedanken
          und Momente die dich tragen. Du wirst gehört.
        </p>

        <div
          className="mt-12 flex items-center gap-7 animate-fade-up"
          style={{ animationDelay: '0.9s' }}
        >
          <a
            href="#cta"
            className="group relative overflow-hidden bg-deep text-cream px-9 py-4 text-[0.78rem] tracking-[0.15em] uppercase"
          >
            <span className="relative z-10">Deinen Moment schreiben</span>
            <span className="absolute inset-0 bg-rose -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          </a>
          <a
            href="#how"
            className="text-[0.78rem] text-muted-warm tracking-[0.1em] border-b border-blush pb-0.5 hover:text-rose hover:border-rose transition-colors"
          >
            Mehr erfahren
          </a>
        </div>
      </div>

      {/* Right */}
      <div className="hidden lg:block relative overflow-hidden bg-fog">
        <div className="absolute left-0 top-[15%] bottom-[15%] w-px bg-[var(--gradient-line)]" />

        <LetterCard
          to="An meine Mutter"
          text='"Ich wünschte, du hättest mir öfter gesagt, dass ich genug bin."'
          foot="247 Frauen haben sich erkannt"
          className="top-[18%] left-[8%]"
          delay="1.0s"
        />
        <LetterCard
          to="An mein 16-jähriges Ich"
          text='"Hör auf, dich kleiner zu machen als du bist."'
          foot="183 Frauen haben sich erkannt"
          className="top-[46%] left-[22%]"
          delay="1.3s"
        />
        <LetterCard
          to="An die Stille"
          text='"Manchmal fühle ich mich unsichtbar, obwohl ich jeden Tag lächle."'
          foot="94 Frauen haben sich erkannt"
          className="top-[70%] left-[6%]"
          delay="1.6s"
        />
      </div>
    </section>
  );
};

export default Hero;
