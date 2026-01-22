import express from "express";
import { DeveloperController } from "../controllers/developer.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();
const developerController = new DeveloperController();

// All routes require authentication
router.use(authenticateToken);

router.get("/", (req, res) => developerController.getAll(req, res));
router.get("/:id", (req, res) => developerController.getById(req, res));
router.post("/", (req, res) => developerController.create(req, res));
router.put("/:id", (req, res) => developerController.update(req, res));
router.delete("/:id", (req, res) => developerController.delete(req, res));

export default router;
