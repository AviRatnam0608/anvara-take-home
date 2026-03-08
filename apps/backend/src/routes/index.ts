import { Router, type IRouter } from 'express';
import { authMiddleware } from '../auth.js';
import authRoutes from './auth.js';
import sponsorsRoutes from './sponsors.js';
import publishersRoutes from './publishers.js';
import campaignsRoutes from './campaigns.js';
import adSlotsRoutes from './adSlots.js';
import placementsRoutes from './placements.js';
import dashboardRoutes from './dashboard.js';
import healthRoutes from './health.js';

const router: IRouter = Router();

// Mount all routes
// Public routes — no auth required
router.use('/auth', authRoutes);
router.use('/sponsors', sponsorsRoutes);
router.use('/publishers', publishersRoutes);
router.use('/health', healthRoutes);

// Protected routes — require valid session
router.use('/campaigns', authMiddleware, campaignsRoutes);
router.use('/ad-slots', authMiddleware, adSlotsRoutes);
router.use('/placements', authMiddleware, placementsRoutes);
router.use('/dashboard', authMiddleware, dashboardRoutes);

export default router;
