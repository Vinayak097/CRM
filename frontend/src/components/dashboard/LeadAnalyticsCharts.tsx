import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { LeadAnalytics } from "@/types";

interface LeadAnalyticsChartsProps {
    data: LeadAnalytics;
    title?: string;
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

const LeadAnalyticsCharts: React.FC<LeadAnalyticsChartsProps> = ({ data, title }) => {
    const [trendType, setTrendType] = useState<"daily" | "weekly" | "monthly">("daily");

    const trendData = trendType === "daily"
        ? data.trends.daily
        : trendType === "weekly"
            ? data.trends.weekly.map(w => ({ ...w, _id: `W${w._id.week}` }))
            : data.trends.monthly;

    return (
        <div className="space-y-6">
            {title && <h2 className="text-xl font-bold text-white">{title}</h2>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Trends */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg text-white font-semibold">Lead Trends</CardTitle>
                        <div className="flex bg-gray-800 p-1 rounded-md text-[10px]">
                            {(["daily", "weekly", "monthly"] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTrendType(type)}
                                    className={`px-2 py-1 rounded transition-colors ${trendType === type ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Leads by Source (Bar Chart as requested) */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white font-semibold">Leads by Source</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.sources}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="source" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {data.sources.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Lead Status Breakdown */}
                <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white font-semibold">Leads by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.statusBreakdown} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis dataKey="status" type="category" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
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

export default LeadAnalyticsCharts;
