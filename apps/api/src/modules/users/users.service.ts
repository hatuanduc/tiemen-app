import bcrypt from 'bcryptjs';
import prisma from '../../services/db';
import {
  roleListArgs,
  type RoleListRow,
  userListArgs,
  type UserListRow,
} from '../../db/prismaQueryArgs';

type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  roleIds: string[];
};

type UpdateUserInput = {
  name?: string;
  password?: string;
  isActive?: boolean;
  roleIds?: string[];
};

function toUserItem(user: UserListRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    roles: user.roles.map((item) => item.role),
  };
}

export async function listUsers(search: string) {
  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    ...userListArgs,
    orderBy: { createdAt: 'desc' },
  });
  return users.map(toUserItem);
}

export async function listRoles(): Promise<RoleListRow[]> {
  return prisma.role.findMany({
    ...roleListArgs,
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });
}

export async function listPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
  });
}

export async function createUser(input: CreateUserInput) {
  const existed = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existed) {
    throw new Error('EMAIL_EXISTS');
  }

  const roleCount = await prisma.role.count({
    where: { id: { in: input.roleIds } },
  });
  if (roleCount !== input.roleIds.length) {
    throw new Error('ROLE_NOT_FOUND');
  }

  const password = bcrypt.hashSync(input.password, 10);

  const created = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password,
      isActive: true,
      roles: {
        create: input.roleIds.map((roleId) => ({ roleId })),
      },
    },
    ...userListArgs,
  });

  return toUserItem(created);
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const existed = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!existed) {
    throw new Error('USER_NOT_FOUND');
  }

  if (input.roleIds) {
    const roleCount = await prisma.role.count({
      where: { id: { in: input.roleIds } },
    });
    if (roleCount !== input.roleIds.length) {
      throw new Error('ROLE_NOT_FOUND');
    }
  }

  const nextPassword = input.password ? bcrypt.hashSync(input.password, 10) : undefined;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      isActive: input.isActive,
      password: nextPassword,
      roles: input.roleIds
        ? {
            deleteMany: {},
            create: input.roleIds.map((roleId) => ({ roleId })),
          }
        : undefined,
    },
    ...userListArgs,
  });

  return toUserItem(updated);
}

export async function createRole(input: {
  key: string;
  name: string;
  description?: string;
  permissionIds: string[];
}) {
  const existed = await prisma.role.findUnique({
    where: { key: input.key },
    select: { id: true },
  });
  if (existed) {
    throw new Error('ROLE_KEY_EXISTS');
  }

  const permissionCount = await prisma.permission.count({
    where: { id: { in: input.permissionIds } },
  });
  if (permissionCount !== input.permissionIds.length) {
    throw new Error('PERMISSION_NOT_FOUND');
  }

  return prisma.role.create({
    data: {
      key: input.key,
      name: input.name,
      description: input.description,
      isSystem: false,
      permissions: {
        create: input.permissionIds.map((permissionId) => ({ permissionId })),
      },
    },
    ...roleListArgs,
  });
}

export async function updateRole(
  roleId: string,
  input: {
    name?: string;
    description?: string;
    permissionIds?: string[];
  },
) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { id: true, isSystem: true },
  });
  if (!role) throw new Error('ROLE_NOT_FOUND');

  if (input.permissionIds) {
    const permissionCount = await prisma.permission.count({
      where: { id: { in: input.permissionIds } },
    });
    if (permissionCount !== input.permissionIds.length) {
      throw new Error('PERMISSION_NOT_FOUND');
    }
  }

  return prisma.role.update({
    where: { id: roleId },
    data: {
      name: input.name,
      description: input.description,
      permissions: input.permissionIds
        ? {
            deleteMany: {},
            create: input.permissionIds.map((permissionId) => ({ permissionId })),
          }
        : undefined,
    },
    ...roleListArgs,
  });
}
