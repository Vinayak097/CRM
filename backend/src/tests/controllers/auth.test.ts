import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import authRoutes from '../../routes/auth.js';
import { createTestUser } from '../helpers/testHelpers.js';
import { Role } from '../../models/User.js';
import User from '../../models/User.js';

// Create test app
function createTestApp(): Express {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    })
  );
  
  app.use('/api/auth', authRoutes);
  
  return app;
}

describe('Authentication Controller Tests', () => {
  let app: Express;
  
  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'password123';
      const user = await createTestUser(Role.salesAgent, { password });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(user.email);
      expect(response.get('Set-Cookie')).toBeDefined();
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail with missing email or password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Please provide email and password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      const password = 'password123';
      const user = await createTestUser(Role.salesAgent, { password });

      // First login to get session cookie
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password
        });

      const cookies = loginResponse.get('Set-Cookie');

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies || []);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(user.email);
    });

    it('should fail when not authenticated', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const password = 'password123';
      const user = await createTestUser(Role.salesAgent, { password });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password
        });

      const cookies = loginResponse.get('Set-Cookie');

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies || []);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });
});
