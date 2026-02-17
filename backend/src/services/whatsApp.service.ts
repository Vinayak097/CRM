import Communication, { CommunicationChannel, CommunicationDirection, CommunicationStatus, CommunicationEntityType } from "../models/Communication.js";
import Activity, { ActivityType, ActivityChannel, ActivityEntityType } from "../models/Activity.js";
import mongoose from "mongoose";

export class WhatsAppService {
    private apiKey: string;
    private apiUrl: string = "https://backend.aisensy.com/campaign/t1/api";

    constructor() {
        this.apiKey = process.env.AISENSY_API_KEY || "";
    }

    /**
     * Send a WhatsApp message using AiSensy
     */
    async sendMessage(params: {
        destination: string;
        message: string;
        userName: string;
        templateName?: string;
        parameters?: string[];
        relatedTo: { type: ActivityEntityType; id: string };
        createdBy: string;
    }) {
        const { destination, message, userName, templateName, parameters, relatedTo, createdBy } = params;

        // 1. Prepare payload for AiSensy
        // Note: AiSensy strictly requires templates for business-initiated messages.
        // If no template is provided, we might be limited in what we can send.
        const payload: any = {
            apiKey: this.apiKey,
            campaignName: templateName || "API_Message", // Fallback name
            destination: destination.replace(/\D/g, ''), // Clean phone number
            userName: userName,
        };

        if (templateName) {
            payload.template = {
                templateName: templateName,
                language: "en",
                parameters: parameters || [],
            };
        } else {
            // For session messages (if within 24h window), AiSensy might have a different endpoint or format
            // But usually, they favor campaign API for everything.
            // Let's assume template for now as it's the standard.
        }

        try {
            // 2. Call AiSensy API
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log(response, 'this is ai sensy call response');
            const result: any = await response.json();

            // 3. Log as Communication
            const communication = await Communication.create({
                channel: CommunicationChannel.WHATSAPP,
                direction: CommunicationDirection.OUTBOUND,
                message: message,
                status: result.success ? CommunicationStatus.SENT : CommunicationStatus.FAILED,
                from: { name: "Avacasa CRM" }, // Or current user's name
                to: [{ name: userName, phone: destination }],
                related_to: {
                    type: relatedTo.type as unknown as CommunicationEntityType,
                    id: new mongoose.Types.ObjectId(relatedTo.id)
                },
                created_by: new mongoose.Types.ObjectId(createdBy),
            });

            // 4. Log as Activity
            await Activity.create({
                activity_type: ActivityType.WHATSAPP_SENT,
                title: "WhatsApp Message Sent",
                description: message,
                channel: ActivityChannel.WHATSAPP,
                related_to: {
                    type: relatedTo.type,
                    id: new mongoose.Types.ObjectId(relatedTo.id),
                },
                communication_id: communication._id,
                performed_by: new mongoose.Types.ObjectId(createdBy),
            });

            return { success: result.success, communicationId: communication._id, result };
        } catch (error: any) {
            console.error("WhatsApp Send Error:", error);
            throw new Error(`Failed to send WhatsApp: ${error.message}`);
        }
    }

    /**
     * Process incoming webhook from AiSensy
     */
    async processWebhook(payload: any) {
        // Payload structure varies, but typically contains:
        // topic: "message.created"
        // notification: { message: { text: "...", from: "...", ... } }

        const topic = payload.topic;
        if (topic !== "message.created" && topic !== "message.received") {
            // Might be status update like 'delivered'
            if (payload.topic === "message.status.updated") {
                await this.handleStatusUpdate(payload);
            }
            return { success: true, message: "Topic ignored" };
        }

        const msgData = payload.notification?.message || payload.message;
        if (!msgData) return { success: false, message: "Invalid payload" };

        const fromPhone = msgData.from || msgData.phone;
        const text = msgData.text?.body || msgData.text || "";

        // 1. Find the Lead/Customer related to this phone number
        // We'll need a way to lookup by phone.
        // For now, let's assume we can find them in the Lead model.
        const Lead = (await import("../models/Lead.js")).default;
        const lead = await Lead.findOne({
            $or: [
                { phone: fromPhone },
                { phone: { $regex: fromPhone.slice(-10) } } // Partial match for safety
            ]
        });

        if (!lead) {
            console.warn(`No lead found for incoming WhatsApp from: ${fromPhone}`);
            // Still log the communication, but it might not be linked to an entity
        }

        // 2. Create Communication
        const communication = await Communication.create({
            channel: CommunicationChannel.WHATSAPP,
            direction: CommunicationDirection.INBOUND,
            message: text,
            status: CommunicationStatus.READ,
            from: { name: lead?.name || "Unknown", phone: fromPhone },
            to: [{ name: "Avacasa CRM" }],
            related_to: lead ? {
                type: CommunicationEntityType.LEAD,
                id: lead._id
            } : undefined,
            created_by: new mongoose.Types.ObjectId("000000000000000000000001"), // System user ID
        });

        // 3. Create Activity
        if (lead) {
            await Activity.create({
                activity_type: ActivityType.WHATSAPP_RECEIVED,
                title: "WhatsApp Message Received",
                description: text,
                channel: ActivityChannel.WHATSAPP,
                related_to: {
                    type: ActivityEntityType.LEAD,
                    id: lead._id,
                },
                communication_id: communication._id,
                performed_by: new mongoose.Types.ObjectId("000000000000000000000001"),
            });
        }

        return { success: true, communicationId: communication._id };
    }

    private async handleStatusUpdate(payload: any) {
        // Update communication status based on delivery/read events
        // Implementation depends on payload details
    }
}

export default new WhatsAppService();
