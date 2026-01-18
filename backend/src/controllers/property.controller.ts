// controllers/property.controller.ts
import type { Request, Response } from "express";
import {
  createPropertySchema,
  updatePropertySchema,
  queryPropertySchema,
  type Property,
} from "../schemas/property.schema.js";
import { PropertyService } from "../services/property.service.js";
import { AppError } from "../utils/errorHandler.js";

export class PropertyController {
  private propertyService: PropertyService;

  constructor() {
    this.propertyService = new PropertyService();
  }

  // Create a new property
  createProperty = async (req: Request, res: Response) => {
    try {
      // Request is validated by `validateRequest` middleware; use body directly
      const property = await this.propertyService.createProperty(
        req.body as unknown as CreatePropertyInput,
      );
      res.status(201).json({
        success: true,
        data: property,
        message: "Property created successfully",
      });
    } catch (error: any) {
      if (error?.name === "ZodError") throw error;
      throw new AppError("Failed to create property", 400, error);
    }
  };

  // Get property by ID or slug
  getProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Property ID is required", 400);
      }
      const property = await this.propertyService.getPropertyById(id);

      if (!property) {
        throw new AppError("Property not found", 404);
      }

      // Increment views
      await this.propertyService.incrementViews(id);

      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error) {
      throw error;
    }
  };

  // Get all properties with filtering and pagination
  getProperties = async (req: Request, res: Response) => {
    try {
      // Query was validated by middleware; use query directly
      const result = await this.propertyService.getProperties(
        req.query as unknown as QueryPropertyInput,
      );

      res.status(200).json({
        success: true,
        data: result.properties,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error: any) {
      if (error?.name === "ZodError") throw error;
      throw new AppError("Failed to fetch properties", 400, error);
    }
  };

  // Update property
  updateProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedProperty = await this.propertyService.updateProperty(
        id,
        req.body as unknown as UpdatePropertyInput,
      );

      if (!updatedProperty) {
        throw new AppError("Property not found", 404);
      }

      res.status(200).json({
        success: true,
        data: updatedProperty,
        message: "Property updated successfully",
      });
    } catch (error: any) {
      if (error?.name === "ZodError") throw error;
      throw new AppError("Failed to update property", 400, error);
    }
  };

  // Delete property
  deleteProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError("Property ID is required", 400);
      }
      const deleted = await this.propertyService.deleteProperty(id);

      if (!deleted) {
        throw new AppError("Property not found", 404);
      }

      res.status(200).json({
        success: true,
        message: "Property deleted successfully",
      });
    } catch (error) {
      throw new AppError("Failed to delete property", 400, error);
    }
  };

  // Get featured properties
  getFeaturedProperties = async (req: Request, res: Response) => {
    try {
      const { limit = "6" } = req.query;
      const properties = await this.propertyService.getFeaturedProperties(
        parseInt(limit as string),
      );

      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error) {
      throw new AppError("Failed to fetch featured properties", 400, error);
    }
  };

  // Get properties by location
  getPropertiesByLocation = async (req: Request, res: Response) => {
    try {
      const { locationId } = req.params;
      if (!locationId) {
        throw new AppError("Location ID is required", 400);
      }
      const { limit = "10" } = req.query;

      const properties = await this.propertyService.getPropertiesByLocation(
        locationId,
        parseInt(limit as string),
      );

      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error) {
      throw new AppError("Failed to fetch properties by location", 400, error);
    }
  };

  // Search properties
  searchProperties = async (req: Request, res: Response) => {
    try {
      const { q, limit = "10" } = req.query;

      if (!q || typeof q !== "string") {
        throw new AppError("Search query is required", 400);
      }

      const properties = await this.propertyService.searchProperties(
        q,
        parseInt(limit as string),
      );

      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error) {
      throw new AppError("Failed to search properties", 400, error);
    }
  };

  // Get properties by type
  getPropertiesByType = async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      if (!type) {
        throw new AppError("Property type is required", 400);
      }
      const queryParams = queryPropertySchema.parse(req.query);

      const result = await this.propertyService.getPropertiesByType(
        type,
        queryParams,
      );

      res.status(200).json({
        success: true,
        data: result.properties,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      throw new AppError("Failed to fetch properties by type", 400, error);
    }
  };
}
