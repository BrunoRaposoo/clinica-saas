import { z } from 'zod';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUUID = (value: string): boolean => {
  return UUID_REGEX.test(value);
};

export const UUIDSchema = z.string().uuid();

export const EmailSchema = z.string().email();

export const PhoneSchema = z.string().min(10).max(11);

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const PaginationParamsSchema = PaginationSchema;

export const IdParamSchema = z.object({
  id: UUIDSchema,
});

export function parseUUID(value: unknown): string {
  return UUIDSchema.parse(value);
}

export function parseIdParam(value: unknown): { id: string } {
  return IdParamSchema.parse(value);
}

export function parsePagination(value: unknown): { page: number; limit: number } {
  return PaginationSchema.parse(value);
}