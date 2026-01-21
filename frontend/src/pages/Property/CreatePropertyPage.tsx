import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertyService } from "../../services/propertyService";
import { PropertyForm } from "../../components/property/PropertyForm";
import type { PropertyFormData } from "../../types/propertyFormData";

const CreatePropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (formData: PropertyFormData) => {
    setLoading(true);
    setError(null);

    try {
      // The formData is already in the correct nested structure
      const submitData = {
        ...formData,
        listing_id: formData.listing_id || `LST-${Date.now()}`,
      };

      await propertyService.createProperty(submitData);
      navigate("/property");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropertyForm
      onSubmit={handleCreate}
      loading={loading}
      error={error}
      onCancel={() => navigate("/property")}
    />
  );
};

export default CreatePropertyPage;
