const GRAPHQL_ENDPOINT = 'https://release-current.starhunter.software/Api/graphql';
const AUTH_TOKEN = '5a9bf82f-2a4e-43bb-89b6-d83459db4390';

const DASHBOARD_QUERY = `
  query RecruiterDashboardData {
    projectCandidates {
      id
      status
      project {
        name
      }
    }
    projects {
      id
      name
    }
    candidates {
      id
    }
  }
`;

async function fetchGraphQL(query, options = {}) {
  const { signal } = options;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ query }),
      signal,
    });

    if (!response.ok) {
      return {
        data: null,
        error: 'The server could not be reached successfully.',
      };
    }

    const rawBody = await response.text();

    if (!rawBody.trim()) {
      return {
        data: null,
        error: 'The server returned an empty response.',
      };
    }

    let payload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return {
        data: null,
        error: 'The server returned malformed data.',
      };
    }

    return {
      data: payload.data ?? null,
      errors: Array.isArray(payload.errors) ? payload.errors : [],
      error:
        Array.isArray(payload.errors) && payload.errors.length > 0
          ? 'Some records could not be fetched from the API.'
          : null,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    return {
      data: null,
      error: 'A network error interrupted the request.',
    };
  }
}

function normalizeProjectCandidates(items) {
  return Array.isArray(items)
    ? items.map((item) => ({
        id: String(item.id ?? ''),
        status: item.status || 'UNKNOWN',
        projectName: item.project?.name || 'Unnamed project',
      }))
    : [];
}

function normalizeProjects(items) {
  return Array.isArray(items)
    ? items.map((project) => ({
        id: String(project.id ?? ''),
        name: project.name || 'Unnamed project',
      }))
    : [];
}

function normalizeCandidates(items) {
  return Array.isArray(items)
    ? items.map((candidate) => ({
        id: String(candidate.id ?? ''),
      }))
    : [];
}

function hasErrorForPath(errors, pathName) {
  return errors.some((error) => Array.isArray(error.path) && error.path[0] === pathName);
}

export async function fetchDashboardData(options = {}) {
  const result = await fetchGraphQL(DASHBOARD_QUERY, options);
  const errors = result.errors || [];
  const data = result.data || {};
  const requestFailed = !result.data && Boolean(result.error);

  return {
    projectCandidates: {
      data: normalizeProjectCandidates(data.projectCandidates),
      error:
        requestFailed || (result.error && hasErrorForPath(errors, 'projectCandidates'))
          ? 'Project candidate data is temporarily unavailable.'
          : '',
    },
    projects: {
      data: normalizeProjects(data.projects),
      error:
        requestFailed || (result.error && hasErrorForPath(errors, 'projects'))
          ? 'Project data is temporarily unavailable.'
          : '',
    },
    candidates: {
      data: normalizeCandidates(data.candidates),
      error:
        requestFailed || (result.error && hasErrorForPath(errors, 'candidates'))
          ? 'Candidate data is temporarily unavailable.'
          : '',
    },
    requestError:
      !result.data && result.error ? 'The dashboard data could not be loaded right now.' : '',
  };
}
