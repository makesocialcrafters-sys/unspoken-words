const Nav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-14 py-5 md:py-7 bg-cream/80 backdrop-blur-md">
      <a href="#" className="flex items-center gap-3 no-underline">
        <span className="font-serif text-base tracking-[0.2em] uppercase text-deep">
          Frauen<span className="text-rose">moment</span>
        </span>
      </a>

      <div className="flex items-center gap-9">
        <a href="#how" className="hidden md:inline text-[0.72rem] tracking-[0.15em] uppercase text-muted-warm hover:text-rose transition-colors">
          Wie es funktioniert
        </a>
        <a href="#feed" className="hidden md:inline text-[0.72rem] tracking-[0.15em] uppercase text-muted-warm hover:text-rose transition-colors">
          Feed
        </a>
        <a href="#preise" className="hidden md:inline text-[0.72rem] tracking-[0.15em] uppercase text-muted-warm hover:text-rose transition-colors">
          Preise
        </a>
        <a
          href="#cta"
          className="bg-deep text-cream px-5 md:px-7 py-3 text-[0.72rem] tracking-[0.15em] uppercase hover:bg-rose transition-colors"
        >
          Jetzt starten
        </a>
      </div>
    </nav>
  );
};

export default Nav;
