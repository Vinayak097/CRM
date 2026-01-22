import type { Request, Response } from "express";
import { DeveloperModel } from "../models/developer.model.js";
import { v4 as uuidv4 } from "uuid";

export class DeveloperController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, active } = req.query;
      const query: any = {};
      
      if (search) {
        query.developer_name = { $regex: search, $options: "i" };
      }
      
      if (active !== undefined) {
        query.active = active === "true";
      }

      const developers = await DeveloperModel.find(query).sort({ developer_name: 1 });
      
      res.json({
        status: "success",
        data: developers,
        count: developers.length
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch developers"
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const developer = await DeveloperModel.findById(req.params.id);
      if (!developer) {
        return res.status(404).json({
          status: "error",
          message: "Developer not found"
        });
      }
      res.json({
        status: "success",
        data: developer
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch developer"
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const id = uuidv4();
      const developerData = {
        ...req.body,
        _id: id,
        id: id
      };


      
      const developer = new DeveloperModel(developerData);
      await developer.save();
      
      res.status(201).json({
        status: "success",
        data: developer
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to create developer"
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const developer = await DeveloperModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      
      if (!developer) {
        return res.status(404).json({
          status: "error",
          message: "Developer not found"
        });
      }
      
      res.json({
        status: "success",
        data: developer
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to update developer"
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const developer = await DeveloperModel.findByIdAndDelete(req.params.id);
      if (!developer) {
        return res.status(404).json({
          status: "error",
          message: "Developer not found"
        });
      }
      res.json({
        status: "success",
        message: "Developer deleted successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to delete developer"
      });
    }
  }
}
