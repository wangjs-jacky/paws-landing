export default function ConnectionFlow({ focus, status }) {
  return (
    <div
      className="connection-flow"
      data-focus={focus}
      data-status={status}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </div>
  );
}
