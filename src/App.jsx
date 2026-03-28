import { useEffect, useMemo, useState } from 'react';

const GRAPHQL_ENDPOINT = 'https://release-current.starhunter.software/Api/graphql';
const AUTH_TOKEN = '5a9bf82f-2a4e-43bb-89b6-d83459db4390';

const PROJECT_CANDIDATES_QUERY = `
  query RecruiterDashboardProjectCandidates {
    projectCandidates {
      id
      status
      project {
        name
      }
    }
  }
`;

async function fetchProjectCandidates() {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      query: PROJECT_CANDIDATES_QUERY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  // GraphQL APIs can return HTTP 200 while still failing at the query layer.
  if (payload.errors?.length) {
    const message = payload.errors.map((error) => error.message).join(' | ');
    throw new Error(message || 'GraphQL returned an unknown error.');
  }

  return (payload.data?.projectCandidates ?? []).map((item) => ({
    id: String(item.id ?? ''),
    status: item.status || 'UNKNOWN',
    projectName: item.project?.name || 'Unnamed project',
  }));
}

function App() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadProjectCandidates() {
      setLoading(true);
      setError('');

      try {
        const nextRows = await fetchProjectCandidates();

        if (!ignore) {
          setRows(nextRows);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong while loading candidates.',
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProjectCandidates();

    // Prevent state updates if the component unmounts during a slow request.
    return () => {
      ignore = true;
    };
  }, [reloadToken]);

  const statuses = useMemo(() => {
    return ['ALL', ...new Set(rows.map((row) => row.status).filter(Boolean))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === 'ALL' || row.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesSearch =
        normalizedSearch === '' ||
        row.id.toLowerCase().includes(normalizedSearch) ||
        row.projectName.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [rows, searchTerm, statusFilter]);

  return (
    <main className="page-shell">
      <section className="dashboard-card">
        <div className="hero">
          <div>
            <p className="eyebrow">Recruiter Dashboard</p>
            <h1>Project candidates overview</h1>
            <p className="hero-copy">
              Live GraphQL data with lightweight search, status filtering, and resilient
              error handling for unstable backend responses.
            </p>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={() => setReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh data
          </button>
        </div>

        <div className="toolbar">
          <label className="field">
            <span>Search by ID or project</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Try 123 or Frontend Hire"
            />
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="state-card">Loading candidates...</div>
        ) : error ? (
          <div className="state-card state-card--error">
            <strong>Unable to load data.</strong>
            <span>{error}</span>
          </div>
        ) : (
          <>
            <div className="results-meta">
              Showing <strong>{filteredRows.length}</strong> of <strong>{rows.length}</strong>{' '}
              candidates
            </div>

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
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.projectName}</td>
                        <td>
                          <span className="status-pill">{row.status}</span>
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
          </>
        )}
      </section>
    </main>
  );
}

export default App;
