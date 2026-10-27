jest.mock("../services/aiAssistantTools", () => ({ definitions: [{ type: "function", name: "get_my_leave_summary" }], runTool: jest.fn(async (req, name) => name === "delete_employee" ? { error: "That data action is not available." } : { leaveBalance: { casual: 8 }, requests: { pending: 1 } }) }));
const aiAssistant = require("../services/aiAssistantService");
const { definitions, runTool } = require("../services/aiAssistantTools");
const controller = require("../controllers/aiAssistantController");

const response = () => {
  const res = { statusCode: 200, body: null };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((body) => { res.body = body; return res; });
  return res;
};

describe("AI Assistant safeguards", () => {
  const saved = process.env.OPENAI_API_KEY;
  const savedEnabled = process.env.AI_ASSISTANT_ENABLED;
  const originalFetch = global.fetch;
  beforeEach(() => { delete process.env.AI_ASSISTANT_ENABLED; jest.clearAllMocks(); });
  afterEach(() => { if (saved === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = saved; if (savedEnabled === undefined) delete process.env.AI_ASSISTANT_ENABLED; else process.env.AI_ASSISTANT_ENABLED = savedEnabled; global.fetch = originalFetch; });

  test("is unavailable without a server-side API key", () => {
    delete process.env.OPENAI_API_KEY;
    expect(aiAssistant.enabled()).toBe(false);
  });

  test("only exposes registered read-only tools", async () => {
    expect(definitions.map((item) => item.name)).toContain("get_my_leave_summary");
    await expect(runTool({}, "delete_employee", {})).resolves.toEqual({ error: "That data action is not available." });
  });

  test("rejects invalid chat request before contacting a provider", async () => {
    const res = response();
    await controller.chat({ body: { message: "", history: [] } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("returns a clearly labelled local summary without a key", async () => {
    delete process.env.OPENAI_API_KEY;
    const res = response();
    await controller.chat({ body: { message: "Show my leave balance", history: [] }, user: { _id: "user" }, userRole: "employee" }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.message).toContain("Local assistant");
    expect(res.body.data.message).toContain("casual: 8");
  });

  test("does not expose provider failures", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error("network details"));
    const res = response();
    await controller.chat({ body: { message: "Show my leave balance", history: [] }, user: { _id: "user" }, userRole: "employee" }, res);
    global.fetch = originalFetch;
    expect(res.statusCode).toBe(502);
    expect(res.body.code).toBe("AI_NETWORK_ERROR");
    expect(res.body.message).not.toContain("network details");
  });
});

 describe("AI configuration and provider protocol", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };
  afterEach(() => { global.fetch = originalFetch; process.env = { ...originalEnv }; });
  test("explicit disable takes precedence over fallback", async () => {
    process.env.AI_ASSISTANT_ENABLED = "false";
    expect(aiAssistant.status()).toMatchObject({ enabled: false, code: "AI_DISABLED" });
    await expect(aiAssistant.ask({}, "hello")).rejects.toMatchObject({ code: "AI_DISABLED" });
  });
  test("missing key advertises local mode", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_ASSISTANT_ENABLED;
    expect(aiAssistant.status()).toMatchObject({ enabled: true, mode: "local", code: "AI_KEY_MISSING" });
  });
  test("unsupported local queries do not call tools", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_ASSISTANT_ENABLED;
    runTool.mockClear();
    expect(await aiAssistant.ask({}, "Write a poem")).toContain("cannot answer other questions");
    expect(runTool).not.toHaveBeenCalled();
  });
  test.each([[401, {}, "AI_AUTH_FAILED"], [429, { code: "insufficient_quota" }, "AI_QUOTA_EXCEEDED"], [429, {}, "AI_RATE_LIMITED"], [404, {}, "AI_INVALID_CONFIG"]])("classifies HTTP %s safely", async (status, error, code) => {
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.AI_ASSISTANT_ENABLED;
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status, json: async () => ({ error }) });
    await expect(aiAssistant.ask({}, "hello")).rejects.toMatchObject({ code });
  });
  test("extracts REST text and replays tool context with storage disabled", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.AI_ASSISTANT_ENABLED;
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ output: [{ type: "function_call", name: "get_my_leave_summary", arguments: "{}", call_id: "call1" }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ output: [{ type: "message", content: [{ type: "output_text", text: "You have 8 days." }] }] }) });
    expect(await aiAssistant.ask({}, "My leave")).toBe("You have 8 days.");
    const body = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(body.store).toBe(false);
    expect(body.previous_response_id).toBeUndefined();
    expect(body.input).toEqual(expect.arrayContaining([expect.objectContaining({ type: "function_call_output", call_id: "call1" })]));
  });
  test("classifies timeouts", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.AI_ASSISTANT_ENABLED;
    global.fetch = jest.fn().mockRejectedValue(Object.assign(new Error("private"), { name: "AbortError" }));
    await expect(aiAssistant.ask({}, "hello")).rejects.toMatchObject({ code: "AI_TIMEOUT" });
  });
});
