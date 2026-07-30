/**
 * Represents a project status option loaded from the database.
 */
export type ProjectStatus = {
  id: number;
  name: string;
};

/**
 * Represents a team member option loaded from the database.
 */
export type TeamMember = {
  id: number;
  name: string;
};

let statuses: ProjectStatus[] = [];
let teamMembers: TeamMember[] = [];
let statusById: Record<number, string> = {};
let teamMemberById: Record<number, string> = {};
let initPromise: Promise<void> | null = null;

/**
 * Loads project status and team member lookup data from the API.
 * The values are cached so repeated calls do not trigger duplicate requests.
 */
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

/**
 * Returns the cached project status list.
 */
export function getProjectStatuses(): ProjectStatus[] {
  return statuses;
}

/**
 * Returns the cached team member list.
 */
export function getTeamMembers(): TeamMember[] {
  return teamMembers;
}

/**
 * Resolves a project status name from its identifier.
 *
 * @param id - The project status identifier.
 * @returns The matching status name or the raw id if no match exists.
 */
export function getProjectStatusName(id?: number): string {
  if (id == null) {
    return '';
  }

  return statusById[id] ?? String(id);
}

/**
 * Resolves a team member name from its identifier.
 *
 * @param id - The team member identifier.
 * @returns The matching member name or the raw id if no match exists.
 */
export function getTeamMemberName(id?: number): string {
  if (id == null) {
    return '';
  }

  return teamMemberById[id] ?? String(id);
}
