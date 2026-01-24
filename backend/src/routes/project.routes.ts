import express from 'express';
import { PropertyProjectController } from '../controllers/project.controller.js';

const router = express.Router();
const propertyProjectController = new PropertyProjectController();

// CREATE
router.post('/', propertyProjectController.createProject);
router.post('/bulk', propertyProjectController.bulkCreateProjects);

// READ
router.get('/', propertyProjectController.getAllProjects);
router.get('/luxury', propertyProjectController.getLuxuryProjects);
router.get('/developer/:developerId', propertyProjectController.getProjectsByDeveloper);
router.get('/:id', propertyProjectController.getProjectById);

// UPDATE
router.put('/:id', propertyProjectController.updateProject);
router.patch('/:id', propertyProjectController.updateProject);

// DELETE
router.delete('/:id', propertyProjectController.deleteProject);

export default router;

