import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import type { SalesManagerStats } from "@/types";

interface Props {
  stats: SalesManagerStats;
}

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500",
  Contacted: "bg-cyan-500",
  Qualified: "bg-yellow-500",
  Shortlisted: "bg-orange-500",
  "Site Visit": "bg-purple-500",
  Negotiation: "bg-pink-500",
  Booked: "bg-green-500",
  Converted: "bg-emerald-600",
  Lost: "bg-red-500",
};

export const SalesManagerDashboard: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Manager Dashboard</h1>
          <p className="text-gray-400">Monitor team performance and sales pipeline.</p>
        </div>
        <Button onClick={() => navigate("/leads")}>View All Leads</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Leads"
          value={stats.totalLeads}
          icon="📋"
          subtitle="All leads in system"
        />
        <KpiCard
          title="Active Deals"
          value={stats.activeDeals}
          icon="🔥"
          subtitle="In progress"
        />
        <KpiCard
          title="Team Conversion Rate"
          value={`${stats.teamConversionRate}%`}
          icon="📈"
          subtitle="This month"
        />
        <KpiCard
          title="Monthly Conversions"
          value={stats.monthlyConversions}
          icon="🎯"
          subtitle="This month"
        />
      </div>

      {/* Sales Funnel & Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.pipeline)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${STATUS_COLORS[status] || "bg-gray-500"}`}
                    />
                    <span className="flex-1 text-sm text-gray-300">{status}</span>
                    <span className="text-sm font-medium text-white">{count}</span>
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${STATUS_COLORS[status] || "bg-gray-500"}`}
                        style={{
                          width: `${Math.min((count / (stats.totalLeads || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Team Performance</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
              Manage →
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/leads")}>
              📋 View All Leads
            </Button>
            <Button variant="outline" onClick={() => navigate("/leads/create")}>
              ➕ Create Lead
            </Button>
            <Button variant="outline" onClick={() => navigate("/users")}>
              👥 Manage Team
            </Button>
            <Button variant="outline" onClick={() => navigate("/projects")}>
              📁 View Projects
            </Button>
            <Button variant="outline" onClick={() => navigate("/property")}>
              🏠 View Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagerDashboard;
