import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { getStoryContent } from '../src/app/storyContent';
import ConnectionFlow from '../src/components/CrossDeviceStory/ConnectionFlow';
import CrossDeviceStory from '../src/components/CrossDeviceStory/CrossDeviceStory';
import MobileConsoleDemo from '../src/components/CrossDeviceStory/MobileConsoleDemo';
import PcConsoleDemo from '../src/components/CrossDeviceStory/PcConsoleDemo';
import { buildConsoleState } from '../src/components/CrossDeviceStory/storyModel';

const copy = getStoryContent('en');

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
  it('renders every localized story scene while exposing the active console scene', () => {
    render(<CrossDeviceStory language="zh" activeSceneOverride="approve" />);

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(4);
    expect(articles.map(article => article.dataset.scene)).toEqual(['start', 'watch', 'approve', 'handoff']);
    expect(screen.getByRole('heading', { name: '关键操作，手机拍板' })).toBeVisible();
    expect(within(articles[2]).getByRole('button', { name: '关键操作，手机拍板' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.getByTestId('cross-device-story')).toHaveAttribute('data-active-scene', 'approve');
    expect(screen.getByTestId('pc-console')).toHaveAttribute('data-scene', 'approve');
    expect(screen.getByTestId('mobile-console')).toHaveAttribute('data-scene', 'approve');
  });

  it('synchronizes every story surface when a user selects another step', async () => {
    const user = userEvent.setup();
    const { container } = render(<CrossDeviceStory language="en" />);
    const articles = screen.getAllByRole('article');
    const startButton = within(articles[0]).getByRole('button', { name: copy.scenes[0].title });
    const approveButton = within(articles[2]).getByRole('button', { name: copy.scenes[2].title });

    expect(startButton).toHaveAttribute('aria-current', 'step');
    await user.click(approveButton);

    expect(screen.getByTestId('cross-device-story')).toHaveAttribute('data-active-scene', 'approve');
    expect(screen.getByTestId('pc-console')).toHaveAttribute('data-scene', 'approve');
    expect(screen.getByTestId('mobile-console')).toHaveAttribute('data-scene', 'approve');
    expect(container.querySelector('.connection-flow')).toHaveAttribute('data-focus', 'mobile');
    expect(container.querySelector('.connection-flow')).toHaveAttribute('data-status', 'approval-pending');
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

    expect(flow).toHaveAttribute('aria-hidden', 'true');
    expect(flow).toHaveAttribute('data-focus', 'shared');
    expect(flow).toHaveAttribute('data-status', 'running');
    expect(flow).toHaveClass('connection-flow');
  });
});
