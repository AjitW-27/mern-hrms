// Uses a uniquely named disposable QA database, never the application database.
const path = require("path"), assert = require("assert/strict");
const base = path.resolve(__dirname, ".."), req = name => require(require.resolve(name, { paths: [path.join(base, "backend")] }));
const mongoose = req("mongoose"), jwt = req("jsonwebtoken"), express = req("express"), request = req("supertest");
req("dotenv").config({ path: path.join(base, "backend/.env") });
process.env.OPENAI_API_KEY = ""; process.env.AI_ASSISTANT_ENABLED = "true"; process.env.AI_PROVIDER = "openai";
const database = "hrms_assistant_qa_" + Date.now();
async function main() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: database });
  const User = require(path.join(base, "backend/models/userModel"));
  const Employee = require(path.join(base, "backend/models/employeeModel"));
  const employee = await Employee.create({ fullName: "QA Employee", email: "profile@example.invalid", mobileNo: "9999999999", department: "QA", designation: "Tester", role: "employee", leaveBalance: { casual: 7, sick: 4, earned: 9 } });
  const linked = await User.create({ name: "QA Linked", email: "linked@example.invalid", password: "local-qa-only-password", mobileNo: "9999999999", role: "employee", employeeRef: employee._id });
  const unlinked = await User.create({ name: "QA Unlinked", email: "unlinked@example.invalid", password: "local-qa-only-password", mobileNo: "9999999998", role: "employee" });
  const admin = await User.create({ name: "QA Admin", email: "admin@example.invalid", password: "local-qa-only-password", mobileNo: "9999999997", role: "admin" });
  const app = express(); app.use(express.json()); app.use("/api/ai-assistant", require(path.join(base, "backend/routes/aiAssistantRoutes")));
  const token = user => jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "5m" });
  const chat = (user, message) => request(app).post("/api/ai-assistant/chat").set("Authorization", "Bearer " + token(user)).send({ message, history: [] });
  let result = await request(app).get("/api/ai-assistant/status").set("Authorization", "Bearer " + token(linked)); assert.equal(result.body.data.mode, "local");
  result = await chat(linked, "Show my leave balance"); assert.equal(result.status, 200); assert.match(result.body.data.message, /casual: 7/);
  result = await chat(unlinked, "Show my leave balance"); assert.equal(result.status, 200); assert.match(result.body.data.message, /Please contact HR/);
  result = await chat(admin, "Show my leave balance"); assert.equal(result.status, 200); assert.match(result.body.data.message, /Which employee/);
  result = await chat(admin, "Headcount by department"); assert.equal(result.status, 200); assert.match(result.body.data.message, /Active employees: 1/);
  result = await chat(linked, "Who is on leave today?"); assert.match(result.body.data.message, /requires manager or HR permission/);
  result = await chat(linked, ""); assert.equal(result.status, 400);
  result = await request(app).post("/api/ai-assistant/chat").send({ message: "Show my leave balance" }); assert.equal(result.status, 401);
  await Employee.create({ fullName: "A QA Employee", email: "a@example.invalid", mobileNo: "9999999996", department: "QA", designation: "Developer", role: "employee" });
  await Employee.create({ fullName: "Z QA Employee", email: "z@example.invalid", mobileNo: "9999999995", department: "QA", designation: "Designer", role: "employee" });
  const { protect } = require(path.join(base, "backend/middleware/authMiddleware"));
  const { getEmployees } = require(path.join(base, "backend/controllers/employeeController"));
  app.get("/qa/employees", protect, getEmployees);
  result = await request(app).get("/qa/employees?sort=fullName&order=asc&limit=1&page=1").set("Authorization", "Bearer " + token(admin)); assert.equal(result.body.total, 3); assert.equal(result.body.data[0].fullName, "A QA Employee");
  result = await request(app).get("/qa/employees?sort=fullName&order=asc&limit=1&page=2").set("Authorization", "Bearer " + token(admin)); assert.equal(result.body.data[0].fullName, "QA Employee");
  result = await request(app).get("/qa/employees?search=Z%20QA&designation=Designer&department=QA").set("Authorization", "Bearer " + token(admin)); assert.equal(result.body.total, 1); assert.equal(result.body.data[0].fullName, "Z QA Employee");
  console.log("PASS: 11 authenticated API integration checks; assistant profile/role/error scenarios and real employee search, sorting, filtering and pagination.");
}
main().catch(error => { console.error("Assistant integration: " + error.message); process.exitCode = 1; }).finally(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.name === database && /^hrms_assistant_qa_\d+$/.test(database)) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
