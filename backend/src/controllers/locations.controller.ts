import type { Request, Response } from "express";
import { LocationModel } from "../models/location.model.js";
import { v4 as uuidv4 } from "uuid";

export class LocationController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, featured, active } = req.query;
      const query: any = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }
      
      if (featured !== undefined) query.featured = featured === "true";
      if (active !== undefined) query.active = active === "true";

      const locations = await LocationModel.find(query).sort({ name: 1 });
      
      res.json({
        status: "success",
        data: locations,
        count: locations.length
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch locations"
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const location = await LocationModel.findById(req.params.id);
      if (!location) {
        return res.status(404).json({
          status: "error",
          message: "Location not found"
        });
      }
      res.json({
        status: "success",
        data: location
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch location"
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const id = req.body._id || uuidv4();
      const locationData = { ...req.body, _id: id };
      
      const location = new LocationModel(locationData);
      await location.save();
      
      res.status(201).json({
        status: "success",
        data: location
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to create location"
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const location = await LocationModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      
      if (!location) {
        return res.status(404).json({
          status: "error",
          message: "Location not found"
        });
      }
      
      res.json({
        status: "success",
        data: location
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to update location"
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const location = await LocationModel.findByIdAndDelete(req.params.id);
      if (!location) {
        return res.status(404).json({
          status: "error",
          message: "Location not found"
        });
      }
      res.json({
        status: "success",
        message: "Location deleted successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to delete location"
      });
    }
  }

  async searchLocations(req: Request, res: Response) {
    try {
      const q = String(req.query.q || "").trim();
      if (!q) {
        return res.json({
          status: "success",
          data: { cities: [], count: 0, search_term: "" },
          message: "Empty search query",
        });
      }

      const limit = Math.min(
        req.query.limit ? parseInt(String(req.query.limit)) : 10,
        100
      );

      // Simple implementation using regex on name
      const locations = await LocationModel.find({
        name: { $regex: q, $options: "i" },
        active: true,
      })
        .limit(limit)
        .lean();

      // Transform to requested format
      const cities = locations.map((loc: any) => {
        return {
          city: loc.name,
          country: "India",
          display_name: loc.name,
          location_id: loc._id,
          region: "",
          state: "",
        };
      });


      res.json({
        action: "",
        code: "success",
        data: {
          cities,
          count: cities.length,
          search_term: q,
        },
        message: `Found ${cities.length} matching cities.`,
        status: "success",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to search locations",
      });
    }
  }
}

