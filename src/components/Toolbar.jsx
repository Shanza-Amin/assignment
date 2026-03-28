function Toolbar({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange, statuses }) {
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
    </div>
  );
}

export default Toolbar;
