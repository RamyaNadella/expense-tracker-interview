import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateToken } from '../../middleware/auth.js';

vi.mock('../../services/importService.js', () => ({
  getActiveSession: vi.fn().mockResolvedValue(null),
  createSession: vi.fn().mockResolvedValue({ id: 1, userId: 1, status: 'upload' }),
  cancelSession: vi.fn().mockResolvedValue(true),
  uploadCsv: vi.fn().mockResolvedValue({ session: { id: 1 }, structure: { headers: [], rowCount: 0 } }),
  saveMapping: vi.fn().mockResolvedValue({ session: { id: 1 }, parsedRows: [], validCount: 0, invalidCount: 0 }),
  updateRow: vi.fn().mockResolvedValue({ rowIndex: 0 }),
  skipRow: vi.fn().mockResolvedValue({ rowIndex: 0, skipped: true }),
  confirmImport: vi.fn().mockResolvedValue({ importedCount: 0, skippedCount: 0, history: {} }),
  listImportHistory: vi.fn().mockResolvedValue([]),
}));

const { default: importRouter } = await import('../../routes/import.js');
const importService = await import('../../services/importService.js');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/import', importRouter);
  return app;
}

function authHeader() {
  const token = generateToken({ userId: 777777, email: 'unit-import@example.com' });
  return { Authorization: `Bearer ${token}` };
}

describe('import route validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('POST /api/import/upload rejects when fileName is missing', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/import/upload')
      .set(authHeader())
      .send({ csvContent: 'a,b\n1,2' });
    expect(response.status).toBe(400);
    expect(importService.uploadCsv).not.toHaveBeenCalled();
  });

  test('POST /api/import/upload rejects when csvContent is missing', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/import/upload')
      .set(authHeader())
      .send({ fileName: 'file.csv' });
    expect(response.status).toBe(400);
    expect(importService.uploadCsv).not.toHaveBeenCalled();
  });

  test('POST /api/import/session/:id/mapping rejects when required mapping keys are missing', async () => {
    const app = makeApp();
    const response = await request(app)
      .post('/api/import/session/1/mapping')
      .set(authHeader())
      .send({ columnMapping: { date: 'Date' } });
    expect(response.status).toBe(400);
    expect(importService.saveMapping).not.toHaveBeenCalled();
  });
});
