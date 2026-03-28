function Summary({ totalProjects, totalCandidates, statusCounts, topProjects }) {
  const statusEntries = Object.entries(statusCounts);

  return (
    <section className="summary-grid">
      <article className="summary-card">
        <span className="summary-label">Project candidates</span>
        <strong>{totalCandidates}</strong>
      </article>

      <article className="summary-card">
        <span className="summary-label">Projects</span>
        <strong>{totalProjects}</strong>
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
            <span className="muted-text">No status data available.</span>
          )}
        </div>
      </article>

      <article className="summary-card summary-card--wide">
        <span className="summary-label">Top projects</span>
        <div className="project-list">
          {topProjects.length > 0 ? (
            topProjects.map((project) => (
              <span key={project.id} className="project-list-item">
                {project.name}
              </span>
            ))
          ) : (
            <span className="muted-text">Projects could not be loaded.</span>
          )}
        </div>
      </article>
    </section>
  );
}

export default Summary;
