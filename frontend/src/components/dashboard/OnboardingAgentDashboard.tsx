import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import type { OnboardingAgentStats } from "@/types";

interface Props {
  stats: OnboardingAgentStats;
}

const STATUS_COLORS: Record<string, string> = {
  Planning: "bg-blue-500",
  "Under Construction": "bg-yellow-500",
  Completed: "bg-green-500",
  "Ready to Move": "bg-emerald-500",
};

export const OnboardingAgentDashboard: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Onboarding Dashboard</h1>
          <p className="text-gray-400">Manage projects and properties onboarding.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/projects/create")}>
            + New Project
          </Button>
          <Button onClick={() => navigate("/property/create")}>+ New Property</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Projects Created"
          value={stats.projectsCreated}
          icon="📁"
          subtitle={`${stats.projectsThisMonth} this month`}
        />
        <KpiCard
          title="Properties Added"
          value={stats.propertiesAdded}
          icon="🏠"
          subtitle={`${stats.propertiesThisMonth} this month`}
        />
        <KpiCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon="⏳"
          subtitle="Awaiting review"
        />
        <KpiCard
          title="Completion Rate"
          value={`${stats.onboardingProgress}%`}
          icon="📊"
          subtitle="Overall progress"
        />
      </div>

      {/* Projects by Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects by Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.projectsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="bg-gray-800 rounded-lg p-4 text-center"
                >
                  <div
                    className={`w-4 h-4 rounded-full mx-auto mb-2 ${STATUS_COLORS[status] || "bg-gray-500"}`}
                  />
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-gray-400 mt-1">{status}</p>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Onboarding Progress</span>
                <span>{stats.onboardingProgress}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                  style={{ width: `${stats.onboardingProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/projects")}
            >
              📁 View All Projects
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/projects/create")}
            >
              ➕ Create New Project
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/property")}
            >
              🏠 View All Properties
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/property/create")}
            >
              ➕ Add New Property
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/developers")}
            >
              🏗️ Manage Developers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingAgentDashboard;
