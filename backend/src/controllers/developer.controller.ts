import type { Request, Response } from "express";
import { DeveloperModel } from "../models/developer.model.js";
import { v4 as uuidv4 } from "uuid";

export class DeveloperController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, active, page = "1", limit = "10" } = req.query;
      const query: any = {};

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      if (search) {
        query.developer_name = { $regex: search, $options: "i" };
      }

      if (active !== undefined) {
        query.active = active === "true";
      }

      const [developers, total] = await Promise.all([
        DeveloperModel.find(query)
          .sort({ developer_name: 1 })
          .skip(skip)
          .limit(limitNum),
        DeveloperModel.countDocuments(query)
      ]);

      res.json({
        status: "success",
        data: developers,
        pagination: {
          total,
          totalPages: Math.ceil(total / limitNum),
          currentPage: pageNum,
          limit: limitNum
        }
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
