import { useRef } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { usePageMotion } from '../src/hooks/usePageMotion';

const motionMocks = vi.hoisted(() => ({
  mediaAdd: vi.fn(),
  mediaRevert: vi.fn(),
  matchMedia: vi.fn(),
  registerPlugin: vi.fn(),
  timelines: [],
  useGSAPConfigs: []
}));

vi.mock('gsap', () => ({
  default: {
    matchMedia: motionMocks.matchMedia,
    registerPlugin: motionMocks.registerPlugin,
    timeline(config) {
      const timeline = {
        config,
        from: vi.fn(function from() { return timeline; }),
        to: vi.fn(function to() { return timeline; })
      };
      motionMocks.timelines.push(timeline);
      return timeline;
    },
    utils: {
      toArray(selector, scope) {
        return [...scope.querySelectorAll(selector)];
      }
    }
  }
}));

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }));

vi.mock('@gsap/react', async () => {
  const { useEffect } = await import('react');
  return {
    useGSAP(setup, config) {
      motionMocks.useGSAPConfigs.push(config);
      useEffect(setup, []);
    }
  };
});

function Harness() {
  const rootRef = useRef(null);
  usePageMotion(rootRef);

  return (
    <main ref={rootRef}>
      <section data-motion-section>
        <h2 data-motion-item>Proof</h2>
        <article data-motion-item>Case</article>
      </section>
      <section data-motion-section>
        <article data-motion-item>Crew</article>
      </section>
      <section data-motion-section>
        <h2 data-motion-item>Architecture</h2>
        <ol>
          {['clients', 'relay', 'daemon', 'agents'].map(nodeId => (
            <li data-motion-item data-architecture-node={nodeId} key={nodeId}>{nodeId}</li>
          ))}
        </ol>
        <div data-architecture-track aria-hidden="true">
          <span data-architecture-packet />
        </div>
      </section>
    </main>
  );
}

beforeEach(() => {
  motionMocks.timelines.length = 0;
  motionMocks.useGSAPConfigs.length = 0;
  for (const mock of [
    motionMocks.mediaAdd,
    motionMocks.mediaRevert,
    motionMocks.matchMedia,
    motionMocks.registerPlugin
  ]) mock.mockReset();

  motionMocks.mediaAdd.mockImplementation((_query, setup) => setup());
  motionMocks.matchMedia.mockReturnValue({
    add: motionMocks.mediaAdd,
    revert: motionMocks.mediaRevert
  });
});

it('creates at most one scoped reveal timeline per marked section and reverts its media context', () => {
  const { container, unmount } = render(<Harness />);
  const sections = [...container.querySelectorAll('[data-motion-section]')];

  expect(motionMocks.mediaAdd).toHaveBeenCalledWith(
    '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    expect.any(Function)
  );
  expect(motionMocks.useGSAPConfigs.at(-1)).toMatchObject({
    scope: { current: container.querySelector('main') }
  });
  expect(motionMocks.timelines).toHaveLength(sections.length);

  motionMocks.timelines.forEach((timeline, index) => {
    expect(timeline.config.scrollTrigger).toMatchObject({
      trigger: sections[index],
      start: 'top 82%',
      once: true,
      invalidateOnRefresh: true
    });
    expect(timeline.from).toHaveBeenCalled();
    for (const [, animation] of timeline.from.mock.calls) {
      expect(animation).toEqual(expect.objectContaining({ opacity: 0 }));
      for (const layoutProperty of ['width', 'height', 'top', 'left']) {
        expect(animation).not.toHaveProperty(layoutProperty);
      }
    }
  });

  const architectureTimeline = motionMocks.timelines[2];
  const track = container.querySelector('[data-architecture-track]');
  const packet = container.querySelector('[data-architecture-packet]');
  const nodes = [...container.querySelectorAll('[data-architecture-node]')];
  Object.defineProperty(track, 'clientWidth', { configurable: true, value: 640 });
  Object.defineProperty(packet, 'offsetWidth', { configurable: true, value: 16 });

  expect(architectureTimeline.to).toHaveBeenCalledOnce();
  const [packetTarget, packetAnimation, packetPosition] = architectureTimeline.to.mock.calls[0];
  expect(packetTarget).toBe(packet);
  expect(packetAnimation).toMatchObject({ x: expect.any(Function), duration: 1.2, ease: 'none' });
  expect(packetAnimation.x()).toBe(624);
  expect(packetPosition).toBe(0.2);

  const nodeCalls = architectureTimeline.from.mock.calls.filter(([target]) => nodes.includes(target));
  expect(nodeCalls).toHaveLength(4);
  expect(nodeCalls.map(([target]) => target)).toEqual(nodes);
  expect(nodeCalls.map(([, , position]) => position)).toEqual([0.2, 0.6, 1, 1.4]);
  for (const [, animation] of nodeCalls) {
    expect(animation).toMatchObject({ y: expect.any(Number), opacity: 0 });
  }

  unmount();
  expect(motionMocks.mediaRevert).toHaveBeenCalledOnce();
});
