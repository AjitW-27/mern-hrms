// Local headless QA. Reads existing records; performs no CRUD or paid AI calls.
const fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const base = path.resolve(__dirname, ".."), out = path.join(base, ".tmp", "ui-review");
fs.mkdirSync(out, { recursive: true });
const req = moduleName => require(require.resolve(moduleName, { paths: [path.join(base, "backend")] }));
const dotenv = req("dotenv"), mongoose = req("mongoose"), jwt = req("jsonwebtoken");
dotenv.config({ path: path.join(base, "backend/.env") });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(url) { for (let i = 0; i < 100; i++) { try { const response = await fetch(url); if (response.ok) return response; } catch {} await pause(300); } throw new Error("QA endpoint unavailable: " + url); }
const children = [];
let socket;
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require(path.join(base, "backend/models/userModel"));
  const Role = require(path.join(base, "backend/models/roleModel"));
  const account = await User.findOne({ isActive: { $ne: false }, role: { $in: ["admin", "hr", "superadmin", "super_admin"] } }).select("name email role avatar employeeRef").lean();
  if (!account) throw new Error("No active local admin account available for read-only QA.");
  const role = await Role.findOne({ $or: [{ code: account.role }, { name: account.role }] }).lean({ flattenMaps: true });
  const token = jwt.sign({ id: String(account._id) }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const user = { ...account, id: String(account._id), rolePermissions: role?.permissions || null };
  await mongoose.disconnect();
  const log = fs.openSync(path.join(out, "server.log"), "a");
  children.push(spawn(process.execPath, ["server.js"], { cwd: path.join(base, "backend"), env: { ...process.env, NODE_ENV: "test", HOST: "127.0.0.1", PORT: "5056", CLIENT_URL: "http://127.0.0.1:4175", OPENAI_API_KEY: "" }, stdio: ["ignore", log, log], windowsHide: true }));
  children.push(spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4175"], { cwd: path.join(base, "frontend"), env: { ...process.env, VITE_API_URL: "/api", VITE_DEV_API_TARGET: "http://127.0.0.1:5056" }, stdio: ["ignore", log, log], windowsHide: true }));
  await Promise.all([until("http://127.0.0.1:5056/health"), until("http://127.0.0.1:4175")]);
  const browser = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  children.push(spawn(browser, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--remote-debugging-port=9229", "--user-data-dir=" + path.join(out, "browser-profile"), "about:blank"], { stdio: "ignore", windowsHide: true }));
  const targets = await (await until("http://127.0.0.1:9229/json/list")).json();
  const target = targets.find(item => item.type === "page");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0; const pending = new Map(), errors = [], networkErrors = [], consoleErrors = [];
  socket.onmessage = event => { const data = JSON.parse(event.data); if (data.id) { const request = pending.get(data.id); pending.delete(data.id); if (data.error) request?.reject(new Error(data.error.message)); else request?.resolve(data.result); } else if (data.method === "Runtime.exceptionThrown") errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text); else if (data.method === "Network.responseReceived" && data.params.response.status >= 400) networkErrors.push({ url: data.params.response.url.replace(/\?.*$/, ""), status: data.params.response.status }); };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params })); });
  const evaluate = async expression => { const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || "Browser evaluation failed"); return result.result.value; };
  const waitFor = async selector => { for (let attempt = 0; attempt < 100; attempt++) { if (await evaluate("!!document.querySelector(" + JSON.stringify(selector) + ")")) return; await pause(200); } throw new Error("UI element did not render: " + selector); };
  const click = async selector => { await waitFor(selector); await evaluate("document.querySelector(" + JSON.stringify(selector) + ").click()"); await pause(150); };
  await cdp("Page.enable"); await cdp("Runtime.enable"); await cdp("Network.enable");
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: "localStorage.setItem('hrms_token'," + JSON.stringify(token) + ");localStorage.setItem('token'," + JSON.stringify(token) + ");localStorage.setItem('hrms_user'," + JSON.stringify(JSON.stringify(user)) + ");" });
  socket.addEventListener("message", event => { const data = JSON.parse(event.data); if (data.method === "Runtime.consoleAPICalled" && data.params.type === "error") consoleErrors.push(data.params.args[0]?.value || data.params.args[0]?.description || "Console error"); });
  const report = { generatedAt: new Date().toISOString(), viewports: [], runtimeErrors: errors, networkErrors, consoleErrors, assertions: {} };
  for (const width of [1440, 1024, 768, 390]) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    await cdp("Page.navigate", { url: "http://127.0.0.1:4175/dashboard" });
    for (let attempt = 0; attempt < 80; attempt++) { await pause(300); if (await evaluate("!!document.querySelector('.smart-dashboard') && !document.querySelector('.smart-stat .MuiSkeleton-root')")) break; }
    await pause(1800);
    report.viewports.push(await evaluate("({width:innerWidth, dashboard:!!document.querySelector('.smart-dashboard'), cards:document.querySelectorAll('.smart-card').length, horizontalOverflow:document.documentElement.scrollWidth>innerWidth, mainOverflow:[...document.querySelectorAll('main')].some(e=>e.scrollWidth>e.clientWidth), cardRadius:document.querySelector('.smart-card')&&getComputedStyle(document.querySelector('.smart-card')).borderRadius})"));
    const screenshot = await cdp("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(out, "dashboard-" + width + ".png"), Buffer.from(screenshot.data, "base64"));
    if (width === 1440) {
      const height = await evaluate("document.querySelector('main').scrollHeight");
      for (let top = 900, section = 1; top < height; top += 900, section++) {
        await evaluate("document.querySelector('main').scrollTop=" + top); await pause(350);
        fs.writeFileSync(path.join(out, "dashboard-1440-section-" + section + ".png"), Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
      }
    }
  }
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp("Page.navigate", { url: "http://127.0.0.1:4175/dashboard/employees" }); await pause(2500);
  await waitFor(".smart-table");
  report.assertions.employeeTable = await evaluate("({table:!!document.querySelector('.smart-table'), rows:document.querySelectorAll('.smart-table tbody tr').length, overflow:document.documentElement.scrollWidth>innerWidth, columns:[...document.querySelectorAll('.smart-table th')].map(e=>e.textContent)})");
  fs.writeFileSync(path.join(out, "employees-1440.png"), Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
  await click('[aria-label="Toggle navigation"]'); await pause(250);
  report.assertions.sidebarCollapsedOffset = await evaluate("Math.round(document.querySelector('main').getBoundingClientRect().left)");
  await click('[aria-label="Toggle navigation"]'); await pause(250);
  report.assertions.sidebarExpandedOffset = await evaluate("Math.round(document.querySelector('main').getBoundingClientRect().left)");
  await evaluate("document.querySelector('input[placeholder=\"Search employees\"]').focus()"); await cdp("Input.insertText", { text: "no-match-ui-qa" }); await pause(900);
  report.assertions.employeeSearchEmptyState = await evaluate("document.body.innerText.includes('No employees match these filters.')");
  await cdp("Page.navigate", { url: "http://127.0.0.1:4175/dashboard/employees" }); await pause(1400);
  await click('[aria-label="Employee grid view"]');
  report.assertions.employeeGridToggle = await evaluate("!document.querySelector('.smart-table')");
  await click('[aria-label="Employee list view"]');
  report.assertions.employeeListToggle = await evaluate("!!document.querySelector('.smart-table')");
  report.employeeViewports = [];
  for (const width of [1440, 1024, 768, 390]) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    await pause(350);
    report.employeeViewports.push(await evaluate("({width:innerWidth,pageOverflow:document.documentElement.scrollWidth>innerWidth,mainOverflow:document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth,tableScrolls:document.querySelector('.smart-table-scroll').scrollWidth>document.querySelector('.smart-table-scroll').clientWidth,columns:document.querySelectorAll('.smart-table th').length})"));
    fs.writeFileSync(path.join(out, "employees-" + width + ".png"), Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
  }
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp("Page.navigate", { url: "http://127.0.0.1:4175/dashboard/employees" }); await pause(1400);
  await click('[aria-label="Open AI HR Assistant"]'); await pause(800);
  report.assertions.assistantFabHidden = await evaluate("!document.querySelector('[aria-label=\"Open AI HR Assistant\"]')");
  await evaluate("[...document.querySelectorAll('button')].find(e=>e.textContent==='Show my leave balance').click()"); await pause(1200);
  report.assertions.assistant = await evaluate("({reply:document.body.innerText.includes('Which employee?')||document.body.innerText.includes('Local assistant - My leave'), userBubble:[...document.querySelectorAll('.MuiTypography-body2')].filter(e=>e.textContent==='Show my leave balance').map(e=>({text:getComputedStyle(e).color,background:getComputedStyle(e.parentElement).backgroundColor}))})");
  fs.writeFileSync(path.join(out, "assistant-1440.png"), Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(report, null, 2));
  await cdp("Storage.clearDataForOrigin", { origin: "http://127.0.0.1:4175", storageTypes: "local_storage" });
  console.log(JSON.stringify(report));
}
main().catch(error => { console.error("Visual QA: " + error.message); process.exitCode = 1; }).finally(async () => { socket?.close(); children.reverse().forEach(child => child.kill()); await mongoose.disconnect(); });
