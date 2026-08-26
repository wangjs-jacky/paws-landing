import SpotlightCard from './react-bits/SpotlightCard';

function FeatureIcon({ index }) {
  const paths = [
    'M4 7h16v10H4zM8 20h8M12 17v3',
    'M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Zm-3 9 2 2 4-4',
    'M8 11V7a4 4 0 0 1 8 0v4M6 11h12v10H6zM12 15v2',
    'M8 18a4 4 0 1 1-1-7.87A6 6 0 0 1 18.5 12H19a3 3 0 1 1 0 6H8Z'
  ];
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paths[index]} /></svg>;
}

export default function FeatureGrid({ copy }) {
  return (
    <section id="product" className="shell-section feature-section" aria-labelledby="feature-title">
      <div className="section-heading feature-section__heading">
        <p className="eyebrow">PAWS / CAPABILITIES</p>
        <h2 id="feature-title">{copy.nav.product}</h2>
      </div>
      <div className="feature-grid">
        {copy.features.map((feature, index) => (
          <SpotlightCard key={feature.title} data-testid="feature-card" className={`feature-card feature-card--${index + 1}`}>
            <FeatureIcon index={index} />
            <span className="feature-card__index">0{index + 1}</span>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
