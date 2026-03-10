const request = require('supertest');
const app = require('../src/app');

let token;

const registerAndLogin = async (role = 'admin') => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: `admin_${Date.now()}@test.com`,
    password: 'password123',
    role,
  });
  return res.body.data.token;
};

describe('Client Routes', () => {
  beforeEach(async () => {
    token = await registerAndLogin();
  });

  const clientData = {
    name: 'Acme Corp',
    email: 'acme@example.com',
    phone: '0123456789',
    company: 'Acme',
  };

  it('should create a client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe(clientData.name);
  });

  it('should list clients', async () => {
    await request(app).post('/api/clients').set('Authorization', `Bearer ${token}`).send(clientData);
    const res = await request(app).get('/api/clients').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a client by id', async () => {
    const created = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);
    const res = await request(app)
      .get(`/api/clients/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(clientData.email);
  });

  it('should update a client', async () => {
    const created = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);
    const res = await request(app)
      .put(`/api/clients/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...clientData, name: 'Updated Corp' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Updated Corp');
  });

  it('should delete (deactivate) a client', async () => {
    const created = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);
    const res = await request(app)
      .delete(`/api/clients/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/clients');
    expect(res.statusCode).toBe(401);
  });
});
