
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import {
    SalesAgentDashboard,
    OnboardingAgentDashboard,
    SalesManagerDashboard,
    BusinessHeadDashboard
} from './RoleDashboards';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    switch (user.role) {
        case Role.SalesAgent:
            return <SalesAgentDashboard />;
        case Role.OnboardingAgent:
            return <OnboardingAgentDashboard />;
        case Role.SalesManager:
            return <SalesManagerDashboard />;
        case Role.BusinessHead:
            return <BusinessHeadDashboard />;
        case Role.Admin:
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Sales Manager View</h2>
                            <div className="border p-4 rounded-lg bg-gray-50"><SalesManagerDashboard /></div>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Business Head View</h2>
                            <div className="border p-4 rounded-lg bg-gray-50"><BusinessHeadDashboard /></div>
                        </section>
                    </div>
                </div>
            );
        default:
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                    <p className="mt-2 text-gray-600">Please contact support to assign a role-specific dashboard.</p>
                </div>
            );
    }
};

export default DashboardPage;
