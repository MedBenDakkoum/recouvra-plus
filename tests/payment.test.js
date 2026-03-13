const request = require('supertest');
const app = require('../src/app');

let token;
let clientId;
let invoiceId;
const INVOICE_AMOUNT = 1500;

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
      amount: INVOICE_AMOUNT,
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

  const getFullPaymentData = (invoiceId) => ({
    invoice: invoiceId,
    amount: INVOICE_AMOUNT,
    paymentMethod: 'virement',
  });

  it('should create a payment with full amount', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getFullPaymentData(invoiceId));
    expect(res.statusCode).toBe(201);
    expect(res.body.data.amount).toBe(INVOICE_AMOUNT);

    // Verify status is now paid
    const inv = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(inv.body.data.status).toBe('paid');
  });

  it('should reject partial payments', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ invoice: invoiceId, amount: 500, paymentMethod: 'virement' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain(INVOICE_AMOUNT.toString());
  });

  it('should reject payment for already paid invoice', async () => {
    // Pay it first
    await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getFullPaymentData(invoiceId));

    // Try paying again
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getFullPaymentData(invoiceId));
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Cette facture est déjà payée');
  });

  it('should list payments', async () => {
    await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(getFullPaymentData(invoiceId));
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
      .send(getFullPaymentData(invoiceId));
    const res = await request(app)
      .get(`/api/payments/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.amount).toBe(INVOICE_AMOUNT);
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/payments');
    expect(res.statusCode).toBe(401);
  });
});