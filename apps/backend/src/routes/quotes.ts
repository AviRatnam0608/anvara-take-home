import { type Response, type IRouter, Router } from 'express';
import type { AuthRequest } from '../auth.js';

const router: IRouter = Router();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getVerificationLevel({
  workEmail,
  companyWebsite,
  legalEntityName,
  complianceAcknowledgement,
}: {
  workEmail: string;
  companyWebsite?: string;
  legalEntityName?: string;
  complianceAcknowledgement: boolean;
}): 'low' | 'medium' | 'high' {
  const hasBusinessDomain =
    /@(?!gmail\.com$|yahoo\.com$|outlook\.com$|hotmail\.com$)[^\s@]+$/i.test(workEmail);
  const hasWebsite = Boolean(companyWebsite);
  const hasLegalEntity = Boolean(legalEntityName);

  const score =
    Number(hasBusinessDomain) +
    Number(hasWebsite) +
    Number(hasLegalEntity) +
    Number(complianceAcknowledgement);

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

// POST /api/quotes/request
router.post('/request', async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body ?? {};

    const companyName = sanitize(body.companyName);
    const workEmail = sanitize(body.workEmail || body.email);
    const phone = sanitize(body.phone) || undefined;
    const budgetRange = sanitize(body.budgetRange) || undefined;
    const campaignGoal = sanitize(body.campaignGoal) || undefined;
    const timelineStart = sanitize(body.timelineStart) || undefined;
    const timelineEnd = sanitize(body.timelineEnd) || undefined;
    const specialRequirements = sanitize(body.specialRequirements || body.message);
    const legalEntityName = sanitize(body.legalEntityName) || undefined;
    const companyWebsite = sanitize(body.companyWebsite) || undefined;
    const adSlotId = sanitize(body.adSlotId);
    const complianceAcknowledgement = Boolean(body.complianceAcknowledgement);

    if (!companyName || !workEmail || !adSlotId || !specialRequirements) {
      res.status(400).json({
        error: 'companyName, workEmail, adSlotId, and specialRequirements are required',
      });
      return;
    }

    if (!isValidEmail(workEmail)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (specialRequirements.length < 20) {
      res.status(400).json({
        error: 'Please provide at least 20 characters about your campaign requirements',
      });
      return;
    }

    const quoteId = `qt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    const verificationLevel = getVerificationLevel({
      workEmail,
      companyWebsite,
      legalEntityName,
      complianceAcknowledgement,
    });

    // Intentionally no persistence for this challenge; log structured payload for review/dev use.
    console.log('Quote requested:', {
      quoteId,
      requestedByUserId: req.user?.id,
      adSlotId,
      companyName,
      workEmail,
      phone,
      budgetRange,
      campaignGoal,
      timelineStart,
      timelineEnd,
      specialRequirements,
      legalEntityName,
      companyWebsite,
      complianceAcknowledgement,
      verificationLevel,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      quoteId,
      verificationLevel,
      estimatedResponseTime: 'Within 2 business days',
    });
  } catch (error) {
    console.error('Error requesting quote:', error);
    res.status(500).json({ error: 'Failed to request quote' });
  }
});

export default router;
