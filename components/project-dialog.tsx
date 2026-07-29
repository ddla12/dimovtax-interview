'use client';

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import Select from "./ui/select";
import {
    getProjectStatuses,
    getTeamMembers,
    loadLookupData,
    type ProjectStatus,
    type TeamMember,
} from "@/lib/lookup";

type Project = {
    id: number;
    name: string;
    project_status_id: number;
    deadline: string;
    team_member_id: number;
    budget: number | null;
};

function ProjectStatusSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);

    useEffect(() => {
        loadLookupData()
            .then(() => setProjectStatuses(getProjectStatuses()))
            .catch((err) => console.error(err));
    }, []);

    return (
        <Select
            name="project_status_id"
            id="project_status_id"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">Select a status</option>
            {projectStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                    {status.name}
                </option>
            ))}
        </Select>
    );
}

function ProjectTeamMemberSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        loadLookupData()
            .then(() => setTeamMembers(getTeamMembers()))
            .catch((err) => console.error(err));
    }, []);

    return (
        <Select
            name="team_member_id"
            id="team_member_id"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">Select a team member</option>
            {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                    {member.name}
                </option>
            ))}
        </Select>
    );
}

interface ProjectDialogProps {
    project?: Project;
    dialogRef?: React.RefObject<HTMLDialogElement>;
    onClose?: () => void;
}

export default function ProjectDialog({ project, dialogRef, onClose }: ProjectDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(project?.name ?? "");
    const [statusId, setStatusId] = useState(String(project?.project_status_id ?? ""));
    const [deadline, setDeadline] = useState(project?.deadline ?? "");
    const [memberId, setMemberId] = useState(String(project?.team_member_id ?? ""));
    const [budget, setBudget] = useState(project?.budget ? String(project.budget) : "");

    useEffect(() => {
        setName(project?.name ?? "");
        setStatusId(String(project?.project_status_id ?? ""));
        setDeadline(project?.deadline ?? "");
        setMemberId(String(project?.team_member_id ?? ""));
        setBudget(project?.budget != null ? String(project.budget) : "");
    }, [project]);

    const handleCancel = () => {
        dialogRef?.current?.close();
        onClose?.();
    };

    const handleDialogClose = () => {
        onClose?.();
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('project_status_id', statusId);
            formData.append('deadline', deadline);
            formData.append('team_member_id', memberId);
            if (budget) {
                formData.append('budget', budget);
            }

            const method = project ? 'PUT' : 'POST';
            const url = '/api/projects';

            if (project) {
                formData.append('id', project.id.toString());
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
            setName("");
            setStatusId("");
            setDeadline("");
            setMemberId("");
            setBudget("");
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog id="project-dialog" ref={dialogRef} onClose={handleDialogClose}>
            <form method="dialog" className="p-4 rounded" onSubmit={onSubmit}>
                <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="project_status_id">Project Status</Label>
                    <ProjectStatusSelect value={statusId} onChange={setStatusId} />
                </div>
                <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                        type="date"
                        name="deadline"
                        id="deadline"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="team_member_id">Team Member</Label>
                    <ProjectTeamMemberSelect value={memberId} onChange={setMemberId} />
                </div>
                <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                        type="number"
                        name="budget"
                        id="budget"
                        step="0.01"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    />
                </div>
                <div className="mt-4 flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : project ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </dialog>
    );
}