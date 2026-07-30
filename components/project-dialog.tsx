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
    type TeamMember,
} from "@/lib/lookup";
import { Project, ProjectStatus } from "@/lib/types";


/**
 * Dropdown for selecting a project status from the lookup data.
 */
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

/**
 * Dropdown for selecting the assigned team member from the lookup data.
 */
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
    dialogRef?: React.RefObject<HTMLDialogElement | null>;
    onClose?: () => void;
}

/**
 * Modal form for creating or editing a project.
 * It submits form data to the projects API route and shows server-side errors inline.
 */
export default function ProjectDialog({ project, dialogRef, onClose }: ProjectDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(project?.name ?? "");
    const [statusId, setStatusId] = useState(String(project?.project_status_id ?? ""));
    const [deadline, setDeadline] = useState(project?.deadline ?? "");
    const [memberId, setMemberId] = useState(String(project?.team_member_id ?? ""));
    const [budget, setBudget] = useState(project?.budget ? String(project.budget) : "");
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        setName(project?.name ?? "");
        setStatusId(String(project?.project_status_id ?? ""));
        setDeadline(project?.deadline ?? "");
        setMemberId(String(project?.team_member_id ?? ""));
        setBudget(project?.budget != null ? String(project.budget) : "");
        setApiError(null);
    }, [project]);

    const handleCancel = () => {
        dialogRef?.current?.close();
        onClose?.();
    };

    const handleDialogClose = () => {
        onClose?.();
    };

    const onSubmit = async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
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

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = (payload && (payload.error || payload.message)) || 'Failed to save project';
                setApiError(String(msg));
                return;
            }

            console.log('Project saved:', payload);
            window.location.reload();
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('Error:', msg);
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog
            id="project-dialog"
            ref={dialogRef}
            onClose={handleDialogClose}
            className="w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        >
            <form method="dialog" className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
                <div className="sm:col-span-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => {
                            setApiError(null);
                            setName(e.target.value);
                        }}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="project_status_id">Project Status</Label>
                    <ProjectStatusSelect value={statusId} onChange={(v) => { setApiError(null); setStatusId(v); }} />
                </div>
                <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                        type="date"
                        name="deadline"
                        id="deadline"
                        value={deadline}
                        onChange={(e) => {
                            setApiError(null);
                            setDeadline(e.target.value);
                        }}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="team_member_id">Team Member</Label>
                    <ProjectTeamMemberSelect value={memberId} onChange={(v) => { setApiError(null); setMemberId(v); }} />
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                        type="number"
                        name="budget"
                        id="budget"
                        step="0.01"
                        value={budget}
                        onChange={(e) => { setApiError(null); setBudget(e.target.value); }}
                    />
                </div>
                {apiError ? (
                    <div className="sm:col-span-2">
                        <p className="text-sm text-destructive mt-1">{apiError}</p>
                    </div>
                ) : null}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end sm:col-span-2">
                    <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? 'Saving...' : project ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </dialog>
    );
}