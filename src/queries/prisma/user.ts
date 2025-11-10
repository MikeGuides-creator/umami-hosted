// src/queries/prisma/user.ts
import type { Prisma } from '@prisma/client';
import prisma from 'lib/prisma';

type GetUserOptions = {
  includePassword?: boolean;
  showDeleted?: boolean;
};

async function findUser(
  criteria: Prisma.UserFindFirstArgs,
  options: GetUserOptions = {},
) {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findFirst({
    ...criteria,
    where: {
      ...(criteria.where || {}),
      ...(showDeleted ? {} : { deletedAt: null }),
    },
    select: {
      id: true,
      username: true,
      password: includePassword,
      role: true,
      createdAt: true,
    },
  });
}

export function getUserById(id: string, options: GetUserOptions = {}) {
  return findUser({ where: { id } }, options);
}

export function getUserByUsername(username: string, options: GetUserOptions = {}) {
  return findUser({ where: { username } }, options);
}
