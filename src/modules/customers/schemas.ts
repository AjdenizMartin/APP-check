import { z } from "zod";

export const customerBaseSchema = z.object({
  fullName: z.string().min(3).max(120),
  phone: z.string().min(6).max(30),
  address: z.string().min(5).max(240),
  notes: z.string().max(1000).optional().or(z.literal("")),
  internalCode: z.string().max(50).optional().or(z.literal("")),
});

export const createCustomerSchema = customerBaseSchema;

export const updateCustomerSchema = customerBaseSchema.extend({
  id: z.string().min(1),
});

export const customerSearchSchema = z.object({
  q: z.string().trim().max(120).optional(),
});
