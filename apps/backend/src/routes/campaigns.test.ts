import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, sponsorUser, publisherUser } from './__test-utils.js';

// Mock Prisma
const mockCampaignFindMany = vi.fn();
const mockCampaignFindFirst = vi.fn();
const mockCampaignCreate = vi.fn();
const mockCampaignUpdate = vi.fn();
const mockCampaignDelete = vi.fn();

vi.mock('../db.js', () => ({
  prisma: {
    campaign: {
      findMany: (...args: unknown[]) => mockCampaignFindMany(...args),
      findFirst: (...args: unknown[]) => mockCampaignFindFirst(...args),
      create: (...args: unknown[]) => mockCampaignCreate(...args),
      update: (...args: unknown[]) => mockCampaignUpdate(...args),
      delete: (...args: unknown[]) => mockCampaignDelete(...args),
    },
  },
}));

const { default: campaignsRouter } = await import('./campaigns.js');

function sponsorApp() {
  return createTestApp('/api/campaigns', campaignsRouter, sponsorUser);
}

function publisherApp() {
  return createTestApp('/api/campaigns', campaignsRouter, publisherUser);
}

const sampleCampaign = {
  id: 'campaign-1',
  name: 'Test Campaign',
  description: 'A test campaign',
  budget: 10000,
  spent: 2500,
  status: 'ACTIVE',
  sponsorId: 'sponsor-1',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-03-31'),
  targetCategories: ['Technology'],
  targetRegions: ['US'],
  sponsor: { id: 'sponsor-1', name: 'Test Sponsor', logo: null },
  _count: { creatives: 0, placements: 0 },
};

describe('GET /api/campaigns', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for publisher user', async () => {
    const res = await request(publisherApp()).get('/api/campaigns');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only sponsors can access campaigns');
  });

  it('returns campaigns scoped to sponsor', async () => {
    mockCampaignFindMany.mockResolvedValue([sampleCampaign]);

    const res = await request(sponsorApp()).get('/api/campaigns');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Campaign');
    // Verify Prisma was called with the sponsor's ID
    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sponsorId: 'sponsor-1' }),
      }),
    );
  });

  it('filters by status query param', async () => {
    mockCampaignFindMany.mockResolvedValue([]);

    await request(sponsorApp()).get('/api/campaigns?status=ACTIVE');

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
  });

  it('returns empty array when no campaigns exist', async () => {
    mockCampaignFindMany.mockResolvedValue([]);

    const res = await request(sponsorApp()).get('/api/campaigns');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 when prisma throws', async () => {
    mockCampaignFindMany.mockRejectedValue(new Error('DB error'));

    const res = await request(sponsorApp()).get('/api/campaigns');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch campaigns');
  });
});

