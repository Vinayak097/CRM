import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface FunnelStageData {
    stage: string;
    count: number;
    percentage: number;
    conversionRate: number;
}

interface SalesFunnelData {
    stages: FunnelStageData[];
    totalLeads: number;
    overallConversionRate: number;
    convertedLeads: number;
}

const STAGE_COLORS = [
    "#3b82f6", // blue
    "#06b6d4", // cyan
    "#10b981", // green
    "#eab308", // yellow
    "#a855f7", // purple
    "#f97316", // orange
    "#ec4899", // pink
    "#22c55e", // emerald
];

const SalesFunnelPage: React.FC = () => {
    const navigate = useNavigate();
    const [funnelData, setFunnelData] = useState<SalesFunnelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFunnelData();
    }, []);

    const fetchFunnelData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/dashboard/sales-funnel");
            setFunnelData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch funnel data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-white">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Sales Funnel Analytics</h1>
                </div>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400">Loading funnel data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-white">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Sales Funnel Analytics</h1>
                </div>
                <div className="p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    if (!funnelData) return null;

    return (
        <div className="p-6 text-white bg-background min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Sales Funnel Analytics</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Visualize lead progression and conversion rates
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Total Leads
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {funnelData.totalLeads}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Converted Leads
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-400">
                            {funnelData.convertedLeads}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            Overall Conversion Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-400">
                            {funnelData.overallConversionRate}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Visualization */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Lead Distribution by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={funnelData.stages}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="stage"
                                stroke="#9ca3af"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1f2937",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Legend />
                            <Bar dataKey="count" name="Lead Count" radius={[8, 8, 0, 0]}>
                                {funnelData.stages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Stage Details Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Stage-by-Stage Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800 text-gray-300">
                                <tr>
                                    <th className="p-3">Stage</th>
                                    <th className="p-3 text-right">Lead Count</th>
                                    <th className="p-3 text-right">% of Total</th>
                                    <th className="p-3 text-right">Conversion from Previous</th>
                                    <th className="p-3 text-right">Drop-off</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funnelData.stages.map((stage, index) => {
                                    const dropOff = 100 - stage.conversionRate;
                                    return (
                                        <tr
                                            key={stage.stage}
                                            className="border-t border-gray-700 hover:bg-gray-800/50"
                                        >
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: STAGE_COLORS[index] }}
                                                    />
                                                    <span className="font-medium">{stage.stage}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right font-semibold">
                                                {stage.count}
                                            </td>
                                            <td className="p-3 text-right text-gray-400">
                                                {stage.percentage}%
                                            </td>
                                            <td className="p-3 text-right">
                                                <span
                                                    className={`px-2 py-1 rounded text-sm ${stage.conversionRate >= 50
                                                            ? "bg-green-500/20 text-green-400"
                                                            : stage.conversionRate >= 25
                                                                ? "bg-yellow-500/20 text-yellow-400"
                                                                : "bg-red-500/20 text-red-400"
                                                        }`}
                                                >
                                                    {stage.conversionRate}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                {index > 0 && dropOff > 0 ? (
                                                    <div className="flex items-center justify-end gap-1 text-red-400">
                                                        <TrendingDown className="h-4 w-4" />
                                                        <span>{dropOff}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesFunnelPage;
