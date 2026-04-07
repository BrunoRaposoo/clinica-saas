"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  APP_NAME: () => APP_NAME,
  APP_VERSION: () => APP_VERSION,
  DATETIME_FORMAT: () => DATETIME_FORMAT,
  DATE_FORMAT: () => DATE_FORMAT,
  DEFAULT_PAGE_SIZE: () => DEFAULT_PAGE_SIZE,
  EmailSchema: () => EmailSchema,
  IdParamSchema: () => IdParamSchema,
  LOCALE: () => LOCALE,
  MAX_PAGE_SIZE: () => MAX_PAGE_SIZE,
  MIN_PAGE_SIZE: () => MIN_PAGE_SIZE,
  PAGINATION_DEFAULTS: () => PAGINATION_DEFAULTS,
  PaginationParamsSchema: () => PaginationParamsSchema,
  PaginationSchema: () => PaginationSchema,
  PhoneSchema: () => PhoneSchema,
  TIMEZONE: () => TIMEZONE,
  TIME_FORMAT: () => TIME_FORMAT,
  UUIDSchema: () => UUIDSchema,
  UUID_REGEX: () => UUID_REGEX,
  addDays: () => addDays,
  addMinutes: () => addMinutes,
  capitalize: () => capitalize,
  capitalizeWords: () => capitalizeWords,
  endOfDay: () => endOfDay,
  formatDate: () => formatDate,
  formatDateLocale: () => formatDateLocale,
  formatDateTimeLocale: () => formatDateTimeLocale,
  formatDocument: () => formatDocument,
  formatPhone: () => formatPhone,
  generateRandomCode: () => generateRandomCode,
  isSameDay: () => isSameDay,
  isValidDate: () => isValidDate,
  isValidUUID: () => isValidUUID,
  maskEmail: () => maskEmail,
  maskPhone: () => maskPhone,
  parseDate: () => parseDate,
  parseIdParam: () => parseIdParam,
  parsePagination: () => parsePagination,
  parseUUID: () => parseUUID,
  slugify: () => slugify,
  startOfDay: () => startOfDay,
  truncate: () => truncate
});
module.exports = __toCommonJS(src_exports);

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
var import_zod = require("zod");
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var isValidUUID = (value) => {
  return UUID_REGEX.test(value);
};
var UUIDSchema = import_zod.z.string().uuid();
var EmailSchema = import_zod.z.string().email();
var PhoneSchema = import_zod.z.string().min(10).max(11);
var PaginationSchema = import_zod.z.object({
  page: import_zod.z.number().int().positive().default(1),
  limit: import_zod.z.number().int().positive().max(100).default(20)
});
var PaginationParamsSchema = PaginationSchema;
var IdParamSchema = import_zod.z.object({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.js.map