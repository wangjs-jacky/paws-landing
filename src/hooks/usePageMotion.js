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
        const track = section.querySelector('[data-architecture-track]');
        const packet = section.querySelector('[data-architecture-packet]');
        const nodes = track && packet
          ? [...section.querySelectorAll('[data-architecture-node]')]
          : [];
        const items = [...section.querySelectorAll('[data-motion-item]')]
          .filter(item => !nodes.includes(item));
        if (items.length === 0 && nodes.length === 0 && !packet) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            once: true,
            invalidateOnRefresh: true
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

        if (packet && track) {
          timeline.from(packet, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.out'
          }, 0.2);
          timeline.to(packet, {
            x: () => Math.max(0, track.clientWidth - packet.offsetWidth),
            duration: 1.2,
            ease: 'none'
          }, 0.2);

          const nodeInterval = nodes.length > 1 ? 1.2 / (nodes.length - 1) : 0;
          nodes.forEach((node, index) => {
            const arrivalPosition = Number((0.2 + nodeInterval * index).toFixed(2));
            timeline.from(node, {
              y: 18,
              opacity: 0,
              duration: 0.28,
              ease: 'power2.out'
            }, arrivalPosition);
          });
        }
      });

      return undefined;
    });

    return () => media.revert();
  }, { scope: rootRef });
}
