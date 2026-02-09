import express from 'express';
import { PropertyProjectController } from '../controllers/project.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import {
    PropertyProjectSchema,
    PropertyProjectUpdateSchema,
    PropertyProjectQuerySchema
} from '../schemas/project.shema.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { Role } from '../models/User.js';

const router = express.Router();
const propertyProjectController = new PropertyProjectController();

// READ - accessible to authenticated users
router.get('/', validateRequest(PropertyProjectQuerySchema, "query"), propertyProjectController.getAllProjects);
router.get('/luxury', propertyProjectController.getLuxuryProjects);
router.get('/developer/:developerId', propertyProjectController.getProjectsByDeveloper);
router.get('/:id', propertyProjectController.getProjectById);

// CREATE - only admin and onboarding agents
router.post(
    '/',
    authenticateToken,
    requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
    validateRequest(PropertyProjectSchema),
    propertyProjectController.createProject
);
router.post(
    '/bulk',
    authenticateToken,
    requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
    propertyProjectController.bulkCreateProjects
);

// UPDATE - only admin and onboarding agents
router.put(
    '/:id',
    authenticateToken,
    requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
    validateRequest(PropertyProjectUpdateSchema),
    propertyProjectController.updateProject
);
router.patch(
    '/:id',
    authenticateToken,
    requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
    validateRequest(PropertyProjectUpdateSchema),
    propertyProjectController.updateProject
);

router.patch(
    '/:id/verify',
    authenticateToken,
    requireRole([Role.Admin, Role.BusinessHead]),
    propertyProjectController.verifyProject
);

// DELETE - only admin and onboarding agents
router.delete(
    '/:id',
    authenticateToken,
    requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
    propertyProjectController.deleteProject
);

export default router;

