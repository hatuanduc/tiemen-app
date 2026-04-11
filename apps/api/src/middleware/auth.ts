import { NextFunction, Request, Response } from 'express';
import prisma from '../services/db';
import { userWithAuthArgs } from '../db/prismaQueryArgs';
import { verifyToken } from '../services/auth';

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = verifyToken(token) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      ...userWithAuthArgs,
    });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid token' });

    req.authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((item) => item.role.key),
      permissions: Array.from(
        new Set(user.roles.flatMap((item) => item.role.permissions.map((rp) => rp.permission.key))),
      ),
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.authUser?.permissions ?? [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
