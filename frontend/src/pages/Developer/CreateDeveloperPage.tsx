import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";

import { developerService } from "../../services/developerService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateDeveloperInput } from "../../types/developer";

const CreateDeveloperPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateDeveloperInput>({
    developer_name: "",
    developer_logo_url: "",
    developer_rating: 0,
    reputation: "",
    esgComplianceScore: 0,
    developer_contact: {
      email: "",
      phone: ""
    },
    developer_previous_projects: [],
    projects: [],
    properties: [],
    active: true,
  });

  const [newPrevProject, setNewPrevProject] = useState("");

  const handleAddPrevProject = () => {
    if (!newPrevProject.trim()) return;
    setFormData(prev => ({
      ...prev,
      developer_previous_projects: [...(prev.developer_previous_projects || []), newPrevProject.trim()]
    }));
    setNewPrevProject("");
  };

  const removePrevProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      developer_previous_projects: (prev.developer_previous_projects || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.developer_name) {
        setError("Developer Name is required");
        setLoading(false);
        return;
      }

      await developerService.create(formData);
      navigate("/developers");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create developer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/developers")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Developers
        </Button>
        <h1 className="text-2xl font-semibold">Create New Developer</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Developer Name *</label>
            <Input
              required
              value={formData.developer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, developer_name: e.target.value }))}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. Vianaar Homes"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
              <Input
                value={formData.developer_logo_url || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, developer_logo_url: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rating (0-10)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.developer_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, developer_rating: parseFloat(e.target.value) }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Reputation / Bio</label>
            <textarea
              value={formData.reputation}
              onChange={(e) => setFormData(prev => ({ ...prev, reputation: e.target.value }))}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white min-h-[100px]"
              placeholder="Describe the developer's reputation..."
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm text-gray-400 font-medium">Previous Projects</label>
            <div className="flex gap-2">
              <Input
                value={newPrevProject}
                onChange={(e) => setNewPrevProject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrevProject())}
                placeholder="Add a previous project name"
                className="bg-gray-800 border-gray-700"
              />
              <Button type="button" onClick={handleAddPrevProject} variant="secondary">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.developer_previous_projects?.map((project, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-800 border border-gray-700 px-2 py-1 rounded text-sm group">
                  <span>{project}</span>
                  <button
                    type="button"
                    onClick={() => removePrevProject(index)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {(!formData.developer_previous_projects || formData.developer_previous_projects.length === 0) && (
                <p className="text-sm text-gray-500">No previous projects added</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4">
             <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <Input
                type="email"
                value={formData.developer_contact?.email || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, developer_contact: { ...prev.developer_contact!, email: e.target.value } }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <Input
                value={formData.developer_contact?.phone || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, developer_contact: { ...prev.developer_contact!, phone: e.target.value } }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ESG Compliance Score (0-10)</label>
              <Input
                type="number"
                min="0"
                max="10"
                value={formData.esgComplianceScore}
                onChange={(e) => setFormData(prev => ({ ...prev, esgComplianceScore: parseInt(e.target.value) }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.active} 
                  onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))} 
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/developers")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateDeveloperPage;
