import { Button as SharedButton } from "../../common/UI";
import React, { useState } from "react";
import { X, Calendar, Clock, Video, Users, CheckCircle2 } from "lucide-react";

export const AddScheduleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    meetingType: "Interview",
    date: "",
    time: "",
    attendees: "",
    meetingUrl: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) { setError("Open Communication to schedule a meeting."); return; }
    try { await onSubmit(formData); } catch (err) { setError(err.message || "Unable to save schedule."); return; }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-[4px] max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
        {error && <p role="alert">{error}</p>}{/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[4px] bg-primary-light text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add New Schedule</h3>
              <p className="text-xs text-slate-500">Plan interview or team sync</p>
            </div>
          </div>
          <SharedButton variant="ghost"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </SharedButton>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Schedule Created!</h4>
            <p className="text-xs text-slate-500">Calendar invitations dispatched to attendees.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Event Title / Role
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer Interview"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Attendee Emails
              </label>
              <input
                type="text"
                placeholder="adrian@company.com, sarah@company.com"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Virtual Meeting Link
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/meeting-id"
                value={formData.meetingUrl}
                onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <SharedButton variant="ghost"
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[4px] border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </SharedButton>
              <SharedButton variant="primary"
                type="submit"
                className="px-5 py-2 rounded-[4px] bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Create Schedule
              </SharedButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddScheduleModal;

