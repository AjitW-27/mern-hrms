const mongoose = require("mongoose");

const meetingRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true, trim: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startTime: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

meetingRoomSchema.index({ isActive: 1, startTime: 1 });

module.exports = mongoose.models.MeetingRoom || mongoose.model("MeetingRoom", meetingRoomSchema);
