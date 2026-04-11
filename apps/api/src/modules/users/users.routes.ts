import express from 'express';
import { requireAuth, requirePermission } from '../../middleware/auth';
import {
  getPermissions,
  getRoles,
  getUsers,
  postRole,
  postUser,
  putRole,
  putUser,
} from './users.controller';

const router = express.Router();

router.use(requireAuth);

router.get('/users', requirePermission('users:view'), getUsers);
router.post('/users', requirePermission('users:create'), postUser);
router.put('/users/:id', requirePermission('users:update'), putUser);

router.get('/roles', requirePermission('roles:view'), getRoles);
router.post('/roles', requirePermission('roles:create'), postRole);
router.put('/roles/:id', requirePermission('roles:update'), putRole);

router.get('/permissions', requirePermission('roles:view'), getPermissions);

export default router;
