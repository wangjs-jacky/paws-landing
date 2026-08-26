import { fireEvent, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SpotlightCard from '../src/components/react-bits/SpotlightCard';

it('keeps card semantics while updating its decorative local spotlight', () => {
  const { container } = render(
    <SpotlightCard className="test-card">
      <article>Capability</article>
    </SpotlightCard>
  );
  const card = container.querySelector('.test-card');
  card.getBoundingClientRect = () => ({ left: 20, top: 30 });

  fireEvent.pointerMove(card, { clientX: 70, clientY: 110 });

  expect(card.tagName).toBe('DIV');
  expect(card.style.getPropertyValue('--spotlight-x')).toBe('50px');
  expect(card.style.getPropertyValue('--spotlight-y')).toBe('80px');
});

it('merges consumer styles and composes the consumer pointer handler', () => {
  const onPointerMove = vi.fn();
  const { container } = render(
    <SpotlightCard style={{ color: 'red', '--consumer-token': 'kept' }} onPointerMove={onPointerMove} />
  );
  const card = container.querySelector('.spotlight-card');
  card.getBoundingClientRect = () => ({ left: 10, top: 20 });

  fireEvent.pointerMove(card, { clientX: 30, clientY: 50 });

  expect(card.style.color).toBe('red');
  expect(card.style.getPropertyValue('--consumer-token')).toBe('kept');
  expect(card.style.getPropertyValue('--spotlight-x')).toBe('20px');
  expect(onPointerMove).toHaveBeenCalledOnce();
});
