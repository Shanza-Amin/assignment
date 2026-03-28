function Summary({
  totalProjects,
  totalProjectCandidates,
  totalCandidates,
  statusCounts,
}) {
  const statusEntries = Object.entries(statusCounts);

  return (
    <section className="summary-grid">
      <article className="summary-card">
        <span className="summary-label">Project candidates</span>
        <strong>{totalProjectCandidates}</strong>
      </article>

      <article className="summary-card">
        <span className="summary-label">Projects</span>
        <strong>{totalProjects}</strong>
      </article>

      <article className="summary-card">
        <span className="summary-label">Candidates</span>
        <strong>{totalCandidates}</strong>
      </article>

      <article className="summary-card summary-card--wide">
        <span className="summary-label">Status breakdown</span>
        <div className="status-summary-list">
          {statusEntries.length > 0 ? (
            statusEntries.map(([status, count]) => (
              <span key={status} className="status-summary-item">
                {status}: {count}
              </span>
            ))
          ) : (
            <span className="muted-text">No candidate data available.</span>
          )}
        </div>
      </article>
    </section>
  );
}

export default Summary;
