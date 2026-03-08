import express, { type Application, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../auth.js';

/**
 * Creates a mini Express app with injected user context for route testing.
 * This bypasses the real authMiddleware — middleware is tested separately in auth.test.ts.
 */
export function createTestApp(
  mountPath: string,
  router: express.Router,
  user?: AuthRequest['user'],
): Application {
  const app = express();
  app.use(express.json());
  if (user) {
    app.use((req: AuthRequest, _res: Response, next: NextFunction) => {
      req.user = user;
      next();
    });
  }
  app.use(mountPath, router);
  return app;
}

export const sponsorUser: AuthRequest['user'] = {
  id: 'user-sponsor-1',
  email: 'sponsor@test.com',
  role: 'SPONSOR',
  sponsorId: 'sponsor-1',
};

export const publisherUser: AuthRequest['user'] = {
  id: 'user-publisher-1',
  email: 'publisher@test.com',
  role: 'PUBLISHER',
  publisherId: 'publisher-1',
};
