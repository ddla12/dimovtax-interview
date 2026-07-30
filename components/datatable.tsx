"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Select from "./ui/select";
import ProjectDialog from "./project-dialog";
import ConfirmDialog from "./confirm-dialog";
import {
    getProjectStatusName,
    getProjectStatuses,
    getTeamMemberName,
    loadLookupData,
} from "@/lib/lookup";
import { Project, ProjectStatus } from "@/lib/types";

/**
 * Maps project status names to badge styling classes.
 */
function ProjectStatusBadge({ statusName }: { statusName: string }) {
    const normalizedStatus = statusName.toLowerCase();

    const styles: Record<string, string> = {
        "not started": "border border-red-500/30 bg-red-500/15 text-red-200",
        "in progress": "border border-sky-500/30 bg-sky-500/15 text-sky-200",
        completed: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
        "on hold": "border border-slate-500/30 bg-slate-500/15 text-slate-200",
    };

    const className = styles[normalizedStatus] ?? "border border-border bg-muted text-muted-foreground";

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
            {statusName}
        </span>
    );
}

/**
 * API response shape returned by the projects listing endpoint.
 */
type ProjectsResponse = {
    data: Project[];
    pagination: {
        page: number;
        limit: number;
        total: number | null;
        pages: number;
    };
};

interface ProjectRowProps {
    project: Project;
    isSelected: boolean;
    onClickProject: (project: Project) => void;
    onToggleSelect: (projectId: number) => void;
}

/**
 * Renders a single project row in the desktop table view.
 */
