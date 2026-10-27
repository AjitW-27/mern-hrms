const fs = require("fs"), path = require("path"), crypto = require("crypto");
const mongoose = require("mongoose"), express = require("express"), request = require("supertest"), jwt = require("jsonwebtoken");
const User = require("../models/userModel"), Employee = require("../models/employeeModel"), Role = require("../models/roleModel"), Leave = require("../models/leaveModule");
const { ensureDefaultRoles } = require("../utils/bootstrap");
jest.mock("../utils/emailService", () => ({ sendEmail: jest.fn().mockResolvedValue({}) }));
jest.mock("../utils/notificationHelper", () => ({ createNotification: jest.fn().mockResolvedValue([]) }));
jest.setTimeout(30000);
const envPath = path.join(__dirname, "../.env");
const configuredMongo = process.env.TEST_MONGO_URI || process.env.MONGO_URI || (fs.existsSync(envPath) ? require("dotenv").parse(fs.readFileSync(envPath)).MONGO_URI : "");
const integration = configuredMongo ? describe : describe.skip;
const dbName = "hrms_functional_qa_" + crypto.randomBytes(8).toString("hex");
const secret = "functional-qa-signing-key-not-a-production-secret";
const app = express(); app.use(express.json());
app.use("/api/auth", require("../routes/authRoutes")); app.use("/api/admin", require("../routes/adminRoutes")); app.use("/api/leaves", require("../routes/leaveRoutes")); for (const [endpoint, route] of Object.entries({ departments:"departmentRoutes",projects:"projectRoutes",assets:"assetRoutes",expenses:"expenseRoutes",training:"trainingRoutes",onboarding:"onboardingRoutes",performance:"performanceRoutes",goals:"goalsRoutes",attendance:"attendanceRoutes",payroll:"payrollRoutes",enterprise:"enterpriseRoutes" })) app.use("/api/"+endpoint,require("../routes/"+route));
app.use(require("../middleware/errorMiddleware").errorHandler);
let admin, token, sequence = 0;
const account = (prefix = "account") => ({ name: "QA " + prefix, email: prefix + (++sequence) + "@qa.invalid", mobileNo: "9000000000", password: "QaPassword!42", role: "employee" });
const employee = extra => Employee.create({ fullName: "QA Employee", email: "employee" + (++sequence) + "@qa.invalid", mobileNo: "9000000001", role: "employee", department: "QA", designation: "QA Tester", ...extra });
const auth = () => ({ Authorization: "Bearer " + token });
integration("isolated functional API checks (requires TEST_MONGO_URI or backend .env)", () => {
beforeAll(async () => {
  process.env.JWT_SECRET = secret; process.env.JWT_REFRESH_SECRET = secret + "-refresh"; process.env.CLIENT_URL = "http://localhost:5173";
  process.env.GOOGLE_CLIENT_ID = "qa-client.apps.googleusercontent.com"; process.env.GOOGLE_CLIENT_SECRET = "qa-server-only-secret";
  await mongoose.connect(configuredMongo, { dbName });
  await ensureDefaultRoles();
  admin = await User.create({ ...account("admin"), role: "admin" }); token = jwt.sign({ id: String(admin._id), role: "admin" }, secret, { expiresIn: "1h" });
});
afterEach(() => jest.restoreAllMocks());
afterAll(async () => { if (mongoose.connection.name === dbName && dbName.startsWith("hrms_functional_qa_")) await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

test("role repair is insert-only and the API returns built-in, inactive and custom DB roles", async () => {
  await Role.updateOne({ code: "manager" }, { $set: { description: "Preserve this custom change" } });
  await Role.create({ name: "qa custom", code: "qa_custom", isActive: false });
  await ensureDefaultRoles();
  expect((await Role.findOne({ code: "manager" })).description).toBe("Preserve this custom change");
  const result = await request(app).get("/api/admin/roles").set(auth()); expect(result.status).toBe(200);
  expect(result.body.data.map(role => role.code)).toEqual(expect.arrayContaining(["admin", "manager", "employee", "system", "qa_custom"]));
});
test("create employee user and save both profile references; clear optional organization without CastError", async () => {
  const profile = await employee(); const details = { ...account(), employeeRef: String(profile._id), organization: "" };
  const created = await request(app).post("/api/admin/users").set(auth()).send(details); expect(created.status).toBe(201);
  const saved = await User.findById(created.body.data._id); expect(String(saved.employeeRef)).toBe(String(profile._id)); expect(String((await Employee.findById(profile._id)).userId)).toBe(String(saved._id));
  const updated = await request(app).put("/api/admin/users/" + saved._id).set(auth()).send({ organization: "", employeeRef: "", name: "Updated QA" });
  expect(updated.status).toBe(200); expect(updated.body.data.organization).toBeNull(); expect(updated.body.data.employeeRef._id).toBe(String(profile._id));
});
test("employee email auto-match links safely, then My Leave, Apply and Cancel work with real persistence", async () => {
  const profile = await employee(); const details = { ...account(), email: profile.email };
  const result = await request(app).post("/api/admin/users").set(auth()).send(details); expect(result.status).toBe(201);
  const employeeToken = jwt.sign({ id: result.body.data._id, role: "employee" }, secret, { expiresIn: "10m" }); const employeeAuth = { Authorization: "Bearer " + employeeToken };
  const mine = await request(app).get("/api/leaves/my").set(employeeAuth); expect(mine.status).toBe(200); expect(mine.body.leaveBalance.casual).toBe(12); expect(mine.body.employeeLinked).toBe(true);
  const applied = await request(app).post("/api/leaves/apply").set(employeeAuth).send({ leaveType: "casual", fromDate: "2030-06-03", toDate: "2030-06-03", reason: "Isolated QA request" });
  expect(applied.status).toBe(201); const record = await Leave.findOne({ employee: profile._id }); expect(record.status).toBe("pending"); expect((await Employee.findById(profile._id)).leaveBalance.casual).toBe(12);
  const cancelled = await request(app).put("/api/leaves/" + record._id + "/cancel").set(employeeAuth); expect(cancelled.status).toBe(200); expect((await Leave.findById(record._id)).status).toBe("cancelled");
});
test("missing employee profile prevents a partial new account and shows a neutral empty My Leave response", async () => {
  const details = account(); const created = await request(app).post("/api/admin/users").set(auth()).send(details); expect(created.status).toBe(400); expect(await User.exists({ email: details.email })).toBeNull();
  const unlinked = await User.create(account()); const unlinkedToken = jwt.sign({ id: String(unlinked._id) }, secret);
  const result = await request(app).get("/api/leaves/my").set("Authorization", "Bearer " + unlinkedToken); expect(result.status).toBe(200); expect(result.body.employeeLinked).toBe(false); expect(result.body.message).toBe("Your account is not linked to an employee profile. Please contact HR.");
});
test("profile linking cannot steal an employee from another account", async () => {
  const owner = await User.create(account()); const profile = await employee({ userId: owner._id });
  const result = await request(app).post("/api/admin/users").set(auth()).send({ ...account(), employeeRef: String(profile._id) }); expect(result.status).toBe(409); expect(String((await Employee.findById(profile._id)).userId)).toBe(String(owner._id));
});
test("invalid organization IDs return a friendly field error and deactivate remains functional", async () => {
  const result = await request(app).put("/api/admin/users/" + admin._id).set(auth()).send({ organization: "not-an-id" }); expect(result.status).toBe(400); expect(result.body.message).not.toMatch(/BSON|Cast to/); expect(result.body.message).toMatch(/organization/);
  const user = await User.create({ ...account(), role: "manager" }); const removed = await request(app).delete("/api/admin/users/" + user._id).set(auth()); expect(removed.status).toBe(200); expect((await User.findById(user._id)).isActive).toBe(false);
});
test("users API pagination preserves totals and returns different pages", async () => {
  const first = await request(app).get("/api/admin/users?limit=1&page=1").set(auth()), second = await request(app).get("/api/admin/users?limit=1&page=2").set(auth()); expect(first.status).toBe(200); expect(first.body.total).toBeGreaterThan(1); expect(first.body.data[0]._id).not.toBe(second.body.data[0]._id);
});

const pair = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 }); const jwk = { ...pair.publicKey.export({ format: "jwk" }), kid: "qa-key", alg: "RS256" };
function googleToken(overrides = {}) { return jwt.sign({ sub: "qa-google-sub", email: admin.email, email_verified: true, ...overrides }, pair.privateKey, { algorithm: "RS256", keyid: "qa-key", issuer: "https://accounts.google.com", audience: process.env.GOOGLE_CLIENT_ID, expiresIn: "5m" }); }
function googleFetch(token) { return jest.spyOn(global, "fetch").mockImplementation(async url => String(url).endsWith("/certs") ? { ok: true, json: async () => ({ keys: [jwk] }), headers: { get: () => "max-age=300" } } : { ok: true, json: async () => ({ id_token: token }) }); }
const googleRequest = code => request(app).post("/api/auth/google").set("Origin", "http://localhost:5173").set("X-Requested-With", "XMLHttpRequest").send({ code });
test("Google configuration never exposes the server secret and missing credentials fail clearly", async () => {
  const config = await request(app).get("/api/auth/google/config"); expect(config.body.configured).toBe(true); expect(JSON.stringify(config.body)).not.toContain(process.env.GOOGLE_CLIENT_SECRET);
  const original = process.env.GOOGLE_CLIENT_SECRET; delete process.env.GOOGLE_CLIENT_SECRET; try { expect((await googleRequest("qa-code")).status).toBe(503); } finally { process.env.GOOGLE_CLIENT_SECRET = original; }
});
test("Google code exchange verifies a signed ID token and uses the existing HRMS session format", async () => {
  const fetch = googleFetch(googleToken()); const result = await googleRequest("qa-code"); expect(result.status).toBe(200); expect(result.body.user.id).toBe(String(admin._id)); expect(jwt.verify(result.body.accessToken, secret).id).toBe(String(admin._id)); expect(result.body.refreshToken).toBeTruthy();
  const body = fetch.mock.calls.find(([url]) => String(url).endsWith("/token"))[1].body; expect(body.get("redirect_uri")).toBe("http://localhost:5173"); expect(body.get("client_secret")).toBe(process.env.GOOGLE_CLIENT_SECRET);
});
test.each([{ email: "unknown-google@qa.invalid" }, { email_verified: false }, { aud: "another-client" }, { exp: 1 }])("Google rejects unknown, unverified, wrong-audience and expired identities: %o", async overrides => {
  const payload = { sub: "qa", email: admin.email, email_verified: true, iss: "https://accounts.google.com", aud: process.env.GOOGLE_CLIENT_ID, exp: Math.floor(Date.now()/1000)+300, ...overrides };
  googleFetch(jwt.sign(payload, pair.privateKey, { algorithm: "RS256", keyid: "qa-key" })); const result = await googleRequest("qa-code"); expect([401,404]).toContain(result.status); if(overrides.email) expect(result.body.message).toBe("No account found. Contact HR Administrator."); expect(result.body.accessToken).toBeUndefined();
});
test("Google rejects forged signatures and cross-origin requests", async () => {
  const other = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 }); googleFetch(jwt.sign({ sub: "qa", email: admin.email, email_verified: true }, other.privateKey, { algorithm:"RS256", keyid:"qa-key",issuer:"https://accounts.google.com",audience:process.env.GOOGLE_CLIENT_ID,expiresIn:"5m" })); expect((await googleRequest("qa-code")).status).toBe(401);
  expect((await request(app).post("/api/auth/google").set("Origin","https://untrusted.invalid").send({ code:"qa-code" })).status).toBe(403);
});
test("Google provider timeout produces a friendly failure", async () => {
  jest.spyOn(global,"fetch").mockRejectedValue(Object.assign(new Error("secret provider detail"),{name:"TimeoutError"})); const result=await googleRequest("qa-code"); expect(result.status).toBe(504); expect(result.body.message).toMatch(/timed out/); expect(result.body.message).not.toContain("secret");
});

