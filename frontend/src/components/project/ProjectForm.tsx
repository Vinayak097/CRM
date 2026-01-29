import React, { useState, useEffect } from "react";
import { Save, X, Info, Layers, DollarSign, Shield, Waves, Star, HardHat, Car, Briefcase, Leaf, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationSearch } from "../property/LocationSearch";
import { developerService } from "../../services/developerService";
import type { PropertyProject } from "../../types/project";

interface ProjectFormProps {
    initialData?: Partial<PropertyProject>;
    onSubmit: (data: any) => void;
    loading: boolean;
    error: string | null;
    onCancel: () => void;
}

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

export const ProjectForm: React.FC<ProjectFormProps> = ({
    initialData,
    onSubmit,
    loading,
    error,
    onCancel,
}) => {
    const [activeTab, setActiveTab] = useState("basic");
    const [developers, setDevelopers] = useState<any[]>([]);
    const [tempInputs, setTempInputs] = useState<Record<string, string>>({
        usp: "",
        recreational: "",
        outdoor: "",
        security: "",
        convenience: "",
    });

    useEffect(() => {
        const loadDevelopers = async () => {
            try {
                const data = await developerService.getAll({ active: true });
                if (Array.isArray(data)) {
                    setDevelopers(data);
                } else if (data && Array.isArray(data.data)) {
                    setDevelopers(data.data);
                }
            } catch (err) {
                console.error("Failed to load developers", err);
            }
        };
        loadDevelopers();
    }, []);

    const [formData, setFormData] = useState<any>({
        name: "",
        subtitle: "",
        project_type: "Residential",
        project_status: "Planning",
        description_short: "",
        description_full: "",
        location_id: "",
        developer: { developer_id: "" },
        project_details: {
            developer_id: "",
            developer_name: "",
            total_units: 0,
            available_units: 0,
            sold_units: 0,
            unit_types_available: [],
        },
        buildingDetails: {
            totalFloors: 0,
            totalUnits: 0,
            constructionYear: new Date().getFullYear(),
            buildingType: "",
            constructionQuality: "",
        },
        timeline: {
            launch_date: "",
            construction_start_date: "",
            estimated_completion_date: "",
            actual_completion_date: "",
            possession_start_date: "",
        },
        project_pricing: {
            min_price: { value: 0, currency: "INR" },
            max_price: { value: 0, currency: "INR" },
            average_price: 0,
        },
        compliance: {
            reraApproved: false,
            reraNumber: "",
            occupancyCertificate: false,
            fireNOC: false,
        },
        project_amenities: {
            recreational: [],
            outdoor: [],
            security: [],
            convenience: [],
        },
        project_features: {
            design_approach: "",
            construction_quality: "",
            unique_selling_points: [],
        },
        infrastructure: {
            evChargingInfra: false,
            powerBackup: { generator: false },
        },
        security: {
            gatedCommunity: false,
            surveillance: { cctv: false },
        },
        parking: {
            covered: false,
            open: false,
            visitorParking: false,
            evCharging: false,
        },
        sustainability: {
            energyEfficiency: { solar: false, wind: false },
            waterManagement: { recycling: false },
        },
        policies: {
            petPolicy: "",
            rentalPolicies: "",
            maxOccupancy: "",
        },
        ...initialData,
    });

    // Update formData when initialData changes (important for Edit page fetching logic)
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData((prev: any) => ({
                ...prev,
                ...initialData,
            }));
        }
    }, [initialData]);

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

    const addItem = (category: string, path: string) => {
        const value = tempInputs[category]?.trim();
        if (!value) return;

        const currentItems = path.split(".").reduce((obj, key) => obj?.[key], formData) || [];
        if (!currentItems.includes(value)) {
            handleInputChange(path, [...currentItems, value]);
        }
        setTempInputs({ ...tempInputs, [category]: "" });
    };

    const removeItem = (path: string, index: number) => {
        const currentItems = path.split(".").reduce((obj, key) => obj?.[key], formData) || [];
        handleInputChange(path, currentItems.filter((_: any, i: number) => i !== index));
    };

    const handleDeveloperChange = (developerId: string) => {
        const dev = developers.find(d => (d.id || d._id) === developerId);
        handleInputChange("developer.developer_id", developerId);
        handleInputChange("project_details.developer_id", developerId);
        handleInputChange("project_details.developer_name", dev?.developer_name || "");
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
        { id: "extra", label: "Extra Info", icon: <Settings size={18} /> },
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
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm text-gray-400">Location Selection</label>
                                    <LocationSearch
                                        value={formData.location_id}
                                        onSelect={(id) => handleInputChange("location_id", id)}
                                        placeholder="Search and select location..."
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
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Full Description</label>
                                <textarea
                                    value={formData.description_full}
                                    onChange={(e) => handleInputChange("description_full", e.target.value)}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white h-48"
                                    placeholder="Detailed project description..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "details" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Project Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Developer</label>
                                    <select
                                        value={formData.developer?.developer_id || ""}
                                        onChange={(e) => handleDeveloperChange(e.target.value)}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                    >
                                        <option value="">Select Developer</option>
                                        {developers.map((dev) => (
                                            <option key={dev.id || dev._id} value={dev.id || dev._id}>
                                                {dev.developer_name}
                                            </option>
                                        ))}
                                    </select>
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
                                    <label className="text-sm text-gray-400">Available Units</label>
                                    <Input
                                        type="number"
                                        value={formData.project_details?.available_units || ""}
                                        onChange={(e) => handleInputChange("project_details.available_units", parseInt(e.target.value))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Sold Units</label>
                                    <Input
                                        type="number"
                                        value={formData.project_details?.sold_units || ""}
                                        onChange={(e) => handleInputChange("project_details.sold_units", parseInt(e.target.value))}
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
                                    <label className="text-sm text-gray-400">Construction Year</label>
                                    <Input
                                        type="number"
                                        value={formData.buildingDetails?.constructionYear || ""}
                                        onChange={(e) => handleInputChange("buildingDetails.constructionYear", parseInt(e.target.value))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Building Type</label>
                                    <Input
                                        value={formData.buildingDetails?.buildingType || ""}
                                        onChange={(e) => handleInputChange("buildingDetails.buildingType", e.target.value)}
                                        className="bg-gray-800 border-gray-700"
                                        placeholder="e.g. High-rise, Boutique"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Construction Quality</label>
                                    <Input
                                        value={formData.buildingDetails?.constructionQuality || ""}
                                        onChange={(e) => handleInputChange("buildingDetails.constructionQuality", e.target.value)}
                                        className="bg-gray-800 border-gray-700"
                                        placeholder="e.g. Premium, Luxury"
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
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <DollarSign size={16} className="text-primary" /> Pricing
                                    </h3>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Price Currency</label>
                                        <select
                                            value={formData.project_pricing?.min_price?.currency || "INR"}
                                            onChange={(e) => {
                                                handleInputChange("project_pricing.min_price.currency", e.target.value);
                                                handleInputChange("project_pricing.max_price.currency", e.target.value);
                                            }}
                                            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                        >
                                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Minimum Price</label>
                                        <Input
                                            type="number"
                                            value={formData.project_pricing?.min_price?.value || ""}
                                            onChange={(e) => handleInputChange("project_pricing.min_price.value", parseFloat(e.target.value))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Maximum Price</label>
                                        <Input
                                            type="number"
                                            value={formData.project_pricing?.max_price?.value || ""}
                                            onChange={(e) => handleInputChange("project_pricing.max_price.value", parseFloat(e.target.value))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Average Price / Sq Ft</label>
                                        <Input
                                            type="number"
                                            value={formData.project_pricing?.average_price || ""}
                                            onChange={(e) => handleInputChange("project_pricing.average_price", parseFloat(e.target.value))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Briefcase size={16} className="text-primary" /> Timeline
                                    </h3>
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
                                        <label className="text-sm text-gray-400">Construction Start</label>
                                        <Input
                                            type="date"
                                            value={formData.timeline?.construction_start_date?.split("T")[0] || ""}
                                            onChange={(e) => handleInputChange("timeline.construction_start_date", e.target.value)}
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
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Possession Start</label>
                                        <Input
                                            type="date"
                                            value={formData.timeline?.possession_start_date?.split("T")[0] || ""}
                                            onChange={(e) => handleInputChange("timeline.possession_start_date", e.target.value)}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "amenities" && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Amenities & Features</h2>

                            {/* Unique Selling Points */}
                            <div className="space-y-4">
                                <label className="text-sm text-gray-400 font-medium">Unique Selling Points</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={tempInputs.usp}
                                        onChange={(e) => setTempInputs({ ...tempInputs, usp: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('usp', 'project_features.unique_selling_points'))}
                                        placeholder="Add a USP (e.g. Infinity Pool)"
                                        className="bg-gray-800 border-gray-700"
                                    />
                                    <Button type="button" onClick={() => addItem('usp', 'project_features.unique_selling_points')} variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.project_features?.unique_selling_points?.map((usp: string, i: number) => (
                                        <span key={i} className="bg-primary/20 text-primary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-primary/30">
                                            {usp} <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => removeItem('project_features.unique_selling_points', i)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Recreational Amenities */}
                                <div className="space-y-4">
                                    <label className="text-sm text-gray-400 font-medium">Recreational Amenities</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tempInputs.recreational}
                                            onChange={(e) => setTempInputs({ ...tempInputs, recreational: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('recreational', 'project_amenities.recreational'))}
                                            placeholder="e.g. Gym, Library"
                                            className="bg-gray-800 border-gray-700"
                                        />
                                        <Button type="button" onClick={() => addItem('recreational', 'project_amenities.recreational')} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.project_amenities?.recreational?.map((item: string, i: number) => (
                                            <span key={i} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-blue-500/30">
                                                {item} <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => removeItem('project_amenities.recreational', i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Outdoor Amenities */}
                                <div className="space-y-4">
                                    <label className="text-sm text-gray-400 font-medium">Outdoor Amenities</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tempInputs.outdoor}
                                            onChange={(e) => setTempInputs({ ...tempInputs, outdoor: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('outdoor', 'project_amenities.outdoor'))}
                                            placeholder="e.g. Park, Jogging Track"
                                            className="bg-gray-800 border-gray-700"
                                        />
                                        <Button type="button" onClick={() => addItem('outdoor', 'project_amenities.outdoor')} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.project_amenities?.outdoor?.map((item: string, i: number) => (
                                            <span key={i} className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-green-500/30">
                                                {item} <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => removeItem('project_amenities.outdoor', i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Security Amenities */}
                                <div className="space-y-4">
                                    <label className="text-sm text-gray-400 font-medium">Security Amenities</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tempInputs.security}
                                            onChange={(e) => setTempInputs({ ...tempInputs, security: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('security', 'project_amenities.security'))}
                                            placeholder="e.g. Intercom, Fire Alarm"
                                            className="bg-gray-800 border-gray-700"
                                        />
                                        <Button type="button" onClick={() => addItem('security', 'project_amenities.security')} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.project_amenities?.security?.map((item: string, i: number) => (
                                            <span key={i} className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-red-500/30">
                                                {item} <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => removeItem('project_amenities.security', i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Convenience Amenities */}
                                <div className="space-y-4">
                                    <label className="text-sm text-gray-400 font-medium">Convenience Amenities</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tempInputs.convenience}
                                            onChange={(e) => setTempInputs({ ...tempInputs, convenience: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('convenience', 'project_amenities.convenience'))}
                                            placeholder="e.g. Mini Mart, ATM"
                                            className="bg-gray-800 border-gray-700"
                                        />
                                        <Button type="button" onClick={() => addItem('convenience', 'project_amenities.convenience')} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.project_amenities?.convenience?.map((item: string, i: number) => (
                                            <span key={i} className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-yellow-500/30">
                                                {item} <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => removeItem('project_amenities.convenience', i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-800">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <HardHat size={16} className="text-primary" /> Infrastructure
                                    </h3>
                                    <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                        <input
                                            type="checkbox"
                                            id="ev-charging"
                                            checked={formData.infrastructure?.evChargingInfra || false}
                                            onChange={(e) => handleInputChange("infrastructure.evChargingInfra", e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="ev-charging" className="text-sm text-gray-300 cursor-pointer">EV Charging Station</label>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                        <input
                                            type="checkbox"
                                            id="power-backup"
                                            checked={formData.infrastructure?.powerBackup?.generator || false}
                                            onChange={(e) => handleInputChange("infrastructure.powerBackup.generator", e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="power-backup" className="text-sm text-gray-300 cursor-pointer">100% Power Backup</label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Car size={16} className="text-primary" /> Parking
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                            <input
                                                type="checkbox"
                                                id="covered-parking"
                                                checked={formData.parking?.covered || false}
                                                onChange={(e) => handleInputChange("parking.covered", e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="covered-parking" className="text-sm text-gray-300 cursor-pointer">Covered</label>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                            <input
                                                type="checkbox"
                                                id="visitor-parking"
                                                checked={formData.parking?.visitorParking || false}
                                                onChange={(e) => handleInputChange("parking.visitorParking", e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="visitor-parking" className="text-sm text-gray-300 cursor-pointer">Visitor</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "compliance" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Compliance & Security</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Star size={16} className="text-primary" /> Compliance
                                    </h3>
                                    <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                        <input
                                            type="checkbox"
                                            id="rera-approved"
                                            checked={formData.compliance?.reraApproved || false}
                                            onChange={(e) => handleInputChange("compliance.reraApproved", e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="rera-approved" className="text-sm text-gray-300 cursor-pointer font-medium">RERA Approved</label>
                                    </div>
                                    {formData.compliance?.reraApproved && (
                                        <div className="space-y-2 pl-6 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-xs text-gray-400">RERA Registration Number</label>
                                            <Input
                                                value={formData.compliance?.reraNumber || ""}
                                                onChange={(e) => handleInputChange("compliance.reraNumber", e.target.value)}
                                                className="bg-gray-800 border-gray-700 text-sm"
                                                placeholder="e.g. PRM/KA/RERA/..."
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                        <input
                                            type="checkbox"
                                            id="oc-received"
                                            checked={formData.compliance?.occupancyCertificate || false}
                                            onChange={(e) => handleInputChange("compliance.occupancyCertificate", e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="oc-received" className="text-sm text-gray-300 cursor-pointer">Occupancy Certificate</label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Shield size={16} className="text-primary" /> Security
                                    </h3>
                                    <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                        <input
                                            type="checkbox"
                                            id="gated-community"
                                            checked={formData.security?.gatedCommunity || false}
                                            onChange={(e) => handleInputChange("security.gatedCommunity", e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="gated-community" className="text-sm text-gray-300 cursor-pointer">Gated Community</label>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                        <input
                                            type="checkbox"
                                            id="cctv-surveillance"
                                            checked={formData.security?.surveillance?.cctv || false}
                                            onChange={(e) => handleInputChange("security.surveillance.cctv", e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="cctv-surveillance" className="text-sm text-gray-300 cursor-pointer">24x7 CCTV Surveillance</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "extra" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">Extra Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Leaf size={16} className="text-primary" /> Sustainability
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                            <input
                                                type="checkbox"
                                                id="solar-power"
                                                checked={formData.sustainability?.energyEfficiency?.solar || false}
                                                onChange={(e) => handleInputChange("sustainability.energyEfficiency.solar", e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="solar-power" className="text-sm text-gray-300 cursor-pointer">Solar Power</label>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded border border-gray-700">
                                            <input
                                                type="checkbox"
                                                id="water-recycling"
                                                checked={formData.sustainability?.waterManagement?.recycling || false}
                                                onChange={(e) => handleInputChange("sustainability.waterManagement.recycling", e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="water-recycling" className="text-sm text-gray-300 cursor-pointer">Water Recycling</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Info size={16} className="text-primary" /> Policies
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Pet Policy</label>
                                            <Input
                                                value={formData.policies?.petPolicy || ""}
                                                onChange={(e) => handleInputChange("policies.petPolicy", e.target.value)}
                                                className="bg-gray-800 border-gray-700 text-sm"
                                                placeholder="e.g. Pets allowed"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Rental Policies</label>
                                            <Input
                                                value={formData.policies?.rentalPolicies || ""}
                                                onChange={(e) => handleInputChange("policies.rentalPolicies", e.target.value)}
                                                className="bg-gray-800 border-gray-700 text-sm"
                                                placeholder="e.g. Short term rentals allowed"
                                            />
                                        </div>
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
