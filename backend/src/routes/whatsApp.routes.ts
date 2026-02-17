import { Router } from "express";
import whatsAppController from "../controllers/whatsApp.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

/**
 * @route   POST /api/whatsapp/send
 * @desc    Send a WhatsApp message
 * @access  Private
 */
router.post("/send", authenticateToken, whatsAppController.sendMessage);

/**
 * @route   POST /api/whatsapp/webhook
 * @desc    Handle AiSensy Webhook
 * @access  Public (Requires signature verification for security)
 */
router.post("/webhook", whatsAppController.handleWebhook);

export default router;
