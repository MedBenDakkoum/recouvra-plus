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

describe('Action Routes', () => {
  beforeEach(async () => {
    token = await registerAndLogin();
    clientId = await createClient(token);
    invoiceId = await createInvoice(token, clientId);
  });

  const getActionData = (clientId, invoiceId) => ({
    client: clientId,
    invoice: invoiceId,
    type: 'appel',
    result: 'Client contacté',
    comment: 'Le client a promis de payer',
  });

  it('should create an action', async () => {
    const res = await request(app)
      .post('/api/actions')
      .set('Authorization', `Bearer ${token}`)
      .send(getActionData(clientId, invoiceId));
    expect(res.statusCode).toBe(201);
    expect(res.body.data.type).toBe('appel');
  });

  it('should list actions', async () => {
    await request(app)
      .post('/api/actions')
      .set('Authorization', `Bearer ${token}`)
      .send(getActionData(clientId, invoiceId));
    const res = await request(app)
      .get('/api/actions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get an action by id', async () => {
    const created = await request(app)
      .post('/api/actions')
      .set('Authorization', `Bearer ${token}`)
      .send(getActionData(clientId, invoiceId));
    const res = await request(app)
      .get(`/api/actions/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.type).toBe('appel');
  });

  it('should filter actions by client', async () => {
    await request(app)
      .post('/api/actions')
      .set('Authorization', `Bearer ${token}`)
      .send(getActionData(clientId, invoiceId));
    const res = await request(app)
      .get(`/api/actions?client=${clientId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/actions');
    expect(res.statusCode).toBe(401);
  });
});