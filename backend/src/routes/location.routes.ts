import express from "express";
import { LocationController } from "../controllers/locations.controller.js";

const router = express.Router();
const locationController = new LocationController();

router.get("/", (req, res) => locationController.getAll(req, res));
router.get("/search", (req, res) => locationController.searchLocations(req, res));
router.get("/:id", (req, res) => locationController.getById(req, res));
router.post("/", (req, res) => locationController.create(req, res));
router.put("/:id", (req, res) => locationController.update(req, res));
router.delete("/:id", (req, res) => locationController.delete(req, res));


export default router;
