import { Prisma } from '@prisma/client';

/** User + roles + role.permissions + permission (login / me / requireAuth) */
export const userWithAuthArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    },
  },
});

export type UserWithAuth = Prisma.UserGetPayload<typeof userWithAuthArgs>;

/** User list + create/update response (roles → role id/key/name) */
export const userListArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    roles: {
      include: {
        role: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
      },
    },
  },
});

export type UserListRow = Prisma.UserGetPayload<typeof userListArgs>;

/** Role list + create/update response */
export const roleListArgs = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    permissions: {
      include: {
        permission: {
          select: {
            id: true,
            key: true,
            module: true,
            action: true,
            label: true,
          },
        },
      },
    },
    _count: {
      select: { users: true },
    },
  },
});

export type RoleListRow = Prisma.RoleGetPayload<typeof roleListArgs>;
