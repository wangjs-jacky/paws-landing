import { fireEvent, render } from '@testing-library/react';
import { expect, it } from 'vitest';
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
