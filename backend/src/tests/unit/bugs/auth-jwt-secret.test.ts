import express from 'express';
import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { authenticateToken, JWT_SECRET } from '../../../middleware/auth.js';

function makeApp() {
  const app = express();
  app.get('/protected', authenticateToken, (_req, res) => {
    res.status(200).json({ ok: true });
  });
  return app;
}

describe('bugs: auth jwt secret', () => {
  test('does not rely on known insecure JWT fallback secret', () => {
    expect(JWT_SECRET).not.toBe('your-secret-key-change-in-production');
  });
});
