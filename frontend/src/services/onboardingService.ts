import api from "./api";
import type { User } from "./authService";

export interface OnboardingResponse {
    success: boolean;
    message: string;
    data: User;
}

export const onboardingService = {
    submitForApproval: async (itemId: string, type: 'Property' | 'Project'): Promise<OnboardingResponse> => {
        const response = await api.post<OnboardingResponse>("/onboarding/submit", { itemId, type });
        return response.data;
    },

    approveItem: async (agentId: string, itemId: string, type: 'Property' | 'Project'): Promise<OnboardingResponse> => {
        const response = await api.post<OnboardingResponse>("/onboarding/approve", { agentId, itemId, type });
        return response.data;
    },

    rejectItem: async (agentId: string, itemId: string, type: 'Property' | 'Project', reason: string): Promise<OnboardingResponse> => {
        const response = await api.post<OnboardingResponse>("/onboarding/reject", { agentId, itemId, type, reason });
        return response.data;
    }
};

export default onboardingService;
