// controllers/property.controller.ts
import type { Request, Response } from "express";
import {
  createPropertySchema,
  type updatePropertySchema,
  type queryPropertySchema,
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
      const validatedData = createPropertySchema.parse(req.body);
      const property = await this.propertyService.createProperty(validatedData);

      res.status(201).json({
        success: true,
        data: property,
        message: "Property created successfully",
      });
    } catch (error) {
      throw new AppError("Failed to create property", 400, error);
    }
  };

  // Get property by ID or slug
  getProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
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
      const queryParams = queryPropertySchema.parse(req.query);
      const result = await this.propertyService.getProperties(queryParams);

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
      throw new AppError("Failed to fetch properties", 400, error);
    }
  };

  // Update property
  updateProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updatePropertySchema.parse(req.body);

      const updatedProperty = await this.propertyService.updateProperty(
        id,
        validatedData
      );

      if (!updatedProperty) {
        throw new AppError("Property not found", 404);
      }

      res.status(200).json({
        success: true,
        data: updatedProperty,
        message: "Property updated successfully",
      });
    } catch (error) {
      throw new AppError("Failed to update property", 400, error);
    }
  };

  // Delete property
  deleteProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
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
        parseInt(limit as string)
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
      const { limit = "10" } = req.query;

      const properties = await this.propertyService.getPropertiesByLocation(
        locationId,
        parseInt(limit as string)
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
        parseInt(limit as string)
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
      const queryParams = queryPropertySchema.parse(req.query);

      const result = await this.propertyService.getPropertiesByType(
        type,
        queryParams
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
