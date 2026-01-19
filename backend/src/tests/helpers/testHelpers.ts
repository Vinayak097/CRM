import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { Role } from '../../models/User.js';
import type { AuthUser } from '../../middlewares/auth.js';
import { LeadStatus } from '../../types/lead.types.js';

/**
 * Create a test user with specified role
 */
export async function createTestUser(
  role: Role = Role.salesAgent,
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
  }> = {}
) {
  const hashedPassword = await bcrypt.hash(overrides.password || 'password123', 10);
  
  const user = await User.create({
    email: overrides.email || `test-${role}-${Date.now()}@test.com`,
    password: hashedPassword,
    name: overrides.name || `Test ${role}`,
    role,
  });

  return user;
}

/**
 * Generate JWT token for a user
 */
export function generateAuthToken(userId: string, role: Role): string {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, role }, secret, { expiresIn: '1h' });
}

/**
 * Create authenticated user and return user + token
 */
export async function createAuthenticatedUser(role: Role = Role.salesAgent) {
  const user = await createTestUser(role);
  const token = generateAuthToken(user._id.toString(), user.role);
  
  return {
    user,
    token,
    authHeader: `Bearer ${token}`,
  };
}

/**
 * Create test lead data
 */
export function createTestLeadData(overrides: any = {}) {
  return {
    identity: {
      firstName: 'Test',
      lastName: 'Lead',
      phone: '+1234567890',
      email: 'test@example.com',
      ...overrides.identity,
    },
    profile: {
      ageGroup: '25-35',
      professions: ['Software Engineer'],
      householdSize: '3-4 members',
      annualIncomeRange: '₹15-25 LPA',
      ...overrides.profile,
    },
    status: overrides.status || LeadStatus.New,
    ...overrides,
  };
}

/**
 * Create test property data
 */
export function createTestPropertyData(overrides: any = {}) {
  return {
    basic_info: {
      property_name: 'Test Property',
      property_type: 'Villa',
      status: 'Available',
      ...overrides.basic_info,
    },
    location: {
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postal_code: '12345',
      },
      ...overrides.location,
    },
    pricing: {
      base_price: 5000000,
      currency: 'INR',
      ...overrides.pricing,
    },
    ...overrides,
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * Clean up all test data
 */
export async function cleanupTestData() {
  const collections = ['users', 'leads', 'properties', 'notifications'];
  
  for (const collection of collections) {
    try {
      await User.db.collection(collection).deleteMany({});
    } catch (error) {
      // Collection might not exist, ignore
    }
  }
}
