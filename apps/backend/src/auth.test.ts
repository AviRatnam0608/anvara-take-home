import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

// Mock Better Auth
const mockGetSession = vi.fn();
vi.mock('./lib/auth.js', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

// Mock Prisma
const mockSponsorFindUnique = vi.fn();
const mockPublisherFindUnique = vi.fn();
vi.mock('./db.js', () => ({
  prisma: {
    sponsor: { findUnique: (...args: unknown[]) => mockSponsorFindUnique(...args) },
    publisher: { findUnique: (...args: unknown[]) => mockPublisherFindUnique(...args) },
  },
}));

// Import after mocks are set up
const { authMiddleware, roleMiddleware } = await import('./auth.js');

function mockReq(headers: Record<string, string> = {}): AuthRequest {
  return { headers } as unknown as AuthRequest;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when getSession returns null', async () => {
    mockGetSession.mockResolvedValue(null);
    const req = mockReq({ cookie: 'some-cookie' });
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when session has no user', async () => {
    mockGetSession.mockResolvedValue({ session: {}, user: null });
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user has no sponsor or publisher record', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'nobody@test.com' },
    });
    mockSponsorFindUnique.mockResolvedValue(null);
    mockPublisherFindUnique.mockResolvedValue(null);

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'No role assigned to this account' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches sponsor user and calls next()', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'sponsor@test.com' },
    });
    mockSponsorFindUnique.mockResolvedValue({ id: 'sponsor-1' });

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next as NextFunction);

    expect(req.user).toEqual({
      id: 'user-1',
      email: 'sponsor@test.com',
      role: 'SPONSOR',
      sponsorId: 'sponsor-1',
    });
    expect(next).toHaveBeenCalled();
  });

  it('attaches publisher user and calls next()', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-2', email: 'publisher@test.com' },
    });
    mockSponsorFindUnique.mockResolvedValue(null);
    mockPublisherFindUnique.mockResolvedValue({ id: 'publisher-1' });

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next as NextFunction);

    expect(req.user).toEqual({
      id: 'user-2',
      email: 'publisher@test.com',
      role: 'PUBLISHER',
      publisherId: 'publisher-1',
    });
    expect(next).toHaveBeenCalled();
  });

  it('returns 500 when getSession throws', async () => {
    mockGetSession.mockRejectedValue(new Error('DB connection failed'));

    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('roleMiddleware', () => {
  it('calls next() when user role is in allowed roles', () => {
    const middleware = roleMiddleware(['SPONSOR']);
    const req = { user: { role: 'SPONSOR' } } as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next as NextFunction);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when user role is not in allowed roles', () => {
    const middleware = roleMiddleware(['SPONSOR']);
    const req = { user: { role: 'PUBLISHER' } } as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when req.user is undefined', () => {
    const middleware = roleMiddleware(['SPONSOR']);
    const req = {} as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('works with multiple allowed roles', () => {
    const middleware = roleMiddleware(['SPONSOR', 'PUBLISHER']);
    const req = { user: { role: 'PUBLISHER' } } as unknown as AuthRequest;
    const res = mockRes();
    const next = vi.fn();

    middleware(req, res, next as NextFunction);

    expect(next).toHaveBeenCalled();
  });
});
