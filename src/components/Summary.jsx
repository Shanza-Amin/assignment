function Summary({
  totalProjects,
  totalProjectCandidates,
  totalCandidates,
  projectCandidatesLoading,
  projectsLoading,
  candidatesLoading,
  statusCounts,
  statusLoading,
}) {
  const statusEntries = Object.entries(statusCounts);

  function renderMetricValue(isLoading, value) {
    return isLoading ? <span className="summary-loading">...</span> : <strong>{value}</strong>;
  }

  return (
    <section className="summary-grid">
      <article className="summary-card">
        <span className="summary-label">Project candidates</span>
        {renderMetricValue(projectCandidatesLoading, totalProjectCandidates)}
      </article>

      <article className="summary-card">
        <span className="summary-label">Projects</span>
        {renderMetricValue(projectsLoading, totalProjects)}
      </article>

      <article className="summary-card">
        <span className="summary-label">Candidates</span>
        {renderMetricValue(candidatesLoading, totalCandidates)}
      </article>

      <article className="summary-card summary-card--wide">
        <span className="summary-label">Status breakdown</span>
        <div className="status-summary-list">
          {statusLoading && statusEntries.length === 0 ? (
            <span className="muted-text">Loading status data...</span>
          ) : statusEntries.length > 0 ? (
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
