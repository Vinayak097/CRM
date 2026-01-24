import type { Request, Response } from "express";
import {
    PropertyProjectSchema,
    PropertyProjectQuerySchema,
    PropertyProjectUpdateSchema
} from "../schemas/project.shema.js";
import PropertyProject from "../models/project.model.js";
import { AppError } from "../utils/errorHandler.js";

export class PropertyProjectController {

    // CREATE - Create new property project
    createProject = async (req: Request, res: Response) => {
        try {
            // Validate request body with Zod
            const validatedData = PropertyProjectSchema.parse(req.body);

            // Create new project
            const project = new PropertyProject(validatedData);
            await project.save();

            return res.status(201).json({
                success: true,
                message: 'Property project created successfully',
                data: project
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors
                });
            }

            throw new AppError('Error creating property project', 500, error);
        }
    }

    // READ - Get all projects with pagination and filtering
    getAllProjects = async (req: Request, res: Response) => {
        try {
            // Validate query params
            const queryParams = PropertyProjectQuerySchema.parse(req.query);

            const page = parseInt(queryParams.page || '1');
            const limit = parseInt(queryParams.limit || '10');
            const skip = (page - 1) * limit;

            // Build filter object
            const filter: any = {};

            if (queryParams.project_status) {
                filter.project_status = queryParams.project_status;
            }

            if (queryParams.project_type) {
                filter.project_type = queryParams.project_type;
            }

            if (queryParams.location_id) {
                filter.location_id = queryParams.location_id;
            }

            if (queryParams.developer_id) {
                filter['developer.developer_id'] = queryParams.developer_id;
            }

            // Price range filter
            if (queryParams.min_price || queryParams.max_price) {
                filter['project_pricing.average_price'] = {};
                if (queryParams.min_price) {
                    filter['project_pricing.average_price'].$gte = parseFloat(queryParams.min_price);
                }
                if (queryParams.max_price) {
                    filter['project_pricing.average_price'].$lte = parseFloat(queryParams.max_price);
                }
            }

            // Text search
            if (queryParams.search) {
                filter.$text = { $search: queryParams.search };
            }

            // Execute query
            const projects = await PropertyProject
                .find(filter)
                .sort(queryParams.sort as any)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await PropertyProject.countDocuments(filter);

            return res.status(200).json({
                success: true,
                data: projects,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: error.errors
                });
            }

            throw new AppError('Error fetching property projects', 500, error);
        }
    }

    // READ - Get single project by ID
    getProjectById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const project = await PropertyProject.findById(id);

            if (!project) {
                throw new AppError('Property project not found', 404);
            }

            return res.status(200).json({
                success: true,
                data: project
            });
        } catch (error: any) {
            throw new AppError('Error fetching property project', 500, error);
        }
    }

    // UPDATE - Update project by ID
    updateProject = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Validate update data
            const validatedData = PropertyProjectUpdateSchema.parse(req.body);

            const project = await PropertyProject.findByIdAndUpdate(
                id,
                { $set: validatedData },
                { new: true, runValidators: true }
            );

            if (!project) {
                throw new AppError('Property project not found', 404);
            }

            return res.status(200).json({
                success: true,
                message: 'Property project updated successfully',
                data: project
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors
                });
            }

            throw new AppError('Error updating property project', 500, error);
        }
    }

    // DELETE - Delete project by ID (soft delete by updating status)
    deleteProject = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { permanent } = req.query;

            if (permanent === 'true') {
                // Hard delete
                const project = await PropertyProject.findByIdAndDelete(id);

                if (!project) {
                    throw new AppError('Property project not found', 404);
                }

                return res.status(200).json({
                    success: true,
                    message: 'Property project permanently deleted'
                });
            } else {
                // Soft delete - update status to 'Deleted' or similar
                const project = await PropertyProject.findByIdAndUpdate(
                    id,
                    { $set: { availabilityStatus: 'Deleted' } },
                    { new: true }
                );

                if (!project) {
                    throw new AppError('Property project not found', 404);
                }

                return res.status(200).json({
                    success: true,
                    message: 'Property project deleted successfully',
                    data: project
                });
            }
        } catch (error: any) {
            throw new AppError('Error deleting property project', 500, error);
        }
    }

    // ADDITIONAL - Get projects by developer
    getProjectsByDeveloper = async (req: Request, res: Response) => {
        try {
            const { developerId } = req.params;

            const projects = await PropertyProject.find({
                'developer.developer_id': developerId
            });

            return res.status(200).json({
                success: true,
                data: projects,
                count: projects.length
            });
        } catch (error: any) {
            throw new AppError('Error fetching developer projects', 500, error);
        }
    }

    // ADDITIONAL - Get luxury projects
    getLuxuryProjects = async (req: Request, res: Response) => {
        try {
            const projects = await PropertyProject.find({
                'targetMarket.segment': 'luxury'
            });

            return res.status(200).json({
                success: true,
                data: projects,
                count: projects.length
            });
        } catch (error: any) {
            throw new AppError('Error fetching luxury projects', 500, error);
        }
    }

    // ADDITIONAL - Bulk create projects
    bulkCreateProjects = async (req: Request, res: Response) => {
        try {
            const { projects } = req.body;

            if (!Array.isArray(projects) || projects.length === 0) {
                throw new AppError('Projects array is required', 400);
            }

            // Validate all projects
            const validatedProjects = projects.map(project =>
                PropertyProjectSchema.parse(project)
            );

            // Insert all projects
            const createdProjects = await PropertyProject.insertMany(validatedProjects);

            return res.status(201).json({
                success: true,
                message: `${createdProjects.length} projects created successfully`,
                data: createdProjects
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors
                });
            }

            throw new AppError('Error bulk creating projects', 500, error);
        }
    }
}
