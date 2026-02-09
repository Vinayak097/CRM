import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KpiCard from "./KpiCard";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import LeadAnalyticsCharts from "./LeadAnalyticsCharts";
import type { AdminStats as AdminStatsType } from "@/types";

interface Props {
  stats: AdminStatsType;
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
  Planning: "bg-blue-500",
  "Under Construction": "bg-yellow-500",
  Completed: "bg-green-500",
  "Ready to Move": "bg-emerald-500",
  // Property Statuses
  AVAILABLE: "bg-green-500",
  SOLD: "bg-red-500",
  RESERVED: "bg-orange-500",
  UNDER_CONTRACT: "bg-yellow-500",
};

const CHART_COLORS: Record<string, string> = {
  New: "#3b82f6",
  Contacted: "#06b6d4",
  Qualified: "#eab308",
  Shortlisted: "#f97316",
  "Site Visit": "#a855f7",
  Negotiation: "#ec4899",
  Booked: "#22c55e",
  Converted: "#059669",
  Lost: "#ef4444",
  Planning: "#3b82f6",
  "Under Construction": "#eab308",
  Completed: "#22c55e",
  "Ready to Move": "#10b981",
  AVAILABLE: "#22c55e",
  SOLD: "#ef4444",
  RESERVED: "#f97316",
  UNDER_CONTRACT: "#eab308",
  Unknown: "#6b7280",
};

export const AdminDashboard: React.FC<Props> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Complete system overview and management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/operational-analytics")}>
            📊 Analytics
          </Button>
          <Button variant="outline" onClick={() => navigate("/users")}>
            👥 Users
          </Button>
          <Button onClick={() => navigate("/leads/create")}>+ New Lead</Button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Total Leads" value={stats.totalLeads} icon="📋" />
        <KpiCard title="Active Deals" value={stats.activeDeals} icon="🔥" />
        <KpiCard title="Conversions" value={stats.monthlyConversions} icon="🎯" subtitle="This month" />
        <KpiCard title="Total Projects" value={stats.totalProjects} icon="📁" />
        <KpiCard title="Properties" value={stats.totalProperties} icon="🏠" />
        <KpiCard title="Total Users" value={stats.totalUsers} icon="👥" />
      </div>

      {/* Lead Analytics Charts */}
      {stats.leadAnalytics && (
        <LeadAnalyticsCharts data={stats.leadAnalytics} title="Lead Analytics Overview" />
      )}

      {/* Sales & Lead Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Pipeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Lead Pipeline</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/leads")}>
              View All →
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.pipeline)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([status, count]) => (
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
                          width: `${Math.min((count / (stats.totalLeads || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="font-medium text-green-500">{stats.conversionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Overview */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between transition-colors hover:bg-gray-800/50 cursor-pointer" onClick={() => navigate("/projects")}>
            <CardTitle className="text-lg">Projects Distribution</CardTitle>
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={Object.entries(stats.projectsByStatus).map(([name, value]) => ({ name, value }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {Object.entries(stats.projectsByStatus).map(([name], index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[name] || CHART_COLORS.Unknown} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="pt-4 border-t border-gray-700 mt-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Active Projects</span>
                <span className="font-semibold text-blue-500">{stats.activeProjects}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Overview */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between transition-colors hover:bg-gray-800/50 cursor-pointer" onClick={() => navigate("/property")}>
            <CardTitle className="text-lg">Property Status</CardTitle>
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.propertiesByStatus).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(stats.propertiesByStatus).map(([name], index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[name] || CHART_COLORS.Unknown} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="pt-4 border-t border-gray-700 mt-2 flex justify-between items-center text-sm text-gray-400">
              <span>Total Listings</span>
              <span className="font-semibold text-white">{stats.totalProperties}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Sales Team</CardTitle>
            <span className="text-sm text-gray-400">{stats.salesAgents.length} agents</span>
          </CardHeader>
          <CardContent>
            {stats.salesAgents.length === 0 ? (
              <p className="text-gray-400 text-sm">No sales agents</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.salesAgents.map((agent) => (
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Onboarding Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Onboarding Team</CardTitle>
            <span className="text-sm text-gray-400">{stats.onboardingAgents.length} agents</span>
          </CardHeader>
          <CardContent>
            {stats.onboardingAgents.length === 0 ? (
              <p className="text-gray-400 text-sm">No onboarding agents</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
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
      </div>

      {/* Growth Trend */}
      {stats.growthTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <span className="w-12 text-sm font-medium text-white text-right">
                    {item.projects} proj
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button variant="outline" className="flex-col h-20" onClick={() => navigate("/leads")}>
              <span className="text-2xl mb-1">📋</span>
              <span className="text-xs">Leads</span>
            </Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => navigate("/leads/create")}>
              <span className="text-2xl mb-1">➕</span>
              <span className="text-xs">New Lead</span>
            </Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => navigate("/users")}>
              <span className="text-2xl mb-1">👥</span>
              <span className="text-xs">Users</span>
            </Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => navigate("/projects")}>
              <span className="text-2xl mb-1">📁</span>
              <span className="text-xs">Projects</span>
            </Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => navigate("/property")}>
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-xs">Properties</span>
            </Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => navigate("/developers")}>
              <span className="text-2xl mb-1">🏗️</span>
              <span className="text-xs">Developers</span>
            </Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => navigate("/sales-funnel")}>
              <span className="text-2xl mb-1">🌪️</span>
              <span className="text-xs">Funnel</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