test.each([
 ["departments", {name:"QA Department",code:"QA-DEPT"}, {description:"Updated department"}],
 ["projects", {name:"QA Project",status:"Not Started",deadline:"2030-12-01"}, {name:"Updated QA Project",status:"In Progress"}],
 ["training", {title:"QA Training",mode:"Online",status:"Planned"}, {title:"Updated QA Training"}],
 ["enterprise/shifts", {name:"QA Shift",startTime:"09:00",endTime:"18:00"}, {name:"Updated QA Shift"}],
 ["enterprise/leave-policies", {name:"QA Leave Policy",leaveType:"Casual"}, {name:"Updated QA Leave Policy"}]
])("save/list/edit/delete work: %s", async (endpoint,payload,patch) => {
 const added=await request(app).post("/api/"+endpoint).set(auth()).send(payload);expect(added.status).toBe(201);const id=added.body.data._id;
 expect((await request(app).get("/api/"+endpoint).set(auth())).status).toBe(200);
 expect((await request(app).put("/api/"+endpoint+"/"+id).set(auth()).send(patch)).status).toBe(200);
 expect((await request(app).delete("/api/"+endpoint+"/"+id).set(auth())).status).toBe(200);
});
test("asset create retains selections; editing and delete work",async()=>{
 const profile=await employee();const added=await request(app).post("/api/assets").set(auth()).send({assetName:"QA Asset",assetId:"QA-ASSET",type:"Serialized",category:"Non-IT",assignedTo:String(profile._id)});expect(added.status).toBe(201);expect(added.body.data.category).toBe("Non-IT");expect(added.body.data.status).toBe("Assigned");expect(added.body.data.assignedTo).toBe(String(profile._id));
 expect((await request(app).put("/api/assets/"+added.body.data._id).set(auth()).send({assignedTo:null,condition:"Good"})).status).toBe(200);
 expect((await request(app).delete("/api/assets/"+added.body.data._id).set(auth())).status).toBe(200);
});
test("expense apply preserves its reason and approval works",async()=>{
 const added=await request(app).post("/api/expenses/apply").set(auth()).send({amount:42,category:"Other",reason:"QA retained business reason"});expect(added.status).toBe(201);expect(added.body.data.reason).toBe("QA retained business reason");
 expect((await request(app).put("/api/expenses/"+added.body.data._id+"/status").set(auth()).send({status:"Approved"})).status).toBe(200);
});
test("payroll generation, approval and paid actions work on isolated employee records",async()=>{
 expect((await request(app).post("/api/payroll/generate").set(auth()).send({month:6,year:2030})).status).toBe(200);
 const list=await request(app).get("/api/payroll?month=6&year=2030").set(auth());expect(list.status).toBe(200);expect(list.body.data.length).toBeGreaterThan(0);const id=list.body.data[0]._id;
 expect((await request(app).put("/api/payroll/"+id+"/approve").set(auth())).status).toBe(200);
 expect((await request(app).put("/api/payroll/"+id+"/mark-paid").set(auth()).send({paymentMode:"Bank Transfer"})).status).toBe(200);
});
test("onboarding, performance, goals and attendance CRUD accept real employee references",async()=>{
 const profile=await employee();
 for(const [endpoint,payload] of [["onboarding",{employee:profile._id,templateName:"QA Template"}],["performance",{employee:profile._id,cycle:"QA Cycle",score:3}],["goals",{employee:profile._id,title:"QA Goal"}],["attendance",{employeeId:profile._id,date:"2030-06-03",status:"Present"}]]){
  const added=await request(app).post("/api/"+endpoint).set(auth()).send(payload);expect([200,201]).toContain(added.status);const id=added.body.data._id;
  expect((await request(app).get("/api/"+endpoint).set(auth())).status).toBe(200);
  expect((await request(app).put("/api/"+endpoint+"/"+id).set(auth()).send(payload)).status).toBe(200);
  expect((await request(app).delete("/api/"+endpoint+"/"+id).set(auth())).status).toBe(200);
 }
});

});
