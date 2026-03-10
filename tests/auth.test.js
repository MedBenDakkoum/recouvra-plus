const request = require('supertest');
const app = require('../src/app');

describe('Auth Routes', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'agent',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app).post('/api/auth/register').send(userData);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send(userData);
      const res = await request(app).post('/api/auth/register').send(userData);
      expect(res.statusCode).toBe(409);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, email: 'not-an-email' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, password: '123' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(userData);
    });

    it('should login and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'wrongpass' });
      expect(res.statusCode).toBe(401);
    });

    it('should reject unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile when authenticated', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(userData);
      const token = registerRes.body.data.token;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(userData.email);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });
});
