export default function ValueComparison({ copy }) {
  return (
    <section
      id="comparison"
      className="shell-section value-comparison"
      aria-label={copy.comparisonLabels.topic}
    >
      <table className="value-comparison__table">
        <thead>
          <tr>
            <th scope="col">{copy.comparisonLabels.topic}</th>
            <th scope="col">{copy.comparisonLabels.local}</th>
            <th scope="col">Paws</th>
          </tr>
        </thead>
        <tbody>
          {copy.comparison.map(row => (
            <tr key={row.id} data-testid="comparison-row">
              <th scope="row">{row.topic}</th>
              <td data-label={copy.comparisonLabels.local}>{row.local}</td>
              <td data-label="Paws">{row.paws}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="value-comparison__note">{copy.architecture.note}</p>
    </section>
  );
}
