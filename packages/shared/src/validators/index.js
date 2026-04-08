"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdParamSchema = exports.PaginationParamsSchema = exports.PaginationSchema = exports.PhoneSchema = exports.EmailSchema = exports.UUIDSchema = exports.isValidUUID = exports.UUID_REGEX = void 0;
exports.parseUUID = parseUUID;
exports.parseIdParam = parseIdParam;
exports.parsePagination = parsePagination;
const zod_1 = require("zod");
exports.UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (value) => {
    return exports.UUID_REGEX.test(value);
};
exports.isValidUUID = isValidUUID;
exports.UUIDSchema = zod_1.z.string().uuid();
exports.EmailSchema = zod_1.z.string().email();
exports.PhoneSchema = zod_1.z.string().min(10).max(11);
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
});
exports.PaginationParamsSchema = exports.PaginationSchema;
exports.IdParamSchema = zod_1.z.object({
    id: exports.UUIDSchema,
});
function parseUUID(value) {
    return exports.UUIDSchema.parse(value);
}
function parseIdParam(value) {
    return exports.IdParamSchema.parse(value);
}
function parsePagination(value) {
    return exports.PaginationSchema.parse(value);
}
//# sourceMappingURL=index.js.map