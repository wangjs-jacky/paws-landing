import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import AgentMarquee from '../src/components/AgentMarquee';

it('exposes one readable supported-agent list', () => {
  render(<AgentMarquee agents={['Claude Code', 'Codex']} labels={{ agentMarquee: 'Supported agents' }} />);

  const marquee = screen.getByRole('region', { name: 'Supported agents' });
  const readableList = within(marquee).getByRole('list');

  expect(within(readableList).getByText('Claude Code')).toBeVisible();
  expect(within(readableList).getByText('Codex')).toBeVisible();
});

it('moves automatically without exposing playback controls', () => {
  const { container } = render(
    <AgentMarquee agents={['Claude Code', 'Codex']} labels={{ agentMarquee: 'Supported agents' }} />
  );

  expect(screen.getByTestId('agent-marquee')).toHaveAttribute('data-motion', 'auto');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(container.querySelector('.agent-marquee__duplicate')).toHaveAttribute('aria-hidden', 'true');
});
