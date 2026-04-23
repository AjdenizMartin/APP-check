import { UserRole } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8).max(128),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(128).optional(),
});
