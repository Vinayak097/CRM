import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboardService";
import type {
  DashboardResponse,
  SalesAgentStats,
  OnboardingAgentStats,
  SalesManagerStats,
  BusinessHeadStats,
  AdminStats,
} from "@/types";
import {
  SalesAgentDashboard,
  OnboardingAgentDashboard,
  SalesManagerDashboard,
  BusinessHeadDashboard,
  AdminDashboard,
} from "@/components/dashboard";

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboard();
        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-800 rounded-xl"></div>
            <div className="h-64 bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-gray-400">No dashboard data available</p>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (data.role) {
    case "sales_agent":
      return <SalesAgentDashboard stats={data.stats as SalesAgentStats} />;
    case "onboarding_agent":
      return <OnboardingAgentDashboard stats={data.stats as OnboardingAgentStats} />;
    case "sales_manager":
      return <SalesManagerDashboard stats={data.stats as SalesManagerStats} />;
    case "business_head":
      return <BusinessHeadDashboard stats={data.stats as BusinessHeadStats} />;
    case "admin":
      return <AdminDashboard stats={data.stats as AdminStats} />;
    default:
      return <BusinessHeadDashboard stats={data.stats as BusinessHeadStats} />;
  }
};

export default DashboardPage;
