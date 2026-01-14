// routes/property.routes.ts
import { Router } from "express";
import { PropertyController } from "../controllers/property.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createPropertySchema,
  updatePropertySchema,
  queryPropertySchema,
} from "../schemas/property.schema.js";

const router = Router();
const propertyController = new PropertyController();

// Public routes
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

// Protected/Admin routes
router.post(
  "/",
  validateRequest(createPropertySchema),
  propertyController.createProperty
);
router.put(
  "/:id",
  validateRequest(updatePropertySchema),
  propertyController.updateProperty
);
router.delete("/:id", propertyController.deleteProperty);

export default router;
