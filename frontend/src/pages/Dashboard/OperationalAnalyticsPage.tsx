import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import axios from "axios";

interface AnalyticsData {
    trends: {
        daily: Array<{ _id: string; count: number }>;
        weekly: Array<{ _id: number; year: number; count: number }>;
        monthly: Array<{ _id: string; count: number }>;
    };
    sources: Array<{ source: string; count: number }>;
    statusBreakdown: Array<{ status: string; count: number }>;
    metrics: {
        totalLeads: number;
        closedWon: number;
        conversionRate: number;
    };
}

const COLORS = ["#3b82f6", "#06b6d4", "#eab308", "#f97316", "#a855f7", "#ec4899", "#22c55e", "#ef4444"];
const STATUS_COLORS: Record<string, string> = {
    New: "#3b82f6",
    Contacted: "#06b6d4",
    "Follow-up": "#eab308",
    "Site Visit": "#a855f7",
    "Closed Won": "#22c55e",
    "Closed Lost": "#ef4444",
};

const OperationalAnalyticsPage: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [trendType, setTrendType] = useState<"daily" | "weekly" | "monthly">("daily");

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get("/api/dashboard/operational-analytics");
            setData(response.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return null;

    const trendData = trendType === "daily"
        ? data.trends.daily
        : trendType === "weekly"
            ? data.trends.weekly.map(w => ({ ...w, _id: `Week ${w._id}` }))
            : data.trends.monthly;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Operational Analytics</h1>
                    <p className="text-gray-400">Team-level performance and lead visibility.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Leads Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{data.metrics.totalLeads}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Closed Won</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">{data.metrics.closedWon}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Overall Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-500">{data.metrics.conversionRate}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Trends */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg text-white">Lead Trends</CardTitle>
                        <div className="flex bg-gray-800 p-1 rounded-md text-xs">
                            {(["daily", "weekly", "monthly"] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTrendType(type)}
                                    className={`px-3 py-1 rounded ${trendType === type ? "bg-primary text-white" : "text-gray-400"
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Leads by Source */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Leads by Source</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.sources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="source"
                                >
                                    {data.sources.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Lead Status Breakdown */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Leads by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.statusBreakdown} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="status" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {data.statusBreakdown.map((item, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[item.status] || "#6b7280"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OperationalAnalyticsPage;
