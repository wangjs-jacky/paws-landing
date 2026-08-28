import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ArchitectureStory from '../src/components/ArchitectureStory';
import { getStoryContent } from '../src/app/storyContent';

it.each([
  ['en', 'Remote start requires the target machine to be online.'],
  ['zh', '远程启动要求目标机器在线。']
])('states the localized online-machine requirement independently for %s', (language, requirement) => {
  const copy = getStoryContent(language);

  render(<ArchitectureStory copy={copy} language={language} />);

  expect(copy.architecture.requirement).toBe(requirement);
  expect(screen.getByText(requirement)).toBeVisible();
  expect(screen.getByText(requirement)).not.toHaveTextContent(copy.architecture.note);
  expect(screen.queryByText(/no VPN|无需\s*VPN/i)).not.toBeInTheDocument();
});

it('renders the truthful architecture as four ordered, readable nodes', () => {
  const copy = getStoryContent('zh');

  render(<ArchitectureStory copy={copy} language="zh" />);

  const topology = screen.getByRole('list');
  expect(topology.tagName).toBe('OL');
  expect(screen.getAllByTestId('architecture-node').map(node => node.dataset.nodeId)).toEqual([
    'clients',
    'relay',
    'daemon',
    'agents'
  ]);
  expect(screen.getByText(copy.architecture.note)).toBeVisible();
  expect(screen.queryByText(/无需\s*VPN/)).not.toBeInTheDocument();
});
