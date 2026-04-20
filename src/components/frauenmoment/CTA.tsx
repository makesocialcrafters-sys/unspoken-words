const CTA = () => (
  <section id="cta" className="px-6 md:px-14 py-32 md:py-40 text-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[var(--gradient-glow)]" />

    <h2 className="font-serif text-[3rem] md:text-[6rem] xl:text-[6.5rem] leading-[1.08] relative z-10 mb-7 text-balance">
      Was würdest<br />
      du <em className="italic text-rose">schreiben?</em>
    </h2>
    <p className="text-[0.95rem] text-muted-warm max-w-[380px] mx-auto mb-12 leading-[1.85] relative z-10">
      Tausende Frauen tragen Worte die niemand hört. Du musst das nicht mehr
      alleine tragen.
    </p>
    <a
      href="#"
      className="group inline-block relative overflow-hidden bg-deep text-cream px-10 py-4 text-[0.78rem] tracking-[0.15em] uppercase z-10"
    >
      <span className="relative z-10">Deinen ersten Moment schreiben</span>
      <span className="absolute inset-0 bg-rose -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
    </a>
  </section>
);

export default CTA;
