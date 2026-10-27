const aiAssistant = require("../services/aiAssistantService");
const logger = require("../utils/logger");
const { runTool } = require("../services/aiAssistantTools");

exports.insight = async (req, res) => {
  if (req.params.name !== "people-dates") return res.status(404).json({ success: false, message: "Insight not found" });
  try {
    const data = await runTool(req, "get_people_dates");
    if (data.error) return res.status(403).json({ success: false, message: data.error });
    return res.json({ success: true, data });
  } catch { return res.status(500).json({ success: false, message: "Upcoming dates could not be retrieved" }); }
};

exports.status = (req, res) => {
  const state = aiAssistant.status();
  logger.info(`ai.status mode=${state.mode} code=${state.code}`);
  return res.json({ success: true, data: state });
};
exports.chat = async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  if (!message || message.length > 2000 || history.length > 12) return res.status(400).json({ success: false, message: "Provide a message up to 2,000 characters and a valid short conversation history." });
  try {
    const started = Date.now();
    const reply = await aiAssistant.ask(req, message, history);
    logger.info(`ai.chat.completed mode=${aiAssistant.status().mode} durationMs=${Date.now() - started}`);
    return res.json({ success: true, data: { message: reply } });
  }
  catch (error) {
    logger.warn(`ai.chat.failed code=${error.code || "AI_DATA_ERROR"} status=${error.status || 502}`);
    return res.status(error.status || 502).json({ success: false, code: error.code || "AI_DATA_ERROR", message: error.code?.startsWith("AI_") ? error.message : "HRMS information could not be retrieved. Please try again." });
  }
};
