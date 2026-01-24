import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "../../services/projectService";
import { ProjectForm } from "../../components/project/ProjectForm";
import type { PropertyProject } from "../../types/project";

const CreateProjectPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (formData: Partial<PropertyProject>) => {
        setLoading(true);
        setError(null);

        try {
            await projectService.createProject(formData);
            navigate("/projects");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProjectForm
            onSubmit={handleCreate}
            loading={loading}
            error={error}
            onCancel={() => navigate("/projects")}
        />
    );
};

export default CreateProjectPage;
