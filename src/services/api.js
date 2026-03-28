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

const PROJECTS_QUERY = `
  query RecruiterDashboardProjects {
    projects {
      id
      name
    }
  }
`;

const CANDIDATES_QUERY = `
  query RecruiterDashboardCandidates {
    candidates {
      id
    }
  }
`;

async function fetchGraphQL(query) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ query }),
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

    const graphQLError =
      payload.errors?.map((error) => error.message).filter(Boolean).join(' ') || null;

    return {
      data: payload.data ?? null,
      error: graphQLError ? 'Some records could not be fetched from the API.' : null,
    };
  } catch {
    return {
      data: null,
      error: 'A network error interrupted the request.',
    };
  }
}

export async function fetchProjectCandidates() {
  const result = await fetchGraphQL(PROJECT_CANDIDATES_QUERY);
  const items = result.data?.projectCandidates;

  return {
    data: Array.isArray(items)
      ? items.map((item) => ({
          id: String(item.id ?? ''),
          status: item.status || 'UNKNOWN',
          projectName: item.project?.name || 'Unnamed project',
        }))
      : [],
    error: result.error,
  };
}

export async function fetchProjects() {
  const result = await fetchGraphQL(PROJECTS_QUERY);
  const items = result.data?.projects;

  return {
    data: Array.isArray(items)
      ? items.map((project) => ({
          id: String(project.id ?? ''),
          name: project.name || 'Unnamed project',
        }))
      : [],
    error: result.error,
  };
}

export async function fetchCandidates() {
  const result = await fetchGraphQL(CANDIDATES_QUERY);
  const items = result.data?.candidates;

  return {
    data: Array.isArray(items)
      ? items.map((candidate) => ({
          id: String(candidate.id ?? ''),
        }))
      : [],
    error: result.error,
  };
}
