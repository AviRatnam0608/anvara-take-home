import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, sponsorUser, publisherUser } from './__test-utils.js';

// Mock Prisma
const mockAdSlotFindMany = vi.fn();
const mockAdSlotFindFirst = vi.fn();
const mockAdSlotFindUnique = vi.fn();
const mockAdSlotCreate = vi.fn();
const mockAdSlotUpdate = vi.fn();

vi.mock('../db.js', () => ({
  prisma: {
    adSlot: {
      findMany: (...args: unknown[]) => mockAdSlotFindMany(...args),
      findFirst: (...args: unknown[]) => mockAdSlotFindFirst(...args),
      findUnique: (...args: unknown[]) => mockAdSlotFindUnique(...args),
      create: (...args: unknown[]) => mockAdSlotCreate(...args),
      update: (...args: unknown[]) => mockAdSlotUpdate(...args),
    },
  },
}));

const { default: adSlotsRouter } = await import('./adSlots.js');

function publisherApp() {
  return createTestApp('/api/ad-slots', adSlotsRouter, publisherUser);
}

function sponsorApp() {
  return createTestApp('/api/ad-slots', adSlotsRouter, sponsorUser);
}

const sampleSlot = {
  id: 'slot-1',
  name: 'Header Banner',
  description: 'Top of page banner',
  type: 'DISPLAY',
  basePrice: 500,
  isAvailable: true,
  publisherId: 'publisher-1',
  publisher: { id: 'publisher-1', name: 'Test Publisher', category: 'Technology', monthlyViews: 100000 },
  _count: { placements: 0 },
};

describe('GET /api/ad-slots', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for sponsor user', async () => {
    const res = await request(sponsorApp()).get('/api/ad-slots');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only publishers can access ad slots');
  });

  it('returns ad slots scoped to publisher', async () => {
    mockAdSlotFindMany.mockResolvedValue([sampleSlot]);

    const res = await request(publisherApp()).get('/api/ad-slots');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Header Banner');
    expect(mockAdSlotFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ publisherId: 'publisher-1' }),
      }),
    );
  });

  it('returns 500 when prisma throws', async () => {
    mockAdSlotFindMany.mockRejectedValue(new Error('DB error'));

    const res = await request(publisherApp()).get('/api/ad-slots');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/ad-slots/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for sponsor user', async () => {
    const res = await request(sponsorApp()).get('/api/ad-slots/slot-1');
    expect(res.status).toBe(403);
  });

  it('returns ad slot when it belongs to the authenticated publisher', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);

    const res = await request(publisherApp()).get('/api/ad-slots/slot-1');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Header Banner');
    expect(mockAdSlotFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'slot-1', publisherId: 'publisher-1' },
      }),
    );
  });

  it('returns 404 when ad slot does not exist or belongs to another publisher', async () => {
    mockAdSlotFindFirst.mockResolvedValue(null);

    const res = await request(publisherApp()).get('/api/ad-slots/other-slot');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ad slot not found');
  });
});

describe('POST /api/ad-slots', () => {
  beforeEach(() => vi.clearAllMocks());

  const validBody = { name: 'New Slot', type: 'DISPLAY', basePrice: 300 };

  it('returns 403 for sponsor user', async () => {
    const res = await request(sponsorApp()).post('/api/ad-slots').send(validBody);
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(publisherApp())
      .post('/api/ad-slots')
      .send({ name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  it('creates ad slot with the authenticated publishers publisherId', async () => {
    mockAdSlotCreate.mockResolvedValue({ ...sampleSlot, ...validBody });

    const res = await request(publisherApp()).post('/api/ad-slots').send(validBody);

    expect(res.status).toBe(201);
    expect(mockAdSlotCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ publisherId: 'publisher-1' }),
      }),
    );
  });

  it('returns 500 when prisma throws', async () => {
    mockAdSlotCreate.mockRejectedValue(new Error('DB error'));

    const res = await request(publisherApp()).post('/api/ad-slots').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/ad-slots/:id/book', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for publisher user', async () => {
    const res = await request(publisherApp()).post('/api/ad-slots/slot-1/book').send({});
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only sponsors can book ad slots');
  });

  it('returns 404 when ad slot does not exist', async () => {
    mockAdSlotFindUnique.mockResolvedValue(null);

    const res = await request(sponsorApp()).post('/api/ad-slots/nonexistent/book').send({});
    expect(res.status).toBe(404);
  });

  it('returns 400 when ad slot is not available', async () => {
    mockAdSlotFindUnique.mockResolvedValue({ ...sampleSlot, isAvailable: false });

    const res = await request(sponsorApp()).post('/api/ad-slots/slot-1/book').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Ad slot is no longer available');
  });

  it('books the ad slot successfully for sponsor', async () => {
    mockAdSlotFindUnique.mockResolvedValue(sampleSlot);
    mockAdSlotUpdate.mockResolvedValue({ ...sampleSlot, isAvailable: false });

    const res = await request(sponsorApp())
      .post('/api/ad-slots/slot-1/book')
      .send({ message: 'Interested!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockAdSlotUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isAvailable: false },
      }),
    );
  });
});

describe('POST /api/ad-slots/:id/unbook', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for sponsor user', async () => {
    const res = await request(sponsorApp()).post('/api/ad-slots/slot-1/unbook');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only publishers can unbook their ad slots');
  });

  it('returns 404 when ad slot does not exist or is not owned', async () => {
    mockAdSlotFindFirst.mockResolvedValue(null);

    const res = await request(publisherApp()).post('/api/ad-slots/slot-1/unbook');
    expect(res.status).toBe(404);
  });

  it('unbooks the ad slot successfully for publisher', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    mockAdSlotUpdate.mockResolvedValue({ ...sampleSlot, isAvailable: true });

    const res = await request(publisherApp()).post('/api/ad-slots/slot-1/unbook');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockAdSlotUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isAvailable: true },
      }),
    );
  });
});
