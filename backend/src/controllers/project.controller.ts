import type { Request, Response } from "express";
import {
    PropertyProjectSchema,
    PropertyProjectQuerySchema,
    PropertyProjectUpdateSchema
} from "../schemas/project.shema.js";
import PropertyProject from "../models/project.model.js";
import { AppError } from "../utils/errorHandler.js";
import mongoose from "mongoose";

export class PropertyProjectController {

    private async findProjectOrThrow(id: string) {
        let project = null;

        // 1. Try finding by MongoDB _id if it's a valid ObjectId
        if (mongoose.isValidObjectId(id)) {
            project = await PropertyProject.findById(id);
        }

        // 2. If not found by _id, try finding by custom string id
        if (!project) {
            project = await PropertyProject.findOne({ id: id });
        }

        // 3. Fallback: Try native collection query for _id as string
        if (!project) {
            const query: any = { _id: id };
            if (mongoose.isValidObjectId(id)) {
                query._id = new mongoose.Types.ObjectId(id);
            }
            project = await PropertyProject.findOne(query);
        }

        if (!project) {
            throw new AppError('Property project not found', 404);
        }

        return project;
    }

    // CREATE - Create new property project
    createProject = async (req: Request, res: Response) => {
        try {
            // Create new project - data already validated by middleware
            const projectData = {
                ...req.body,
                assignedAgent: (req as any).user?.id
            };
            const project = new PropertyProject(projectData);
            await project.save();

            // Onboarding assignment
            const user = (req as any).user;
            if (user?.role === 'onboarding_agent') {
                const User = (await import('../models/User.js')).default;
                await User.findByIdAndUpdate(user.id, {
                    $push: {
                        assignedProjects: {
                            projectId: project._id,
                            status: 'Draft',
                            updatedAt: new Date()
                        }
                    }
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Property project created successfully',
                data: project
            });
        } catch (error: any) {
            if (error?.name === "ZodError" || error.code === 11000) throw error;
            throw new AppError(error.message || 'Error creating property project', 500, error);
        }
    }

    // READ - Get all projects with pagination and filtering
    getAllProjects = async (req: Request, res: Response) => {
        try {
            // query parameters already validated by middleware
            const queryParams = req.query as any;

            let page = parseInt(queryParams.page || '1');
            let limit = parseInt(queryParams.limit || '10');

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;

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

            // Role-based visibility
            const user = (req as any).user;

            if (user?.role === 'sales_agent') {
                filter.isVerified = true;
            } else if (queryParams.isVerified) {
                filter.isVerified = queryParams.isVerified === 'true';
            }

            // Soft-delete filter: include 0, null, or missing fields. Only exclude explicitly deleted (1)
            const isDeletedVal = queryParams.is_deleted ? parseInt(queryParams.is_deleted) : 0;
            if (isDeletedVal === 0) {
                filter.is_deleted = { $ne: 1 };
            } else {
                filter.is_deleted = isDeletedVal;
            }

            // Execute query
            console.log(`[PropertyProjectController] Fetching projects with filter: ${JSON.stringify(filter)}`);

            const projects = await PropertyProject
                .find(filter)
                .sort(queryParams.sort as any)
                .skip(skip)
                .limit(limit);

            const total = await PropertyProject.countDocuments(filter);
            console.log(`[PropertyProjectController] Found ${projects.length} projects out of ${total} total matching filter`);

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
            throw new AppError('Error fetching property projects', 500, error);
        }
    }

    // READ - Get single project by ID (supports both _id and custom id)
    getProjectById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const project = await this.findProjectOrThrow(id);

            return res.status(200).json({
                success: true,
                data: project
            });
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            console.error(`[PropertyProjectController] Error fetching project: ${error.message}`, error);
            throw new AppError('Error fetching property project', 500, error);
        }
    }

    updateProject = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Data already validated by middleware
            const updateData = { ...req.body };
            // Strip immutable or redundant ID/timestamp fields
            delete updateData._id;
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.updated_at;
            
            // Set updated_at manually with ISO format
            updateData.updated_at = new Date().toISOString();

            const project = await PropertyProject.findOneAndUpdate(
                { id: id },
                { $set: updateData },
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
            console.error(`[PropertyProjectController] Error updating project:`, error);
            if (error instanceof AppError) throw error;
            throw new AppError('Error updating property project', 500, error);
        }
    }

    deleteProject = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { permanent } = req.query;

            if (permanent === 'true') {
                const project = await PropertyProject.findOneAndDelete({ id: id });
                if (!project) throw new AppError('Property project not found', 404);

                return res.status(200).json({
                    success: true,
                    message: 'Property project permanently deleted'
                });
            } else {
                const project = await PropertyProject.findOneAndUpdate(
                    { id: id },
                    { $set: { is_deleted: 1, availabilityStatus: 'Deleted' } },
                    { new: true }
                );

                if (!project) throw new AppError('Property project not found', 404);

                return res.status(200).json({
                    success: true,
                    message: 'Property project soft-deleted successfully',
                    data: project
                });
            }
        } catch (error: any) {
            if (error instanceof AppError) throw error;
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

            // Insert all projects - manual validation skipped here as it's bulk
            // In a better system, this would also have a bulk schema validation
            const createdProjects = await PropertyProject.insertMany(projects);

            return res.status(201).json({
                success: true,
                message: `${createdProjects.length} projects created successfully`,
                data: createdProjects
            });
        } catch (error: any) {
            throw new AppError('Error bulk creating projects', 500, error);
        }
    }

    verifyProject = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const project = await PropertyProject.findOneAndUpdate(
                { id: id },
                { $set: { isVerified: true } },
                { new: true }
            );

            if (!project) throw new AppError('Property project not found', 404);

            return res.status(200).json({
                success: true,
                message: 'Property project verified successfully',
                data: project
            });
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error verifying property project', 500, error);
        }
    }
}
