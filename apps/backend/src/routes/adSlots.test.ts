import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, sponsorUser, publisherUser } from './__test-utils.js';

// Mock Prisma
const mockAdSlotFindMany = vi.fn();
const mockAdSlotFindFirst = vi.fn();
const mockAdSlotFindUnique = vi.fn();
const mockAdSlotCreate = vi.fn();
const mockAdSlotUpdate = vi.fn();
const mockAdSlotDelete = vi.fn();

vi.mock('../db.js', () => ({
  prisma: {
    adSlot: {
      findMany: (...args: unknown[]) => mockAdSlotFindMany(...args),
      findFirst: (...args: unknown[]) => mockAdSlotFindFirst(...args),
      findUnique: (...args: unknown[]) => mockAdSlotFindUnique(...args),
      create: (...args: unknown[]) => mockAdSlotCreate(...args),
      update: (...args: unknown[]) => mockAdSlotUpdate(...args),
      delete: (...args: unknown[]) => mockAdSlotDelete(...args),
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

function noAuthApp() {
  return createTestApp('/api/ad-slots', adSlotsRouter);
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

  it('returns all available ad slots for unauthenticated requests (marketplace)', async () => {
    mockAdSlotFindMany.mockResolvedValue([sampleSlot]);

    const res = await request(noAuthApp()).get('/api/ad-slots');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockAdSlotFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isAvailable: true }),
      }),
    );
  });

  it('returns all available ad slots for sponsor user (marketplace)', async () => {
    mockAdSlotFindMany.mockResolvedValue([sampleSlot]);

    const res = await request(sponsorApp()).get('/api/ad-slots');

    expect(res.status).toBe(200);
    expect(mockAdSlotFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isAvailable: true }),
      }),
    );
  });

  it('returns ad slots scoped to publisher when publisherId param matches', async () => {
    mockAdSlotFindMany.mockResolvedValue([sampleSlot]);

    const res = await request(publisherApp()).get('/api/ad-slots?publisherId=publisher-1');

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

  it('returns ad slot for unauthenticated request (marketplace detail)', async () => {
    mockAdSlotFindUnique.mockResolvedValue(sampleSlot);

    const res = await request(noAuthApp()).get('/api/ad-slots/slot-1');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Header Banner');
    expect(mockAdSlotFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'slot-1' },
      }),
    );
  });

  it('returns ad slot for any authenticated user', async () => {
    mockAdSlotFindUnique.mockResolvedValue(sampleSlot);

    const res = await request(sponsorApp()).get('/api/ad-slots/slot-1');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Header Banner');
  });

  it('returns 404 when ad slot does not exist', async () => {
    mockAdSlotFindUnique.mockResolvedValue(null);

    const res = await request(publisherApp()).get('/api/ad-slots/other-slot');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ad slot not found');
  });
});

describe('POST /api/ad-slots', () => {
  beforeEach(() => vi.clearAllMocks());

  const validBody = { name: 'New Slot', type: 'DISPLAY', basePrice: 300 };

  it('returns 401 for unauthenticated user', async () => {
    const res = await request(noAuthApp()).post('/api/ad-slots').send(validBody);
    expect(res.status).toBe(401);
  });

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

  it('returns 400 when invalid type is provided', async () => {
    const res = await request(publisherApp())
      .post('/api/ad-slots')
      .send({ name: 'Test Slot', type: 'INVALID_TYPE', basePrice: 300 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid type');
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

describe('PUT /api/ad-slots/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for sponsor user', async () => {
    const res = await request(sponsorApp())
      .put('/api/ad-slots/slot-1')
      .send({ name: 'Updated' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only publishers can update ad slots');
  });

  it('returns 404 when ad slot does not exist or belongs to another publisher', async () => {
    mockAdSlotFindFirst.mockResolvedValue(null);

    const res = await request(publisherApp())
      .put('/api/ad-slots/other-slot')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ad slot not found');
  });

  it('returns 400 when no valid fields are provided', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);

    const res = await request(publisherApp())
      .put('/api/ad-slots/slot-1')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No valid fields provided for update');
  });

  it('returns 400 when invalid type is provided', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);

    const res = await request(publisherApp())
      .put('/api/ad-slots/slot-1')
      .send({ type: 'INVALID_TYPE' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid type');
  });

  it('updates ad slot successfully with valid fields', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    const updatedSlot = { ...sampleSlot, name: 'Updated Banner', basePrice: 750 };
    mockAdSlotUpdate.mockResolvedValue(updatedSlot);

    const res = await request(publisherApp())
      .put('/api/ad-slots/slot-1')
      .send({ name: 'Updated Banner', basePrice: 750 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Banner');
    expect(mockAdSlotUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'slot-1' },
        data: expect.objectContaining({ name: 'Updated Banner', basePrice: 750 }),
      }),
    );
  });

  it('updates ad slot type with valid enum value', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    mockAdSlotUpdate.mockResolvedValue({ ...sampleSlot, type: 'VIDEO' });

    const res = await request(publisherApp())
      .put('/api/ad-slots/slot-1')
      .send({ type: 'VIDEO' });

    expect(res.status).toBe(200);
    expect(mockAdSlotUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'VIDEO' }),
      }),
    );
  });

  it('verifies ownership via findFirst with publisherId', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    mockAdSlotUpdate.mockResolvedValue(sampleSlot);

    await request(publisherApp())
      .put('/api/ad-slots/slot-1')
      .send({ name: 'Test' });

    expect(mockAdSlotFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'slot-1', publisherId: 'publisher-1' },
      }),
    );
  });

  it('returns 500 when prisma throws', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    mockAdSlotUpdate.mockRejectedValue(new Error('DB error'));

    const res = await request(publisherApp())
      .put('/api/ad-slots/slot-1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update ad slot');
  });
});

describe('DELETE /api/ad-slots/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for sponsor user', async () => {
    const res = await request(sponsorApp()).delete('/api/ad-slots/slot-1');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only publishers can delete ad slots');
  });

  it('returns 404 when ad slot does not exist or belongs to another publisher', async () => {
    mockAdSlotFindFirst.mockResolvedValue(null);

    const res = await request(publisherApp()).delete('/api/ad-slots/other-slot');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Ad slot not found');
  });

  it('deletes ad slot successfully and returns 204', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    mockAdSlotDelete.mockResolvedValue(sampleSlot);

    const res = await request(publisherApp()).delete('/api/ad-slots/slot-1');

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(mockAdSlotDelete).toHaveBeenCalledWith({ where: { id: 'slot-1' } });
  });

  it('verifies ownership via findFirst with publisherId before deleting', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    mockAdSlotDelete.mockResolvedValue(sampleSlot);

    await request(publisherApp()).delete('/api/ad-slots/slot-1');

    expect(mockAdSlotFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'slot-1', publisherId: 'publisher-1' },
      }),
    );
  });

  it('returns 500 when prisma throws', async () => {
    mockAdSlotFindFirst.mockResolvedValue(sampleSlot);
    mockAdSlotDelete.mockRejectedValue(new Error('DB error'));

    const res = await request(publisherApp()).delete('/api/ad-slots/slot-1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to delete ad slot');
  });
});
