import { type Response, type IRouter, Router } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import type { AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/campaigns - List authenticated user's campaigns
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SPONSOR' || !req.user!.sponsorId) {
      res.status(403).json({ error: 'Only sponsors can access campaigns' });
      return;
    }

    const { status } = req.query;

    const campaigns = await prisma.campaign.findMany({
      where: {
        // Scope to the authenticated sponsor's campaigns only
        sponsorId: req.user!.sponsorId,
        ...(status && { status: status as string as 'ACTIVE' | 'PAUSED' | 'COMPLETED' }),
      },
      include: {
        sponsor: { select: { id: true, name: true, logo: true } },
        _count: { select: { creatives: true, placements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/campaigns/:id - Get single campaign (must own it)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SPONSOR' || !req.user!.sponsorId) {
      res.status(403).json({ error: 'Only sponsors can access campaigns' });
      return;
    }

    const id = getParam(req.params.id);

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        sponsorId: req.user!.sponsorId,
      },
      include: {
        sponsor: true,
        creatives: true,
        placements: {
          include: {
            adSlot: true,
            publisher: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// POST /api/campaigns - Create new campaign for authenticated sponsor
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SPONSOR' || !req.user!.sponsorId) {
      res.status(403).json({ error: 'Only sponsors can create campaigns' });
      return;
    }

    const { name, description, budget, cpmRate, cpcRate, startDate, endDate, targetCategories, targetRegions } =
      req.body;

    if (!name || !budget || !startDate || !endDate) {
      res.status(400).json({
        error: 'Name, budget, startDate, and endDate are required',
      });
      return;
    }

    // Use the authenticated user's sponsorId — never trust the request body
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        budget,
        cpmRate,
        cpcRate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetCategories: targetCategories || [],
        targetRegions: targetRegions || [],
        sponsorId: req.user!.sponsorId!,
      },
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Valid campaign statuses matching the Prisma CampaignStatus enum
const VALID_CAMPAIGN_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];

// PUT /api/campaigns/:id - Update campaign (SPONSOR only, must own it)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SPONSOR' || !req.user!.sponsorId) {
      res.status(403).json({ error: 'Only sponsors can update campaigns' });
      return;
    }

    const id = getParam(req.params.id);

    // Verify ownership: findFirst with sponsorId filter
    // Returns 404 for both "not found" and "not owned" — doesn't reveal resource existence
    const existing = await prisma.campaign.findFirst({
      where: { id, sponsorId: req.user!.sponsorId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    // Extract only the fields that are allowed to be updated
    const { name, description, budget, cpmRate, cpcRate, startDate, endDate, targetCategories, targetRegions, status } =
      req.body;

    // Build update data — only include fields that were actually provided
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = budget;
    if (cpmRate !== undefined) updateData.cpmRate = cpmRate;
    if (cpcRate !== undefined) updateData.cpcRate = cpcRate;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (targetCategories !== undefined) updateData.targetCategories = targetCategories;
    if (targetRegions !== undefined) updateData.targetRegions = targetRegions;
    if (status !== undefined) {
      if (!VALID_CAMPAIGN_STATUSES.includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${VALID_CAMPAIGN_STATUSES.join(', ')}`,
        });
        return;
      }
      updateData.status = status;
    }

    // Require at least one field to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields provided for update' });
      return;
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /api/campaigns/:id - Delete campaign (SPONSOR only, must own it)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SPONSOR' || !req.user!.sponsorId) {
      res.status(403).json({ error: 'Only sponsors can delete campaigns' });
      return;
    }

    const id = getParam(req.params.id);

    // Verify ownership before deleting
    const existing = await prisma.campaign.findFirst({
      where: { id, sponsorId: req.user!.sponsorId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    // Cascade delete handles related creatives and placements automatically
    await prisma.campaign.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;
