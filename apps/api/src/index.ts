import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from './services/db';
import { PrismaClient, User } from '@prisma/client'
import { signToken, verifyToken } from './services/auth';

dotenv.config();

const app = express();
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
  }),
);

const port = Number(process.env.PORT ?? 4000);
// token helpers moved to services/auth

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  prisma.user
    .findUnique({ where: { email } })
    .then((user: User | null) => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const match = bcrypt.compareSync(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signToken({ id: user.id, email: user.email, name: user.name ?? undefined });
      // Do not return password
      const safeUser = { id: user.id, email: user.email, name: user.name };
      return res.json({ token, user: safeUser });
    })
    .catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error('Login error', err);
      return res.status(500).json({ message: 'Server error' });
    });
});

app.get('/auth/me', (req, res) => {
  const auth = req.header('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = verifyToken(token) as {
      sub: string;
      email: string;
      name: string;
    };
    // optionally verify user still exists in DB
    prisma.user
      .findUnique({ where: { id: payload.sub } })
      .then((user: User | null) => {
        if (!user) return res.status(401).json({ message: 'Invalid token' });
        return res.json({ user: { id: user.id, email: user.email, name: user.name } });
      })
      .catch(() => res.status(500).json({ message: 'Server error' }));
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
