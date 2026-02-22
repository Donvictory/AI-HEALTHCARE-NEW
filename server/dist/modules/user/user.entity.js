"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyHealthHistory = exports.HealthCondition = exports.Gender = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["DOCTOR"] = "DOCTOR";
    UserRole["PATIENT"] = "PATIENT";
    UserRole["USER"] = "USER";
})(UserRole || (exports.UserRole = UserRole = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
var HealthCondition;
(function (HealthCondition) {
    HealthCondition["NONE"] = "NONE";
    HealthCondition["HYPERTENSION"] = "HYPERTENSION";
    HealthCondition["DIABETES"] = "DIABETES";
    HealthCondition["ASTHMA"] = "ASTHMA";
    HealthCondition["HEART_DISEASE"] = "HEART DISEASE";
    HealthCondition["MALARIA"] = "MALARIA";
    HealthCondition["SICKLE_CELL"] = "SICKLE CELL";
    HealthCondition["STROKE"] = "STROKE";
    HealthCondition["CANCER"] = "CANCER";
})(HealthCondition || (exports.HealthCondition = HealthCondition = {}));
var FamilyHealthHistory;
(function (FamilyHealthHistory) {
    FamilyHealthHistory["NONE"] = "NONE";
    FamilyHealthHistory["HYPERTENSION"] = "HYPERTENSION";
    FamilyHealthHistory["DIABETES"] = "DIABETES";
    FamilyHealthHistory["ASTHMA"] = "ASTHMA";
    FamilyHealthHistory["HEART_DISEASE"] = "HEART DISEASE";
    FamilyHealthHistory["MALARIA"] = "MALARIA";
    FamilyHealthHistory["SICKLE_CELL"] = "SICKLE CELL";
    FamilyHealthHistory["STROKE"] = "STROKE";
    FamilyHealthHistory["CANCER"] = "CANCER";
})(FamilyHealthHistory || (exports.FamilyHealthHistory = FamilyHealthHistory = {}));
