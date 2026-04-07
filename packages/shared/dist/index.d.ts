import { z } from 'zod';

declare function formatDate(date: Date | string): string;
declare function formatDateLocale(date: Date | string): string;
declare function formatDateTimeLocale(date: Date | string): string;
declare function parseDate(dateString: string): Date;
declare function isValidDate(date: unknown): boolean;
declare function addDays(date: Date, days: number): Date;
declare function addMinutes(date: Date, minutes: number): Date;
declare function startOfDay(date: Date): Date;
declare function endOfDay(date: Date): Date;
declare function isSameDay(date1: Date, date2: Date): boolean;

declare function formatPhone(phone: string): string;
declare function formatDocument(document: string): string;
declare function maskPhone(phone: string): string;
declare function maskEmail(email: string): string;

declare function generateRandomCode(length?: number): string;
declare function slugify(text: string): string;
declare function truncate(text: string, maxLength: number): string;
declare function capitalize(text: string): string;
declare function capitalizeWords(text: string): string;

declare const DEFAULT_PAGE_SIZE = 20;
declare const MAX_PAGE_SIZE = 100;
declare const MIN_PAGE_SIZE = 1;
declare const PAGINATION_DEFAULTS: {
    readonly page: 1;
    readonly limit: 20;
};

declare const APP_NAME = "Cl\u00EDnica SaaS";
declare const APP_VERSION = "1.0.0";
declare const DATE_FORMAT = "dd/MM/yyyy";
declare const TIME_FORMAT = "HH:mm";
declare const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
declare const LOCALE = "pt-BR";
declare const TIMEZONE = "America/Sao_Paulo";

declare const UUID_REGEX: RegExp;
declare const isValidUUID: (value: string) => boolean;
declare const UUIDSchema: z.ZodString;
declare const EmailSchema: z.ZodString;
declare const PhoneSchema: z.ZodString;
declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
declare const PaginationParamsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
declare const IdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
declare function parseUUID(value: unknown): string;
declare function parseIdParam(value: unknown): {
    id: string;
};
declare function parsePagination(value: unknown): {
    page: number;
    limit: number;
};

export { APP_NAME, APP_VERSION, DATETIME_FORMAT, DATE_FORMAT, DEFAULT_PAGE_SIZE, EmailSchema, IdParamSchema, LOCALE, MAX_PAGE_SIZE, MIN_PAGE_SIZE, PAGINATION_DEFAULTS, PaginationParamsSchema, PaginationSchema, PhoneSchema, TIMEZONE, TIME_FORMAT, UUIDSchema, UUID_REGEX, addDays, addMinutes, capitalize, capitalizeWords, endOfDay, formatDate, formatDateLocale, formatDateTimeLocale, formatDocument, formatPhone, generateRandomCode, isSameDay, isValidDate, isValidUUID, maskEmail, maskPhone, parseDate, parseIdParam, parsePagination, parseUUID, slugify, startOfDay, truncate };
