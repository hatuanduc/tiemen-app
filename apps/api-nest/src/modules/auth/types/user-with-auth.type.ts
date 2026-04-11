import { Prisma } from '@prisma/client';

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
