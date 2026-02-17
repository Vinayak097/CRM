import api from "./api";

export interface SendWhatsAppParams {
    destination: string;
    message: string;
    userName: string;
    templateName?: string;
    parameters?: string[];
    relatedTo: {
        type: "lead" | "customer" | "deal" | "property";
        id: string;
    };
}

export interface WhatsAppResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const whatsAppService = {
    /**
     * Send a WhatsApp message through the CRM backend
     */
    sendMessage: async (params: SendWhatsAppParams): Promise<WhatsAppResponse> => {
        const response = await api.post<WhatsAppResponse>("/whatsapp/send", params);
        return response.data;
    }
};

export default whatsAppService;
