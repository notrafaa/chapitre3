// ===========================================================================
//  VisionWords — Imaginer · Construire · Publier.
//  Cartes éditoriales sans images ni pictogrammes.
// ===========================================================================

const WORDS = [
  {
    word: "Imaginer",
    text: "Trouver une idée nette, étrange, mémorable. Une direction que l’on reconnaît avant même de savoir la nommer.",
  },
  {
    word: "Construire",
    text: "Donner une forme réelle à l’idée. Design, produit, détails, rythme : tout doit tenir debout.",
  },
  {
    word: "Publier",
    text: "Faire sortir le projet du carnet. Le lancer, le montrer, lui donner une présence et une audience.",
  },
] as const;

export function VisionWords() {
  return (
    <div className="vision-grid grid grid-cols-1 divide-y divide-ink-800/60 overflow-hidden rounded-xl border border-ink-800/70 bg-ink-950 md:grid-cols-3 md:divide-x md:divide-y-0">
      {WORDS.map((item, i) => (
        <article
          key={item.word}
          className="vision-card group relative min-h-[17rem] overflow-hidden bg-ink-950 p-6 transition-all duration-500 ease-book hover:-translate-y-1 hover:bg-ink-900/40 sm:min-h-[22rem] sm:p-8"
        >
          <span
            aria-hidden
            className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-paper/45 via-paper/10 to-transparent opacity-80"
          />
          <span
            aria-hidden
            className="absolute -right-6 -top-8 font-display text-[11rem] font-bold leading-none text-paper/[0.035] transition-transform duration-700 group-hover:translate-y-2 group-hover:text-paper/[0.06] sm:text-[13rem]"
          >
            0{i + 1}
          </span>
          <span className="font-mono text-sm text-ink-500">0{i + 1}</span>

          <div className="relative z-10 mt-24">
            <h3 className="headline-gradient font-display text-5xl font-bold leading-none sm:text-6xl md:text-5xl lg:text-6xl">
              {item.word}
            </h3>
            <p className="mt-7 font-serif text-2xl italic leading-snug text-ink-100 md:text-xl lg:text-2xl">
              {item.text}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