describe('GET /api/campaigns/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for publisher user', async () => {
    const res = await request(publisherApp()).get('/api/campaigns/campaign-1');
    expect(res.status).toBe(403);
  });

  it('returns campaign when it belongs to the authenticated sponsor', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);

    const res = await request(sponsorApp()).get('/api/campaigns/campaign-1');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Campaign');
    expect(mockCampaignFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1', sponsorId: 'sponsor-1' },
      }),
    );
  });

  it('returns 404 when campaign does not exist or belongs to another sponsor', async () => {
    mockCampaignFindFirst.mockResolvedValue(null);

    const res = await request(sponsorApp()).get('/api/campaigns/other-campaign');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Campaign not found');
  });

  it('returns 500 when prisma throws', async () => {
    mockCampaignFindFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(sponsorApp()).get('/api/campaigns/campaign-1');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/campaigns', () => {
  beforeEach(() => vi.clearAllMocks());

  const validBody = {
    name: 'New Campaign',
    budget: 5000,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
  };

  it('returns 403 for publisher user', async () => {
    const res = await request(publisherApp()).post('/api/campaigns').send(validBody);
    expect(res.status).toBe(403);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(sponsorApp())
      .post('/api/campaigns')
      .send({ budget: 5000, startDate: '2026-04-01', endDate: '2026-06-30' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  it('returns 400 when budget is missing', async () => {
    const res = await request(sponsorApp())
      .post('/api/campaigns')
      .send({ name: 'Test', startDate: '2026-04-01', endDate: '2026-06-30' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when dates are missing', async () => {
    const res = await request(sponsorApp())
      .post('/api/campaigns')
      .send({ name: 'Test', budget: 5000 });

    expect(res.status).toBe(400);
  });

  it('creates campaign with the authenticated sponsors sponsorId', async () => {
    const createdCampaign = { ...sampleCampaign, ...validBody };
    mockCampaignCreate.mockResolvedValue(createdCampaign);

    const res = await request(sponsorApp()).post('/api/campaigns').send(validBody);

    expect(res.status).toBe(201);
    // Verify sponsorId comes from req.user, not from body
    expect(mockCampaignCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sponsorId: 'sponsor-1' }),
      }),
    );
  });

  it('returns 500 when prisma throws', async () => {
    mockCampaignCreate.mockRejectedValue(new Error('DB error'));

    const res = await request(sponsorApp()).post('/api/campaigns').send(validBody);

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/campaigns/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for publisher user', async () => {
    const res = await request(publisherApp())
      .put('/api/campaigns/campaign-1')
      .send({ name: 'Updated' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only sponsors can update campaigns');
  });

  it('returns 404 when campaign does not exist or belongs to another sponsor', async () => {
    mockCampaignFindFirst.mockResolvedValue(null);

    const res = await request(sponsorApp())
      .put('/api/campaigns/other-campaign')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Campaign not found');
  });

  it('returns 400 when no valid fields are provided', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);

    const res = await request(sponsorApp())
      .put('/api/campaigns/campaign-1')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No valid fields provided for update');
  });

  it('returns 400 when invalid status is provided', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);

    const res = await request(sponsorApp())
      .put('/api/campaigns/campaign-1')
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid status');
  });

  it('updates campaign successfully with valid fields', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);
    const updatedCampaign = { ...sampleCampaign, name: 'Updated Campaign', budget: 20000 };
    mockCampaignUpdate.mockResolvedValue(updatedCampaign);

    const res = await request(sponsorApp())
      .put('/api/campaigns/campaign-1')
      .send({ name: 'Updated Campaign', budget: 20000 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Campaign');
    expect(mockCampaignUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1' },
        data: expect.objectContaining({ name: 'Updated Campaign', budget: 20000 }),
      }),
    );
  });

  it('updates campaign status with valid enum value', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);
    mockCampaignUpdate.mockResolvedValue({ ...sampleCampaign, status: 'PAUSED' });

    const res = await request(sponsorApp())
      .put('/api/campaigns/campaign-1')
      .send({ status: 'PAUSED' });

    expect(res.status).toBe(200);
    expect(mockCampaignUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAUSED' }),
      }),
    );
  });

  it('verifies ownership via findFirst with sponsorId', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);
    mockCampaignUpdate.mockResolvedValue(sampleCampaign);

    await request(sponsorApp())
      .put('/api/campaigns/campaign-1')
      .send({ name: 'Test' });

    expect(mockCampaignFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1', sponsorId: 'sponsor-1' },
      }),
    );
  });

  it('returns 500 when prisma throws', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);
    mockCampaignUpdate.mockRejectedValue(new Error('DB error'));

    const res = await request(sponsorApp())
      .put('/api/campaigns/campaign-1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update campaign');
  });
});

describe('DELETE /api/campaigns/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for publisher user', async () => {
    const res = await request(publisherApp()).delete('/api/campaigns/campaign-1');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only sponsors can delete campaigns');
  });

  it('returns 404 when campaign does not exist or belongs to another sponsor', async () => {
    mockCampaignFindFirst.mockResolvedValue(null);

    const res = await request(sponsorApp()).delete('/api/campaigns/other-campaign');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Campaign not found');
  });

  it('deletes campaign successfully and returns 204', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);
    mockCampaignDelete.mockResolvedValue(sampleCampaign);

    const res = await request(sponsorApp()).delete('/api/campaigns/campaign-1');

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(mockCampaignDelete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } });
  });

  it('verifies ownership via findFirst with sponsorId before deleting', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);
    mockCampaignDelete.mockResolvedValue(sampleCampaign);

    await request(sponsorApp()).delete('/api/campaigns/campaign-1');

    expect(mockCampaignFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1', sponsorId: 'sponsor-1' },
      }),
    );
  });

  it('returns 500 when prisma throws', async () => {
    mockCampaignFindFirst.mockResolvedValue(sampleCampaign);
    mockCampaignDelete.mockRejectedValue(new Error('DB error'));

    const res = await request(sponsorApp()).delete('/api/campaigns/campaign-1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to delete campaign');
  });
});
