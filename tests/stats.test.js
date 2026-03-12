const request = require('supertest');
const app = require('../src/app');

describe('Stats Routes', () => {
  let adminToken, agentToken;

  const createUserAndGetToken = async (role) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: `${role} Stats`,
        email: `${role}.stats.${Date.now()}@test.com`,
        password: 'password123',
        role
      });
    return res.body.data.token;
  };

  beforeEach(async () => {
    adminToken = await createUserAndGetToken('admin');
    agentToken = await createUserAndGetToken('agent');
  });

  describe('GET /api/stats/overview', () => {
    it('should return overview stats for admin', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('clients');
      expect(res.body.data).toHaveProperty('invoices');
      expect(res.body.data).toHaveProperty('actions');
    });

    it('should reject access for agent (403)', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Authorization', `Bearer ${agentToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Accès refusé');
    });
  });

  describe('GET /api/stats/clients/:id', () => {
    let testClientId;

    beforeEach(async () => {
      const clientRes = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Client Stats Test',
          email: `client.stats.${Date.now()}@test.com`,
          phone: '123456789',
          company: 'Stats Company'
        });
      testClientId = clientRes.body.data._id;
    });

    it('should return client stats for admin', async () => {
      const res = await request(app)
        .get(`/api/stats/clients/${testClientId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('client');
      expect(res.body.data).toHaveProperty('invoices');
    });

    it('should reject access for agent (403)', async () => {
      const res = await request(app)
        .get(`/api/stats/clients/${testClientId}`)
        .set('Authorization', `Bearer ${agentToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
