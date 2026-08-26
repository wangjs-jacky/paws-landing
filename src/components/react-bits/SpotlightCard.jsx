// Adapted from the free React Bits SpotlightCard component:
// https://reactbits.dev/components/spotlight-card
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255,163,26,.16)',
  ...props
}) {
  function handlePointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
  }

  return (
    <div
      {...props}
      className={`spotlight-card ${className}`.trim()}
      style={{ '--spotlight-color': spotlightColor }}
      onPointerMove={handlePointerMove}
    >
      {children}
    </div>
  );
}
