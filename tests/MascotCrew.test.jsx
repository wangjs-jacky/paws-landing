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
const approvedIds = [
  'astro',
  'explorer',
  'hoodie',
  'ninja',
  'scientist',
  'barista',
  'florist'
];

beforeEach(() => localStorage.clear());

describe('Paws Crew registry', () => {
  it.each([
    ['English', 'en', ['Astronaut', 'Explorer', 'Developer', 'Ninja', 'Scientist', 'Barista', 'Florist']],
    ['Chinese', 'zh', ['宇航员', '探险家', '程序员', '忍者', '科学家', '咖啡师', '花艺师']]
  ])('builds the complete %s crew in the approved order', (_label, language, expectedTitles) => {
    const crew = getMascotCrew(getStoryContent(language));

    expect(MASCOT_IDS).toEqual(approvedIds);
    expect(crew.map(item => item.id)).toEqual(approvedIds);
    expect(crew.map(item => item.title)).toEqual(expectedTitles);
    expect(crew.map(item => item.src)).toEqual([
      '/assets/mascots/astro.png',
      '/assets/mascots/explorer.png',
      '/assets/mascots/hoodie.png',
      '/assets/mascots/ninja.png',
      '/assets/mascots/scientist.png',
      '/assets/mascots/barista.png',
      '/assets/mascots/florist.png'
    ]);
  });

  it('normalizes a valid shuffled copy to the approved order', () => {
    const shuffledCopy = { ...copy, crew: [...copy.crew].reverse() };

    expect(getMascotCrew(shuffledCopy).map(item => item.id)).toEqual(approvedIds);
    expect(getMascotCrew(shuffledCopy).map(item => item.title)).toEqual([
      'Astronaut',
      'Explorer',
      'Developer',
      'Ninja',
      'Scientist',
      'Barista',
      'Florist'
    ]);
  });

  it.each([
    ['missing', copy.crew.slice(0, -1)],
    ['extra', [...copy.crew, { ...copy.crew[0], id: 'pilot' }]],
    ['unknown', copy.crew.map(item => item.id === 'florist' ? { ...item, id: 'pilot' } : item)],
    ['duplicate', copy.crew.map(item => item.id === 'florist' ? { ...copy.crew[0] } : item)]
  ])('rejects a %s role collection', (_case, crew) => {
    expect(() => getMascotCrew({ ...copy, crew })).toThrow(
      'Paws Crew copy must contain exactly the seven unique approved mascot IDs.'
    );
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

  it.each([
    ['en', 'Paws Crew'],
    ['zh', 'Paws 角色小队']
  ])('uses the localized %s section label', (language, expectedLabel) => {
    const localizedCopy = getStoryContent(language);

    expect(localizedCopy.crewLabel).toBe(expectedLabel);
    render(<MascotCrew copy={localizedCopy} />);
    expect(screen.getByRole('region', { name: expectedLabel })).toBeInTheDocument();
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
