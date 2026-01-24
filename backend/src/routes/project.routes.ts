import express from 'express';
import { PropertyProjectController } from '../controllers/project.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import {
    PropertyProjectSchema,
    PropertyProjectUpdateSchema,
    PropertyProjectQuerySchema
} from '../schemas/project.shema.js';

const router = express.Router();
const propertyProjectController = new PropertyProjectController();

// CREATE
router.post('/', validateRequest(PropertyProjectSchema), propertyProjectController.createProject);
router.post('/bulk', propertyProjectController.bulkCreateProjects);

// READ
router.get('/', validateRequest(PropertyProjectQuerySchema, "query"), propertyProjectController.getAllProjects);
router.get('/luxury', propertyProjectController.getLuxuryProjects);
router.get('/developer/:developerId', propertyProjectController.getProjectsByDeveloper);
router.get('/:id', propertyProjectController.getProjectById);

// UPDATE
router.put('/:id', validateRequest(PropertyProjectUpdateSchema), propertyProjectController.updateProject);
router.patch('/:id', validateRequest(PropertyProjectUpdateSchema), propertyProjectController.updateProject);

// DELETE
router.delete('/:id', propertyProjectController.deleteProject);

export default router;

