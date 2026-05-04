"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhone = formatPhone;
exports.formatDocument = formatDocument;
exports.maskPhone = maskPhone;
exports.maskEmail = maskEmail;
function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}
function formatDocument(document) {
    const cleaned = document.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    if (cleaned.length === 14) {
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    return document;
}
function maskPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
        return cleaned.slice(0, -8) + '********';
    }
    return phone;
}
function maskEmail(email) {
    const [local, domain] = email.split('@');
    if (!domain)
        return email;
    const maskedLocal = local.length > 2
        ? local.slice(0, 2) + '*'.repeat(local.length - 2)
        : local;
    return `${maskedLocal}@${domain}`;
}
//# sourceMappingURL=string.js.map