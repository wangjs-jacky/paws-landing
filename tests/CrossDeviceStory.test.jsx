import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStoryContent } from '../src/app/storyContent';
import ConnectionFlow from '../src/components/CrossDeviceStory/ConnectionFlow';
import CrossDeviceStory from '../src/components/CrossDeviceStory/CrossDeviceStory';
import MobileConsoleDemo from '../src/components/CrossDeviceStory/MobileConsoleDemo';
import PcConsoleDemo from '../src/components/CrossDeviceStory/PcConsoleDemo';
import { buildConsoleState } from '../src/components/CrossDeviceStory/storyModel';

const motionMocks = vi.hoisted(() => ({
  cancelAnimationFrame: vi.fn(),
  desktop: true,
  coarse: false,
  matchMedia: vi.fn(),
  mediaAdd: vi.fn(),
  mediaRevert: vi.fn(),
  reduced: false,
  refresh: vi.fn(),
  registerPlugin: vi.fn(),
  requestAnimationFrame: vi.fn(),
  timeline: vi.fn(),
  timelineTo: vi.fn(),
  useGSAPConfigs: []
}));

vi.mock('gsap', () => ({
  default: {
    matchMedia: motionMocks.matchMedia,
    registerPlugin: motionMocks.registerPlugin,
    timeline: motionMocks.timeline
  }
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { refresh: motionMocks.refresh }
}));

vi.mock('@gsap/react', async () => {
  const { useEffect } = await import('react');

  return {
    useGSAP(setup, config) {
      motionMocks.useGSAPConfigs.push(config);
      useEffect(setup, config.dependencies);
    }
  };
});

const copy = getStoryContent('en');

beforeEach(() => {
  motionMocks.desktop = true;
  motionMocks.coarse = false;
  motionMocks.reduced = false;
  motionMocks.useGSAPConfigs.length = 0;

  for (const mock of [
    motionMocks.cancelAnimationFrame,
    motionMocks.matchMedia,
    motionMocks.mediaAdd,
    motionMocks.mediaRevert,
    motionMocks.refresh,
    motionMocks.requestAnimationFrame,
    motionMocks.timeline,
    motionMocks.timelineTo
  ]) {
    mock.mockReset();
  }

  motionMocks.timelineTo.mockReturnThis();
  motionMocks.timeline.mockReturnValue({ to: motionMocks.timelineTo });
  motionMocks.mediaAdd.mockImplementation((query, setup) => {
    const enabled = motionMocks.desktop && !motionMocks.coarse && !motionMocks.reduced;
    if (enabled) setup();
  });
  motionMocks.matchMedia.mockReturnValue({
    add: motionMocks.mediaAdd,
    revert: motionMocks.mediaRevert
  });
  motionMocks.requestAnimationFrame.mockImplementation(callback => {
    motionMocks.pendingFrame = callback;
    return 73;
  });

  window.matchMedia = vi.fn(query => ({
    matches: query === '(prefers-reduced-motion: reduce)' && motionMocks.reduced,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }));
  window.requestAnimationFrame = motionMocks.requestAnimationFrame;
  window.cancelAnimationFrame = motionMocks.cancelAnimationFrame;
});

function renderDemos(sceneId) {
  const state = buildConsoleState(sceneId, copy);
  render(
    <>
      <PcConsoleDemo state={state} copy={copy} />
      <MobileConsoleDemo state={state} copy={copy} />
    </>
  );
  return {
    state,
    pc: screen.getByTestId('pc-console'),
    mobile: screen.getByTestId('mobile-console')
  };
}

function expectDemoButtonsToBeDisabled(container) {
  for (const button of within(container).queryAllByRole('button')) {
    expect(button).toBeDisabled();
  }
}

