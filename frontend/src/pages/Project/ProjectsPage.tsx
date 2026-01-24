import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, Filter, X } from "lucide-react";
import { projectService, type QueryProjectParams } from "../../services/projectService";
import type { PropertyProject, ProjectStatus } from "../../types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 10;

const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<PropertyProject[]>([]);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        project_status: "" as ProjectStatus | "",
        project_type: "",
    });

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: QueryProjectParams = {
                page,
                limit: PAGE_SIZE,
            };
            if (search) params.search = search;
            if (filters.project_status) params.project_status = filters.project_status as ProjectStatus;
            if (filters.project_type) params.project_type = filters.project_type;

            const response = await projectService.getProjects(params);
            setProjects(response.data);
            setTotalPages(response.pagination.totalPages);
            setTotal(response.pagination.total);
        } catch {
            setError("Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    }, [page, search, filters]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await projectService.deleteProject(id);
            fetchProjects();
        } catch {
            alert("Failed to delete project");
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            project_status: "",
            project_type: "",
        });
        setPage(1);
    };

    const getStatusColor = (status?: string) => {
        const colors: Record<string, string> = {
            'Planning': "bg-yellow-500/20 text-yellow-400",
            'Under Construction': "bg-blue-500/20 text-blue-400",
            'Completed': "bg-green-500/20 text-green-400",
            'Ready to Move': "bg-cyan-500/20 text-cyan-400",
        };
        return colors[status || ""] || "bg-gray-500/20 text-gray-400";
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== "");

    return (
        <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold">Projects</h1>
                        <p className="text-gray-400 text-sm mt-1">{total} total projects</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            className="sm:w-auto w-full"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {hasActiveFilters && (
                                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                                    {Object.values(filters).filter((v) => v !== "").length}
                                </span>
                            )}
                        </Button>
                        <Button onClick={() => navigate("/projects/create")} className="sm:w-auto w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex gap-2 flex-1">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search projects by name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9 bg-gray-800 border-gray-700 text-white w-full"
                            />
                        </div>
                        <Button onClick={handleSearch} variant="secondary" size="icon" className="shrink-0">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Filters</h3>
                            <div className="flex gap-2">
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Project Status</label>
                                <select
                                    value={filters.project_status}
                                    onChange={(e) => handleFilterChange("project_status", e.target.value)}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Planning">Planning</option>
                                    <option value="Under Construction">Under Construction</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Ready to Move">Ready to Move</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Project Type</label>
                                <select
                                    value={filters.project_type}
                                    onChange={(e) => handleFilterChange("project_type", e.target.value)}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Mixed Use">Mixed Use</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
                    {error}
                </div>
            )}

            {/* Mobile grid view */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-6 text-center text-gray-400">Loading...</div>
                ) : projects.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">No projects found</div>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project._id}
                            className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">{project.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{project.subtitle || "No subtitle"}</p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusColor(project.project_status)}`}
                                >
                                    {project.project_status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-3">
                                <div className="text-gray-400">
                                    Type: <span className="text-gray-200">{project.project_type}</span>
                                </div>
                                {project.project_pricing?.average_price && (
                                    <div className="text-gray-400">
                                        Avg: <span className="text-primary">₹{project.project_pricing.average_price}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-gray-700">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-blue-400 hover:text-blue-300"
                                    onClick={() => navigate(`/projects/${project._id}/edit`)}
                                >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-red-400 hover:text-red-300"
                                    onClick={() => handleDelete(project._id, project.name)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto rounded border border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-300">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Price Range</th>
                            <th className="p-3">Avg Price</th>
                            <th className="p-3">Developer</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : projects.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-400">
                                    No projects found
                                </td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr
                                    key={project._id}
                                    className="border-t border-gray-700 hover:bg-gray-800"
                                >
                                    <td className="p-3 font-medium">
                                        <div>
                                            {project.name}
                                            <p className="text-xs text-gray-500 font-normal">{project.subtitle}</p>
                                        </div>
                                    </td>
                                    <td className="p-3">{project.project_type}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(project.project_status)}`}>
                                            {project.project_status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {project.project_pricing?.min_price?.display_value} - {project.project_pricing?.max_price?.display_value}
                                    </td>
                                    <td className="p-3">
                                        {project.project_pricing?.average_price ? `₹${project.project_pricing.average_price}` : "-"}
                                    </td>
                                    <td className="p-3 text-sm text-gray-400">
                                        {project.project_details?.developer_name || project.developer?.developer_id || "-"}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-400 hover:text-blue-300"
                                                onClick={() => navigate(`/projects/${project._id}/edit`)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300"
                                                onClick={() => handleDelete(project._id, project.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center md:justify-end items-center gap-3 mt-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="flex-1 sm:flex-none"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Prev</span>
                        </Button>
                        <span className="text-sm text-gray-400 px-2">
                            {page} / {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="flex-1 sm:flex-none"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
