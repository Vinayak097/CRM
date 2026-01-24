import React, { useState } from "react";
import { Save, X, Info, Layers, DollarSign, Shield, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PropertyProject } from "../../types/project";

interface ProjectFormProps {
    initialData?: Partial<PropertyProject>;
    onSubmit: (data: any) => void;
    loading: boolean;
    error: string | null;
    onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    initialData,
    onSubmit,
    loading,
    error,
    onCancel,
}) => {
    const [activeTab, setActiveTab] = useState("basic");
    const [formData, setFormData] = useState<any>({
        name: "",
        subtitle: "",
        project_type: "Residential",
        project_status: "Planning",
        description_short: "",
        description_full: "",
        location_id: "",
        project_pricing: {
            min_price: { value: 0, currency: "INR" },
            max_price: { value: 0, currency: "INR" },
            average_price: 0,
        },
        ...initialData,
    });

    const handleInputChange = (path: string, value: any) => {
        const newFormData = { ...formData };
        const parts = path.split(".");
        let current = newFormData;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        setFormData(newFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const tabs = [
        { id: "basic", label: "Basic Info", icon: <Info size={18} /> },
        { id: "details", label: "Project Details", icon: <Layers size={18} /> },
        { id: "pricing", label: "Pricing & Timeline", icon: <DollarSign size={18} /> },
        { id: "amenities", label: "Amenities & Features", icon: <Waves size={18} /> },
        { id: "compliance", label: "Compliance & Security", icon: <Shield size={18} /> },
    ];

    return (
        <div className="p-4 md:p-6 text-white min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{initialData?._id ? "Edit Project" : "Create New Project"}</h1>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel} disabled={loading}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save Project"}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "hover:bg-gray-800 text-gray-400"
                                }`}
                        >
                            {tab.icon}
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                    {activeTab === "basic" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Project Name *</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="e.g. Skyline Heights"
                                        className="bg-gray-800 border-gray-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Subtitle</label>
                                    <Input
                                        value={formData.subtitle}
                                        onChange={(e) => handleInputChange("subtitle", e.target.value)}
                                        placeholder="e.g. Premium Living"
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Project Type *</label>
                                    <select
                                        value={formData.project_type}
                                        onChange={(e) => handleInputChange("project_type", e.target.value)}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Mixed Use">Mixed Use</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Project Status *</label>
                                    <select
                                        value={formData.project_status}
                                        onChange={(e) => handleInputChange("project_status", e.target.value)}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="Under Construction">Under Construction</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Ready to Move">Ready to Move</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Location ID</label>
                                    <Input
                                        value={formData.location_id}
                                        onChange={(e) => handleInputChange("location_id", e.target.value)}
                                        placeholder="Select Location"
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Short Description</label>
                                <textarea
                                    value={formData.description_short}
                                    onChange={(e) => handleInputChange("description_short", e.target.value)}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white h-24"
                                    placeholder="Summarize the project..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "details" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Project Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Developer Name</label>
                                    <Input
                                        value={formData.project_details?.developer_name || ""}
                                        onChange={(e) => handleInputChange("project_details.developer_name", e.target.value)}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Total Units</label>
                                    <Input
                                        type="number"
                                        value={formData.project_details?.total_units || ""}
                                        onChange={(e) => handleInputChange("project_details.total_units", parseInt(e.target.value))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Total Floors</label>
                                    <Input
                                        type="number"
                                        value={formData.buildingDetails?.totalFloors || ""}
                                        onChange={(e) => handleInputChange("buildingDetails.totalFloors", parseInt(e.target.value))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Construction Quality</label>
                                    <Input
                                        value={formData.buildingDetails?.constructionQuality || ""}
                                        onChange={(e) => handleInputChange("buildingDetails.constructionQuality", e.target.value)}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "pricing" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Pricing & Timeline</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300">Pricing</h3>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Minimum Price</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                value={formData.project_pricing?.min_price?.value || ""}
                                                onChange={(e) => handleInputChange("project_pricing.min_price.value", parseFloat(e.target.value))}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                            <select className="bg-gray-800 border-gray-700 rounded px-2">
                                                <option>INR</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Maximum Price</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                value={formData.project_pricing?.max_price?.value || ""}
                                                onChange={(e) => handleInputChange("project_pricing.max_price.value", parseFloat(e.target.value))}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                            <select className="bg-gray-800 border-gray-700 rounded px-2">
                                                <option>INR</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300">Timeline</h3>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Launch Date</label>
                                        <Input
                                            type="date"
                                            value={formData.timeline?.launch_date?.split("T")[0] || ""}
                                            onChange={(e) => handleInputChange("timeline.launch_date", e.target.value)}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Estimated Completion</label>
                                        <Input
                                            type="date"
                                            value={formData.timeline?.estimated_completion_date?.split("T")[0] || ""}
                                            onChange={(e) => handleInputChange("timeline.estimated_completion_date", e.target.value)}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "amenities" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Amenities & Features</h2>
                            <div className="space-y-4">
                                <label className="text-sm text-gray-400">Unique Selling Points (comma separated)</label>
                                <textarea
                                    value={formData.project_features?.unique_selling_points?.join(", ") || ""}
                                    onChange={(e) => handleInputChange("project_features.unique_selling_points", e.target.value.split(",").map(s => s.trim()))}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white h-24"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Infrastructure</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.infrastructure?.evChargingInfra || false}
                                            onChange={(e) => handleInputChange("infrastructure.evChargingInfra", e.target.checked)}
                                        />
                                        <label className="text-sm text-gray-300">EV Charging Infra</label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-medium">Parking</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.parking?.visitorParking || false}
                                            onChange={(e) => handleInputChange("parking.visitorParking", e.target.checked)}
                                        />
                                        <label className="text-sm text-gray-300">Visitor Parking</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "compliance" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Compliance & Security</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.compliance?.reraApproved || false}
                                            onChange={(e) => handleInputChange("compliance.reraApproved", e.target.checked)}
                                        />
                                        <label className="text-sm text-gray-300 font-medium">RERA Approved</label>
                                    </div>
                                    {formData.compliance?.reraApproved && (
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">RERA Number</label>
                                            <Input
                                                value={formData.compliance?.reraNumber || ""}
                                                onChange={(e) => handleInputChange("compliance.reraNumber", e.target.value)}
                                                className="bg-gray-800 border-gray-700"
                                                placeholder="Registration No."
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.security?.gatedCommunity || false}
                                            onChange={(e) => handleInputChange("security.gatedCommunity", e.target.checked)}
                                        />
                                        <label className="text-sm text-gray-300 font-medium">Gated Community</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
