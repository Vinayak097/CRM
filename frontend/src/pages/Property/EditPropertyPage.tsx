import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { propertyService, type CreatePropertyData } from "../../services/propertyService";
import { PROPERTY_TAGS } from "../../lib/propertyTags";
import { CONSTRUCTION_STATUSES } from "../../lib/constructionStatuses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePropertyData>({
    title: "",
    slug: "",
    description: "",
    price: "",
    locationId: "",
    propertyType: "APARTMENT",
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    floors: 1,
    images: [],
    amenities: [],
    features: [],
    coordinates: {
      lat: 0,
      lng: 0,
    },
    status: "AVAILABLE",
    featured: false,
    active: true,
    tags: [],
  });

  const [newImage, setNewImage] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newTag, setNewTag] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoadingData(true);
      try {
        const response = await propertyService.getPropertyById(id);
        const property = response.data;
        setFormData({
          title: property.title || "",
          slug: property.slug || "",
          description: property.description || "",
          price: property.price || "",
          locationId: property.locationId || "",
          propertyType: property.propertyType || "APARTMENT",
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          floors: property.floors || 1,
          images: property.images || [],
          amenities: property.amenities || [],
          features: property.features || [],
          coordinates: property.coordinates || { lat: 0, lng: 0 },
          status: property.status || "AVAILABLE",
          featured: property.featured || false,
          active: property.active !== undefined ? property.active : true,
          unitConfiguration: property.unitConfiguration,
          aboutProject: property.aboutProject,
          legalApprovals: property.legalApprovals,
          registrationCosts: property.registrationCosts,
          propertyManagement: property.propertyManagement,
          financialReturns: property.financialReturns,
          investmentBenefits: property.investmentBenefits,
          nearbyInfrastructure: property.nearbyInfrastructure,
          plotSize: property.plotSize,
          constructionStatus: property.constructionStatus,
          emiOptions: property.emiOptions,
          tags: property.tags || [],
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoadingData(false);
      }
    };

    fetchProperty();
  }, [id]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const addItem = (field: "images" | "amenities" | "features" | "tags", value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
    if (field === "images") setNewImage("");
    if (field === "amenities") setNewAmenity("");
    if (field === "features") setNewFeature("");
    if (field === "tags") setNewTag("");
  };

  const removeItem = (field: "images" | "amenities" | "features" | "tags", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.slug || !formData.description || !formData.price || !formData.locationId) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (formData.area <= 0) {
        setError("Area must be greater than 0");
        setLoading(false);
        return;
      }

      await propertyService.updateProperty(id, formData);
      navigate("/property");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400">Loading property...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/property")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <h1 className="text-2xl font-semibold">Edit Property</h1>
        <p className="text-gray-400 text-sm mt-1">Update property information</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="e.g., Luxury 3BHK Apartment in Downtown"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Slug <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="e.g., luxury-3bhk-apartment-downtown"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white min-h-[100px]"
                placeholder="Detailed description of the property..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Price <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="e.g., 5000000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Location ID <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.locationId}
                onChange={(e) => setFormData((prev) => ({ ...prev, locationId: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="Location ID"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Property Type <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    propertyType: e.target.value as CreatePropertyData["propertyType"],
                  }))
                }
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as CreatePropertyData["status"],
                  }))
                }
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="RESERVED">Reserved</option>
                <option value="UNDER_CONTRACT">Under Contract</option>
              </select>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Area (sq.ft) <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                required
                min="1"
                value={formData.area}
                onChange={(e) => setFormData((prev) => ({ ...prev, area: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bedrooms</label>
              <Input
                type="number"
                min="0"
                value={formData.bedrooms || 0}
                onChange={(e) => setFormData((prev) => ({ ...prev, bedrooms: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bathrooms</label>
              <Input
                type="number"
                min="0"
                value={formData.bathrooms || 0}
                onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Floors</label>
              <Input
                type="number"
                min="1"
                value={formData.floors || 1}
                onChange={(e) => setFormData((prev) => ({ ...prev, floors: Number(e.target.value) }))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Location Coordinates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Latitude <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                required
                step="any"
                value={formData.coordinates.lat}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coordinates: { ...prev.coordinates, lat: Number(e.target.value) },
                  }))
                }
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Longitude <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                required
                step="any"
                value={formData.coordinates.lng}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coordinates: { ...prev.coordinates, lng: Number(e.target.value) },
                  }))
                }
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div className="flex gap-2 mb-4">
            <Input
              type="url"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Image URL"
              className="bg-gray-800 border-gray-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem("images", newImage);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addItem("images", newImage)}
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.images?.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Property ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded border border-gray-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeItem("images", idx)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Amenities</h2>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity"
              className="bg-gray-800 border-gray-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem("amenities", newAmenity);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addItem("amenities", newAmenity)}
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities?.map((amenity, idx) => (
              <span
                key={idx}
                className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeItem("amenities", idx)}
                  className="hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Features</h2>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add feature"
              className="bg-gray-800 border-gray-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem("features", newFeature);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addItem("features", newFeature)}
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features?.map((feature, idx) => (
              <span
                key={idx}
                className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeItem("features", idx)}
                  className="hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <div className="flex gap-2 mb-4">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
            >
              <option value="">Select tag</option>
              {PROPERTY_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={() => {
                if (selectedTag) {
                  addItem("tags", selectedTag);
                  setSelectedTag("");
                }
              }}
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeItem("tags", idx)}
                  className="hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">About Project</label>
              <textarea
                value={formData.aboutProject || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, aboutProject: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white min-h-[100px]"
                placeholder="Information about the project..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Property Management</label>
              <textarea
                value={formData.propertyManagement || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, propertyManagement: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white min-h-[100px]"
                placeholder="Property management details..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Financial Returns</label>
              <textarea
                value={formData.financialReturns || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, financialReturns: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white min-h-[100px]"
                placeholder="Financial returns information..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Construction Status</label>
              <select
                value={formData.constructionStatus || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, constructionStatus: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none text-white"
              >
                <option value="">Select construction status</option>
                {CONSTRUCTION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">EMI Options</label>
              <Input
                type="text"
                value={formData.emiOptions || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, emiOptions: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="EMI options details..."
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700"
              />
              <span>Featured Property</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700"
              />
              <span>Active</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/property")}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPropertyPage;
