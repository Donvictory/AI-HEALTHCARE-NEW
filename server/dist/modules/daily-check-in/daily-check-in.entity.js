"use strict";
// ─── Enums ───────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifestyleCheck = exports.Symptom = exports.CurrentHealthStatus = void 0;
var CurrentHealthStatus;
(function (CurrentHealthStatus) {
    CurrentHealthStatus["EXCELLENT"] = "EXCELLENT";
    CurrentHealthStatus["GOOD"] = "GOOD";
    CurrentHealthStatus["FAIR"] = "FAIR";
})(CurrentHealthStatus || (exports.CurrentHealthStatus = CurrentHealthStatus = {}));
var Symptom;
(function (Symptom) {
    Symptom["FEVER"] = "FEVER";
    Symptom["HEADACHE"] = "HEADACHE";
    Symptom["FATIGUE"] = "FATIGUE";
    Symptom["COUGH"] = "COUGH";
    Symptom["SORE_THROAT"] = "SORE_THROAT";
    Symptom["SHORTNESS_OF_BREATH"] = "SHORTNESS_OF_BREATH";
    Symptom["BODY_ACHES"] = "BODY_ACHES";
    Symptom["NAUSEA"] = "NAUSEA";
    Symptom["VOMITING"] = "VOMITING";
    Symptom["DIZZINESS"] = "DIZZINESS";
    Symptom["RASH"] = "RASH";
    Symptom["CHEST_PAIN"] = "CHEST_PAIN";
    Symptom["ABDOMINAL_PAIN"] = "ABDOMINAL_PAIN";
    Symptom["LOSS_OF_APPETITE"] = "LOSS_OF_APPETITE";
    Symptom["INSOMNIA"] = "INSOMNIA";
    Symptom["ANXIETY"] = "ANXIETY";
    Symptom["DEPRESSION"] = "DEPRESSION";
    Symptom["JOINT_PAIN"] = "JOINT_PAIN";
    Symptom["BACK_PAIN"] = "BACK_PAIN";
    Symptom["OTHER"] = "OTHER";
})(Symptom || (exports.Symptom = Symptom = {}));
var LifestyleCheck;
(function (LifestyleCheck) {
    LifestyleCheck["DRANK_LAST_NIGHT"] = "DRANK_LAST_NIGHT";
    LifestyleCheck["SMOKED_TODAY"] = "SMOKED_TODAY";
    LifestyleCheck["SKIPPED_MEALS"] = "SKIPPED_MEALS";
    LifestyleCheck["NO_EXERCISE"] = "NO_EXERCISE";
})(LifestyleCheck || (exports.LifestyleCheck = LifestyleCheck = {}));
