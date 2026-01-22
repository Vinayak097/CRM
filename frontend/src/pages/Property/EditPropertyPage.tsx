import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { propertyService } from "../../services/propertyService";
import { PropertyForm } from "../../components/property/PropertyForm";
import type { PropertyFormData } from "../../types/propertyFormData";
import { getDefaultFormData } from "../../types/propertyFormData";

const EditPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<PropertyFormData | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoadingData(true);
      try {
        const response = await propertyService.getPropertyById(id);
        const p = response.data as any;

        // Merge with default data to ensure all nested objects exist
        const defaultData = getDefaultFormData();

        const preparedData = {
          ...defaultData,
          ...p,
          // Explicitly map nested structures
          pricing: {
            ...defaultData.pricing,
            ...(p.pricing || {})
          },
          location: {
            ...defaultData.location,
            ...(p.location || {})
          },
          specifications: {
            ...defaultData.specifications,
            ...(p.specifications || {})
          },
          spatialDetails: {
            ...defaultData.spatialDetails,
            ...(p.spatialDetails || {})
          },
          visual_assets: {
            ...defaultData.visual_assets,
            ...(p.visual_assets || {}),
            images: p.visual_assets?.images || []
          },
          project_info: {
            ...defaultData.project_info,
            ...(p.project_info || {})
          },
          amenities_summary: {
            ...defaultData.amenities_summary,
            ...(p.amenities_summary || {}),
            primary_amenities: p.amenities_summary?.primary_amenities || []
          },
          features: p.features || [],
          property_tags: p.property_tags || [],
          badges: {
            ...defaultData.badges,
            ...(p.badges || {})
          }
        };

        setInitialData(preparedData);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoadingData(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleUpdate = async (formData: PropertyFormData) => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
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
        <div className="text-center flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div className="text-gray-400">Loading property...</div>
        </div>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full max-w-6xl mx-auto">
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
        <button onClick={() => navigate("/property")} className="text-blue-400 hover:underline">Back to Properties</button>
      </div>
    );
  }

  return (
    <PropertyForm
      initialData={initialData || undefined}
      onSubmit={handleUpdate}
      loading={loading}
      error={error}
      isEdit={true}
      onCancel={() => navigate("/property")}
    />
  );
};

export default EditPropertyPage;
