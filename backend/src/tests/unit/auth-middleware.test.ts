import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, expect, test } from 'vitest';
import { authenticateToken } from '../../middleware/auth.js';

function makeApp() {
  const app = express();
  app.get('/protected', authenticateToken, (_req, res) => {
    res.status(200).json({ ok: true });
  });
  return app;
}

describe('auth middleware', () => {
  function requiredJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET must be defined for auth tests');
    }
    return secret;
  }

  test('returns 401 when Authorization header is missing', async () => {
    const app = makeApp();
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Authentication required' });
  });

  test('returns 403 when Authorization is not Bearer format', async () => {
    const app = makeApp();
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Token abc123');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid or expired token' });
  });

  test('returns 401 when Bearer token is empty', async () => {
    const app = makeApp();
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer ');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Authentication required' });
  });

  test('returns 403 when token is invalid', async () => {
    const app = makeApp();
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer not-a-real-jwt');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid or expired token' });
  });

  test('returns 403 when token is expired', async () => {
    const app = makeApp();
    const expiredToken = jwt.sign({ userId: 1, email: 'expired@example.com' }, requiredJwtSecret(), {
      expiresIn: -60,
    });
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid or expired token' });
  });
});
