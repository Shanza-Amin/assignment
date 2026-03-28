import { useEffect, useMemo, useState } from 'react';
import Pagination from './components/Pagination.jsx';
import Summary from './components/Summary.jsx';
import Table from './components/Table.jsx';
import Toolbar from './components/Toolbar.jsx';
import { useDebounce } from './hooks/useDebounce.js';
import { fetchProjectCandidates, fetchProjects } from './services/api.js';

const PAGE_SIZE = 10;

function App() {
  const [projectCandidates, setProjectCandidates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('projectName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      setLoading(true);
      setError('');

      const [projectCandidatesResult, projectsResult] = await Promise.allSettled([
        fetchProjectCandidates(),
        fetchProjects(),
      ]);

      if (ignore) {
        return;
      }

      let nextError = '';

      if (projectCandidatesResult.status === 'fulfilled') {
        setProjectCandidates(projectCandidatesResult.value);
      } else {
        setProjectCandidates([]);
        nextError = projectCandidatesResult.reason?.message || 'Failed to load project candidates.';
      }

      if (projectsResult.status === 'fulfilled') {
        setProjects(projectsResult.value);
      } else {
        setProjects([]);
        nextError = nextError
          ? `${nextError} Projects could not be loaded either.`
          : projectsResult.reason?.message || 'Failed to load projects.';
      }

      setError(nextError);
      setLoading(false);
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, [reloadToken]);

  const statuses = useMemo(() => {
    return ['ALL', ...new Set(projectCandidates.map((item) => item.status).filter(Boolean))];
  }, [projectCandidates]);

  const statusCounts = useMemo(() => {
    return projectCandidates.reduce((counts, item) => {
      const key = item.status || 'UNKNOWN';
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }, [projectCandidates]);

  const topProjects = useMemo(() => {
    return projects.slice(0, 5);
  }, [projects]);

  const filteredAndSortedRows = useMemo(() => {
    // Filter first, then sort, so pagination always operates on the final visible dataset.
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

    const filteredRows = projectCandidates.filter((row) => {
      const matchesStatus =
        statusFilter === 'ALL' || row.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesSearch =
        normalizedSearch === '' ||
        row.id.toLowerCase().includes(normalizedSearch) ||
        row.projectName.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    return [...filteredRows].sort((left, right) => {
      const leftValue = (left[sortField] || '').toLowerCase();
      const rightValue = (right[sortField] || '').toLowerCase();

      if (leftValue === rightValue) {
        return 0;
      }

      const comparison = leftValue > rightValue ? 1 : -1;
      return sortDirection === 'asc' ? comparison : comparison * -1;
    });
  }, [projectCandidates, debouncedSearchTerm, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    // Jump back to the first page whenever the visible dataset definition changes.
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredAndSortedRows.length / PAGE_SIZE));
  }, [filteredAndSortedRows.length]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedRows, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleSortFieldChange(nextField) {
    if (sortField === nextField) {
      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(nextField);
    setSortDirection('asc');
  }

  return (
    <main className="page-shell">
      <section className="dashboard-card">
        <div className="hero">
          <div>
            <p className="eyebrow">Recruiter Dashboard</p>
            <h1>Project candidates overview</h1>
            <p className="hero-copy">
              Real GraphQL data with defensive error handling, debounced search, sorting,
              status insights, and lightweight client-side pagination.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() => setReloadToken((value) => value + 1)}
          >
            Refresh data
          </button>
        </div>

        <Summary
          totalProjects={projects.length}
          totalCandidates={projectCandidates.length}
          statusCounts={statusCounts}
          topProjects={topProjects}
        />

        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statuses={statuses}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortFieldChange={handleSortFieldChange}
        />

        {loading ? (
          <div className="state-card">Loading dashboard data...</div>
        ) : (
          <>
            {error ? (
              <div className="state-card state-card--error">
                <strong>Some data could not be loaded cleanly.</strong>
                <span>{error}</span>
              </div>
            ) : null}

            <div className="results-meta">
              Showing <strong>{paginatedRows.length}</strong> rows on page{' '}
              <strong>{currentPage}</strong> of <strong>{totalPages}</strong> from{' '}
              <strong>{filteredAndSortedRows.length}</strong> matching candidates
            </div>

            <Table rows={paginatedRows} />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={filteredAndSortedRows.length}
              onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
              onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            />
          </>
        )}
      </section>
    </main>
  );
}

export default App;
