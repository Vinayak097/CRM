import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Loader2, Upload, Cloud, Image as ImageIcon, FolderUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "./LocationSearch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDefaultFormData, type PropertyFormData } from "../../types/propertyFormData";

import { developerService } from "../../services/developerService";
import type { Developer } from "../../types/developer";

interface PropertyFormProps {
    initialData?: Partial<PropertyFormData>;
    onSubmit: (data: PropertyFormData) => Promise<void>;
    loading: boolean;
    error?: string | null;
    isEdit?: boolean;
    onCancel: () => void;
}

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];
const AREA_UNITS = ["sqft", "sqm", "sqyd", "acre", "hectare"];

export const PropertyForm: React.FC<PropertyFormProps> = ({
    initialData,
    onSubmit,
    loading,
    error: submitError,
    isEdit = false,
    onCancel
}) => {
    const [formData, setFormData] = useState<PropertyFormData>(() => ({
        ...getDefaultFormData(),
        ...initialData
    }));

    const [validationError, setValidationError] = useState<string | null>(null);

    const [developers, setDevelopers] = useState<Developer[]>([]);

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

    // Update formData when initialData changes (important for Edit page fetching logic)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                // Ensure nested objects are merged correctly if needed, simpler to just spread over default if structure is guaranteed
                // But we already did a merge in initialization. 
                // If ID changes or data loads late, we need this.
                // A simple spread might overwrite updated fields if user is typing while data loads? 
                // Edit page usually shows loading spinner until data is ready, so this is safe.
            }));
        }
    }, [initialData]);

    const [newImage, setNewImage] = useState("");
    const [newAmenity, setNewAmenity] = useState("");
    const [newFeature, setNewFeature] = useState("");
    const [newTag, setNewTag] = useState("");
    const [newAttraction, setNewAttraction] = useState("");

    const addItem = (field: "images" | "amenities" | "features" | "tags", value: string) => {
        if (!value.trim()) return;

        if (field === "images") {
            setFormData(prev => ({
                ...prev,
                visual_assets: {
                    ...prev.visual_assets,
                    images: [...(prev.visual_assets.images || []), { src: value, title: "", type: "image", description: "", alt: "" }]
                }
            }));
            setNewImage("");
        } else if (field === "amenities") {
            setFormData(prev => ({
                ...prev,
                amenities_summary: {
                    ...prev.amenities_summary,
                    primary_amenities: [...(prev.amenities_summary.primary_amenities || []), value]
                }
            }));
            setNewAmenity("");
        } else if (field === "features") {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), value]
            }));
            setNewFeature("");
        } else if (field === "tags") {
            setFormData(prev => ({
                ...prev,
                property_tags: [...(prev.property_tags || []), value]
            }));
            setNewTag("");
        } else if ((field as string) === "attractions") {
            setFormData(prev => ({
                ...prev,
                location_details: {
                    ...prev.location_details,
                    nearby_attractions: [...(prev.location_details.nearby_attractions || []), value]
                }
            }));
            setNewAttraction("");
        }
    };

    const removeItem = (field: "images" | "amenities" | "features" | "tags", index: number) => {
        if (field === "images") {
            setFormData(prev => ({
                ...prev,
                visual_assets: {
                    ...prev.visual_assets,
                    images: prev.visual_assets.images.filter((_, i) => i !== index)
                }
            }));
        } else if (field === "amenities") {
            setFormData(prev => ({
                ...prev,
                amenities_summary: {
                    ...prev.amenities_summary,
                    primary_amenities: prev.amenities_summary.primary_amenities.filter((_, i) => i !== index)
                }
            }));
        } else if (field === "features") {
            setFormData(prev => ({
                ...prev,
                features: prev.features.filter((_, i) => i !== index)
            }));
        } else if (field === "tags") {
            setFormData(prev => ({
                ...prev,
                property_tags: prev.property_tags.filter((_, i) => i !== index)
            }));
        } else if ((field as string) === "attractions") {
            setFormData(prev => ({
                ...prev,
                location_details: {
                    ...prev.location_details,
                    nearby_attractions: prev.location_details.nearby_attractions.filter((_, i) => i !== index)
                }
            }));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        addItem("images", reader.result as string);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSingleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail_url" | "main_image_url") => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setFormData(prev => ({
                        ...prev,
                        visual_assets: {
                            ...prev.visual_assets,
                            [field]: reader.result as string
                        }
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Validate required fields
        if (!formData.title) {
            setValidationError("Title is required");
            return;
        }

        await onSubmit(formData);
    };

    return (
        <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full max-w-6xl mx-auto">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-semibold">{isEdit ? "Edit Property" : "Create New Property"}</h1>
                <p className="text-gray-400 text-sm mt-1">{isEdit ? "Update property information" : "Add a new property to the system with full details"}</p>
            </div>

            {(validationError || submitError) && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
                    {validationError || submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 mb-8 bg-gray-900 border border-gray-700 h-auto">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                        <TabsTrigger value="pricing">Pricing</TabsTrigger>
                        <TabsTrigger value="specs">Specs</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                        <TabsTrigger value="amenities">Features</TabsTrigger>
                        <TabsTrigger value="project">Project</TabsTrigger>
                        <TabsTrigger value="financials">Financials</TabsTrigger>
                        <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Identity & Descriptions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Title *</label>
                                    <Input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="bg-gray-800 border-gray-700"
                                        placeholder="Luxury 3BHK Apartment..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                                    <Input
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Listing Type</label>
                                    <select
                                        value={formData.listing_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, listing_type: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                    >
                                        <option value="SALE">Sale</option>
                                        <option value="RENT">Rent</option>
                                        <option value="LEASE">Lease</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Property Type</label>
                                    <select
                                        value={formData.property_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, property_type: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                    >
                                        <option value="PLOT">Plot</option>
                                        <option value="VILLA">Villa</option>
                                        <option value="APARTMENT">Apartment</option>
                                        <option value="FARM_HOUSE">Farm House</option>
                                        <option value="COMMERCIAL">Commercial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="SOLD">Sold</option>
                                        <option value="RESERVED">Reserved</option>
                                        <option value="UNDER_CONTRACT">Under Contract</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Short Description</label>
                                    <textarea
                                        value={formData.description_short}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description_short: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 min-h-[80px] text-white"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Long Description</label>
                                    <textarea
                                        value={formData.description_long}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description_long: e.target.value }))}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 min-h-[150px] text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="location" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Location Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Location Selection</label>
                                    <LocationSearch
                                        value={formData.location_id}
                                        onSelect={(id) => setFormData(prev => ({ ...prev, location_id: id }))}
                                        placeholder="Search for a location (e.g. Nachinola, Vagator...)"
                                    />
                                </div>
                                <div className="md:col-span-2 border-t border-gray-700 pt-4 mt-2">
                                    <h3 className="text-sm font-medium mb-3">Address Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Input
                                            placeholder="Street"
                                            value={formData.specificAddress?.street || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, specificAddress: { ...prev.specificAddress, street: e.target.value } }))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                        <Input
                                            placeholder="Area/Region"
                                            value={formData.specificAddress?.area || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, specificAddress: { ...prev.specificAddress, area: e.target.value } }))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                        <Input
                                            placeholder="City"
                                            value={formData.specificAddress?.city || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, specificAddress: { ...prev.specificAddress, city: e.target.value } }))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Latitude</label>
                                        <Input
                                            type="number" step="any"
                                            value={formData.location?.coordinates?.latitude}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                location: { ...prev.location, coordinates: { ...prev.location?.coordinates, latitude: Number(e.target.value) } }
                                            }))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                                        <Input
                                            type="number" step="any"
                                            value={formData.location?.coordinates?.longitude}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                location: { ...prev.location, coordinates: { ...prev.location?.coordinates, longitude: Number(e.target.value) } }
                                            }))}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex gap-2">
                                        <div className="w-[100px] shrink-0">
                                            <label className="block text-sm text-gray-400 mb-1">Currency</label>
                                            <select
                                                value={formData.pricing?.total_price?.currency}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    pricing: {
                                                        ...prev.pricing,
                                                        total_price: { ...prev.pricing.total_price, currency: e.target.value },
                                                        price_per_sqft: { ...prev.pricing.price_per_sqft, currency: e.target.value }
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                            >
                                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm text-gray-400 mb-1">Total Price (Value)</label>
                                            <Input
                                                type="number"
                                                value={formData.pricing?.total_price?.value}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    pricing: { ...prev.pricing, total_price: { ...prev.pricing.total_price, value: Number(e.target.value), display_value: `₹${e.target.value}` } }
                                                }))}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-sm text-gray-400 mb-1">Price Per Unit</label>
                                            <Input
                                                type="number"
                                                value={formData.pricing?.price_per_sqft?.value}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    pricing: { ...prev.pricing, price_per_sqft: { ...prev.pricing.price_per_sqft, value: Number(e.target.value) } }
                                                }))}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                        <div className="w-[100px] shrink-0">
                                            <label className="block text-sm text-gray-400 mb-1">Unit</label>
                                            <select
                                                value={formData.pricing?.price_per_sqft?.unit || "sqft"}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    pricing: {
                                                        ...prev.pricing,
                                                        price_per_sqft: { ...prev.pricing.price_per_sqft, unit: e.target.value }
                                                    },
                                                    spatialDetails: {
                                                        ...prev.spatialDetails,
                                                        area: { ...prev.spatialDetails.area, unit: e.target.value }
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                            >
                                                {AREA_UNITS.map(u => <option key={u} value={u}>/{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Original Price (Before Discount)</label>
                                    <Input
                                        type="number"
                                        value={formData.pricing?.original_price}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            pricing: { ...prev.pricing, original_price: Number(e.target.value) }
                                        }))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Discount %</label>
                                    <Input
                                        type="number"
                                        value={formData.pricing?.discount_percentage}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            pricing: { ...prev.pricing, discount_percentage: Number(e.target.value) }
                                        }))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="specs" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Specifications</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Bedrooms</label>
                                    <Input type="number"
                                        value={formData.specifications?.bedrooms || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specifications: { ...prev.specifications, bedrooms: Number(e.target.value) } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Bathrooms</label>
                                    <Input type="number"
                                        value={formData.specifications?.bathrooms || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specifications: { ...prev.specifications, bathrooms: Number(e.target.value) } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Parking Spaces</label>
                                    <Input type="number"
                                        value={formData.specifications?.parking_spaces || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specifications: { ...prev.specifications, parking_spaces: Number(e.target.value) } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Carpet Area</label>
                                    <Input type="number"
                                        value={formData.spatialDetails?.area?.carpet}
                                        onChange={(e) => setFormData(prev => ({ ...prev, spatialDetails: { ...prev.spatialDetails, area: { ...prev.spatialDetails.area, carpet: Number(e.target.value) } } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                                <div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-sm text-gray-400 mb-1">Built-up Area</label>
                                            <Input type="number"
                                                value={formData.spatialDetails?.area?.builtUp}
                                                onChange={(e) => setFormData(prev => ({ ...prev, spatialDetails: { ...prev.spatialDetails, area: { ...prev.spatialDetails.area, builtUp: Number(e.target.value) } } }))}
                                                className="bg-gray-800 border-gray-700" />
                                        </div>
                                        <div className="w-[100px] shrink-0">
                                            <label className="block text-sm text-gray-400 mb-1">Unit</label>
                                            <select
                                                value={formData.spatialDetails?.area?.unit || "sqft"}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    spatialDetails: {
                                                        ...prev.spatialDetails,
                                                        area: { ...prev.spatialDetails.area, unit: e.target.value }
                                                    },
                                                    pricing: {
                                                        ...prev.pricing,
                                                        price_per_sqft: { ...prev.pricing.price_per_sqft, unit: e.target.value }
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                            >
                                                {AREA_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Facing</label>
                                    <Input
                                        value={formData.spatialDetails?.facing}
                                        onChange={(e) => setFormData(prev => ({ ...prev, spatialDetails: { ...prev.spatialDetails, facing: e.target.value } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Floors</label>
                                    <Input type="number"
                                        value={formData.specifications?.floors || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specifications: { ...prev.specifications, floors: Number(e.target.value) } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Year Built</label>
                                    <Input type="number"
                                        value={formData.specifications?.year_built}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specifications: { ...prev.specifications, year_built: Number(e.target.value) } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Property Age (Years)</label>
                                    <Input type="number"
                                        value={formData.specifications?.property_age}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specifications: { ...prev.specifications, property_age: Number(e.target.value) } }))}
                                        className="bg-gray-800 border-gray-700" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="media" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold">Media Assets</h2>
                                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                    {formData.visual_assets?.images?.length || 0} Images
                                </span>
                            </div>

                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 mb-8 flex flex-col items-center justify-center text-center hover:border-blue-500/50 hover:bg-gray-800/30 transition-all group">
                                <div className="bg-gray-800 group-hover:bg-blue-500/10 p-4 rounded-full mb-4 transition-colors">
                                    <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Upload Property Images</h3>
                                <p className="text-gray-400 text-sm mb-6 max-w-sm">
                                    Drag and drop high-quality images here to showcase your property
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={handleFileSelect}
                                        />
                                        <Button type="button" variant="secondary" className="w-full gap-2 relative pointer-events-none">
                                            <FolderUp className="w-4 h-4" />
                                            Choose Files
                                        </Button>
                                    </div>
                                    <Button type="button" variant="outline" className="gap-2 border-gray-600 bg-transparent hover:bg-gray-800 text-gray-300">
                                        <Cloud className="w-4 h-4 text-blue-400" />
                                        Get from Google Drive
                                    </Button>
                                </div>
                            </div>

                            {/* URL Fallback */}
                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-gray-900 px-2 text-gray-500">Or add via URL</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-8">
                                <Input
                                    placeholder="Paste image URL here..."
                                    value={newImage}
                                    onChange={(e) => setNewImage(e.target.value)}
                                    className="bg-gray-800 border-gray-700 font-mono text-sm"
                                />
                                <Button type="button" onClick={() => addItem("images", newImage)} variant="secondary" className="px-6">
                                    Add
                                </Button>
                            </div>

                            {/* Image Grid */}
                            {formData.visual_assets?.images && formData.visual_assets.images.length > 0 && (
                                <div className="space-y-4 mb-8">
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {formData.visual_assets.images.map((img, idx) => (
                                            <div key={idx} className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shadow-sm">
                                                <img
                                                    src={img.src}
                                                    alt={`Property ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => removeItem("images", idx)}
                                                        className="h-8 w-8"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {/* Index Badge */}
                                                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded">
                                                    #{idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Media Links */}
                            <div className="grid grid-cols-1 gap-6 border-t border-gray-800 pt-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                        Key Assets
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Thumbnail Picker */}
                                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-800">
                                            <label className="block text-sm text-gray-400 mb-3">Thumbnail Image</label>
                                            {formData.visual_assets?.thumbnail_url && (
                                                <div className="mb-3 relative aspect-video rounded overflow-hidden bg-gray-900">
                                                    <img src={formData.visual_assets.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, visual_assets: { ...prev.visual_assets, thumbnail_url: "" } }))}
                                                        className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            onChange={(e) => handleSingleFileSelect(e, "thumbnail_url")}
                                                        />
                                                        <Button type="button" variant="secondary" className="w-full gap-2 relative pointer-events-none text-xs">
                                                            <FolderUp className="w-3 h-3" />
                                                            Choose File
                                                        </Button>
                                                    </div>
                                                    <Button type="button" variant="outline" className="flex-1 gap-2 border-gray-600 bg-transparent hover:bg-gray-800 text-gray-300 text-xs">
                                                        <Cloud className="w-3 h-3 text-blue-400" />
                                                        From Drive
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500 text-xs">URL</span>
                                                    <Input
                                                        value={formData.visual_assets?.thumbnail_url}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, visual_assets: { ...prev.visual_assets, thumbnail_url: e.target.value } }))}
                                                        className="bg-gray-800 border-gray-700 pl-8 text-xs h-8"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Image Picker */}
                                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-800">
                                            <label className="block text-sm text-gray-400 mb-3">Main Banner Image</label>
                                            {formData.visual_assets?.main_image_url && (
                                                <div className="mb-3 relative aspect-video rounded overflow-hidden bg-gray-900">
                                                    <img src={formData.visual_assets.main_image_url} alt="Main" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, visual_assets: { ...prev.visual_assets, main_image_url: "" } }))}
                                                        className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            onChange={(e) => handleSingleFileSelect(e, "main_image_url")}
                                                        />
                                                        <Button type="button" variant="secondary" className="w-full gap-2 relative pointer-events-none text-xs">
                                                            <FolderUp className="w-3 h-3" />
                                                            Choose File
                                                        </Button>
                                                    </div>
                                                    <Button type="button" variant="outline" className="flex-1 gap-2 border-gray-600 bg-transparent hover:bg-gray-800 text-gray-300 text-xs">
                                                        <Cloud className="w-3 h-3 text-blue-400" />
                                                        From Drive
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500 text-xs">URL</span>
                                                    <Input
                                                        value={formData.visual_assets?.main_image_url}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, visual_assets: { ...prev.visual_assets, main_image_url: e.target.value } }))}
                                                        className="bg-gray-800 border-gray-700 pl-8 text-xs h-8"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="amenities" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Amenities & Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Primary Amenities</label>
                                    <div className="flex gap-2 mb-3">
                                        <Input value={newAmenity} onChange={e => setNewAmenity(e.target.value)} className="bg-gray-800 border-gray-700" />
                                        <Button type="button" onClick={() => addItem("amenities", newAmenity)} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.amenities_summary?.primary_amenities?.map((a, i) => (
                                            <span key={i} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                                {a} <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("amenities", i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Property Features</label>
                                    <div className="flex gap-2 mb-3">
                                        <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} className="bg-gray-800 border-gray-700" />
                                        <Button type="button" onClick={() => addItem("features", newFeature)} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.features?.map((f, i) => (
                                            <span key={i} className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                                {f} <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("features", i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="project" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Project & Developer</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                                        <input type="checkbox" checked={formData.project_info?.is_part_of_project} onChange={e => setFormData(prev => ({ ...prev, project_info: { ...prev.project_info, is_part_of_project: e.target.checked } }))} />
                                        <span className="text-sm font-medium">Part of a Project</span>
                                    </label>
                                </div>
                                <div />
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                                    <Input
                                        value={formData.project_info?.project_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project_info: { ...prev.project_info, project_name: e.target.value } }))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Project Type</label>
                                    <Input
                                        value={formData.project_info?.project_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project_info: { ...prev.project_info, project_type: e.target.value } }))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Project Status</label>
                                    <Input
                                        value={formData.project_info?.project_status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project_info: { ...prev.project_info, project_status: e.target.value } }))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">RERA Number</label>
                                    <Input
                                        value={formData.project_info?.rarera_number}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project_info: { ...prev.project_info, rarera_number: e.target.value } }))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div className="md:col-span-2 pt-4 border-t border-gray-700">
                                    <h3 className="text-sm font-medium mb-3">Developer Info</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-gray-400 mb-1">Select Developer</label>
                                            <select
                                                value={formData.developer?.developer_id || ""}
                                                onChange={(e) => {
                                                    const selectedDev = developers.find(d => (d.id || d._id) === e.target.value);
                                                    if (selectedDev) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            developer: {
                                                                ...prev.developer,
                                                                name: selectedDev.developer_name,
                                                                developer_id: selectedDev.id || selectedDev._id,
                                                                logo: selectedDev.developer_logo_url || ""
                                                            }
                                                        }));
                                                    } else {
                                                        if (e.target.value === "") {
                                                            setFormData(prev => ({ ...prev, developer: { name: "", developer_id: "" } }));
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                            >
                                                <option value="">-- Choose Developer --</option>
                                                {developers.map(dev => (
                                                    <option key={dev._id || dev.id} value={dev.id || dev._id}>
                                                        {dev.developer_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Display selected info */}
                                        {formData.developer?.name && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Selected: {formData.developer.name} (ID: {formData.developer.developer_id})
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="financials" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Financial Projections</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Capital Appreciation</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.capital_appreciation?.has_high_appreciation_potential} onChange={e => setFormData(prev => ({ ...prev, capital_appreciation: { ...prev.capital_appreciation, has_high_appreciation_potential: e.target.checked } }))} />
                                            <span className="text-sm">High Appreciation Potential</span>
                                        </label>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Projected Rate (%)</label>
                                            <Input type="number" value={formData.capital_appreciation?.projected_appreciation_rate} onChange={e => setFormData(prev => ({ ...prev, capital_appreciation: { ...prev.capital_appreciation, projected_appreciation_rate: Number(e.target.value) } }))} className="bg-gray-800 border-gray-700" />
                                        </div>
                                        <textarea
                                            placeholder="Appreciation Prospects"
                                            value={formData.capital_appreciation?.prospects}
                                            onChange={e => setFormData(prev => ({ ...prev, capital_appreciation: { ...prev.capital_appreciation, prospects: e.target.value } }))}
                                            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-xs text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Rental Potential</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.rental_potential?.has_high_rental_yield} onChange={e => setFormData(prev => ({ ...prev, rental_potential: { ...prev.rental_potential, has_high_rental_yield: e.target.checked } }))} />
                                            <span className="text-sm">High Rental Yield</span>
                                        </label>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Yield Percentage (%)</label>
                                            <Input type="number" value={formData.rental_potential?.yield_percentage} onChange={e => setFormData(prev => ({ ...prev, rental_potential: { ...prev.rental_potential, yield_percentage: Number(e.target.value) } }))} className="bg-gray-800 border-gray-700" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="metadata" className="space-y-6">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Metadata & Tags</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Property Tags</label>
                                    <div className="flex gap-2 mb-3">
                                        <Input value={newTag} onChange={e => setNewTag(e.target.value)} className="bg-gray-800 border-gray-700" />
                                        <Button type="button" onClick={() => addItem("tags", newTag)} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.property_tags?.map((t, i) => (
                                            <span key={i} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                                {t} <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem("tags", i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Investment Highlights</label>
                                    <p className="text-xs text-gray-500">Add key selling points for investors.</p>
                                </div>
                                <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-700">
                                    <h3 className="text-sm font-medium">Status & Visibility</h3>
                                    <div className="flex flex-wrap gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.badges?.is_new_listing} onChange={e => setFormData(prev => ({ ...prev, badges: { ...prev.badges, is_new_listing: e.target.checked } }))} />
                                            <span className="text-sm">New Listing</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.badges?.is_pre_launch} onChange={e => setFormData(prev => ({ ...prev, badges: { ...prev.badges, is_pre_launch: e.target.checked } }))} />
                                            <span className="text-sm">Pre-Launch</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.badges?.is_featured} onChange={e => setFormData(prev => ({ ...prev, badges: { ...prev.badges, is_featured: e.target.checked } }))} />
                                            <span className="text-sm">Featured</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Submit Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEdit ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            isEdit ? "Update Property" : "Create Property"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};
