export default function MascotCard({ mascot, loadImage }) {
  return (
    <li
      className="mascot-card"
      data-testid="mascot-card"
      data-mascot-id={mascot.id}
      data-motion-item
    >
      <div className="mascot-card__surface" data-testid={`mascot-card-${mascot.id}`}>
        <div className="mascot-card__media">
          {loadImage ? (
            <img
              src={mascot.src}
              alt={mascot.alt}
              width="512"
              height="512"
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="mascot-card__copy">
          <p className="mascot-card__role">{mascot.role}</p>
          <h3>{mascot.title}</h3>
          <p className="mascot-card__meaning">{mascot.body}</p>
        </div>
      </div>
    </li>
  );
}
