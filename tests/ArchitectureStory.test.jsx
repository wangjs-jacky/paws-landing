import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ArchitectureStory from '../src/components/ArchitectureStory';
import { getStoryContent } from '../src/app/storyContent';

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
