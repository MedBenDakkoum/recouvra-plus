const request = require('supertest');
const app = require('../src/app');

let token;
let clientId;

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

describe('Invoice Routes', () => {
  beforeEach(async () => {
    token = await registerAndLogin();
    clientId = await createClient(token);
  });

  const getInvoiceData = (clientId) => ({
    invoiceNumber: `INV-${Date.now()}`,
    client: clientId,
    amount: 1500,
    currency: 'TND',
    dueDate: '2026-12-31',
    status: 'pending',
    description: 'Facture test',
  });

  it('should create an invoice', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(getInvoiceData(clientId));
    expect(res.statusCode).toBe(201);
    expect(res.body.data.amount).toBe(1500);
  });

  it('should list invoices', async () => {
    await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(getInvoiceData(clientId));
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get an invoice by id', async () => {
    const created = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(getInvoiceData(clientId));
    const res = await request(app)
      .get(`/api/invoices/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.amount).toBe(1500);
  });

  it('should update an invoice', async () => {
    const created = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(getInvoiceData(clientId));
    const res = await request(app)
      .put(`/api/invoices/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...getInvoiceData(clientId), amount: 2000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.amount).toBe(2000);
  });

  it('should delete an invoice', async () => {
    const created = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(getInvoiceData(clientId));
    const res = await request(app)
      .delete(`/api/invoices/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/invoices');
    expect(res.statusCode).toBe(401);
  });
});