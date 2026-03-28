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

async function fetchGraphQL(query) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  // The API can still fail even when the HTTP layer succeeds.
  if (payload.errors?.length) {
    const message = payload.errors.map((error) => error.message).join(' | ');
    throw new Error(message || 'GraphQL returned an unknown error.');
  }

  return payload.data || {};
}

export async function fetchProjectCandidates() {
  const data = await fetchGraphQL(PROJECT_CANDIDATES_QUERY);

  return (data.projectCandidates ?? []).map((item) => ({
    id: String(item.id ?? ''),
    status: item.status || 'UNKNOWN',
    projectName: item.project?.name || 'Unnamed project',
  }));
}

export async function fetchProjects() {
  const data = await fetchGraphQL(PROJECTS_QUERY);

  return (data.projects ?? []).map((project) => ({
    id: String(project.id ?? ''),
    name: project.name || 'Unnamed project',
  }));
}
