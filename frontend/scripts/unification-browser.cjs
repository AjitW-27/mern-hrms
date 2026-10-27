// Local headless QA. Reads existing records; performs no CRUD or paid AI calls.
const fs = require("fs"), path = require("path"), { spawn } = require("child_process");
const base = path.resolve(__dirname, "../.."), out = path.join(base, ".tmp", "frontend-unification", "ui");
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
  children.push(spawn(browser, ["--headless=new", "--disable-gpu", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--remote-debugging-port=9229", "--user-data-dir=" + path.join(out, "browser-profile-" + Date.now()), "about:blank"], { stdio: "ignore", windowsHide: true }));
  const targets = await (await until("http://127.0.0.1:9229/json/list")).json();
  const target = targets.find(item => item.type === "page");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0; const pending = new Map(), errors = [], networkErrors = [], consoleErrors = [];
  socket.onmessage = event => { const data = JSON.parse(event.data); if (data.id) { const request = pending.get(data.id); pending.delete(data.id); if (data.error) request?.reject(new Error(data.error.message)); else request?.resolve(data.result); } else if (data.method === "Runtime.exceptionThrown") { const error = data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text; errors.push(error); fs.writeFileSync(path.join(out,"runtime-errors.json"),JSON.stringify(errors,null,2)); } else if (data.method === "Network.responseReceived" && data.params.response.status >= 400) networkErrors.push({ url: data.params.response.url.replace(/\?.*$/, ""), status: data.params.response.status }); };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const requestId = ++id; const timer = setTimeout(() => { pending.delete(requestId); reject(new Error("CDP request timed out: " + method)); }, 15000); pending.set(requestId, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } }); socket.send(JSON.stringify({ id: requestId, method, params })); });
  const evaluate = async expression => { const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || "Browser evaluation failed"); return result.result.value; };
  const waitFor = async selector => { for (let attempt = 0; attempt < 100; attempt++) { if (await evaluate("!!document.querySelector(" + JSON.stringify(selector) + ")")) return; await pause(200); } throw new Error("UI element did not render: " + selector); };
  const click = async selector => { await waitFor(selector); await evaluate("document.querySelector(" + JSON.stringify(selector) + ").click()"); await pause(150); };
  await cdp("Page.enable"); await cdp("Runtime.enable"); await cdp("Network.enable"); await cdp("Page.bringToFront"); await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: "localStorage.setItem('hrms_token'," + JSON.stringify(token) + ");localStorage.setItem('token'," + JSON.stringify(token) + ");localStorage.setItem('hrms_user'," + JSON.stringify(JSON.stringify(user)) + ");" });
  socket.addEventListener("message", event => { const data = JSON.parse(event.data); if (data.method === "Runtime.consoleAPICalled" && data.params.type === "error") consoleErrors.push(data.params.args.map(arg=>arg.value||arg.description||"").join(" ")); });
  const report = { generatedAt: new Date().toISOString(), viewports: [], runtimeErrors: errors, networkErrors, consoleErrors, assertions: {} };
  for (const width of (process.argv.includes("--admin") ? [1440, 390] : [1440, 1024, 768, 390])) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    for (const route of (process.argv.includes("--admin") ? ["/admin/users", "/admin/roles", "/audit-logs"] : ["", "/employees", "/projects", "/leave", "/attendance", "/reports", ...(!process.argv.includes("--smoke") && width === 1440 ? ["/assets", "/training", "/onboarding", "/expenses", "/payroll", "/performance", "/goals", "/departments"] : [])])) {
      await cdp("Page.navigate", { url: "http://127.0.0.1:4175/dashboard" + route }); await pause(2500);
      await waitFor("main"); for(let i=0;i<50;i++){if(await evaluate("!document.querySelector('.MuiSkeleton-root')"))break;await pause(200);}
      await pause(300);
      report.viewports.push(await evaluate(`({route:location.pathname,width:innerWidth,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,mainOverflow:document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth,table:!!document.querySelector('.ui-table'),empty:!!document.querySelector('[data-ui=empty-state]'),radius:document.querySelector('[data-ui=card]')&&getComputedStyle(document.querySelector('[data-ui=card]')).borderRadius,desktopHamburger:innerWidth>=768&&!!document.querySelector('[aria-label="Open navigation"]')})`));
      fs.writeFileSync(path.join(out,process.argv.includes("--admin") ? "admin-results.json" : "results.json"),JSON.stringify(report,null,2));
      fs.writeFileSync(path.join(out, (route.slice(1).replaceAll("/","-")||"dashboard")+"-"+width+".png"), Buffer.from((await cdp("Page.captureScreenshot",{format:"png"})).data,"base64"));
    }
  }
  await cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await cdp("Page.navigate",{url:"http://127.0.0.1:4175/dashboard/employees"}); await waitFor("[data-ui=sidebar]"); await pause(300);
  const initial = await evaluate("({left:document.querySelector('main').getBoundingClientRect().left,width:document.querySelector('[data-ui=sidebar]').getBoundingClientRect().width})");
  await cdp("Input.dispatchMouseEvent",{type:"mouseMoved",x:35,y:150}); await pause(400);
  const expanded = await evaluate("({left:document.querySelector('main').getBoundingClientRect().left,width:document.querySelector('[data-ui=sidebar]').getBoundingClientRect().width})");
  await cdp("Input.dispatchMouseEvent",{type:"mouseMoved",x:600,y:150}); await pause(650);
  const collapsed = await evaluate("({left:document.querySelector('main').getBoundingClientRect().left,width:document.querySelector('[data-ui=sidebar]').getBoundingClientRect().width})");
  report.assertions.sidebar={initial,expanded,collapsed};
  await cdp("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9}); await cdp("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await evaluate("document.querySelector('nav [aria-label=Employees]').focus()"); await pause(350);
  report.assertions.keyboardExpanded=await evaluate("document.querySelector('[data-ui=sidebar]').getAttribute('aria-expanded')==='true'");
  await cdp("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27}); await evaluate("document.activeElement.blur()");await pause(450);
  if(process.argv.includes("--admin")) {
    await cdp("Page.navigate",{url:"http://127.0.0.1:4175/dashboard/leave"});await waitFor(".MuiTabs-root");await pause(1500);await evaluate("document.querySelector('[role=combobox]').dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}))");await waitFor('[role="option"][data-value]:not([data-value=""])');await evaluate("[...document.querySelectorAll('[role=option]')].find(element=>element.getAttribute('data-value')).click()");await pause(1600);report.assertions.adminEmployeeSelection=await evaluate("!!document.querySelector('[data-ui=data-table]')&&!document.body.innerText.includes('Your account is not linked')");
    await cdp("Page.navigate",{url:"http://127.0.0.1:4175/dashboard/employees"});await waitFor("[data-ui=data-table]");await pause(1800);
  }
  report.assertions.branding=await evaluate("({title:document.title,logo:!!document.querySelector('nav img'),favicon:document.querySelector('link[rel=icon]').href.startsWith('data:image/svg+xml')})");
  report.assertions.themeBefore=await evaluate("getComputedStyle([...document.querySelectorAll('button')].find(e=>e.textContent==='Add Employee')).backgroundColor");
  await evaluate("import('/src/strore/themeStore.js').then(async ({default:store})=>{ const {paletteTokens}=await import('/src/theme/designTokens.js'); store.getState().updateTokens({primary:paletteTokens.info}); })"); await pause(350);
  report.assertions.themeAfter=await evaluate("({button:getComputedStyle([...document.querySelectorAll('button')].find(e=>e.textContent==='Add Employee')).backgroundColor,sidebar:getComputedStyle(document.querySelector('nav [aria-current=page] .MuiListItemIcon-root')).color,variable:getComputedStyle(document.documentElement).getPropertyValue('--primary')})");
  await evaluate("import('/src/strore/themeStore.js').then(({default:store})=>store.getState().resetTheme())");
  await cdp("Fetch.enable",{patterns:[{urlPattern:"*/api/ai-assistant/chat",requestStage:"Request"}]});
  socket.addEventListener("message",event=>{const item=JSON.parse(event.data);if(item.method==="Fetch.requestPaused"&&item.params.request.url.includes("/ai-assistant/chat")) cdp("Fetch.fulfillRequest",{requestId:item.params.requestId,responseCode:200,responseHeaders:[{name:"Content-Type",value:"application/json"}],body:Buffer.from(JSON.stringify({success:true,data:{message:"QA controlled reply; no provider request executed."}})).toString("base64")});});
  await click('[aria-label="Open AI HR Assistant"]'); await pause(800);
  report.assertions.assistantFabHidden=await evaluate("!document.querySelector('[aria-label=\"Open AI HR Assistant\"]')");
  await evaluate("[...document.querySelectorAll('button')].find(e=>e.textContent==='Show my leave balance').click()"); await pause(600);
  report.assertions.userBubble=await evaluate("(()=>{const element=[...document.querySelectorAll('.MuiTypography-body2')].find(e=>e.textContent==='Show my leave balance');return element&&{text:getComputedStyle(element).color,background:getComputedStyle(element.parentElement).backgroundColor}})()");
  await cdp("Fetch.disable");
  fs.writeFileSync(path.join(out,"assistant.png"),Buffer.from((await cdp("Page.captureScreenshot",{format:"png"})).data,"base64"));
  await click('[aria-label="Close assistant"]');
  // Test empty and failed API responses in the browser; fixtures are only in this QA runner.
  await cdp("Fetch.enable",{patterns:[{urlPattern:"*/api/projects*",requestStage:"Request"}]});
  let apiError=false;
  socket.addEventListener("message",event=>{const item=JSON.parse(event.data);if(item.method==="Fetch.requestPaused") cdp("Fetch.fulfillRequest",{requestId:item.params.requestId,responseCode:apiError?503:200,responseHeaders:[{name:"Content-Type",value:"application/json"}],body:Buffer.from(JSON.stringify(apiError?{message:"QA simulated service outage"}:{success:true,data:[],total:0})).toString("base64")});});
  await cdp("Page.navigate",{url:"http://127.0.0.1:4175/dashboard/projects"});await waitFor("[data-ui=data-table]"); await pause(1600);
  report.assertions.emptyTable=await evaluate("({empty:!!document.querySelector('[data-ui=empty-state]'),height:document.querySelector('[data-ui=data-table]').getBoundingClientRect().height,footer:!!document.querySelector('[data-ui=table-footer]'),addDisabled:[...document.querySelectorAll('button')].find(e=>e.textContent==='Add Project')?.disabled,range:document.querySelector('[data-ui=table-footer]').textContent,emptyBounds:(()=>{const r=document.querySelector('[data-ui=empty-state]').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}})()})");
  apiError=true;await click('[aria-label="Refresh records"]');await pause(600);
  report.assertions.errorRetry=await evaluate("document.body.innerText.includes('QA simulated service outage')&&[...document.querySelectorAll('button')].some(e=>e.textContent==='Retry')");
  apiError=false;await evaluate("[...document.querySelectorAll('button')].find(e=>e.textContent==='Retry').click()");await pause(500);
  report.assertions.retryRecovered=await evaluate("!document.body.innerText.includes('QA simulated service outage')&&!!document.querySelector('[data-ui=empty-state]')");
  await cdp("Fetch.disable");
  report.assertions.launcherOverlap = await evaluate("(()=>{const launcher=document.querySelector('[aria-label=\"Open AI HR Assistant\"]').getBoundingClientRect();return [...document.querySelectorAll('[data-ui=table-footer]')].some(element=>{const footer=element.getBoundingClientRect();return launcher.left<footer.right&&launcher.right>footer.left&&launcher.top<footer.bottom&&launcher.bottom>footer.top})})()");
  fs.writeFileSync(path.join(out,"results.json"),JSON.stringify(report,null,2));
  const assert = require("node:assert/strict"); assert.equal(report.runtimeErrors.length,0); assert.equal(report.consoleErrors.length,0); assert.ok(report.viewports.every(page=>!page.overflow&&!page.mainOverflow&&page.h1===1&&!page.desktopHamburger)); assert.equal(report.assertions.sidebar.initial.left,report.assertions.sidebar.expanded.left); assert.equal(report.assertions.sidebar.expanded.width,260); assert.ok(Math.abs(report.assertions.sidebar.collapsed.width-72)<1); assert.equal(report.assertions.keyboardExpanded,true); assert.notEqual(report.assertions.themeBefore,report.assertions.themeAfter.button); assert.equal(report.assertions.themeAfter.button,report.assertions.themeAfter.sidebar); assert.equal(report.assertions.assistantFabHidden,true); assert.equal(report.assertions.userBubble.text,"rgb(255, 255, 255)"); assert.equal(report.assertions.launcherOverlap,false); assert.equal(report.assertions.emptyTable.addDisabled,false); assert.equal(report.assertions.errorRetry,true); assert.equal(report.assertions.retryRecovered,true);
  await cdp("Storage.clearDataForOrigin",{origin:"http://127.0.0.1:4175",storageTypes:"local_storage"});
  console.log(JSON.stringify({viewports:report.viewports.length,runtimeErrors:report.runtimeErrors,consoleErrors:report.consoleErrors,assertions:report.assertions}));
}
main().catch(error=>{console.error("Visual QA: "+error.stack);process.exitCode=1;}).finally(async()=>{socket?.close();children.reverse().forEach(child=>child.kill());await mongoose.disconnect();});
