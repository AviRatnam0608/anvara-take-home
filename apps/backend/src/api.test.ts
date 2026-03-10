import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock Prisma before importing app
const mockQueryRaw = vi.fn();
vi.mock('./db.js', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
    sponsor: { findUnique: vi.fn() },
    publisher: { findUnique: vi.fn() },
  },
}));

// Mock Better Auth (imported by auth middleware via routes)
vi.mock('./lib/auth.js', () => ({
  auth: {
    api: { getSession: vi.fn().mockResolvedValue(null) },
  },
}));

const { default: app } = await import('./index.js');

describe('GET /api/health', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with status "ok" when database is connected', async () => {
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns 503 when database is disconnected', async () => {
    mockQueryRaw.mockRejectedValue(new Error('Connection refused'));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('error');
    expect(res.body.database).toBe('disconnected');
  });
});

describe('Rate Limiting', () => {
  it('includes rate-limit headers in responses', async () => {
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(app).get('/api/health');

    // express-rate-limit with standardHeaders: 'draft-8' uses RateLimit header
    const rateLimitHeader =
      res.headers['ratelimit-limit'] ||
      res.headers['ratelimit'] ||
      res.headers['x-ratelimit-limit'];

    expect(rateLimitHeader).toBeDefined();
  });
});

describe('Protected routes without auth', () => {
  it('returns 401 for unauthenticated campaigns request', async () => {
    const res = await request(app).get('/api/campaigns');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Not authenticated');
  });

  it('returns 401 for unauthenticated ad-slots mutation', async () => {
    const res = await request(app).post('/api/ad-slots').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unauthenticated dashboard request', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(401);
  });
});
