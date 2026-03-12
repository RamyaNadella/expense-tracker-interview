import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../services/authService.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

const { default: authRouter } = await import('../../routes/auth.js');
const authService = await import('../../services/authService.js');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

describe('auth route validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('POST /api/auth/register rejects when email is missing', async () => {
    const app = makeApp();
    const response = await request(app).post('/api/auth/register').send({ password: 'password123' });
    expect(response.status).toBe(400);
    expect(authService.register).not.toHaveBeenCalled();
  });

  test('POST /api/auth/register rejects when password is missing', async () => {
    const app = makeApp();
    const response = await request(app).post('/api/auth/register').send({ email: 'user@example.com' });
    expect(response.status).toBe(400);
    expect(authService.register).not.toHaveBeenCalled();
  });

  test('POST /api/auth/register rejects when email format is invalid', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad-email', password: 'password123' });
    expect(response.status).toBe(400);
    expect(authService.register).not.toHaveBeenCalled();
  });

  test('POST /api/auth/register rejects when password is too short', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: '12345' });
    expect(response.status).toBe(400);
    expect(authService.register).not.toHaveBeenCalled();
  });

  test.todo('POST /api/auth/register rejects when name is missing');

  test('POST /api/auth/login rejects when email is missing', async () => {
    const app = makeApp();
    const response = await request(app).post('/api/auth/login').send({ password: 'password123' });
    expect(response.status).toBe(400);
    expect(authService.login).not.toHaveBeenCalled();
  });

  test('POST /api/auth/login rejects when password is missing', async () => {
    const app = makeApp();
    const response = await request(app).post('/api/auth/login').send({ email: 'user@example.com' });
    expect(response.status).toBe(400);
    expect(authService.login).not.toHaveBeenCalled();
  });

  test.todo('POST /api/auth/register trims or normalizes email before storing');
});
