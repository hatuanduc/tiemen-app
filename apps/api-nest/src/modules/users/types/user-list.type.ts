import { Prisma } from '@prisma/client';

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
