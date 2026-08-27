import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/app/App';
import { getStoryContent } from '../src/app/storyContent';
import MascotCrew from '../src/components/MascotCrew/MascotCrew';
import { MASCOT_IDS, getMascotCrew } from '../src/components/MascotCrew/mascotRegistry';

const copy = getStoryContent('en');
const storyCss = readFileSync(resolve(process.cwd(), 'src/styles/story.css'), 'utf8');

beforeEach(() => localStorage.clear());

describe('Paws Crew registry', () => {
  it('keeps the seven approved roles in their fixed narrative order', () => {
    expect(MASCOT_IDS).toEqual([
      'astro',
      'explorer',
      'hoodie',
      'ninja',
      'scientist',
      'barista',
      'florist'
    ]);

    expect(getMascotCrew(copy).map(({ id, src }) => ({ id, src }))).toEqual([
      { id: 'astro', src: '/assets/mascots/astro.png' },
      { id: 'explorer', src: '/assets/mascots/explorer.png' },
      { id: 'hoodie', src: '/assets/mascots/hoodie.png' },
      { id: 'ninja', src: '/assets/mascots/ninja.png' },
      { id: 'scientist', src: '/assets/mascots/scientist.png' },
      { id: 'barista', src: '/assets/mascots/barista.png' },
      { id: 'florist', src: '/assets/mascots/florist.png' }
    ]);
  });
});

describe('Paws Crew rail', () => {
  it('renders every localized role with stable media dimensions and no controls', () => {
    const { container } = render(<MascotCrew copy={copy} />);
    const cards = screen.getAllByTestId('mascot-card');

    expect(cards).toHaveLength(7);
    expect(cards.map(card => card.dataset.mascotId)).toEqual(MASCOT_IDS);
    expect(screen.getByTestId('mascot-card-astro')).toHaveTextContent(copy.crew[0].title);

    copy.crew.forEach((item, index) => {
      const card = cards[index];
      const image = within(card).getByRole('img', { name: item.alt });

      expect(card).toHaveTextContent(item.role);
      expect(card).toHaveTextContent(item.title);
      expect(card).toHaveTextContent(item.body);
      expect(image).toHaveAttribute('src', `/assets/mascots/${item.id}.png`);
      expect(image).toHaveAttribute('width', '512');
      expect(image).toHaveAttribute('height', '512');
    });

    expect(within(screen.getByTestId('mascot-crew-rail')).queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-mascot-id]')).toHaveLength(7);
  });

  it('sits immediately after the cross-device story on the homepage', () => {
    render(<App />);

    expect(screen.getByTestId('mascot-crew').previousElementSibling).toHaveAttribute('id', 'app-pc');
  });

  it('uses native horizontal overflow and removes transforms for reduced motion', () => {
    expect(storyCss).toMatch(
      /\.mascot-crew__rail\s*\{[^}]*overflow-x:\s*auto;[^}]*scroll-snap-type:\s*x proximity;/s
    );
    expect(storyCss).toMatch(
      /\.mascot-card\s*\{[^}]*flex:\s*0 0 min\(18rem, 78vw\);[^}]*scroll-snap-align:\s*start;/s
    );
    expect(storyCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.mascot-crew__rail\s*\{[^}]*transform:\s*none !important;/
    );
  });
});
