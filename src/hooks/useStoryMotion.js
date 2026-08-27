import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sceneIndexFromProgress } from '../components/CrossDeviceStory/storyModel';

const DESKTOP_MOTION_QUERY = '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useStoryMotion({ rootRef, sceneCount, disabled, onSceneChange }) {
  useGSAP(() => {
    if (disabled || sceneCount < 1 || !rootRef.current) {
      return undefined;
    }

    const media = gsap.matchMedia();

    media.add(DESKTOP_MOTION_QUERY, () => {
      const root = rootRef.current;
      const stage = root?.querySelector('.cross-device-story__stage');
      const pc = stage?.querySelector('.pc-console');
      const connection = stage?.querySelector('.connection-flow');
      const mobile = stage?.querySelector('.mobile-console');

      if (!root || !stage || !pc || !connection || !mobile) {
        return undefined;
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          pin: stage,
          pinSpacing: false,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: self => onSceneChange(sceneIndexFromProgress(self.progress, sceneCount))
        }
      });

      timeline
        .to(pc, { scale: 1.02, y: -8, opacity: 1, transformOrigin: 'center center', duration: 1 }, 0)
        .to(mobile, { scale: 0.96, y: 10, opacity: 0.78, transformOrigin: 'center center', duration: 1 }, 0)
        .to(connection, { opacity: 0.72, duration: 1 }, 0)
        .to(pc, { scale: 0.97, y: 4, opacity: 0.74, duration: 1 }, 1)
        .to(mobile, { scale: 1.03, y: -8, opacity: 1, duration: 1 }, 1)
        .to(connection, { opacity: 1, duration: 1 }, 1)
        .to(pc, { scale: 1, y: 0, opacity: 1, duration: 1 }, 2)
        .to(mobile, { scale: 1, y: 0, opacity: 1, duration: 1 }, 2)
        .to(connection, { opacity: 0.86, duration: 1 }, 2);

      return undefined;
    });

    return () => media.revert();
  }, {
    scope: rootRef,
    dependencies: [disabled, sceneCount, onSceneChange],
    revertOnUpdate: true
  });
}
