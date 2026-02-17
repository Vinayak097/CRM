import { Request, Response } from "express";
import whatsAppService from "../services/whatsApp.service.js";
import { AppError } from "../utils/errorHandler.js";

export class WhatsAppController {
    /**
     * Send a WhatsApp message
     */
    sendMessage = async (req: Request, res: Response) => {
        try {
            const { destination, message, userName, relatedTo, templateName, parameters } = req.body;
            const createdBy = (req as any).user.id;

            if (!destination || !message || !userName || !relatedTo) {
                throw new AppError("Missing required fields", 400);
            }

            const result = await whatsAppService.sendMessage({
                destination,
                message,
                userName,
                relatedTo,
                templateName,
                parameters,
                createdBy,
            });

            res.status(200).json({
                success: true,
                message: "WhatsApp message sent successfully",
                data: result
            });
        } catch (error: any) {
            console.error("WhatsApp Controller Error:", error);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to send WhatsApp message"
            });
        }
    }

    /**
     * Handle AiSensy Webhook
     */
    handleWebhook = async (req: Request, res: Response) => {
        try {
            const payload = req.body;
            console.log("[WhatsApp Webhook] Received payload:", JSON.stringify(payload, null, 2));

            // Verify signature if needed (X-AiSensy-Signature)

            await whatsAppService.processWebhook(payload);

            // Always respond with 2xx to AiSensy
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error("WhatsApp Webhook Error:", error);
            // Still respond with 200 to acknowledge receipt, unless it's a critical infrastructure failure
            res.status(200).json({ success: false, error: error.message });
        }
    }
}

export default new WhatsAppController();
