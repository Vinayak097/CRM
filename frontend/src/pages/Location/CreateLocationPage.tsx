import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";

import { locationService } from "../../services/locationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateLocationInput } from "../../types/location";

const CreateLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateLocationInput>({
    name: "",
    description: "",
    image: "",
    coordinates: { lat: 15.4909, lng: 73.8278 }, // Default to Goa coordinates
    highlights: [],
    amenities: [],
    featured: false,
    active: true,
  });

  const [newHighlight, setNewHighlight] = useState("");

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()]
    }));
    setNewHighlight("");
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name) {
        setError("Name is required");
        setLoading(false);
        return;
      }

      await locationService.create(formData);
      navigate("/locations");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/locations")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Locations
        </Button>
        <h1 className="text-2xl font-semibold">Create New Location</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name *</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g. Vagator"
            />
          </div>


          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white min-h-[100px]"
              placeholder="Describe the location..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Image URL</label>
            <Input
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="bg-gray-800 border-gray-700"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Latitude</label>
              <Input
                type="number"
                step="any"
                value={formData.coordinates.lat}
                onChange={(e) => setFormData(prev => ({ ...prev, coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) } }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Longitude</label>
              <Input
                type="number"
                step="any"
                value={formData.coordinates.lng}
                onChange={(e) => setFormData(prev => ({ ...prev, coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) } }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Highlights</label>
            <div className="flex gap-2 mb-3">
              <Input 
                value={newHighlight} 
                onChange={e => setNewHighlight(e.target.value)} 
                className="bg-gray-800 border-gray-700"
                placeholder="Add a highlight..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHighlight())}
              />
              <Button type="button" onClick={handleAddHighlight} variant="secondary">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.highlights.map((h, i) => (
                <span key={i} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                  {h} <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => removeHighlight(i)} />
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.featured} 
                onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))} 
              />
              <span className="text-sm">Featured</span>
            </label>
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

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/locations")}
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

export default CreateLocationPage;
