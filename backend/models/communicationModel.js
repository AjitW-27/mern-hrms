const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    title: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessageText: { type: String, trim: true, default: "" },
    lastMessageAt: { type: Date, default: null },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, default: "" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meetingType: { type: String, enum: ["online", "in-person"], default: "online" },
    location: { type: String, trim: true, default: "" },
    meetingLink: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" },
  },
  { timestamps: true }
);

meetingSchema.index({ startAt: 1, status: 1 });
meetingSchema.index({ participants: 1, startAt: 1 });

const callLogSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    callee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["audio", "video"], default: "audio" },
    status: { type: String, enum: ["ringing", "accepted", "rejected", "missed", "ended"], default: "ringing" },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

callLogSchema.index({ caller: 1, createdAt: -1 });
callLogSchema.index({ callee: 1, createdAt: -1 });

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);
const CallLog = mongoose.models.CallLog || mongoose.model("CallLog", callLogSchema);

module.exports = { Conversation, Message, Meeting, CallLog };
