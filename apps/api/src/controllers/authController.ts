import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../services/db';
import { userWithAuthArgs, type UserWithAuth } from '../db/prismaQueryArgs';
import { signToken, verifyToken } from '../services/auth';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email, name: user.name ?? undefined });
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      ...userWithAuthArgs,
    });
    const userRoleRows = userWithRoles?.roles ?? ([] as UserWithAuth['roles']);
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: userRoleRows.map((item) => item.role.key),
      permissions: Array.from(
        new Set(
          userRoleRows.flatMap((item) => item.role.permissions.map((rp) => rp.permission.key)),
        ),
      ),
    };
    return res.json({ token, user: safeUser });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function me(req: Request, res: Response) {
  const auth = req.header('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = verifyToken(token) as { sub: string; email: string; name: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      ...userWithAuthArgs,
    });
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    const permissions = Array.from(
      new Set(user.roles.flatMap((item) => item.role.permissions.map((rp) => rp.permission.key))),
    );
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((item) => item.role.key),
        permissions,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth/me error', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
