const request = require('supertest');
const app = require('../src/app');

describe('Validation Error Tests', () => {
  let token, clientId;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Admin Validation',
      email: `admin.validation.${Date.now()}@test.com`,
      password: 'password123',
      role: 'admin'
    });
    token = res.body.data.token;

    const clientRes = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Client Validation Test',
        email: `client.validation.${Date.now()}@test.com`,
        phone: '123456789',
        company: 'Validation Company'
      });
    clientId = clientRes.body.data._id;
  });

  describe('Invoice Validation Errors', () => {
    it('should reject invoice without dueDate (400)', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          invoiceNumber: 'INV-NO-DUEDATE',
          client: clientId,
          amount: 1000,
          currency: 'TND',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('dueDate')])
      );
    });

    it('should reject invoice with invalid amount (400)', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          invoiceNumber: 'INV-INVALID-AMOUNT',
          client: clientId,
          amount: -100,
          currency: 'TND',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Payment Validation Errors', () => {
    it('should reject payment without paymentMethod (400)', async () => {
      const invoiceRes = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          invoiceNumber: `INV-PAYMENT-${Date.now()}`,
          client: clientId,
          amount: 1000,
          currency: 'TND',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending'
        });

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          invoice: invoiceRes.body.data._id,
          amount: 200,
          paymentDate: new Date()
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('paymentMethod')])
      );
    });
  });
});
