export const MASCOT_IDS = [
  'astro',
  'explorer',
  'hoodie',
  'ninja',
  'scientist',
  'barista',
  'florist'
];

export const mascotSources = Object.fromEntries(
  MASCOT_IDS.map(id => [id, `/assets/mascots/${id}.png`])
);

export function getMascotCrew(copy) {
  return copy.crew.map(item => ({ ...item, src: mascotSources[item.id] }));
}
