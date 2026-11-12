import { useCallback, useEffect, useState } from "react";
import { MARQUEE_IMAGES } from "../data/content";

const Track = ({ hidden = false, onOpen }) => (
  <div aria-hidden={hidden} style={{ animationDuration: "60s" }}
    className="flex w-max shrink-0 animate-marquee gap-4 pr-4 group-hover:[animation-play-state:paused]">
    {MARQUEE_IMAGES.map((img, i) => (
      <button key={img.thumb} type="button" tabIndex={hidden ? -1 : 0} aria-label={`View photo ${i + 1}`} onClick={() => onOpen(i)}
        className="h-44 w-72 shrink-0 cursor-zoom-in overflow-hidden rounded-lg sm:h-56 sm:w-96">
        <img src={img.thumb} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
      </button>
    ))}
  </div>
);

function Lightbox({ index, onClose, onStep }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  const btn = "absolute flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition-colors hover:bg-white/30";
  return (
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" data-testid="lightbox" onClick={onClose}
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10">
      <img src={MARQUEE_IMAGES[index].full} alt="" onClick={(e) => e.stopPropagation()}
           className="max-h-full max-w-full rounded-md object-contain shadow-2xl" />
      <button type="button" aria-label="Close" onClick={onClose} className={`${btn} right-4 top-4`}>×</button>
      {MARQUEE_IMAGES.length > 1 && (
        <>
          <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); onStep(-1); }} className={`${btn} left-3 top-1/2 -translate-y-1/2 sm:left-6`}>‹</button>
          <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); onStep(1); }} className={`${btn} right-3 top-1/2 -translate-y-1/2 sm:right-6`}>›</button>
        </>
      )}
    </div>
  );
}

export default function Marquee() {
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d) => setOpen((i) => (i + d + MARQUEE_IMAGES.length) % MARQUEE_IMAGES.length), []);

  return (
    <section data-testid="marquee" className="group overflow-hidden border-y hairline bg-white py-8">
      <div className="flex">
        <Track onOpen={setOpen} />
        <Track hidden onOpen={setOpen} />
      </div>
      {open !== null && <Lightbox index={open} onClose={close} onStep={step} />}
    </section>
  );
}
