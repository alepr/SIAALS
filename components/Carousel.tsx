import React, { useEffect, useCallback, useState } from 'react';

interface CarouselProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

const Carousel: React.FC<CarouselProps> = ({ images, startIndex = 0, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const prev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') onClose();
  }, [next, prev, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onKey]);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80">
      <button aria-label="Cerrar" onClick={onClose} className="absolute top-4 right-4 text-white p-2 rounded-md hover:bg-white/10">✕</button>

      <button aria-label="Anterior" onClick={prev} className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-md">◀</button>
      <div className="max-w-[95vw] max-h-[90vh] w-full flex items-center justify-center">
        <img
          src={images[index]}
          alt={`Plan ${index + 1}`}
          className="object-contain max-w-full max-h-full rounded shadow-lg"
        />
      </div>
      <button aria-label="Siguiente" onClick={next} className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-md">▶</button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            className={`w-12 h-8 overflow-hidden rounded border ${i === index ? 'border-white' : 'border-white/30'}`}
          >
            <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
