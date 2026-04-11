import { Request, Response } from 'express';
import {
  createRole,
  createUser,
  listPermissions,
  listRoles,
  listUsers,
  updateRole,
  updateUser,
} from './users.service';

function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'UNKNOWN';
}

export async function getUsers(req: Request, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const users = await listUsers(search);
  return res.json({ items: users });
}

export async function postUser(req: Request, res: Response) {
  const body = req.body as {
    email?: string;
    name?: string;
    password?: string;
    roleIds?: string[];
  };
  if (!body.email || !body.password || !body.name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const created = await createUser({
      email: body.email.trim().toLowerCase(),
      name: body.name.trim(),
      password: body.password,
      roleIds: Array.isArray(body.roleIds) ? body.roleIds : [],
    });
    return res.status(201).json({ item: created });
  } catch (error) {
    const code = messageFromError(error);
    if (code === 'EMAIL_EXISTS') return res.status(409).json({ message: 'Email already exists' });
    if (code === 'ROLE_NOT_FOUND') return res.status(400).json({ message: 'Invalid roles' });
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function putUser(req: Request, res: Response) {
  const body = req.body as {
    name?: string;
    password?: string;
    isActive?: boolean;
    roleIds?: string[];
  };
  try {
    const updated = await updateUser(req.params.id, {
      name: body.name?.trim(),
      password: body.password?.trim() ? body.password : undefined,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
      roleIds: Array.isArray(body.roleIds) ? body.roleIds : undefined,
    });
    return res.json({ item: updated });
  } catch (error) {
    const code = messageFromError(error);
    if (code === 'USER_NOT_FOUND') return res.status(404).json({ message: 'User not found' });
    if (code === 'ROLE_NOT_FOUND') return res.status(400).json({ message: 'Invalid roles' });
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getRoles(_req: Request, res: Response) {
  const roles = await listRoles();
  return res.json({
    items: roles.map((role) => ({
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.users,
      permissions: role.permissions.map((item) => item.permission),
    })),
  });
}

export async function postRole(req: Request, res: Response) {
  const body = req.body as {
    key?: string;
    name?: string;
    description?: string;
    permissionIds?: string[];
  };
  if (!body.key || !body.name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const role = await createRole({
      key: body.key.trim().toLowerCase(),
      name: body.name.trim(),
      description: body.description?.trim(),
      permissionIds: Array.isArray(body.permissionIds) ? body.permissionIds : [],
    });
    return res.status(201).json({
      item: {
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        userCount: role._count.users,
        permissions: role.permissions.map((item) => item.permission),
      },
    });
  } catch (error) {
    const code = messageFromError(error);
    if (code === 'ROLE_KEY_EXISTS') return res.status(409).json({ message: 'Role key already exists' });
    if (code === 'PERMISSION_NOT_FOUND') {
      return res.status(400).json({ message: 'Invalid permissions' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function putRole(req: Request, res: Response) {
  const body = req.body as {
    name?: string;
    description?: string;
    permissionIds?: string[];
  };
  try {
    const role = await updateRole(req.params.id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      permissionIds: Array.isArray(body.permissionIds) ? body.permissionIds : undefined,
    });
    return res.json({
      item: {
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        userCount: role._count.users,
        permissions: role.permissions.map((item) => item.permission),
      },
    });
  } catch (error) {
    const code = messageFromError(error);
    if (code === 'ROLE_NOT_FOUND') return res.status(404).json({ message: 'Role not found' });
    if (code === 'PERMISSION_NOT_FOUND') {
      return res.status(400).json({ message: 'Invalid permissions' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getPermissions(_req: Request, res: Response) {
  const permissions = await listPermissions();
  return res.json({ items: permissions });
}
