import MascotCard from './MascotCard';
import { getMascotCrew } from './mascotRegistry';

export default function MascotCrew({ copy }) {
  const mascots = getMascotCrew(copy);

  return (
    <section
      id="paws-crew"
      className="mascot-crew"
      aria-label={copy.crewLabel}
      data-testid="mascot-crew"
      data-motion-section
    >
      <ol className="mascot-crew__rail" data-testid="mascot-crew-rail">
        {mascots.map(mascot => <MascotCard key={mascot.id} mascot={mascot} />)}
      </ol>
    </section>
  );
}
