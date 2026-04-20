import { PenLine, MessageCircleHeart, Share2 } from "lucide-react";

const steps = [
  {
    num: "01",
    Icon: PenLine,
    title: "Schreib anonym",
    desc: "Kein Name. Kein Profil. Nur du und deine Worte — an wen auch immer du schreiben musst. Deine Mutter, dein Chef, dein früheres Ich.",
  },
  {
    num: "02",
    Icon: MessageCircleHeart,
    title: "Werde gehört",
    desc: "Frauenmoment antwortet — warm, ehrlich, ohne Urteil. Nicht wie eine App. Wie die Freundin die du dir immer gewünscht hast.",
  },
  {
    num: "03",
    Icon: Share2,
    title: "Teile wenn du willst",
    desc: 'Dein Brief erscheint anonym im Feed. Andere Frauen geben ein Herz — kein Kommentar, kein Urteil. Nur: "Ich kenne dieses Gefühl."',
  },
];

const HowItWorks = () => (
  <section id="how" className="px-6 md:px-14 py-24 md:py-32">
    <div className="section-label mb-4">Wie es funktioniert</div>
    <h2 className="font-serif text-[2.4rem] md:text-[3.8rem] leading-[1.15] max-w-[560px] mb-16 md:mb-20 text-balance">
      Drei Schritte.<br />
      <em className="italic text-rose">Eine Erleichterung.</em>
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
      {steps.map(({ num, Icon, title, desc }) => (
        <div key={num} className="reveal">
          <div className="font-serif text-[4.5rem] text-fog leading-none -mb-4">{num}</div>
          <div className="mb-4">
            <Icon className="w-7 h-7 text-rose" strokeWidth={1.25} />
          </div>
          <h3 className="font-serif text-[1.5rem] font-normal mb-3">{title}</h3>
          <p className="text-[0.88rem] leading-[1.85] text-muted-warm">{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
