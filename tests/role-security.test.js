const request = require('supertest');
const app = require('../src/app');

describe('Role Security Tests', () => {
  let adminToken, agentToken;
  let testClient, testInvoice;

  const createUserAndGetToken = async (role) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: `${role} Security`,
        email: `${role}.security.${Date.now()}@test.com`,
        password: 'password123',
        role
      });
    return res.body.data.token;
  };

  beforeEach(async () => {
    adminToken = await createUserAndGetToken('admin');
    agentToken = await createUserAndGetToken('agent');

    // Créer un client
    const clientRes = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Client Security Test',
        email: `client.security.${Date.now()}@test.com`,
        phone: '123456789',
        company: 'Security Company'
      });
    testClient = clientRes.body.data;

    // Créer une facture
    const invoiceRes = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        invoiceNumber: `INV-SECURITY-${Date.now()}`,
        client: testClient._id,
        amount: 1000,
        currency: 'TND',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
        description: 'Facture pour test sécurité'
      });
    testInvoice = invoiceRes.body.data;
  });

  describe('Agent Role Restrictions', () => {
    it('should reject agent trying to delete a client (403)', async () => {
      const res = await request(app)
        .delete(`/api/clients/${testClient._id}`)
        .set('Authorization', `Bearer ${agentToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject agent trying to delete an invoice (403)', async () => {
      const res = await request(app)
        .delete(`/api/invoices/${testInvoice._id}`)
        .set('Authorization', `Bearer ${agentToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject agent trying to access stats overview (403)', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Authorization', `Bearer ${agentToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow agent to read clients (200)', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${agentToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
