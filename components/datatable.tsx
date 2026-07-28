"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Select from "./ui/select";

type Project = {
    id: number;
    name: string;
    project_status_id: number;
    deadline: string;
    team_member_id: number;
    budget: number | null;
};

type ProjectsResponse = {
    data: Project[];
    pagination: {
        page: number;
        limit: number;
        total: number | null;
        pages: number;
    };
};

type Status = {
    id: number;
    name: string;
};

function ProjectRow({ project }: { project: Project }) {
    return (
        <tr key={project.id} className="border-t border-border even:bg-muted">
            <td className="px-4 py-3 text-sm font-medium">{project.name}</td>
            <td className="px-4 py-3 text-sm">{project.project_status_id}</td>
            <td className="px-4 py-3 text-sm">{project.deadline}</td>
            <td className="px-4 py-3 text-sm">{project.team_member_id}</td>
            <td className="px-4 py-3 text-sm">
                {project.budget === null ? "—" : `$${project.budget.toFixed(2)}`}
            </td>
        </tr>        
    );
}

export default function Datatable() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [name, setName] = useState("");
    const [statusId, setStatusId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function loadStatuses() {
            try {
                const res = await fetch("/api/project-status");
                if (!res.ok) {
                    throw new Error("Failed to load project statuses");
                }
                const data: Status[] = await res.json();
                setStatuses(data);
            } catch (err) {
                console.error(err);
            }
        }

        loadStatuses();
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
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
                    <div>
                        <Label htmlFor="status-filter">Status</Label>
                        <select
                            id="status-filter"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
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
                {/* This communicates with the project dialog*/}
                <Button command="show-modal" commandfor="project-dialog">
                    Create Project
                </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="min-w-full border-collapse text-left">
                    <caption className="sr-only">Projects table</caption>
                    <thead>
                        <tr className="bg-muted text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                    Loading projects...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-sm text-destructive">
                                    {error}
                                </td>
                            </tr>
                        ) : projects.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                    No projects found.
                                </td>
                            </tr>
                        ) : (
                            projects.map((project) => <ProjectRow key={project.id} project={project} />)
                        )}
                    </tbody>
                </table>
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
        </section>
    );
}