import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import type { SalesManagerStats } from "@/types";

interface Props {
  stats: SalesManagerStats;
}

export const SalesManagerDashboard: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Manager Dashboard</h1>
          <p className="text-gray-400">Monitor team performance and lead activity.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Team Leads"
          value={stats.totalLeads}
          subtitle="All leads in system"
        />
        <KpiCard
          title="Active Deals"
          value={stats.activeDeals}
          subtitle="In progress"
        />
        <KpiCard
          title="Team Conversion Rate"
          value={`${stats.teamConversionRate}%`}
          subtitle="This month"
        />
        <KpiCard
          title="Revenue Pipeline"
          value={`₹${(stats.revenuePipeline / 10000000).toFixed(2)}Cr`}
          subtitle="Expected revenue"
        />
      </div>

      {/* Main Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Review, assign, and follow up on incoming leads.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/leads")}>Open Leads</Button>
              <Button variant="outline" onClick={() => navigate("/leads/create")}>
                Create Lead
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Funnel Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Funnel Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Visualize lead progression and conversion rates across stages.
            </p>
            <Button onClick={() => navigate("/sales-funnel")}>
              View Funnel
            </Button>
          </CardContent>
        </Card>

        {/* Projects & Properties Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects & Properties Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Track available inventory and project updates in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/projects")}>
                View Projects
              </Button>
              <Button variant="outline" onClick={() => navigate("/property")}>
                View Properties
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Agent Performance</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
            Manage -
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.teamPerformance.length === 0 ? (
              <p className="text-gray-400 text-sm">No sales agents found</p>
            ) : (
              stats.teamPerformance.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{agent.assignedLeads}</p>
                    <p className="text-xs text-gray-400">leads</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagerDashboard;
