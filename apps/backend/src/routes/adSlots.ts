import { type Response, type IRouter, Router } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import type { AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/ad-slots - List authenticated publisher's ad slots
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'PUBLISHER' || !req.user!.publisherId) {
      res.status(403).json({ error: 'Only publishers can access ad slots' });
      return;
    }

    const { type, available } = req.query;

    const adSlots = await prisma.adSlot.findMany({
      where: {
        // Scope to the authenticated publisher's ad slots only
        publisherId: req.user!.publisherId,
        ...(type && {
          type: type as string as 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST',
        }),
        ...(available === 'true' && { isAvailable: true }),
      },
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
        _count: { select: { placements: true } },
      },
      orderBy: { basePrice: 'desc' },
    });

    res.json(adSlots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/:id - Get single ad slot (must own it)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'PUBLISHER' || !req.user!.publisherId) {
      res.status(403).json({ error: 'Only publishers can access ad slots' });
      return;
    }

    const id = getParam(req.params.id);

    const adSlot = await prisma.adSlot.findFirst({
      where: {
        id,
        publisherId: req.user!.publisherId,
      },
      include: {
        publisher: true,
        placements: {
          include: {
            campaign: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    res.json(adSlot);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    res.status(500).json({ error: 'Failed to fetch ad slot' });
  }
});

// POST /api/ad-slots - Create new ad slot for authenticated publisher
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'PUBLISHER' || !req.user!.publisherId) {
      res.status(403).json({ error: 'Only publishers can create ad slots' });
      return;
    }

    const { name, description, type, basePrice } = req.body;

    if (!name || !type || !basePrice) {
      res.status(400).json({
        error: 'Name, type, and basePrice are required',
      });
      return;
    }

    // Use the authenticated user's publisherId — never trust the request body
    const adSlot = await prisma.adSlot.create({
      data: {
        name,
        description,
        type,
        basePrice,
        publisherId: req.user!.publisherId!,
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(adSlot);
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// POST /api/ad-slots/:id/book - Book an ad slot (simplified booking flow, sponsors only)
router.post('/:id/book', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SPONSOR') {
      res.status(403).json({ error: 'Only sponsors can book ad slots' });
      return;
    }

    const id = getParam(req.params.id);
    const { message } = req.body;

    // Check if slot exists and is available
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (!adSlot.isAvailable) {
      res.status(400).json({ error: 'Ad slot is no longer available' });
      return;
    }

    // Mark slot as unavailable
    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    console.log(`Ad slot ${id} booked by user ${req.user!.id}. Message: ${message || 'None'}`);

    res.json({
      success: true,
      message: 'Ad slot booked successfully!',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    res.status(500).json({ error: 'Failed to book ad slot' });
  }
});

// POST /api/ad-slots/:id/unbook - Reset ad slot to available (for testing, publishers only)
router.post('/:id/unbook', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'PUBLISHER' || !req.user!.publisherId) {
      res.status(403).json({ error: 'Only publishers can unbook their ad slots' });
      return;
    }

    const id = getParam(req.params.id);

    // Verify the authenticated publisher owns this ad slot
    const adSlot = await prisma.adSlot.findFirst({
      where: { id, publisherId: req.user!.publisherId },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: true },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Ad slot is now available again',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error unbooking ad slot:', error);
    res.status(500).json({ error: 'Failed to unbook ad slot' });
  }
});

// TODO: Add PUT /api/ad-slots/:id endpoint (Challenge 4)
// TODO: Add DELETE /api/ad-slots/:id endpoint (Challenge 4)

export default router;
