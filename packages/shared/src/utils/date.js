"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatDateLocale = formatDateLocale;
exports.formatDateTimeLocale = formatDateTimeLocale;
exports.parseDate = parseDate;
exports.isValidDate = isValidDate;
exports.addDays = addDays;
exports.addMinutes = addMinutes;
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;
exports.isSameDay = isSameDay;
function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
}
function formatDateLocale(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
}
function formatDateTimeLocale(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR');
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
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
//# sourceMappingURL=date.js.map