const request = require('supertest');
const app = require('../src/app');

describe('Users Routes', () => {
  let adminToken, agentToken;

  const createUserAndGetToken = async (role) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: `${role} User`,
        email: `${role}.${Date.now()}@test.com`,
        password: 'password123',
        role
      });
    return res.body.data.token;
  };

  beforeEach(async () => {
    adminToken = await createUserAndGetToken('admin');
    agentToken = await createUserAndGetToken('agent');
  });

  describe('GET /api/users', () => {
    it('should return users list for admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject access for agent (403)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${agentToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    let testUserId;

    beforeEach(async () => {
      const testUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: `test.${Date.now()}@test.com`,
          password: 'password123',
          role: 'agent'
        });
      testUserId = testUserRes.body.data.user._id;
    });

    it('should update user for admin', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should reject access for agent (403)', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ name: 'Updated Name' });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
