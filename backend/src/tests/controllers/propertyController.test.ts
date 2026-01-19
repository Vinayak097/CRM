import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import propertyRoutes from '../../routes/property.routes.js';
import { createTestPropertyData } from '../helpers/testHelpers.js';
import { PropertyModel } from '../../models/property.model.js';

// Create test app - Property routes seem to be public for GET, but let's assume they might need auth later
// For now, testing the existing public routes
function createTestApp(): Express {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  
  app.use('/api/properties', propertyRoutes);
  
  return app;
}

describe('Property Controller Tests', () => {
  let app: Express;
  
  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/properties - Get All', () => {
    it('should retrieve all properties with pagination', async () => {
      await PropertyModel.create(createTestPropertyData({ basic_info: { property_name: 'P1' } }));
      await PropertyModel.create(createTestPropertyData({ basic_info: { property_name: 'P2' } }));

      const response = await request(app).get('/api/properties');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.properties).toBeDefined();
      expect(response.body.data.properties.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter by property type', async () => {
      await PropertyModel.create(createTestPropertyData({ basic_info: { property_type: 'Villa', property_name: 'Villa 1' } }));
      await PropertyModel.create(createTestPropertyData({ basic_info: { property_type: 'Apartment', property_name: 'Apt 1' } }));

      const response = await request(app)
        .get('/api/properties')
        .query({ property_type: 'Villa' });

      expect(response.status).toBe(200);
      const allVillas = response.body.data.properties.every((p: any) => p.basic_info.property_type === 'Villa');
      expect(allVillas).toBe(true);
    });
  });

  describe('GET /api/properties/:id - Get By ID', () => {
    it('should retrieve property by ID and increment views', async () => {
      const property = await PropertyModel.create(createTestPropertyData());

      const response = await request(app).get(`/api/properties/${property._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(property._id.toString());
      
      // Check views increment (might need a short delay or check DB directly)
      const after = await PropertyModel.findById(property._id);
      expect(after?.analytics?.views).toBeGreaterThan(0);
    });

    it('should return 404 for missing property', async () => {
      const response = await request(app).get('/api/properties/507f1f77bcf86cd799439011');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/properties/featured - Featured', () => {
    it('should retrieve featured properties', async () => {
      await PropertyModel.create(createTestPropertyData({ basic_info: { is_featured: true, property_name: 'F1' } }));
      
      const response = await request(app).get('/api/properties/featured');

      expect(response.status).toBe(200);
      expect(response.body.data.properties.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.properties[0].basic_info.is_featured).toBe(true);
    });
  });

  describe('GET /api/properties/search - Search', () => {
    it('should search by query string', async () => {
      await PropertyModel.create(createTestPropertyData({ basic_info: { property_name: 'UniqueName Villa' } }));
      
      const response = await request(app)
        .get('/api/properties/search')
        .query({ q: 'UniqueName' });

      expect(response.status).toBe(200);
      expect(response.body.data.properties.some((p: any) => p.basic_info.property_name.includes('UniqueName'))).toBe(true);
    });

    it('should return 400 without query', async () => {
      const response = await request(app).get('/api/properties/search');
      expect(response.status).toBe(400);
    });
  });
});
