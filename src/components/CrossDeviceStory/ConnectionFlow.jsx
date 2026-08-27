export default function ConnectionFlow({ focus, status }) {
  return (
    <div
      className="connection-flow"
      data-focus={focus}
      data-status={status}
      aria-hidden="true"
    >
      {[0, 1, 2].map(index => (
        <i className="connection-flow__line" key={index}>
          <span className="connection-flow__line-progress" />
        </i>
      ))}
    </div>
  );
}
