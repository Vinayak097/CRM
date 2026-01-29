
import React from 'react';

export const SalesAgentDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Sales Agent Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Assigned Leads</h3>
                    <p className="text-2xl font-bold">12</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Today's Follow-ups</h3>
                    <p className="text-2xl font-bold">5</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Pending Leads</h3>
                    <p className="text-2xl font-bold">3</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Conversions (Month)</h3>
                    <p className="text-2xl font-bold">2</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">My Leads</h2>
                    <p className="text-gray-500">Kanban view placeholder...</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Upcoming Follow-ups</h2>
                    <p className="text-gray-500">List view placeholder...</p>
                </div>
            </div>
        </div>
    );
};

export const OnboardingAgentDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Onboarding Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Projects Created</h3>
                    <p className="text-2xl font-bold">8</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Properties Added</h3>
                    <p className="text-2xl font-bold">45</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Developers Onboarded</h3>
                    <p className="text-2xl font-bold">3</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Pending Approvals</h3>
                    <p className="text-2xl font-bold">7</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">New Project</button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded">New Property</button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Onboarding Status</h2>
                    <p className="text-gray-500">Tracker view placeholder...</p>
                </div>
            </div>
        </div>
    );
};

export const SalesManagerDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Sales Manager Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Leads</h3>
                    <p className="text-2xl font-bold">145</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Active Deals</h3>
                    <p className="text-2xl font-bold">32</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Team Conversion Rate</h3>
                    <p className="text-2xl font-bold">12%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Revenue Pipeline</h3>
                    <p className="text-2xl font-bold">$2.4M</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">Team Performance</h2>
                <p className="text-gray-500">Agent performance table placeholder...</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Sales Funnel</h2>
                <p className="text-gray-500">Funnel chart placeholder...</p>
            </div>
        </div>
    );
};

export const BusinessHeadDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Business Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Active Projects</h3>
                    <p className="text-2xl font-bold">15</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Inventory</h3>
                    <p className="text-2xl font-bold">342</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Growth (QoQ)</h3>
                    <p className="text-2xl font-bold text-green-600">+15%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Onboarding Velocity</h3>
                    <p className="text-2xl font-bold">4.2/wk</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">Business Insights</h2>
                <p className="text-gray-500">Growth trends chart placeholder...</p>
            </div>
        </div>
    );
};
