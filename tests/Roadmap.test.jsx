import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import Roadmap from '../src/components/Roadmap';
import { content } from '../src/app/content';
import { getStoryContent } from '../src/app/storyContent';

const SHIPPED_IDS = [
  'app',
  'pc-web',
  'daemon',
  'agents',
  'approval',
  'handoff',
  'self-hosting'
];

it.each(['en', 'zh'])('renders the complete shipped set in approved order for %s', language => {
  const copy = { ...getStoryContent(language), labels: content[language].labels };

  render(<Roadmap copy={copy} />);

  const shippedIds = within(screen.getByTestId('roadmap-shipped'))
    .getAllByRole('listitem')
    .map(item => item.dataset.roadmapId);
  expect(shippedIds).toEqual(SHIPPED_IDS);
  expect([...new Set(shippedIds)]).toEqual(SHIPPED_IDS);
});

it('separates shipped work from a non-actionable planned Chrome extension', () => {
  const storyCopy = getStoryContent('zh');
  const copy = { ...storyCopy, labels: content.zh.labels };

  render(<Roadmap copy={copy} />);

  const shipped = screen.getByTestId('roadmap-shipped');
  const planned = screen.getByTestId('roadmap-planned');
  expect(within(shipped).queryByText(/Chrome/)).not.toBeInTheDocument();
  expect(within(planned).getByText('Chrome 插件更新')).toBeVisible();
  expect(within(planned).getAllByText(content.zh.labels.planned)).toHaveLength(copy.roadmap.planned.length + 1);

  const chromeItem = within(planned).getByText('Chrome 插件更新').closest('li');
  expect(within(chromeItem).queryByRole('link')).not.toBeInTheDocument();
  expect(within(chromeItem).queryByRole('button')).not.toBeInTheDocument();
  expect(chromeItem.querySelector('time')).not.toBeInTheDocument();
  expect(chromeItem).not.toHaveTextContent(/\b20\d{2}\b|\bv\d+(?:\.\d+)?\b/i);
});
