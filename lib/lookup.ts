export type ProjectStatus = {
  id: number;
  name: string;
};

export type TeamMember = {
  id: number;
  name: string;
};

let statuses: ProjectStatus[] = [];
let teamMembers: TeamMember[] = [];
let statusById: Record<number, string> = {};
let teamMemberById: Record<number, string> = {};
let initPromise: Promise<void> | null = null;

export async function loadLookupData(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const [statusResponse, teamMemberResponse] = await Promise.all([
        fetch('/api/project-status'),
        fetch('/api/team-member'),
      ]);

      if (!statusResponse.ok) {
        throw new Error('Failed to load project statuses');
      }

      if (!teamMemberResponse.ok) {
        throw new Error('Failed to load team members');
      }

      const statusData = (await statusResponse.json()) as ProjectStatus[];
      const teamMemberData = (await teamMemberResponse.json()) as TeamMember[];

      statuses = statusData;
      teamMembers = teamMemberData;
      statusById = Object.fromEntries(statusData.map((status) => [status.id, status.name]));
      teamMemberById = Object.fromEntries(teamMemberData.map((member) => [member.id, member.name]));
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

export function getProjectStatuses(): ProjectStatus[] {
  return statuses;
}

export function getTeamMembers(): TeamMember[] {
  return teamMembers;
}

export function getProjectStatusName(id?: number): string {
  if (id == null) {
    return '';
  }

  return statusById[id] ?? String(id);
}

export function getTeamMemberName(id?: number): string {
  if (id == null) {
    return '';
  }

  return teamMemberById[id] ?? String(id);
}
