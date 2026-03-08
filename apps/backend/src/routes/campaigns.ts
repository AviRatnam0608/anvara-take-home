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

// TODO: Add PUT /api/campaigns/:id endpoint (Challenge 4)
// TODO: Add DELETE /api/campaigns/:id endpoint (Challenge 4)

export default router;
