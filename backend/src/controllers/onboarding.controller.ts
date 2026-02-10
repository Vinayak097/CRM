import { Request, Response } from 'express';
import { OnboardingService } from '../services/onboarding.service.js';
import { AppError } from '../utils/errorHandler.js';

export class OnboardingController {
    private onboardingService: OnboardingService;

    constructor() {
        this.onboardingService = new OnboardingService();
    }

    submitForApproval = async (req: Request, res: Response) => {
        try {
            const { itemId, type } = req.body;
            const userId = (req as any).user._id;

            if (!itemId || !type) {
                throw new AppError('Item ID and type are required', 400);
            }

            const user = await this.onboardingService.submitForApproval(userId, itemId, type);

            res.status(200).json({
                success: true,
                message: `${type} submitted for approval successfully`,
                data: user
            });
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to submit for approval', error.statusCode || 500, error);
        }
    }

    approveItem = async (req: Request, res: Response) => {
        try {
            const { agentId, itemId, type } = req.body;
            const managerId = (req as any).user._id;

            if (!agentId || !itemId || !type) {
                throw new AppError('Agent ID, Item ID, and type are required', 400);
            }

            const agent = await this.onboardingService.approveItem(managerId, agentId, itemId, type);

            res.status(200).json({
                success: true,
                message: `${type} approved successfully`,
                data: agent
            });
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to approve item', error.statusCode || 500, error);
        }
    }

    rejectItem = async (req: Request, res: Response) => {
        try {
            const { agentId, itemId, type, reason } = req.body;
            const managerId = (req as any).user._id;

            if (!agentId || !itemId || !type || !reason) {
                throw new AppError('Agent ID, Item ID, type, and reason are required', 400);
            }

            const agent = await this.onboardingService.rejectItem(managerId, agentId, itemId, type, reason);

            res.status(200).json({
                success: true,
                message: `${type} rejected successfully`,
                data: agent
            });
        } catch (error: any) {
            throw new AppError(error.message || 'Failed to reject item', error.statusCode || 500, error);
        }
    }
}
