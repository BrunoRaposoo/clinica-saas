"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStatus = exports.PaymentStatus = exports.AppointmentStatus = exports.ProfessionalSpecialty = exports.SystemRole = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["CLINIC_OWNER"] = "clinic_owner";
    UserRole["PROFESSIONAL"] = "professional";
    UserRole["RECEPTIONIST"] = "receptionist";
})(UserRole || (exports.UserRole = UserRole = {}));
var SystemRole;
(function (SystemRole) {
    SystemRole["SUPER_ADMIN"] = "super_admin";
    SystemRole["ORG_ADMIN"] = "org_admin";
    SystemRole["PROFESSIONAL"] = "professional";
    SystemRole["RECEPTIONIST"] = "receptionist";
    SystemRole["SUPPORT"] = "support";
})(SystemRole || (exports.SystemRole = SystemRole = {}));
var ProfessionalSpecialty;
(function (ProfessionalSpecialty) {
    ProfessionalSpecialty["NUTRITIONIST"] = "nutritionist";
    ProfessionalSpecialty["PSYCHOLOGIST"] = "psychologist";
    ProfessionalSpecialty["PHYSIOTHERAPIST"] = "physiotherapist";
    ProfessionalSpecialty["DENTIST"] = "dentist";
    ProfessionalSpecialty["GENERAL_PRACTITIONER"] = "general_practitioner";
    ProfessionalSpecialty["OTHER"] = "other";
})(ProfessionalSpecialty || (exports.ProfessionalSpecialty = ProfessionalSpecialty = {}));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "scheduled";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["IN_PROGRESS"] = "in_progress";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["CANCELLED"] = "cancelled";
    AppointmentStatus["NO_SHOW"] = "no_show";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["OVERDUE"] = "overdue";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["PENDING"] = "pending";
    MessageStatus["SENT"] = "sent";
    MessageStatus["FAILED"] = "failed";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
//# sourceMappingURL=index.js.map