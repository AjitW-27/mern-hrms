const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Enterprise HRMS API",
      version: "2.2.0",
      description: "Authentication, RBAC, employee lifecycle, attendance, leave, payroll, recruitment, onboarding, assets, expenses, training, performance, reports, notifications, and audit APIs."
    },
    servers: [{ url: "/api", description: "Current server" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login and receive access and refresh tokens",
          responses: { 200: { description: "Login successful" } }
        }
      },
      "/auth/refresh-token": {
        post: {
          tags: ["Authentication"],
          summary: "Rotate refresh token and issue a new access token",
          responses: { 200: { description: "Token refreshed" } }
        }
      },
      "/users": {
        get: { tags: ["Users"], summary: "List users", responses: { 200: { description: "Users" } } },
        post: { tags: ["Users"], summary: "Create user", responses: { 201: { description: "Created" } } }
      },
      "/organizations": {
        get: { tags: ["Organization"], summary: "List organizations", responses: { 200: { description: "Organizations" } } },
        post: { tags: ["Organization"], summary: "Create organization", responses: { 201: { description: "Created" } } }
      },
      "/enterprise/recruitment/jobs": {
        get: { tags: ["Recruitment"], summary: "List jobs", responses: { 200: { description: "Jobs" } } },
        post: { tags: ["Recruitment"], summary: "Create job", responses: { 201: { description: "Created" } } }
      },
      "/enterprise/reports/hr-summary": {
        get: { tags: ["Reports"], summary: "HR summary report", responses: { 200: { description: "Report" } } }
      }
    }
  },
  apis: ["./routes/*.js", "./routes/**/*.js", "./models/*.js"]
});

module.exports = swaggerSpec;
