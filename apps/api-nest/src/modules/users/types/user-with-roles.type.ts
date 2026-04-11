import { Prisma } from '@prisma/client';

export const userWithAuthArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    roles: {
      include: {
        role: true,
      },
    },
  },
});

export type UserWithRoles = Prisma.UserGetPayload<typeof userWithAuthArgs>;
