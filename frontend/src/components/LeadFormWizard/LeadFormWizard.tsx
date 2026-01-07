import React from "react";
import { Button } from "@/components/ui/button";

export interface LeadFormData {
  identity: {
    fullName: string;
    email: string;
    phone: string;
  };
  propertyVision: {
    budgetRange: string;
  };
  dreamHomeNotes: string;
}

interface Props {
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  mode?: 'modal' | 'page';
  initialData?: any;
}

export default function LeadFormWizard({ onSubmit, onCancel, loading, mode = 'modal' }: Props) {
  const handleSubmit = async () => {
    await onSubmit({
      identity: { fullName: "Test", email: "test@test.com", phone: "123" },
      propertyVision: { budgetRange: "5-10L" },
      dreamHomeNotes: "Test notes"
    });
  };

  if (mode === 'page') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-3xl mx-auto flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Lead Form</h2>
          <p className="text-sm text-gray-400">Fill out the lead information</p>
        </div>
        <div className="p-6 flex-1">
          <p>Form content here</p>
        </div>
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Lead Form</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
        </div>
        <div className="p-6 flex-1">
          <p>Form content here</p>
        </div>
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}