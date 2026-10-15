import React, { useState } from 'react';
import { ScreenType, Student } from '../../types/student';
import { useFeedback } from '../../context/FeedbackContext';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Loader2,
  FolderOpen,
  Plus
} from 'lucide-react';

interface FeedbackStatesScreenProps {
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
}

export const FeedbackStatesScreen: React.FC<FeedbackStatesScreenProps> = ({ onNavigate }) => {
  const { showToast, openDeleteModal, closeDeleteModal } = useFeedback();

  const [simulatedRoll, setSimulatedRoll] = useState('CS-2022-041');
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);

  // Sample student for modal demo
  const sampleStudent: Student = {
    id: -1,
    rollNumber: 'CS-2022-041',
    name: 'Aarav Sharma',
    email: 'a.sharma@college.edu',
    phone: '+1 (555) 234-8901',
    department: 'Computer Science & Engg.',
    semester: 'Semester 5',
    batch: 'Batch of 2024',
    marks: 88.5,
    enrollmentStatus: 'ACTIVE',
    standing: 'Good Standing',
    degreeTrack: 'B.Tech Computer Science',
    admissionDate: 'Aug 2021',
    advisor: 'Dr. Ramanujan',
    registeredDate: 'Oct 14, 2024',
  };

  const handleTriggerDemoModal = () => {
    openDeleteModal(sampleStudent, async () => {
      await new Promise((res) => setTimeout(res, 800));
      showToast({
        type: 'success',
        title: 'Demo completed; no data changed.',
        message: 'This is a UI demonstration and does not call the database.',
      });
      closeDeleteModal();
    });
  };

  const handlePingLiveToast = () => {
    const variants: Array<{ type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }> = [
      {
        type: 'success',
        title: 'Update Synchronized',
        message: 'Student record updated successfully.',
      },
      {
        type: 'error',
        title: '500 Internal Server Error',
        message: 'Database deadlock detected during grade synchronization in transaction ID #9482.',
      },
      {
        type: 'warning',
        title: 'Pending Grade Deadline',
        message: 'Grade entry deadline closing in 4 hours for IT Dept.',
      },
      {
        type: 'info',
        title: 'Registry Sync',
        message: 'All academic rosters aligned with Flask central server.',
      },
    ];
    const item = variants[Math.floor(Math.random() * variants.length)];
    showToast(item);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Banner */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
            UI Specs &amp; Micro-Patterns
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
          Feedback &amp; System States
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          UI demonstration only; examples do not change student records. Modals, alerts, and feedback patterns for Flask &amp; MySQL error handling.
        </p>
      </div>

      {/* Interactive Trigger Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={handleTriggerDemoModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Toggle Modal Focus (Delete Modal)</span>
        </button>

        <button
          onClick={handlePingLiveToast}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Ping Live Toast</span>
        </button>
      </div>

      {/* Section 1: High-Impact Modal Overlay Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            1. High-Impact Modal Overlay
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            Critical Action
          </span>
        </div>

        {/* Embedded Modal Showcase */}
        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Student Record?</h3>
              <p className="text-xs text-slate-500 font-mono">
                Demo student record {'{id}'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs mb-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Aarav Sharma</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-700">
                Roll: CS-2022-041
              </span>
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Semester 5 • Computer Science &amp; Engg.
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            This action is irreversible. All associated semester results, attendance records, and faculty remarks will be permanently purged from the MySQL database.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleTriggerDemoModal}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Student</span>
            </button>
            <button
              onClick={() => showToast({ type: 'info', message: 'Deletion cancelled. Data remains intact.' })}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: System Toast & Banner Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            2. System Toast &amp; Banner Alerts
          </h2>
          <span className="text-xs text-slate-500 font-medium">3 Stacked Variants</span>
        </div>

        <div className="space-y-3">
          {/* Success */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-emerald-200 rounded-lg shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Update Synchronized</span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Student record updated successfully.</p>
            </div>
          </div>

          {/* 500 Error */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-red-200 rounded-lg shadow-xs">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700">500 Internal Server Error</span>
                <span className="text-[10px] font-bold text-red-600 uppercase">RETRY</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Database deadlock detected during grade synchronization in transaction ID #9482.
              </p>
            </div>
          </div>

          {/* Pending Warning */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold text-slate-900 block">Pending Grade Deadline</span>
              <p className="text-xs text-slate-600 mt-0.5">
                Grade entry deadline closing in 4 hours for IT Dept.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Field Validation Behavior */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            3. Field Validation Behavior
          </h2>
          <span className="text-xs text-slate-500 font-mono">Reactive UX</span>
        </div>

        <div className="space-y-4 max-w-lg">
          {/* Error Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">Roll Number</label>
              <span className="text-[11px] font-bold text-red-600">Duplicate Detected</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={simulatedRoll}
                onChange={(e) => setSimulatedRoll(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm font-mono rounded-lg border border-red-400 bg-red-50/20 text-slate-900 pr-9 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <AlertTriangle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
              <span>⊗</span> Roll number {simulatedRoll} already exists in the system
            </p>
          </div>

          {/* Validated Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">College Email</label>
              <span className="text-[11px] font-bold text-emerald-600">Verified</span>
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value="a.sharma@college.edu"
                className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-emerald-400 bg-emerald-50/20 text-slate-900 pr-9 focus:outline-none"
              />
              <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <span>✓</span> Valid institutional domain (@college.edu) verified
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Loading & Conduct Empty State */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            4. Loading &amp; Conduct Empty State
          </h2>
          <span className="text-xs text-slate-500 font-mono">Async Flow</span>
        </div>

        {/* Skeleton & Loading Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Data Sync Roster (Skeleton)</span>
            <span>Simulated Pulse</span>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="h-6 bg-slate-200/70 rounded animate-pulse w-3/4"></div>
            <div className="h-6 bg-slate-200/70 rounded animate-pulse w-full"></div>
            <div className="h-6 bg-slate-200/70 rounded animate-pulse w-5/6"></div>
          </div>

          <button
            onClick={() => {
              setIsSimulatingLoading(true);
              setTimeout(() => setIsSimulatingLoading(false), 1500);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#243b64] hover:bg-[#192d4d] text-white text-xs font-semibold transition-colors"
          >
            {isSimulatingLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Simulate Loading State (Click to Test)</span>
            )}
          </button>
        </div>

        {/* Empty Disciplinary Record Box (from Image 11) */}
        <div className="mt-6 p-8 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Disciplinary Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            This student has maintained an exemplary conduct record across all active academic terms.
          </p>
          <button
            onClick={() => showToast({ type: 'info', message: 'Incident logging form opened.' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Incident</span>
          </button>
        </div>
      </div>
    </div>
  );
};
