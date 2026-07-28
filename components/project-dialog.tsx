'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import Select from "./ui/select";

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
        <Select name="project_status_id" id="project_status_id">
            {projectStatuses.map(status => (
                <option key={status.id} value={status.id}>
                    {status.name}
                </option>
            ))}
        </Select>
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
        <Select name="team_member_id" id="team_member_id">
            {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                    {member.name}
                </option>
            ))}
        </Select>
    );
}

export default function ProjectDialog({ projectId }: { projectId?: number }) {
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const method = projectId ? 'PUT' : 'POST';
            const url = '/api/projects';

            if (projectId) {
                formData.append('id', projectId.toString());
            }

            const response = await fetch(url, {
                method,
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save project');
            }

            const data = await response.json();
            console.log('Project saved:', data);
            
            // Reset form and close dialog if needed
            event.currentTarget.reset();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog id="project-dialog">
            <form method="dialog" className="p-4 rounded" onSubmit={onSubmit}>
                <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input type="text" name="name" id="name" required />
                </div>
                <div>
                    <Label htmlFor="project_status_id">Project Status</Label>
                    <ProjectStatusSelect />
                </div>
                <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input type="date" name="deadline" id="deadline" required />
                </div>
                <div>
                    <Label htmlFor="team_member_id">Team Member</Label>
                    <ProjectTeamMemberSelect />
                </div>
                <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input type="number" name="budget" id="budget" step="0.01" />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Submit'}
                </Button>
            </form>
        </dialog>
    );
}