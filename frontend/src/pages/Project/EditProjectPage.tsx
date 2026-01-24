import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectService } from "../../services/projectService";
import { ProjectForm } from "../../components/project/ProjectForm";
import type { PropertyProject } from "../../types/project";

const EditProjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<PropertyProject | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            try {
                const response = await projectService.getProjectById(id);
                setProject(response.data);
            } catch (err: any) {
                setError("Failed to fetch project details");
            } finally {
                setFetching(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleUpdate = async (formData: Partial<PropertyProject>) => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            await projectService.updateProject(id, formData);
            navigate("/projects");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update project");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-400">Loading project details...</div>;
    }

    return (
        <ProjectForm
            initialData={project || {}}
            onSubmit={handleUpdate}
            loading={loading}
            error={error}
            onCancel={() => navigate("/projects")}
        />
    );
};

export default EditProjectPage;
