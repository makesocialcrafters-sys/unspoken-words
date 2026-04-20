const QuoteBand = () => (
  <section className="bg-deep px-6 md:px-14 py-14 text-center relative overflow-hidden">
    <div className="absolute inset-3 border border-blush/10 pointer-events-none" />
    <p className="font-serif italic text-[1.6rem] md:text-[2.6rem] leading-[1.4] text-cream">
      "Jede Frau trägt Worte in sich,{' '}
      <span className="not-italic text-blush">die gehört werden wollen.</span>"
    </p>
    <div className="mt-4 text-[0.65rem] tracking-[0.28em] uppercase text-muted-warm">
      — Die Idee hinter Frauenmoment
    </div>
  </section>
);

export default QuoteBand;
