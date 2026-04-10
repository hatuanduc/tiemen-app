import express from 'express';
import { login, me } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.get('/me', me);

export default router;