function ProjectRow({ project, isSelected, onClickProject, onToggleSelect }: ProjectRowProps) {
    return (
        <tr
            onClick={() => onClickProject(project)}
            key={project.id}
            className="border-t border-border even:bg-muted cursor-pointer"
        >
            <td className="px-4 py-3 text-sm">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(project.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="h-4 w-4 rounded border border-input text-primary focus:ring-primary"
                />
            </td>
            <td className="px-4 py-3 text-sm font-medium">{project.name}</td>
            <td className="px-4 py-3 text-sm">
                <ProjectStatusBadge statusName={getProjectStatusName(project.project_status_id)} />
            </td>
            <td className="px-4 py-3 text-sm">{project.deadline}</td>
            <td className="px-4 py-3 text-sm">{getTeamMemberName(project.team_member_id)}</td>
            <td className="px-4 py-3 text-sm">
                {project.budget === null ? "—" : `$${project.budget.toFixed(2)}`}
            </td>
        </tr>
    );
}

/**
 * Renders a single project card for small-screen layouts.
 */
function ProjectCard({ project, isSelected, onClickProject, onToggleSelect }: ProjectRowProps) {
    return (
        <div
            onClick={() => onClickProject(project)}
            key={project.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md md:hidden"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    onClickProject(project);
                }
            }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(project.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="mt-1 h-4 w-4 rounded border border-input text-primary focus:ring-primary"
                    />
                    <div>
                        <p className="text-base font-medium">{project.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <ProjectStatusBadge statusName={getProjectStatusName(project.project_status_id)} />
                            <p className="text-sm text-muted-foreground">{project.deadline}</p>
                        </div>
                    </div>
                </div>
                <div className="text-right text-sm">
                    <p className="font-medium">{project.budget === null ? "—" : `$${project.budget.toFixed(2)}`}</p>
                    <p className="text-muted-foreground">{getTeamMemberName(project.team_member_id)}</p>
                </div>
            </div>
        </div>
    );
}

/**
 * Main project listing screen with search, filtering, pagination, and CRUD actions.
 */
export default function Datatable() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [name, setName] = useState("");
    const [statusId, setStatusId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const confirmDialogRef = useRef<HTMLDialogElement | null>(null);

    const openDialog = () => {
        dialogRef.current?.showModal();
    };

    const handleCreateProject = () => {
        setSelectedProject(undefined);
        openDialog();
    };

    const handleClickProject = (project: Project) => {
        setSelectedProject(project);
        openDialog();
    };

    const handleCloseDialog = () => {
        setSelectedProject(undefined);
    };

    const openConfirmDialog = () => {
        confirmDialogRef.current?.showModal();
    };

    const closeConfirmDialog = () => {
        confirmDialogRef.current?.close();
    };

    const handleToggleSelect = (projectId: number) => {
        setSelectedIds((current) =>
            current.includes(projectId)
                ? current.filter((id) => id !== projectId)
                : [...current, projectId]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectedIds.length === projects.length) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(projects.map((project) => project.id));
    };

    const handleRequestDelete = () => {
        if (selectedIds.length === 0) return;
        openConfirmDialog();
    };

    const handleConfirmDelete = async () => {
        if (selectedIds.length === 0) return;

        setIsDeleting(true);
        try {
            for (const id of selectedIds) {
                const response = await fetch(`/api/projects?id=${id}`, {
                    method: "DELETE",
                });

                const payload = await response.json();
                if (!response.ok) {
                    throw new Error((payload as { error?: string }).error || `Failed to delete project ${id}`);
                }
            }

            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete selected projects");
        } finally {
            setIsDeleting(false);
            closeConfirmDialog();
        }
    };

    useEffect(() => {
        loadLookupData()
            .then(() => setStatuses(getProjectStatuses()))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        async function loadProjects() {
            setIsLoading(true);
            setError(null);

            const searchParams = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            if (name.trim()) {
                searchParams.set("name", name.trim());
            }

            if (statusId) {
                searchParams.set("project_status_id", statusId);
            }

            try {
                const res = await fetch(`/api/projects?${searchParams.toString()}`);
                const payload = await res.json();

                if (!res.ok) {
                    throw new Error((payload as { error?: string }).error || "Failed to load projects");
                }

                const json = payload as ProjectsResponse;
                setProjects(json.data);
                setTotalPages(json.pagination.pages);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                setProjects([]);
                setTotalPages(1);
            } finally {
                setIsLoading(false);
            }
        }

        loadProjects();
    }, [page, limit, name, statusId]);

    return (
        <section className="w-full max-w-5xl p-4">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                    <div>
                        <Label htmlFor="project-search">Search projects</Label>
                        <Input
                            id="project-search"
                            type="search"
                            value={name}
                            onChange={(e) => {
                                setPage(1);
                                setName(e.target.value);
                            }}
                            placeholder="Search by name"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status-filter">Status</Label>
                        <Select
                            id="status-filter"
                            value={statusId}
                            onChange={(e) => {
                                setPage(1);
                                setStatusId(e.target.value);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={String(status.id)}>
                                    {status.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="page-size">Rows per page</Label>
                    <Select
                        id="page-size"
                        value={String(limit)}
                        onChange={(e) => {
                            setLimit(parseInt(e.target.value, 10));
                            setPage(1);
                        }}
                    >
                        {[10, 25, 50].map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
                    <Button type="button" className="w-full sm:w-auto" onClick={handleRequestDelete} disabled={selectedIds.length === 0 || isDeleting} variant="destructive">
                        Delete Selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                    </Button>
                    <Button type="button" className="w-full sm:w-auto" onClick={handleCreateProject}>
                        Create Project
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="grid gap-4 p-4 md:hidden">
                    {isLoading ? (
                        <div className="rounded-xl border border-border bg-background p-4 text-center text-sm text-muted-foreground">
                            Loading projects...
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-border bg-background p-4 text-center text-sm text-destructive">
                            {error}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="rounded-xl border border-border bg-background p-4 text-center text-sm text-muted-foreground">
                            No projects found.
                        </div>
                    ) : (
                        projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                isSelected={selectedIds.includes(project.id)}
                                onClickProject={handleClickProject}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))
                    )}
                </div>

                <div className="overflow-x-auto md:block hidden">
                    <table className="min-w-full w-full border-collapse text-left">
                        <caption className="sr-only">Projects table</caption>
                        <thead>
                            <tr className="bg-muted text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={projects.length > 0 && selectedIds.length === projects.length}
                                        onChange={handleToggleSelectAll}
                                        className="h-4 w-4 rounded border border-input text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Deadline</th>
                                <th className="px-4 py-3">Team member</th>
                                <th className="px-4 py-3">Budget</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                        Loading projects...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-destructive">
                                        {error}
                                    </td>
                                </tr>
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                        No projects found.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <ProjectRow
                                        key={project.id}
                                        project={project}
                                        isSelected={selectedIds.includes(project.id)}
                                        onClickProject={handleClickProject}
                                        onToggleSelect={handleToggleSelect}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={page <= 1 || isLoading}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                        Previous
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={page >= totalPages || isLoading}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <ProjectDialog project={selectedProject} dialogRef={dialogRef} onClose={handleCloseDialog} />
            <ConfirmDialog
                dialogRef={confirmDialogRef}
                selectedCount={selectedIds.length}
                isDeleting={isDeleting}
                onCancel={closeConfirmDialog}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
}