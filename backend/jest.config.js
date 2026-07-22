module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["controllers/**/*.js", "middleware/**/*.js", "models/**/*.js", "routes/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/"]
};
