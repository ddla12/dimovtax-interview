import { useEffect, useState } from "react";

'use client';

interface ProjectStatus {
    id: number;
    name: string;
}

function ProjectStatusSelect() {
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);

    useEffect(() => {
        const fetchProjectStatuses = async () => {
            const response = await fetch('/api/project-status');
            const data = await response.json();
            setProjectStatuses(data);
        };

        fetchProjectStatuses();
    }, []);

    return (
        <select name="project_status_id" id="project_status_id">
            {projectStatuses.map(status => (
                <option key={status.id} value={status.id}>
                    {status.name}
                </option>
            ))}
        </select>
    );
}

interface TeamMember {
    id: number;
    name: string;
}

function ProjectTeamMemberSelect() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            const response = await fetch('/api/team-member');
            const data = await response.json();
            setTeamMembers(data);
        };

        fetchTeamMembers();
    }, []);

    return (
        <select name="team_member_id" id="team_member_id">
            {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                    {member.name}
                </option>
            ))}
        </select>
    );
}

export default function ProjectDialog() {
    const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {

    };

    return (
        <dialog>
            <form method="dialog" onSubmit={onSubmit}>
                <input type="text" name="name" id="name" />
                <ProjectStatusSelect />
                <input type="date" name="deadline" id="deadline" />
                <ProjectTeamMemberSelect />
                <input type="number" name="budget" id="budget" />
                <button type="submit">Submit</button>
            </form>
        </dialog>
    );
}