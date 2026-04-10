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
  MessageStatus: () => MessageStatus,
  PaymentStatus: () => PaymentStatus,
  ProfessionalSpecialty: () => ProfessionalSpecialty,
  SystemRole: () => SystemRole,
  UserRole: () => UserRole
});
module.exports = __toCommonJS(src_exports);

// src/enums/index.ts
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["ADMIN"] = "admin";
  UserRole2["CLINIC_OWNER"] = "clinic_owner";
  UserRole2["PROFESSIONAL"] = "professional";
  UserRole2["RECEPTIONIST"] = "receptionist";
  return UserRole2;
})(UserRole || {});
var SystemRole = /* @__PURE__ */ ((SystemRole2) => {
  SystemRole2["SUPER_ADMIN"] = "super_admin";
  SystemRole2["ORG_ADMIN"] = "org_admin";
  SystemRole2["PROFESSIONAL"] = "professional";
  SystemRole2["RECEPTIONIST"] = "receptionist";
  SystemRole2["SUPPORT"] = "support";
  return SystemRole2;
})(SystemRole || {});
var ProfessionalSpecialty = /* @__PURE__ */ ((ProfessionalSpecialty2) => {
  ProfessionalSpecialty2["NUTRITIONIST"] = "nutritionist";
  ProfessionalSpecialty2["PSYCHOLOGIST"] = "psychologist";
  ProfessionalSpecialty2["PHYSIOTHERAPIST"] = "physiotherapist";
  ProfessionalSpecialty2["DENTIST"] = "dentist";
  ProfessionalSpecialty2["GENERAL_PRACTITIONER"] = "general_practitioner";
  ProfessionalSpecialty2["OTHER"] = "other";
  return ProfessionalSpecialty2;
})(ProfessionalSpecialty || {});
var PaymentStatus = /* @__PURE__ */ ((PaymentStatus2) => {
  PaymentStatus2["PENDING"] = "pending";
  PaymentStatus2["PAID"] = "paid";
  PaymentStatus2["OVERDUE"] = "overdue";
  PaymentStatus2["REFUNDED"] = "refunded";
  return PaymentStatus2;
})(PaymentStatus || {});
var MessageStatus = /* @__PURE__ */ ((MessageStatus2) => {
  MessageStatus2["PENDING"] = "pending";
  MessageStatus2["SENT"] = "sent";
  MessageStatus2["FAILED"] = "failed";
  return MessageStatus2;
})(MessageStatus || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MessageStatus,
  PaymentStatus,
  ProfessionalSpecialty,
  SystemRole,
  UserRole
});
//# sourceMappingURL=index.js.map