/**
 * Shape of a project row shown in the data table.
 */
export interface Project {
    id: number;
    name: string;
    project_status_id: number;
    deadline: string;
    team_member_id: number;
    budget: number | null;
};

/**
 * Represents a project status option loaded from the database.
 */
export interface ProjectStatus {
  id: number;
  name: string;
};