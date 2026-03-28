function getStatusClassName(status) {
  const normalizedStatus = (status || 'unknown').toLowerCase();

  if (normalizedStatus.includes('active')) {
    return 'status-pill status-pill--active';
  }

  if (normalizedStatus.includes('pending')) {
    return 'status-pill status-pill--pending';
  }

  return 'status-pill status-pill--unknown';
}

function Table({ rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Candidate ID</th>
            <th>Project</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.projectName}</td>
                <td>
                  <span className={getStatusClassName(row.status)}>{row.status}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty-state">
                No candidates match the current search or filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
