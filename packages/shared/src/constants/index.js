"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIMEZONE = exports.LOCALE = exports.DATETIME_FORMAT = exports.TIME_FORMAT = exports.DATE_FORMAT = exports.APP_VERSION = exports.APP_NAME = void 0;
__exportStar(require("./pagination"), exports);
exports.APP_NAME = 'Clínica SaaS';
exports.APP_VERSION = '1.0.0';
exports.DATE_FORMAT = 'dd/MM/yyyy';
exports.TIME_FORMAT = 'HH:mm';
exports.DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
exports.LOCALE = 'pt-BR';
exports.TIMEZONE = 'America/Sao_Paulo';
//# sourceMappingURL=index.js.map