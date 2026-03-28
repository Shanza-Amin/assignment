function Toolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statuses,
  sortField,
  sortDirection,
  onSortFieldChange,
}) {
  return (
    <div className="toolbar">
      <label className="field">
        <span>Search by ID or project</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Try 123 or Frontend Hire"
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Sort by</span>
        <select value={sortField} onChange={(event) => onSortFieldChange(event.target.value)}>
          <option value="projectName">Project name</option>
          <option value="status">Status</option>
        </select>
      </label>

      <button
        type="button"
        className="sort-direction-button"
        onClick={() => onSortFieldChange(sortField)}
      >
        Direction: {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      </button>
    </div>
  );
}

export default Toolbar;
