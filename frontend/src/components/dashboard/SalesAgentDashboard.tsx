import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import type { SalesAgentStats } from "@/types";

interface Props {
  stats: SalesAgentStats;
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

export const SalesAgentDashboard: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your sales overview.</p>
        </div>
        <Button onClick={() => navigate("/leads/create")}>+ New Lead</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Follow-ups"
          value={stats.todaysFollowups}
          icon="📅"
          subtitle="Scheduled for today"
        />
        <KpiCard
          title="Missed Follow-ups"
          value={stats.missedFollowups}
          icon="⚠️"
          subtitle="Needs attention"
        />
        <KpiCard
          title="My Pipeline Leads"
          value={stats.assignedLeadsCount}
          icon="📋"
          subtitle="Total in pipeline"
        />
        <KpiCard
          title="Monthly Conversions"
          value={stats.monthlyConversions}
          icon="🎯"
          subtitle="This month"
        />
      </div>

      {/* Pipeline & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.pipeline).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${STATUS_COLORS[status] || "bg-gray-500"}`}
                  />
                  <span className="flex-1 text-sm text-gray-300">{status}</span>
                  <span className="text-sm font-medium text-white">{count}</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${STATUS_COLORS[status] || "bg-gray-500"}`}
                      style={{
                        width: `${Math.min((count / (stats.assignedLeadsCount || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
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
              onClick={() => navigate("/leads")}
            >
              📋 View All Leads
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/leads/create")}
            >
              ➕ Create New Lead
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/projects")}
            >
              📁 Browse Projects
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/property")}
            >
              🏠 Browse Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAgentDashboard;
