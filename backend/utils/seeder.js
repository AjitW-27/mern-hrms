const bootstrap = require("./bootstrap");

(async () => {
  try {
    await bootstrap();
    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
})();
