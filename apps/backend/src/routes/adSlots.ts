import { type Response, type IRouter, Router } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import type { AuthRequest } from '../auth.js';

const router: IRouter = Router();

// Valid ad slot types matching the Prisma AdSlotType enum
const VALID_AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

// GET /api/ad-slots - List ad slots
// Public: returns all available ad slots (marketplace browsing)
// Authenticated publisher with publisherId param: returns that publisher's ad slots
// Supports: search, type, minPrice, maxPrice, page, limit
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, available, publisherId, search, minPrice, maxPrice, page, limit } = req.query;

    // If a publisher is requesting their own ad slots (dashboard)
    const isOwnerRequest =
      req.user?.role === 'PUBLISHER' &&
      req.user.publisherId &&
      publisherId === req.user.publisherId;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      ...(isOwnerRequest
        ? { publisherId: req.user!.publisherId }
        : { isAvailable: true }),
      ...(type && {
        type: type as string as 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST',
      }),
      ...(available === 'true' && { isAvailable: true }),
    };

    // Text search on name, description, and publisher name
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { publisher: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    // Price range filters
    if (minPrice || maxPrice) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const priceFilter: any = {};
      if (minPrice && !isNaN(Number(minPrice))) priceFilter.gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) priceFilter.lte = Number(maxPrice);
      where.basePrice = priceFilter;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [adSlots, total] = await Promise.all([
      prisma.adSlot.findMany({
        where,
        include: {
          publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
          _count: { select: { placements: true } },
        },
        orderBy: { basePrice: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.adSlot.count({ where }),
    ]);

    res.json({
      data: adSlots,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/:id - Get single ad slot (public for marketplace detail)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);

    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
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
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'PUBLISHER' || !req.user.publisherId) {
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

    // Validate type against AdSlotType enum — prevents Prisma from leaking internal errors
    if (!VALID_AD_SLOT_TYPES.includes(type)) {
      res.status(400).json({
        error: `Invalid type. Must be one of: ${VALID_AD_SLOT_TYPES.join(', ')}`,
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
        publisherId: req.user.publisherId!,
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
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'SPONSOR') {
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

    console.log(`Ad slot ${id} booked by user ${req.user.id}. Message: ${message || 'None'}`);

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
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'PUBLISHER' || !req.user.publisherId) {
      res.status(403).json({ error: 'Only publishers can unbook their ad slots' });
      return;
    }

    const id = getParam(req.params.id);

    // Verify the authenticated publisher owns this ad slot
    const adSlot = await prisma.adSlot.findFirst({
      where: { id, publisherId: req.user.publisherId },
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

// PUT /api/ad-slots/:id - Update ad slot (PUBLISHER only, must own it)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'PUBLISHER' || !req.user.publisherId) {
      res.status(403).json({ error: 'Only publishers can update ad slots' });
      return;
    }

    const id = getParam(req.params.id);

    // Verify ownership: findFirst with publisherId filter
    // Returns 404 for both "not found" and "not owned" — doesn't reveal resource existence
    const existing = await prisma.adSlot.findFirst({
      where: { id, publisherId: req.user.publisherId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    // Extract only the fields that are allowed to be updated
    const { name, description, type, position, width, height, basePrice, cpmFloor, isAvailable } = req.body;

    // Build update data — only include fields that were actually provided
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) {
      if (!VALID_AD_SLOT_TYPES.includes(type)) {
        res.status(400).json({
          error: `Invalid type. Must be one of: ${VALID_AD_SLOT_TYPES.join(', ')}`,
        });
        return;
      }
      updateData.type = type;
    }
    if (position !== undefined) updateData.position = position;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (cpmFloor !== undefined) updateData.cpmFloor = cpmFloor;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    // Require at least one field to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields provided for update' });
      return;
    }

    const adSlot = await prisma.adSlot.update({
      where: { id },
      data: updateData,
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json(adSlot);
  } catch (error) {
    console.error('Error updating ad slot:', error);
    res.status(500).json({ error: 'Failed to update ad slot' });
  }
});

// DELETE /api/ad-slots/:id - Delete ad slot (PUBLISHER only, must own it)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (req.user.role !== 'PUBLISHER' || !req.user.publisherId) {
      res.status(403).json({ error: 'Only publishers can delete ad slots' });
      return;
    }

    const id = getParam(req.params.id);

    // Verify ownership before deleting
    const existing = await prisma.adSlot.findFirst({
      where: { id, publisherId: req.user.publisherId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    // Cascade delete handles related placements automatically
    await prisma.adSlot.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    res.status(500).json({ error: 'Failed to delete ad slot' });
  }
});

export default router;
