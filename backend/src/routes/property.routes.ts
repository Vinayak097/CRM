// routes/property.routes.ts
import { Router } from "express";
import { PropertyController } from "../controllers/property.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createPropertySchema,
  updatePropertySchema,
  queryPropertySchema,
} from "../schemas/property.schema.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";
import { Role } from "../models/User.js";

const router = Router();
const propertyController = new PropertyController();

// Read routes - accessible to authenticated users
router.get(
  "/",
  validateRequest(queryPropertySchema, "query"),
  propertyController.getProperties
);
router.get("/featured", propertyController.getFeaturedProperties);
router.get("/search", propertyController.searchProperties);
router.get(
  "/type/:type",
  validateRequest(queryPropertySchema, "query"),
  propertyController.getPropertiesByType
);
router.get("/location/:locationId", propertyController.getPropertiesByLocation);
router.get("/:id", propertyController.getProperty);

// Write routes - only admin and onboarding agents can create/update/delete
router.post(
  "/",
  authenticateToken,
  requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
  validateRequest(createPropertySchema),
  propertyController.createProperty
);
router.put(
  "/:id",
  authenticateToken,
  requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
  validateRequest(updatePropertySchema),
  propertyController.updateProperty
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole([Role.Admin, Role.OnboardingAgent, Role.Developer]),
  propertyController.deleteProperty
);

export default router;
