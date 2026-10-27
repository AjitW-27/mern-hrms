import { Button as SharedButton } from "../../common/UI";
import React, { useState } from "react";
import { X, FileText, CheckCircle2 } from "lucide-react";
import execReq from "../../../lib/execReq";

export const AddRequestModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    leaveType: "casual",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("");

    try {
      await execReq.post("/leaves/apply", formData);
      setStatusMsg("Leave request submitted successfully!");
      setTimeout(() => {
        setStatusMsg("");
        onClose();
      }, 1200);
    } catch (err) {
      setStatusMsg(err?.response?.data?.message || "Unable to submit this request. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-[4px] max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[4px] bg-primary-light text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Submit Request</h3>
              <p className="text-xs text-slate-500">Apply for leave, time-off or approval</p>
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

        {statusMsg ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">{statusMsg}</h4>
            <p className="text-xs text-slate-500">You can track the status under Leave Management.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Request Type
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="earned">Earned / Annual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Reason / Remarks
              </label>
              <textarea
                rows={3}
                required
                placeholder="Brief reason for your request..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
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
                disabled={loading}
                className="px-5 py-2 rounded-[4px] bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </SharedButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddRequestModal;