describe('cross-device product demonstrations', () => {
  it('skips the scoped timeline when reduced motion is requested', () => {
    motionMocks.reduced = true;

    render(<CrossDeviceStory language="en" />);

    expect(motionMocks.timeline).not.toHaveBeenCalled();
    expect(motionMocks.matchMedia).not.toHaveBeenCalled();
  });

  it('creates one scoped desktop timeline and maps scroll progress back to React state', () => {
    const { unmount } = render(<CrossDeviceStory language="en" />);
    const story = screen.getByTestId('cross-device-story');
    const stage = story.querySelector('.cross-device-story__stage');
    const mascot = story.querySelector('.story-scene-mascot');
    const connectionLines = [...stage.querySelectorAll('.connection-flow__line-progress')];
    const [timelineConfig] = motionMocks.timeline.mock.calls[0];

    expect(motionMocks.timeline).toHaveBeenCalledOnce();
    expect(motionMocks.mediaAdd).toHaveBeenCalledWith(
      '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      expect.any(Function)
    );
    expect(motionMocks.useGSAPConfigs.at(-1)).toMatchObject({
      scope: { current: story },
      revertOnUpdate: true
    });
    expect(timelineConfig.scrollTrigger.trigger).toBe(stage);
    expect(timelineConfig.scrollTrigger.endTrigger).toBe(story);
    expect(timelineConfig.scrollTrigger.pin).toBe(stage);
    expect(timelineConfig.scrollTrigger.scrub).toBe(true);
    expect(timelineConfig.scrollTrigger.start).toEqual(expect.any(Function));
    expect(timelineConfig.scrollTrigger.end).toBe('bottom bottom');
    expect(timelineConfig.scrollTrigger.start()).toBe('top top+=92');
    expect(motionMocks.timelineTo).not.toHaveBeenCalledWith(stage, expect.anything(), expect.anything());
    expect(mascot).toHaveAttribute('aria-hidden', 'true');
    expect(mascot.querySelector('img')).toHaveAttribute('alt', '');
    expect(connectionLines).toHaveLength(3);
    expect(motionMocks.timelineTo).toHaveBeenCalledWith(
      connectionLines,
      expect.objectContaining({ scaleX: expect.any(Number), opacity: expect.any(Number) }),
      0
    );
    expect(motionMocks.timelineTo).toHaveBeenCalledWith(
      mascot,
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
        rotation: expect.any(Number),
        scale: expect.any(Number)
      }),
      0
    );

    act(() => timelineConfig.scrollTrigger.onUpdate({ progress: 0.76 }));
    expect(story).toHaveAttribute('data-active-scene', 'handoff');
    expect(screen.getByTestId('pc-console')).toHaveAttribute('data-scene', 'handoff');
    expect(screen.getByTestId('mobile-console')).toHaveAttribute('data-scene', 'handoff');
    expect(motionMocks.timeline).toHaveBeenCalledOnce();

    unmount();
    expect(motionMocks.mediaRevert).toHaveBeenCalledOnce();
  });

  it('keeps coarse-pointer desktops in the complete static flow', () => {
    motionMocks.coarse = true;

    render(<CrossDeviceStory language="en" />);

    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(motionMocks.timeline).not.toHaveBeenCalled();
  });

  it('keeps mobile and tablet layouts in the complete static flow', () => {
    motionMocks.desktop = false;

    render(<CrossDeviceStory language="en" />);

    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(screen.getByTestId('pc-console')).toBeVisible();
    expect(screen.getByTestId('mobile-console')).toBeVisible();
    expect(motionMocks.timeline).not.toHaveBeenCalled();
  });

  it('renders complete scene-specific evidence inside every static chapter', () => {
    render(<CrossDeviceStory language="en" />);

    const chapters = screen.getAllByRole('article');
    const evidence = chapters.map(chapter => chapter.querySelector('[data-testid="story-static-evidence"]'));

    expect(evidence).toHaveLength(4);
    expect(evidence.every(Boolean)).toBe(true);
    expect(evidence.map(item => item.dataset.staticScene)).toEqual(['start', 'watch', 'approve', 'handoff']);

    for (const [index, scene] of copy.scenes.entries()) {
      const state = buildConsoleState(scene.id, copy);
      const pc = evidence[index].querySelector('[data-static-surface="pc"]');
      const mobile = evidence[index].querySelector('[data-static-surface="mobile"]');
      const connection = evidence[index].querySelector('.connection-flow');

      expect(pc).toHaveAttribute('data-scene', scene.id);
      expect(pc).toHaveAttribute('data-status', state.sessionStatus);
      expect(pc).toHaveAttribute('data-focus', String(state.focus === 'pc' || state.focus === 'shared'));
      expect(mobile).toHaveAttribute('data-scene', scene.id);
      expect(mobile).toHaveAttribute('data-status', state.sessionStatus);
      expect(mobile).toHaveAttribute('data-focus', String(state.focus === 'mobile' || state.focus === 'shared'));
      expect(connection).toHaveAttribute('data-status', state.sessionStatus);
      expect(connection).toHaveAttribute('data-focus', state.focus);
    }

    for (const value of [copy.consoles.machine, copy.consoles.project, copy.consoles.agent, copy.consoles.sessionId]) {
      expect(within(evidence[0].querySelector('[data-static-surface="pc"]')).queryAllByText(value)).not.toHaveLength(0);
    }
    expect(within(evidence[1]).getAllByText('Skill')).not.toHaveLength(0);
    expect(within(evidence[1]).getAllByText('Subagent')).not.toHaveLength(0);
    expect(within(evidence[2]).getAllByText('npm run build')).not.toHaveLength(0);
    expect(within(evidence[3]).getAllByText(copy.consoles.sessionId)).toHaveLength(2);

    expect(screen.getAllByTestId('pc-console')).toHaveLength(1);
    expect(screen.getAllByTestId('mobile-console')).toHaveLength(1);
    expect(document.querySelectorAll('.cross-device-story__stage--shared')).toHaveLength(1);
  });

  it('does not duplicate nested landmarks or element IDs across rendered story evidence', () => {
    render(<CrossDeviceStory language="en" />);

    const story = screen.getByTestId('cross-device-story');
    const ids = [...story.querySelectorAll('[id]')].map(element => element.id);

    expect(within(story).queryAllByRole('region')).toHaveLength(0);
    expect(within(story).queryAllByRole('complementary')).toHaveLength(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('refreshes ScrollTrigger after language layout changes and cancels stale frames', () => {
    const { rerender, unmount } = render(<CrossDeviceStory language="en" />);
    const firstFrame = motionMocks.pendingFrame;

    rerender(<CrossDeviceStory language="zh" />);

    expect(motionMocks.cancelAnimationFrame).toHaveBeenCalledWith(73);
    expect(motionMocks.requestAnimationFrame).toHaveBeenCalledTimes(2);
    act(() => motionMocks.pendingFrame());
    expect(motionMocks.refresh).toHaveBeenCalledOnce();
    expect(motionMocks.timeline).toHaveBeenCalledOnce();
    expect(firstFrame).toEqual(expect.any(Function));

    unmount();
    expect(motionMocks.cancelAnimationFrame).toHaveBeenLastCalledWith(73);
  });

  it('renders every localized story scene while exposing the active console scene', () => {
    render(<CrossDeviceStory language="zh" activeSceneOverride="approve" />);

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(4);
    expect(articles.map(article => article.dataset.scene)).toEqual(['start', 'watch', 'approve', 'handoff']);
    expect(screen.getByRole('heading', { name: '关键操作，手机拍板' })).toBeVisible();
    expect(articles[2].querySelector('.story-step__meta button')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByTestId('cross-device-story')).toHaveAttribute('data-active-scene', 'approve');
    expect(screen.getByTestId('pc-console')).toHaveAttribute('data-scene', 'approve');
    expect(screen.getByTestId('mobile-console')).toHaveAttribute('data-scene', 'approve');
  });

  it('synchronizes every story surface when a user selects another step', async () => {
    const user = userEvent.setup();
    const { container } = render(<CrossDeviceStory language="en" />);
    const articles = screen.getAllByRole('article');
    const startButton = articles[0].querySelector('.story-step__meta button');
    const approveButton = articles[2].querySelector('.story-step__meta button');

    expect(startButton).toHaveAttribute('aria-current', 'step');
    await user.click(approveButton);

    expect(screen.getByTestId('cross-device-story')).toHaveAttribute('data-active-scene', 'approve');
    expect(screen.getByTestId('pc-console')).toHaveAttribute('data-scene', 'approve');
    expect(screen.getByTestId('mobile-console')).toHaveAttribute('data-scene', 'approve');
    const sharedStage = container.querySelector('.cross-device-story__stage--shared');
    expect(sharedStage.querySelector('.connection-flow')).toHaveAttribute('data-focus', 'mobile');
    expect(sharedStage.querySelector('.connection-flow')).toHaveAttribute('data-status', 'approval-pending');
    expect(startButton).not.toHaveAttribute('aria-current');
    expect(approveButton).toHaveAttribute('aria-current', 'step');
  });

  it('shows localized remote-start controls in the PC Web composer', () => {
    const { pc, mobile } = renderDemos('start');

    expect(pc).toHaveAttribute('data-scene', 'start');
    expect(pc).toHaveAttribute('data-status', 'ready');
    expect(pc).toHaveAttribute('data-focus', 'true');
    expect(pc).toHaveAccessibleName(copy.consoles.pcSummary.start);
    for (const value of [copy.consoles.machine, copy.consoles.project, copy.consoles.agent]) {
      expect(within(pc).getAllByText(value)[0]).toBeVisible();
    }
    expect(within(pc).getByText(copy.consoles.demoDisclaimer)).toBeVisible();
    expect(mobile).toHaveAttribute('data-status', 'ready');
    expect(mobile).toHaveAttribute('data-focus', 'false');
    expectDemoButtonsToBeDisabled(pc);
    expectDemoButtonsToBeDisabled(mobile);
  });

  it('shows visible skill, tool and subagent activity while the session runs', () => {
    const { pc, mobile } = renderDemos('watch');

    expect(pc).toHaveAttribute('data-scene', 'watch');
    expect(pc).toHaveAttribute('data-status', 'running');
    expect(pc).toHaveAttribute('data-focus', 'true');
    expect(pc).toHaveAccessibleName(copy.consoles.pcSummary.watch);
    expect(within(pc).getByText(/Skill/)).toBeVisible();
    expect(within(pc).getByText(/Tool/)).toBeVisible();
    expect(within(pc).getByText(/Subagent/)).toBeVisible();
    expect(mobile).toHaveAttribute('data-focus', 'false');
    expect(within(mobile).getByText(copy.scenes[1].body)).toBeVisible();
  });

  it('shows a disabled mobile permission decision when approval is pending', () => {
    const { pc, mobile } = renderDemos('approve');

    expect(pc).toHaveAttribute('data-status', 'approval-pending');
    expect(pc).toHaveAttribute('data-focus', 'false');
    expect(mobile).toHaveAttribute('data-scene', 'approve');
    expect(mobile).toHaveAttribute('data-status', 'approval-pending');
    expect(mobile).toHaveAttribute('data-focus', 'true');
    expect(within(mobile).getByText('npm run build')).toBeVisible();
    expect(within(mobile).getByRole('button', { name: copy.consoles.approveOnce })).toBeDisabled();
    expect(within(mobile).getByRole('button', { name: copy.consoles.allowSession })).toBeDisabled();
    expect(within(mobile).getByRole('button', { name: copy.consoles.reject })).toBeDisabled();
    expect(within(mobile).getByText(copy.consoles.demoDisclaimer)).toBeVisible();
  });

  it('keeps the same session identity visible on PC Web and App during handoff', () => {
    const { state, pc, mobile } = renderDemos('handoff');

    expect(pc).toHaveAttribute('data-scene', 'handoff');
    expect(pc).toHaveAttribute('data-status', 'running');
    expect(pc).toHaveAttribute('data-focus', 'true');
    expect(mobile).toHaveAttribute('data-focus', 'true');
    expect(within(pc).getByText(state.sessionId)).toBeVisible();
    expect(within(mobile).getByText(state.sessionId)).toBeVisible();
    expect(within(pc).getByText(copy.scenes[3].body)).toBeVisible();
    expect(within(mobile).getByText(copy.scenes[3].body)).toBeVisible();
  });

  it('marks the connection visualization as non-interactive decoration', () => {
    const { container } = render(<ConnectionFlow focus="shared" status="running" />);
    const flow = container.querySelector('.connection-flow');
    const lines = flow.querySelectorAll('.connection-flow__line');

    expect(flow).toHaveAttribute('aria-hidden', 'true');
    expect(flow).toHaveAttribute('data-focus', 'shared');
    expect(flow).toHaveAttribute('data-status', 'running');
    expect(flow).toHaveClass('connection-flow');
    expect(lines).toHaveLength(3);
    for (const line of lines) {
      expect(line.querySelector('.connection-flow__line-progress')).toBeInTheDocument();
    }
  });
});
