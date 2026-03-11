const request = require('supertest');
const app = require('../src/app');

let token;
let clientId;
let invoiceId;

const registerAndLogin = async (role = 'admin') => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: `admin_${Date.now()}@test.com`,
    password: 'password123',
    role,
  });
  return res.body.data.token;
};

const createClient = async (token) => {
  const res = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Acme Corp',
      email: `acme_${Date.now()}@example.com`,
      phone: '0123456789',
      company: 'Acme',
    });
  return res.body.data._id;
};

const createInvoice = async (token, clientId) => {
  const res = await request(app)
    .post('/api/invoices')
    .set('Authorization', `Bearer ${token}`)
    .send({
      invoiceNumber: `INV-${Date.now()}`,
      client: clientId,
      amount: 1500,
      currency: 'TND',
      dueDate: '2026-12-31',
      status: 'pending',
      description: 'Facture test',
    });
  return res.body.data._id;
};

describe('Payment Routes', () => {
  beforeEach(async () => {
    token = await registerAndLogin();
    clientId = await createClient(token);
    invoiceId = await createInvoice(token, clientId);
  });

  const getPaymentData = (invoiceId) => ({
    invoice: invoiceId,
    amount: 500,
    paymentMethod: 'virement',
  });

  it('should create a payment', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getPaymentData(invoiceId));
    expect(res.statusCode).toBe(201);
    expect(res.body.data.amount).toBe(500);
  });

  it('should update invoice status to partial after payment', async () => {
    await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getPaymentData(invoiceId));
    const res = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.data.status).toBe('partial');
  });

  it('should update invoice status to paid when full amount paid', async () => {
    await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ invoice: invoiceId, amount: 1500, paymentMethod: 'virement' });
    const res = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.data.status).toBe('paid');
  });

  it('should list payments', async () => {
    await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getPaymentData(invoiceId));
    const res = await request(app)
      .get('/api/payments')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a payment by id', async () => {
    const created = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getPaymentData(invoiceId));
    const res = await request(app)
      .get(`/api/payments/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.amount).toBe(500);
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/payments');
    expect(res.statusCode).toBe(401);
  });
});