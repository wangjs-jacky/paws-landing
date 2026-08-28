import { useEffect, useRef, useState } from 'react';
import MascotCard from './MascotCard';
import { getMascotCrew } from './mascotRegistry';

export default function MascotCrew({ copy }) {
  const mascots = getMascotCrew(copy);
  const sectionRef = useRef(null);
  const [loadImages, setLoadImages] = useState(() => (
    typeof window === 'undefined' || !('IntersectionObserver' in window)
  ));

  useEffect(() => {
    const section = sectionRef.current;
    if (loadImages || !section || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setLoadImages(true);
      observer.disconnect();
    }, { rootMargin: '800px 0px' });
    observer.observe(section);

    return () => observer.disconnect();
  }, [loadImages]);

  return (
    <section
      ref={sectionRef}
      id="paws-crew"
      className="mascot-crew"
      aria-label={copy.crewLabel}
      data-testid="mascot-crew"
      data-motion-section
    >
      <ol className="mascot-crew__rail" data-testid="mascot-crew-rail">
        {mascots.map(mascot => (
          <MascotCard key={mascot.id} mascot={mascot} loadImage={loadImages} />
        ))}
      </ol>
    </section>
  );
}
