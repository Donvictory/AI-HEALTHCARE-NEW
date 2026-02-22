import { OpenAPIV3 } from "openapi-types";

const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "AI Healthcare API Explorer",
    version: "1.0.0",
    description: "API documentation for the AI Healthcare backend services",
  },
  servers: [
    {
      url: "https://ai-healthcare-new.vercel.app",
      description: "Production server",
    },
    {
      url: "http://localhost:8000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["USER", "ADMIN", "SUPER_ADMIN"] },
          isActive: { type: "boolean" },
          age: { type: "integer" },
          gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
          height: { type: "number" },
          weight: { type: "number" },
          state: { type: "string" },
          city: { type: "string" },
          phoneNumber: { type: "string" },
          healthConditions: { type: "array", items: { type: "string" } },
          familyHealthHistory: { type: "array", items: { type: "string" } },
          hasCompletedDailyChecks: { type: "boolean" },
          currentDailyCheckStep: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
        },
      },
      DailyCheckIn: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          hoursSlept: { type: "number", minimum: 0, maximum: 24, example: 7 },
          stressLevel: { type: "integer", minimum: 1, maximum: 10, example: 4 },
          currentMood: { type: "integer", minimum: 1, maximum: 10, example: 7 },
          dailyActivityMeasure: {
            type: "number",
            minimum: 0,
            example: 30,
            description: "Minutes of activity",
          },
          numOfWaterGlasses: { type: "integer", minimum: 0, example: 8 },
          currentHealthStatus: {
            type: "string",
            enum: ["EXCELLENT", "GOOD", "FAIR"],
            example: "GOOD",
          },
          symptomsToday: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "FEVER",
                "HEADACHE",
                "FATIGUE",
                "COUGH",
                "SORE_THROAT",
                "SHORTNESS_OF_BREATH",
                "BODY_ACHES",
                "NAUSEA",
                "VOMITING",
                "DIZZINESS",
                "RASH",
                "CHEST_PAIN",
                "ABDOMINAL_PAIN",
                "LOSS_OF_APPETITE",
                "INSOMNIA",
                "ANXIETY",
                "DEPRESSION",
                "JOINT_PAIN",
                "BACK_PAIN",
                "OTHER",
              ],
            },
            example: ["HEADACHE", "FATIGUE"],
          },
          medicalReports: {
            type: "array",
            items: { type: "string" },
            description: "Cloudinary URLs of uploaded reports",
          },
          feelingAboutReport: {
            type: "string",
            example: "I'm a bit worried about my blood pressure readings",
          },
          lifestyleChecks: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "DRANK_LAST_NIGHT",
                "SMOKED_TODAY",
                "SKIPPED_MEALS",
                "NO_EXERCISE",
              ],
            },
            example: ["NO_EXERCISE"],
          },
          anythingElse: {
            type: "string",
            example: "Feeling a bit stressed about work",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Users", description: "User management and authentication" },
    { name: "Media", description: "Media file uploads" },
    {
      name: "Daily Check-In",
      description:
        "Daily health check-in — all 5 steps submitted in one request",
    },
  ],
  paths: {
    // ─── Auth ──────────────────────────────────────────────────────
    "/api/v1/users/register": {
      post: {
        tags: ["Users"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Email already in use or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/login": {
      post: {
        tags: ["Users"],
        summary: "Login with email and password",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": { description: "Incorrect email or password" },
        },
      },
    },
    "/api/v1/users/refresh-token": {
      post: {
        tags: ["Users"],
        summary:
          "Get a new access token (reads refreshToken from httpOnly cookie automatically)",
        security: [],
        responses: {
          "200": {
            description: "New access token issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { accessToken: { type: "string" } },
                },
              },
            },
          },
          "401": { description: "Invalid or expired refresh token" },
        },
      },
    },
    "/api/v1/users/logout": {
      post: {
        tags: ["Users"],
        summary: "Logout — clears the refreshToken httpOnly cookie",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Logged out successfully" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    // ─── Protected User Routes ─────────────────────────────────────
    "/api/v1/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get my profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Profile retrieved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update my profile (onboarding details)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  age: { type: "integer" },
                  gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
                  height: { type: "number" },
                  weight: { type: "number" },
                  state: { type: "string" },
                  city: { type: "string" },
                  phoneNumber: { type: "string" },
                  healthConditions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  familyHealthHistory: {
                    type: "array",
                    items: { type: "string" },
                  },
                  hasCompletedDailyChecks: { type: "boolean" },
                  currentDailyCheckStep: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Profile updated" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    // ─── Admin Routes ──────────────────────────────────────────────
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users (Admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users retrieved" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    // ─── Media Routes ──────────────────────────────────────────────
    "/api/v1/media/upload": {
      post: {
        tags: ["Media"],
        summary: "Upload a single file",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "File uploaded successfully" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/media/upload/multiple": {
      post: {
        tags: ["Media"],
        summary: "Upload multiple files (max 10)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Files uploaded successfully" },
          "401": { description: "Unauthorized" },
        },
      },
    },

    // ─── Daily Check-In ────────────────────────────────────────────
    "/api/v1/daily-check-ins": {
      post: {
        tags: ["Daily Check-In"],
        summary: "Submit daily check-in (all 5 steps at once)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "hoursSlept",
                  "stressLevel",
                  "currentMood",
                  "dailyActivityMeasure",
                  "numOfWaterGlasses",
                  "currentHealthStatus",
                ],
                properties: {
                  hoursSlept: {
                    type: "number",
                    minimum: 0,
                    maximum: 24,
                    example: 7,
                  },
                  stressLevel: {
                    type: "integer",
                    minimum: 1,
                    maximum: 10,
                    example: 4,
                  },
                  currentMood: {
                    type: "integer",
                    minimum: 1,
                    maximum: 10,
                    example: 7,
                  },
                  dailyActivityMeasure: {
                    type: "number",
                    minimum: 0,
                    example: 30,
                    description: "Minutes",
                  },
                  numOfWaterGlasses: {
                    type: "integer",
                    minimum: 0,
                    example: 8,
                  },
                  currentHealthStatus: {
                    type: "string",
                    enum: ["EXCELLENT", "GOOD", "FAIR"],
                    example: "GOOD",
                  },
                  symptomsToday: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "FEVER",
                        "HEADACHE",
                        "FATIGUE",
                        "COUGH",
                        "SORE_THROAT",
                        "SHORTNESS_OF_BREATH",
                        "BODY_ACHES",
                        "NAUSEA",
                        "VOMITING",
                        "DIZZINESS",
                        "RASH",
                        "CHEST_PAIN",
                        "ABDOMINAL_PAIN",
                        "LOSS_OF_APPETITE",
                        "INSOMNIA",
                        "ANXIETY",
                        "DEPRESSION",
                        "JOINT_PAIN",
                        "BACK_PAIN",
                        "OTHER",
                      ],
                    },
                  },
                  medicalReports: {
                    type: "array",
                    items: { type: "string" },
                    description: "Optional: Cloudinary URLs",
                  },
                  feelingAboutReport: {
                    type: "string",
                    description: "Optional: open-ended text, normalized by LLM",
                  },
                  lifestyleChecks: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "DRANK_LAST_NIGHT",
                        "SMOKED_TODAY",
                        "SKIPPED_MEALS",
                        "NO_EXERCISE",
                      ],
                    },
                  },
                  anythingElse: {
                    type: "string",
                    description: "Optional: open-ended text, normalized by LLM",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Check-in submitted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DailyCheckIn" },
              },
            },
          },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
        },
      },
      get: {
        tags: ["Daily Check-In"],
        summary: "Get all check-ins for the current user (newest first)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Check-ins retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    results: { type: "integer" },
                    checkIns: {
                      type: "array",
                      items: { $ref: "#/components/schemas/DailyCheckIn" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/daily-check-ins/today": {
      get: {
        tags: ["Daily Check-In"],
        summary: "Get today's check-in (null if none submitted yet)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Today's check-in or null",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DailyCheckIn" },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/daily-check-ins/{id}": {
      get: {
        tags: ["Daily Check-In"],
        summary: "Get a specific check-in by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Check-in retrieved" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Daily Check-In"],
        summary: "Update a check-in (all fields optional)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DailyCheckIn" },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Daily Check-In"],
        summary: "Delete a check-in",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Deleted" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
  },
};

export default swaggerSpec;
