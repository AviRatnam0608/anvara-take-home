import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createTestApp, sponsorUser } from './__test-utils.js';

const { default: quotesRouter } = await import('./quotes.js');

function appWithAuth() {
  return createTestApp('/api/quotes', quotesRouter, sponsorUser);
}

function appNoAuth() {
  return createTestApp('/api/quotes', quotesRouter);
}

describe('POST /api/quotes/request', () => {
  beforeEach(() => {
    // no-op; reserved for consistency
  });

  it('accepts valid quote payload for authenticated users', async () => {
    const res = await request(appWithAuth()).post('/api/quotes/request').send({
      companyName: 'Acme Inc',
      workEmail: 'growth@acme.com',
      adSlotId: 'slot-1',
      specialRequirements: 'Need a custom package with flighting and category exclusivity.',
      legalEntityName: 'Acme Incorporated',
      companyWebsite: 'https://acme.com',
      complianceAcknowledgement: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.quoteId).toMatch(/^qt_/);
    expect(res.body.verificationLevel).toBe('high');
  });

  it('accepts valid quote payload for unauthenticated users (lead capture)', async () => {
    const res = await request(appNoAuth()).post('/api/quotes/request').send({
      companyName: 'Acme Inc',
      workEmail: 'team@acme.com',
      adSlotId: 'slot-1',
      specialRequirements: 'We need premium placement for a mid-quarter brand awareness push.',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(appNoAuth()).post('/api/quotes/request').send({
      companyName: 'Acme Inc',
      workEmail: 'not-an-email',
      adSlotId: 'slot-1',
      specialRequirements: 'Need custom package with category exclusivity and reporting.',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(appNoAuth()).post('/api/quotes/request').send({
      companyName: 'Acme Inc',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('required');
  });

  it('returns 400 when requirements text is too short', async () => {
    const res = await request(appNoAuth()).post('/api/quotes/request').send({
      companyName: 'Acme Inc',
      workEmail: 'growth@acme.com',
      adSlotId: 'slot-1',
      specialRequirements: 'Need deal',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('at least 20 characters');
  });
});
