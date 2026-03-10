import { type Request, type Response, type NextFunction } from 'express';
import { auth } from './lib/auth.js';
import { prisma } from './db.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'SPONSOR' | 'PUBLISHER';
    sponsorId?: string;
    publisherId?: string;
  };
}

/**
 * Authentication middleware — validates the Better Auth session cookie.
 *
 * 1. Converts Express headers to a Web Headers object (what getSession expects)
 * 2. Calls auth.api.getSession() to validate the cookie against the database
 * 3. If invalid → 401 Unauthorized
 * 4. If valid → looks up the user's Sponsor/Publisher record to determine role
 * 5. Attaches full user context to req.user
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Convert Express headers to Web Headers for Better Auth
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(', '));
      }
    }

    const session = await auth.api.getSession({ headers });

    if (!session?.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userId = session.user.id;
    const email = session.user.email;

    // Determine if the user is a Sponsor or Publisher
    const sponsor = await prisma.sponsor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (sponsor) {
      req.user = {
        id: userId,
        email,
        role: 'SPONSOR',
        sponsorId: sponsor.id,
      };
      next();
      return;
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (publisher) {
      req.user = {
        id: userId,
        email,
        role: 'PUBLISHER',
        publisherId: publisher.id,
      };
      next();
      return;
    }

    // Valid session but no Sponsor/Publisher record — no role assigned
    res.status(403).json({ error: 'No role assigned to this account' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware — enriches req.user when a valid session
 * is present but does NOT block the request when no session exists.
 * Used for routes that are public but provide extra data to authenticated users
 * (e.g., the marketplace GET endpoint).
 */
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(', '));
      }
    }

    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      const userId = session.user.id;
      const email = session.user.email;

      const sponsor = await prisma.sponsor.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (sponsor) {
        req.user = { id: userId, email, role: 'SPONSOR', sponsorId: sponsor.id };
      } else {
        const publisher = await prisma.publisher.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (publisher) {
          req.user = { id: userId, email, role: 'PUBLISHER', publisherId: publisher.id };
        }
      }
    }
    // If no session or no role, req.user stays undefined — that's fine
    next();
  } catch {
    // Auth lookup failed — continue without auth (it's optional)
    next();
  }
}

export function roleMiddleware(allowedRoles: Array<'SPONSOR' | 'PUBLISHER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
