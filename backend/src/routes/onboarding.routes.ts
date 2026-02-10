import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { Role } from '../models/User.js';

const router = Router();
const onboardingController = new OnboardingController();

// Submit for approval (Onboarding Agents)
router.post(
    '/submit',
    authenticateToken,
    requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
    onboardingController.submitForApproval
);

// Approve (Business Head)
router.post(
    '/approve',
    authenticateToken,
    requireRole([Role.Admin, Role.BusinessHead]),
    onboardingController.approveItem
);

// Reject (Business Head)
router.post(
    '/reject',
    authenticateToken,
    requireRole([Role.Admin, Role.BusinessHead]),
    onboardingController.rejectItem
);

export default router;
