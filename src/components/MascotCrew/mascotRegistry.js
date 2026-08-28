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

const INVALID_CREW_MESSAGE = 'Paws Crew copy must contain exactly the seven unique approved mascot IDs.';

export function getMascotCrew(copy) {
  const crew = copy?.crew;
  if (!Array.isArray(crew) || crew.length !== MASCOT_IDS.length) {
    throw new Error(INVALID_CREW_MESSAGE);
  }

  const crewById = new Map();
  for (const item of crew) {
    if (!MASCOT_IDS.includes(item?.id) || crewById.has(item.id)) {
      throw new Error(INVALID_CREW_MESSAGE);
    }
    crewById.set(item.id, item);
  }

  if (crewById.size !== MASCOT_IDS.length) {
    throw new Error(INVALID_CREW_MESSAGE);
  }

  return MASCOT_IDS.map(id => ({ ...crewById.get(id), src: mascotSources[id] }));
}
