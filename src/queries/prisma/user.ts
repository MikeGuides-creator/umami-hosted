import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export interface GetUserOptions {
  includePassword?: boolean;
  showDeleted?: boolean;
}

async function findUser(criteria: Prisma.UserFindUniqueArgs, options: GetUserOptions = {}) {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findFirst({
    ...criteria,
    where: {
      ...criteria.where,
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

export async function getUser(userId: string, options: GetUserOptions = {}) {
  return findUser({ where: { id: userId } }, options);
}

export async function getUserByUsername(username: string, options: GetUserOptions = {}) {
  return findUser({ where: { username } }, options);
}
