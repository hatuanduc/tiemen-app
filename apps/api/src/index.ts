import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth';
import usersRoutes from './modules/users/users.routes';

dotenv.config();

const app = express();
app.use(express.json());

// simple request logger to help debugging whether requests reach this API
app.use((req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log(`API request: ${req.method} ${req.url}`);
  next();
});

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

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRoutes);
app.use('/management', usersRoutes);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
