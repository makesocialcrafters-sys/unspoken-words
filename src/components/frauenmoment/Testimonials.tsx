const testimonials = [
  {
    text: '"Ich habe meiner Mutter nie sagen können wie verletzt ich war. Hier habe ich es zum ersten Mal geschrieben — und danach konnte ich endlich schlafen."',
    name: "Lena, 24 · Studentin · Wien",
  },
  {
    text: '"Als Schülerin fühlt man sich oft allein mit allem. Frauenmoment hat mir gezeigt: andere Mädchen fühlen genau das gleiche."',
    name: "Sara, 17 · Schülerin · Berlin",
  },
  {
    text: '"Ich dachte ich brauche eine Therapie. Manchmal brauche ich einfach nur einen Ort wo ich schreiben kann ohne Konsequenzen zu fürchten."',
    name: "Mira, 31 · Berufstätig · München",
  },
  {
    text: '"Der Feed hat mich zum Weinen gebracht — nicht aus Trauer. Sondern weil ich endlich nicht mehr allein damit war."',
    name: "Yasmin, 22 · Studentin · Hamburg",
  },
];

const Testimonials = () => (
  <section className="px-6 md:px-14 py-24 md:py-32 bg-fog">
    <div className="section-label mb-4">Stimmen</div>
    <h2 className="font-serif text-[2.4rem] md:text-[3.8rem] leading-[1.15] max-w-[560px] text-balance">
      Was Frauen <em className="italic text-rose">sagen.</em>
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
      {testimonials.map((t) => (
        <article key={t.name} className="bg-card p-10 md:p-11 relative">
          <span
            className="absolute top-5 left-8 font-serif text-[5rem] text-blush leading-none opacity-50 select-none"
            aria-hidden
          >
            "
          </span>
          <p className="font-serif italic text-[1.15rem] leading-[1.8] text-deep mt-8">
            {t.text}
          </p>
          <div className="mt-5 text-[0.68rem] tracking-[0.2em] uppercase text-rose">
            {t.name}
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default Testimonials;
