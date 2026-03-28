import { useEffect, useMemo, useRef, useState } from 'react';
import Pagination from './components/Pagination.jsx';
import Loader from './components/Loader.jsx';
import Summary from './components/Summary.jsx';
import Table from './components/Table.jsx';
import Toolbar from './components/Toolbar.jsx';
import { useDebounce } from './hooks/useDebounce.js';
import { fetchDashboardData } from './services/api.js';

const PAGE_SIZE = 10;
const EMPTY_DATASET_STATE = {
  data: [],
  loading: true,
  error: '',
  hasLoaded: false,
};

function beginDatasetLoad(previousState) {
  return {
    ...previousState,
    loading: true,
    error: '',
  };
}

function resolveDatasetState(previousState, nextValue) {
  const nextData = Array.isArray(nextValue.data) ? nextValue.data : [];
  const nextError = nextValue.error || '';
  const shouldKeepPreviousData =
    nextError && nextData.length === 0 && previousState.data.length > 0;

  return {
    data: shouldKeepPreviousData ? previousState.data : nextData,
    loading: false,
    error: nextError && nextData.length === 0 ? nextError : '',
    hasLoaded: previousState.hasLoaded || nextData.length > 0 || !nextError,
  };
}

function App() {
  const [projectCandidatesState, setProjectCandidatesState] = useState(EMPTY_DATASET_STATE);
  const [projectsState, setProjectsState] = useState(EMPTY_DATASET_STATE);
  const [candidatesState, setCandidatesState] = useState(EMPTY_DATASET_STATE);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('projectName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const latestRequestRef = useRef(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDashboardData() {
      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;

      setProjectCandidatesState(beginDatasetLoad);
      setProjectsState(beginDatasetLoad);
      setCandidatesState(beginDatasetLoad);

      const dashboardData = await fetchDashboardData({
        signal: abortController.signal,
      });

      if (abortController.signal.aborted || latestRequestRef.current !== requestId) {
        return;
      }

      setProjectCandidatesState((currentValue) =>
        resolveDatasetState(currentValue, dashboardData.projectCandidates),
      );
      setProjectsState((currentValue) =>
        resolveDatasetState(currentValue, dashboardData.projects),
      );
      setCandidatesState((currentValue) =>
        resolveDatasetState(currentValue, dashboardData.candidates),
      );
    }

    loadDashboardData();

    return () => {
      abortController.abort();
    };
  }, [reloadToken]);

  const statuses = useMemo(() => {
    return [
      'ALL',
      ...new Set(projectCandidatesState.data.map((item) => item.status).filter(Boolean)),
    ];
  }, [projectCandidatesState.data]);

  const statusCounts = useMemo(() => {
    return projectCandidatesState.data.reduce((counts, item) => {
      const key = item.status || 'UNKNOWN';
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
  }, [projectCandidatesState.data]);

  const globalError = useMemo(() => {
    const datasetStates = [projectCandidatesState, projectsState, candidatesState];

    const allDatasetsFailed = datasetStates.every(
      (datasetState) => datasetState.error && datasetState.data.length === 0,
    );

    return allDatasetsFailed ? 'The dashboard data could not be loaded right now.' : '';
  }, [projectCandidatesState, projectsState, candidatesState]);

  const isRefreshing =
    projectCandidatesState.loading || projectsState.loading || candidatesState.loading;

  const filteredAndSortedRows = useMemo(() => {
    // Filter first, then sort, so pagination always operates on the final visible dataset.
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

    const filteredRows = projectCandidatesState.data.filter((row) => {
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
  }, [projectCandidatesState.data, debouncedSearchTerm, statusFilter, sortField, sortDirection]);

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
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh data'}
          </button>
        </div>

        <Summary
          totalProjects={projectsState.data.length}
          totalProjectCandidates={projectCandidatesState.data.length}
          totalCandidates={candidatesState.data.length}
          projectCandidatesLoading={projectCandidatesState.loading}
          projectsLoading={projectsState.loading}
          candidatesLoading={candidatesState.loading}
          statusCounts={statusCounts}
          statusLoading={projectCandidatesState.loading}
        />

        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statuses={statuses}
        />

        {projectCandidatesState.loading && projectCandidatesState.data.length === 0 ? (
          <Loader label="Loading candidate data" />
        ) : (
          <>
            {globalError ? (
              <div className="state-card state-card--error">
                <strong>Some data could not be loaded cleanly.</strong>
                <span>{globalError}</span>
                <div>
                  <button
                    type="button"
                    className="retry-button"
                    onClick={() => setReloadToken((value) => value + 1)}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : null}

            <div className="results-meta">
              Showing <strong>{paginatedRows.length}</strong> rows on page{' '}
              <strong>{currentPage}</strong> of <strong>{totalPages}</strong> from{' '}
              <strong>{filteredAndSortedRows.length}</strong> matching candidates
            </div>

            {projectCandidatesState.error &&
            projectCandidatesState.data.length === 0 &&
            !globalError ? (
              <div className="state-card state-card--error">
                <strong>Candidate data could not be loaded.</strong>
                <span>{projectCandidatesState.error}</span>
              </div>
            ) : null}

            <Table
              rows={paginatedRows}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortFieldChange}
            />

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
