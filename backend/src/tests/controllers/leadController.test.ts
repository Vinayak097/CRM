import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import leadRoutes from '../../routes/leadRoutes.js';
import authRoutes from '../../routes/auth.js';
import { authenticateToken, requireRole } from '../../middlewares/auth.js';
import { Role } from '../../models/User.js';
import { createAuthenticatedUser, createTestLeadData, createTestUser } from '../helpers/testHelpers.js';
import Lead from '../../models/Lead.js';
import { LeadStatus } from '../../types/lead.types.js';

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
    })
  );
  
  app.use('/api/auth', authRoutes);
  app.use(
    '/api/leads',
    authenticateToken,
    requireRole([Role.Admin, Role.salesAgent]),
    leadRoutes
  );
  
  return app;
}

describe('Lead Controller Tests', () => {
  let app: Express;
  
  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/leads - Create Lead', () => {
    it('should create a new lead with valid data', async () => {
      const { token, user } = await createAuthenticatedUser(Role.salesAgent);
      const leadData = createTestLeadData();

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send(leadData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.identity.firstName).toBe(leadData.identity.firstName);
      expect(response.body.data.system.assignedAgent).toBe(user._id.toString());
    });

    it('should create a lead with minimal required data', async () => {
      const { token } = await createAuthenticatedUser(Role.salesAgent);
      const minimalData = {
        identity: {
          firstName: 'Minimal',
          lastName: 'Lead',
          phone: '+9876543210',
        },
      };

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send(minimalData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.identity.firstName).toBe(minimalData.identity.firstName);
    });

    it('should fail with invalid phone number', async () => {
      const { token } = await createAuthenticatedUser(Role.salesAgent);
      const invalidData = createTestLeadData({
        identity: {
          phone: 'invalid-phone',
        },
      });

      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/leads - Get All Leads', () => {
    it('should get all leads (Admin)', async () => {
      const { token } = await createAuthenticatedUser(Role.Admin);
      
      await Lead.create(createTestLeadData({ identity: { firstName: 'Admin', lastName: 'Lead', phone: '+1111111111' } }));
      await Lead.create(createTestLeadData({ identity: { firstName: 'Another', lastName: 'Lead', phone: '+2222222222' } }));

      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.leads).toBeDefined();
      expect(response.body.data.leads.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter leads by status', async () => {
      const { token } = await createAuthenticatedUser(Role.Admin);
      
      await Lead.create(createTestLeadData({ 
        identity: { firstName: 'New', lastName: 'Lead', phone: '+3333333333' },
        system: { leadStatus: LeadStatus.New } 
      }));
      await Lead.create(createTestLeadData({ 
        identity: { firstName: 'Qualified', lastName: 'Lead', phone: '+4444444444' },
        system: { leadStatus: LeadStatus.Qualified } 
      }));

      const response = await request(app)
        .get('/api/leads')
        .query({ status: LeadStatus.New })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const allNew = response.body.data.leads.every((l: any) => l.system.leadStatus === LeadStatus.New);
      expect(allNew).toBe(true);
    });

    it('should restrict sales agent to their own leads', async () => {
      const { token, user } = await createAuthenticatedUser(Role.salesAgent);
      const otherAgent = await createTestUser(Role.salesAgent);
      
      await Lead.create(createTestLeadData({ 
        identity: { phone: '+5555555555' },
        system: { assignedAgent: user._id }
      }));
      await Lead.create(createTestLeadData({ 
        identity: { phone: '+6666666666' },
        system: { assignedAgent: otherAgent._id }
      }));

      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const onlyMine = response.body.data.leads.every((l: any) => l.system.assignedAgent._id === user._id.toString());
      expect(onlyMine).toBe(true);
    });
  });

  describe('GET /api/leads/:id - Get Lead By ID', () => {
    it('should get a lead by ID', async () => {
      const { token } = await createAuthenticatedUser(Role.Admin);
      const lead = await Lead.create(createTestLeadData());

      const leadId = (lead as any)._id?.toString();
      const response = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data._id || response.body.data.id).toBe(leadId);
    });

    it('should deny access to sales agent for unassigned lead', async () => {
      const { token } = await createAuthenticatedUser(Role.salesAgent);
      const otherAgent = await createTestUser(Role.salesAgent);
      const lead = await Lead.create(createTestLeadData({ system: { assignedAgent: (otherAgent as any)._id } }));

      const leadId = (lead as any)._id?.toString();
      const response = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/leads/:id - Update Lead', () => {
    it('should update lead identity', async () => {
      const { token } = await createAuthenticatedUser(Role.Admin);
      const lead = await Lead.create(createTestLeadData());

      const leadId = (lead as any)._id?.toString();
      const response = await request(app)
        .patch(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ identity: { firstName: 'UpdatedName' } });

      expect(response.status).toBe(200);
      expect(response.body.data.identity.firstName).toBe('UpdatedName');
    });
  });

  describe('PATCH /api/leads/:id/status - Update Status', () => {
    it('should update lead status', async () => {
      const { token } = await createAuthenticatedUser(Role.Admin);
      const lead = await Lead.create(createTestLeadData({ system: { leadStatus: LeadStatus.New } }));

      const leadId = (lead as any)._id?.toString();
      const response = await request(app)
        .patch(`/api/leads/${leadId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ leadStatus: LeadStatus.Qualified, notes: 'Qualified after call' });

      expect(response.status).toBe(200);
      expect(response.body.data.newStatus).toBe(LeadStatus.Qualified);

      const updatedLead = await Lead.findById(leadId);
      expect(updatedLead?.system?.leadStatus).toBe(LeadStatus.Qualified);
    });
  });

  describe('PATCH /api/leads/:id/assign-agent - Assign Agent', () => {
    it('should allow admin to assign agent', async () => {
      const { token } = await createAuthenticatedUser(Role.Admin);
      const agent = await createTestUser(Role.salesAgent);
      const lead = await Lead.create(createTestLeadData());

      const leadId = (lead as any)._id?.toString();
      const agentId = (agent as any)._id?.toString();
      const response = await request(app)
        .patch(`/api/leads/${leadId}/assign-agent`)
        .set('Authorization', `Bearer ${token}`)
        .send({ agentId: agentId });

      expect(response.status).toBe(200);
      expect(response.body.data.system.assignedAgent).toBe(agentId);
    });
  });

  describe('DELETE /api/leads/:id - Delete Lead', () => {
    it('should allow admin to delete lead', async () => {
      const { token } = await createAuthenticatedUser(Role.Admin);
      const lead = await Lead.create(createTestLeadData());

      const leadId = (lead as any)._id?.toString();
      const response = await request(app)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const found = await Lead.findById(leadId);
      expect(found).toBeNull();
    });
  });
});
