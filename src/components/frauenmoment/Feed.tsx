import { Heart } from "lucide-react";
import { useState } from "react";

const items = [
  { to: "An meinen Chef", text: '"Was du letzten Dienstag gesagt hast hat mich innerlich zerbrochen. Aber ich bin nicht zerbrochen."', city: "Berlin", hearts: 312 },
  { to: "An meine beste Freundin", text: '"Ich vermisse uns. Bevor alles kompliziert wurde. Bevor wir aufgehört haben, ehrlich zu sein."', city: "Wien", hearts: 208 },
  { to: "An mich selbst", text: '"Du musst nicht alles kontrollieren. Du darfst auch einfach mal fallen lassen und atmen."', city: "München", hearts: 441 },
  { to: "An meinen Ex", text: '"Ich hoffe du weißt, wie lange ich gebraucht habe, um wieder ich selbst zu sein."', city: "Hamburg", hearts: 389 },
  { to: "An die Gesellschaft", text: '"Ich bin müde davon, mich kleiner zu machen damit andere sich größer fühlen können."', city: "Köln", hearts: 527 },
  { to: "An meine Tochter", text: '"Ich hoffe du wächst in einer Welt auf, die dich sieht — so wie du wirklich bist."', city: "Graz", hearts: 176 },
];

const FeedCard = ({ item }: { item: (typeof items)[number] }) => {
  const [liked, setLiked] = useState(false);
  const count = item.hearts + (liked ? 1 : 0);

  return (
    <article className="bg-cream/[0.03] border border-blush/10 p-8 transition-all duration-300 hover:border-blush/25 hover:bg-cream/[0.06] hover:-translate-y-1">
      <div className="micro-label text-blush mb-4">{item.to}</div>
      <p className="font-serif italic text-[1.1rem] leading-[1.75] text-cream mb-5">
        {item.text}
      </p>
      <div className="flex justify-between items-center text-[0.68rem] text-cream/25">
        <span>anonym · {item.city}</span>
        <button
          onClick={() => setLiked((v) => !v)}
          className="flex items-center gap-1.5 text-blush hover:scale-110 transition-transform"
          aria-label="Herz vergeben"
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={liked ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
          {count}
        </button>
      </div>
    </article>
  );
};

const Feed = () => (
  <section id="feed" className="bg-deep px-6 md:px-14 py-24 md:py-32">
    <div className="section-label text-blush mb-4">Der Frauenmoment Feed</div>
    <h2 className="font-serif text-cream text-[2.4rem] md:text-[3.8rem] leading-[1.15] max-w-[560px] mb-16 md:mb-20 text-balance">
      Worte die Frauen<br />
      <em className="italic text-blush">endlich aussprechen.</em>
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((it) => (
        <FeedCard key={it.to} item={it} />
      ))}
    </div>
  </section>
);

export default Feed;
