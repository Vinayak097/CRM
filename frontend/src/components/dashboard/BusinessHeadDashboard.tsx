import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import type { BusinessHeadStats } from "@/types";

interface Props {
  stats: BusinessHeadStats;
}

const STATUS_COLORS: Record<string, string> = {
  Planning: "bg-blue-500",
  "Under Construction": "bg-yellow-500",
  Completed: "bg-green-500",
  "Ready to Move": "bg-emerald-500",
};

export const BusinessHeadDashboard: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Overview</h1>
          <p className="text-gray-400">Strategic insights and onboarding control.</p>
        </div>
        <Button onClick={() => navigate("/projects")}>View Projects</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Projects"
          value={stats.activeProjects}
          icon="📁"
          subtitle="Currently active"
        />
        <KpiCard
          title="Total Properties"
          value={stats.totalProperties}
          icon="🏠"
          subtitle="In the system"
        />
        <KpiCard
          title="Completion Rate"
          value={`${stats.onboardingCompletionRate}%`}
          icon="✅"
          subtitle="Onboarding completed"
        />
        <KpiCard
          title="Total Projects"
          value={stats.totalProjects}
          icon="📊"
          subtitle="All projects"
        />
      </div>

      {/* Projects Status & Growth Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Growth Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.growthTrend.length === 0 ? (
              <p className="text-gray-400 text-sm">No data available</p>
            ) : (
              <div className="space-y-3">
                {stats.growthTrend.map((item) => (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-400">{item.month}</span>
                    <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{
                          width: `${Math.min(
                            (item.projects / Math.max(...stats.growthTrend.map((t) => t.projects), 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-sm font-medium text-white text-right">
                      {item.projects}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Agents & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding Agents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Onboarding Agents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
              Manage →
            </Button>
          </CardHeader>
          <CardContent>
            {stats.onboardingAgents.length === 0 ? (
              <p className="text-gray-400 text-sm">No onboarding agents found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.onboardingAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-medium">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              onClick={() => navigate("/property")}
            >
              🏠 View All Properties
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/users")}
            >
              👥 Manage Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/developers")}
            >
              🏗️ View Developers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessHeadDashboard;
