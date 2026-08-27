import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import Roadmap from '../src/components/Roadmap';
import { content } from '../src/app/content';
import { getStoryContent } from '../src/app/storyContent';

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
