import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import type { AuthRequest } from '../auth.js';
import { getParam } from '../utils/helpers.js';

const router: IRouter = Router();

// GET /api/sponsors - List all sponsors
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// GET /api/sponsors/:id - Get single sponsor with campaigns
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: {
            _count: { select: { placements: true } },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!sponsor) {
      res.status(404).json({ error: 'Sponsor not found' });
      return;
    }

    res.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

// POST /api/sponsors - Create new sponsor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, website, logo, description, industry } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const sponsor = await prisma.sponsor.create({
      data: { name, email, website, logo, description, industry },
    });

    res.status(201).json(sponsor);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

// PUT /api/sponsors/:id - Update sponsor (SPONSOR only, must own it)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'SPONSOR' || !req.user.sponsorId) {
      res.status(403).json({ error: 'Only sponsors can update sponsors' });
      return;
    }

    const id = getParam(req.params.id);
    if (id !== req.user.sponsorId) {
      res.status(404).json({ error: 'Sponsor not found' });
      return;
    }

    const { name, website, logo, description, industry } = req.body as Record<string, unknown>;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (website !== undefined) updateData.website = website;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (industry !== undefined) updateData.industry = industry;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields provided for update' });
      return;
    }

    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: updateData,
    });

    res.json(sponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

export default router;
