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

function getSortArrow(column, sortField, sortDirection) {
  if (column !== sortField) {
    return '↕';
  }

  return sortDirection === 'asc' ? '↑' : '↓';
}

function Table({ rows, sortField, sortDirection, onSortChange }) {
  const columns = [
    { key: 'id', label: 'Candidate ID' },
    { key: 'projectName', label: 'Project' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                <button
                  type="button"
                  className={
                    column.key === sortField
                      ? 'table-sort-button table-sort-button--active'
                      : 'table-sort-button'
                  }
                  onClick={() => onSortChange(column.key)}
                >
                  <span>{column.label}</span>
                  <span className="sort-arrow">{getSortArrow(column.key, sortField, sortDirection)}</span>
                </button>
              </th>
            ))}
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
