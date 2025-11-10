import type { Prisma } from '@prisma/client';
import prisma from 'lib/prisma';

type GetUserOptions = {
  includePassword?: boolean;
  showDeleted?: boolean;
};

async function findUser(
  criteria: Prisma.UserFindUniqueArgs,
  options: GetUserOptions = {},
) {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findUnique({
    ...criteria,
    where: {
      ...criteria.where,
      // only return non-deleted users unless explicitly requested
      ...(showDeleted ? {} : { deletedAt: null }),
    },
    select: {
      id: true,
      username: true,
      password: includePassword, // only include password hash when asked
      role: true,
      createdAt: true,
    },
  });
}

export function getUserById(id: string, options?: GetUserOptions) {
  return findUser({ where: { id } }, options);
}

export function getUserByUsername(username: string, options?: GetUserOptions) {
  return findUser({ where: { username } }, options);
}
