import { IUserEntity } from "../modules/user/user.entity";
import { IDailyCheckInEntity } from "../modules/daily-check-in/daily-check-in.entity";

/**
 * Maps user and check-in data to HL7 FHIR standard (Observation & Patient)
 */
export const mapToFHIR = (
  user: IUserEntity,
  checkIns: IDailyCheckInEntity[],
) => {
  const patientResource = {
    resourceType: "Patient",
    id: user._id,
    active: user.isActive,
    name: [{ text: user.name }],
    gender: user.gender?.toLowerCase() || "unknown",
    birthDate: user.age
      ? new Date(new Date().getFullYear() - user.age, 0, 1)
          .toISOString()
          .split("T")[0]
      : undefined,
    extension: [
      {
        url: "http://hl7.org/fhir/StructureDefinition/patient-onboarded",
        valueBoolean: user.isOnboarded,
      },
    ],
  };

  const observations = checkIns.map((ci) => ({
    resourceType: "Observation",
    id: ci._id,
    status: "final",
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "85354-9",
          display: "Blood pressure panel",
        },
      ], // Placeholder for a real health panel
    },
    subject: { reference: `Patient/${user._id}` },
    effectiveDateTime: ci.createdAt,
    component: [
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8967-7",
              display: "Sleep duration",
            },
          ],
        },
        valueQuantity: {
          value: ci.hoursSlept,
          unit: "hours",
          system: "http://unitsofmeasure.org",
          code: "h",
        },
      },
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "stress-level",
              display: "Stress Level",
            },
          ],
        },
        valueInteger: ci.stressLevel,
      },
    ],
  }));

  return {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      { resource: patientResource },
      ...observations.map((obs) => ({ resource: obs })),
    ],
  };
};

/**
 * Generates SBAR formatting (Situation, Background, Assessment, Recommendation)
 */
export const generateSBAR = (
  user: IUserEntity,
  recentCheckIns: IDailyCheckInEntity[],
  drift: number,
) => {
  const latestCheckIn = recentCheckIns[0];

  const situation = `Patient ${user.name} is reporting a health status of '${latestCheckIn?.currentHealthStatus || "Unknown"}' with a current resilience score indicating ${drift > 15 ? "Significant Drift" : "Normal Variance"}.`;

  const background = `${user.age}-year old ${user.gender} with a medical history of: ${user.healthConditions?.join(", ") || "No significant history"}. Family history includes: ${user.familyHealthHistory?.join(", ") || "None reported"}.`;

  const assessment = `In the last 7 days, there has been a ${drift}% negative drift from the baseline health metrics. Key stressors identified: ${latestCheckIn?.symptomsToday?.join(", ") || "None significant"}. Most recent sleep average: ${latestCheckIn?.hoursSlept} hours.`;

  const recommendation =
    drift > 20
      ? "Recommend immediate clinical review of biometric trends and psychological support for elevated stress markers."
      : "Recommend continued monitoring of daily biometrics and optimizing sleep hygiene.";

  return {
    situation,
    background,
    assessment,
    recommendation,
  };
};
