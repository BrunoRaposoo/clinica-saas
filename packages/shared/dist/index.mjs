// src/utils/date.ts
function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
}
function formatDateLocale(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}
function formatDateTimeLocale(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR");
}
function parseDate(dateString) {
  return new Date(dateString);
}
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
function addMinutes(date, minutes) {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}
function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}
function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

// src/utils/string.ts
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
function formatDocument(document) {
  const cleaned = document.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return document;
}
function maskPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    return cleaned.slice(0, -8) + "********";
  }
  return phone;
}
function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.length > 2 ? local.slice(0, 2) + "*".repeat(local.length - 2) : local;
  return `${maskedLocal}@${domain}`;
}

// src/utils/index.ts
function generateRandomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
}
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function capitalizeWords(text) {
  return text.split(" ").map(capitalize).join(" ");
}

// src/constants/pagination.ts
var DEFAULT_PAGE_SIZE = 20;
var MAX_PAGE_SIZE = 100;
var MIN_PAGE_SIZE = 1;
var PAGINATION_DEFAULTS = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE
};

// src/constants/index.ts
var APP_NAME = "Cl\xEDnica SaaS";
var APP_VERSION = "1.0.0";
var DATE_FORMAT = "dd/MM/yyyy";
var TIME_FORMAT = "HH:mm";
var DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
var LOCALE = "pt-BR";
var TIMEZONE = "America/Sao_Paulo";

// src/validators/index.ts
import { z } from "zod";
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var isValidUUID = (value) => {
  return UUID_REGEX.test(value);
};
var UUIDSchema = z.string().uuid();
var EmailSchema = z.string().email();
var PhoneSchema = z.string().min(10).max(11);
var PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});
var PaginationParamsSchema = PaginationSchema;
var IdParamSchema = z.object({
  id: UUIDSchema
});
function parseUUID(value) {
  return UUIDSchema.parse(value);
}
function parseIdParam(value) {
  return IdParamSchema.parse(value);
}
function parsePagination(value) {
  return PaginationSchema.parse(value);
}
export {
  APP_NAME,
  APP_VERSION,
  DATETIME_FORMAT,
  DATE_FORMAT,
  DEFAULT_PAGE_SIZE,
  EmailSchema,
  IdParamSchema,
  LOCALE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  PAGINATION_DEFAULTS,
  PaginationParamsSchema,
  PaginationSchema,
  PhoneSchema,
  TIMEZONE,
  TIME_FORMAT,
  UUIDSchema,
  UUID_REGEX,
  addDays,
  addMinutes,
  capitalize,
  capitalizeWords,
  endOfDay,
  formatDate,
  formatDateLocale,
  formatDateTimeLocale,
  formatDocument,
  formatPhone,
  generateRandomCode,
  isSameDay,
  isValidDate,
  isValidUUID,
  maskEmail,
  maskPhone,
  parseDate,
  parseIdParam,
  parsePagination,
  parseUUID,
  slugify,
  startOfDay,
  truncate
};
//# sourceMappingURL=index.mjs.map