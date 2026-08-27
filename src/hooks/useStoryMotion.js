import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sceneIndexFromProgress } from '../components/CrossDeviceStory/storyModel';

const DESKTOP_MOTION_QUERY = '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const FALLBACK_HEADER_HEIGHT = 76;
const STAGE_TOP_GAP = 16;

gsap.registerPlugin(useGSAP, ScrollTrigger);

function storyStageStart() {
  const measuredHeaderHeight = document.querySelector('.site-header')?.getBoundingClientRect().height;
  const headerHeight = measuredHeaderHeight || FALLBACK_HEADER_HEIGHT;
  return `top top+=${Math.round(headerHeight + STAGE_TOP_GAP)}`;
}

export function useStoryMotion({ rootRef, sceneCount, disabled, onSceneChange }) {
  useGSAP(() => {
    if (disabled || sceneCount < 1 || !rootRef.current) {
      return undefined;
    }

    const media = gsap.matchMedia();

    media.add(DESKTOP_MOTION_QUERY, () => {
      const root = rootRef.current;
      const stage = root?.querySelector('.cross-device-story__stage--shared');
      const pc = stage?.querySelector('.pc-console');
      const connectionLines = [...(stage?.querySelectorAll('.connection-flow__line-progress') ?? [])];
      const mascot = stage?.querySelector('.story-scene-mascot');
      const mobile = stage?.querySelector('.mobile-console');

      if (!root || !stage || !pc || connectionLines.length !== 3 || !mascot || !mobile) {
        return undefined;
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: storyStageStart,
          endTrigger: root,
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
        .to(connectionLines, { scaleX: 0.68, opacity: 0.62, duration: 1 }, 0)
        .to(mascot, { x: -14, y: -8, rotation: -6, scale: 0.92, duration: 1 }, 0)
        .to(pc, { scale: 0.97, y: 4, opacity: 0.74, duration: 1 }, 1)
        .to(mobile, { scale: 1.03, y: -8, opacity: 1, duration: 1 }, 1)
        .to(connectionLines, { scaleX: 1, opacity: 1, duration: 1 }, 1)
        .to(mascot, { x: 16, y: -14, rotation: 7, scale: 1.08, duration: 1 }, 1)
        .to(pc, { scale: 1, y: 0, opacity: 1, duration: 1 }, 2)
        .to(mobile, { scale: 1, y: 0, opacity: 1, duration: 1 }, 2)
        .to(connectionLines, { scaleX: 0.9, opacity: 0.86, duration: 1 }, 2)
        .to(mascot, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1 }, 2);

      return undefined;
    });

    return () => media.revert();
  }, {
    scope: rootRef,
    dependencies: [disabled, sceneCount, onSceneChange],
    revertOnUpdate: true
  });
}
