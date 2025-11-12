import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface GetUserOptions {
  includePassword?: boolean;
  showDeleted?: boolean;
}

function baseSelect(includePassword = false) {
  return {
    id: true,
    username: true,
    role: true,
    createdAt: true,
    password: includePassword,
  } satisfies Prisma.UserSelect;
}

async function findUser(
  criteria: Prisma.UserFindFirstArgs,
  opts: GetUserOptions = {}
) {
  const { includePassword = false, showDeleted = false } = opts;

  return prisma.client.user.findFirst({
    ...criteria,
    where: {
      ...(criteria.where ?? {}),
      ...(showDeleted ? {} : { deletedAt: null }),
    },
    select: baseSelect(includePassword),
  });
}

export async function getUser(userId: string, opts: GetUserOptions = {}) {
  return findUser({ where: { id: userId } }, opts);
}

export async function getUserByUsername(
  username: string,
  opts: GetUserOptions = {}
) {
  return findUser({ where: { username } }, opts);
}

/** === functions expected by API routes === */

export async function getUsers(opts: GetUserOptions = {}) {
  const { includePassword = false, showDeleted = false } = opts;

  return prisma.client.user.findMany({
    where: showDeleted ? {} : { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: baseSelect(includePassword),
  });
}

type CreateUserInput = {
  username: string;
  password: string; // assume already hashed by the caller
  role?: string; // "admin" | "user"
};

export async function createUser(input: CreateUserInput) {
  const { username, password, role = "user" } = input;

  return prisma.client.user.create({
    data: { username, password, role },
    select: baseSelect(false),
  });
}

type UpdateUserInput = {
  username?: string;
  password?: string; // assume already hashed by the caller if provided
  role?: string;
  // allow undelete if API wants to: deletedAt: null removes soft-delete
  deletedAt?: Date | null;
};

export async function updateUser(userId: string, data: UpdateUserInput) {
  return prisma.client.user.update({
    where: { id: userId },
    data,
    select: baseSelect(false),
  });
}

export async function deleteUser(userId: string) {
  // Soft-delete by default; switch to .delete() if your API expects hard delete
  return prisma.client.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
    select: baseSelect(false),
  });
}
