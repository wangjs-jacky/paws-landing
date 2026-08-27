import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const DESKTOP_REVEAL_QUERY = '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function usePageMotion(rootRef) {
  useGSAP(() => {
    if (!rootRef.current) return undefined;

    const media = gsap.matchMedia();

    media.add(DESKTOP_REVEAL_QUERY, () => {
      const sections = gsap.utils.toArray('[data-motion-section]', rootRef.current);

      sections.forEach(section => {
        const items = [...section.querySelectorAll('[data-motion-item]')];
        const packet = section.querySelector('[data-architecture-packet]');
        if (items.length === 0 && !packet) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            once: true
          }
        });

        if (items.length > 0) {
          timeline.from(items, {
            y: 36,
            opacity: 0,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power3.out'
          }, 0);
        }

        if (packet) {
          timeline.from(packet, {
            xPercent: -320,
            opacity: 0,
            duration: 0.85,
            ease: 'power2.out'
          }, 0.22);
        }
      });

      return undefined;
    });

    return () => media.revert();
  }, { scope: rootRef });
}
