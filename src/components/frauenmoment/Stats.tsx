const stats = [
  {
    number: "1 von 3",
    text: "Frauen hat niemanden, dem sie wirklich alles sagen kann",
  },
  {
    number: "72%",
    text: "schlucken Dinge runter, um andere nicht zu belasten",
  },
  {
    number: "Jede 2.",
    text: "hat Briefe geschrieben, die sie nie abgeschickt hat",
  },
];

const Stats = () => {
  return (
    <section className="section px-14 py-[120px] max-md:px-6">
      <div className="reveal">
        <p className="section-label">In Zahlen</p>
        <h2 className="font-serif text-[clamp(2.4rem,3.5vw,3.8rem)] font-light leading-[1.15] max-w-[560px] mb-16">
          Worte die ungesagt bleiben.
        </h2>

        <div className="grid grid-cols-3 gap-14 max-md:grid-cols-1 max-md:gap-10">
          {stats.map((s, i) => (
            <div
              key={i}
              className="reveal pt-8 border-t border-blush"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="font-serif font-light text-rose leading-none mb-6 text-[5rem]">
                {s.number}
              </div>
              <p className="text-[0.95rem] leading-[1.85] text-muted-warm max-w-[280px]">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
