import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";

export interface GetUserOptions {
  includePassword?: boolean;
  showDeleted?: boolean;
}

type SafeUser = {
  id: string;
  username: string;
  role: string;
  createdAt: Date;
  password?: string | null;
};

async function findUser(
  criteria: Prisma.UserFindUniqueArgs,
  options: GetUserOptions = {},
) {
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
  }) as Promise<SafeUser | null>;
}

/**
 * Single-user helpers (used by auth + “me” routes)
 */
export async function getUser(
  userId: string,
  options: GetUserOptions = {},
) {
  return findUser({ where: { id: userId } }, options);
}

export async function getUserByUsername(
  username: string,
  options: GetUserOptions = {},
) {
  return findUser({ where: { username } }, options);
}

/**
 * Admin helpers used by:
 * - /api/admin/users
 * - /api/users
 */

// List all users (for admin table)
export async function getUsers(options: GetUserOptions = {}) {
  const { includePassword = false, showDeleted = false } = options;

  return prisma.client.user.findMany({
    where: showDeleted ? {} : { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      password: includePassword,
      role: true,
      createdAt: true,
    },
  }) as Promise<SafeUser[]>;
}

type CreateUserInput = {
  username: string;
  password: string;
  role: string;
};

// Create a new user (admin create form)
export async function createUser(data: CreateUserInput) {
  const { username, password, role } = data;

  const user = await prisma.client.user.create({
    data: {
      username,
      password,
      role,
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return user as SafeUser;
}

type UpdateUserInput = {
  username?: string;
  password?: string;
  role?: string;
  deletedAt?: Date | null;
};

// Update user details (admin edit form)
export async function updateUser(userId: string, data: UpdateUserInput) {
  const user = await prisma.client.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return user as SafeUser;
}

// Soft-delete a user (admin delete)
export async function deleteUser(userId: string) {
  await prisma.client.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  return true;
}
