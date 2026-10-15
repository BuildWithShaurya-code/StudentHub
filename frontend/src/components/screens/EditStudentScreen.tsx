import React, { useState, useEffect } from 'react';
import { ScreenType, Student } from '../../types/student';
import { StudentService } from '../../services/studentService';
import { useFeedback } from '../../context/FeedbackContext';
import { evaluateMarks } from '../../utils/grading';
import {
  ArrowLeft,
  Save,
  Lock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Printer,
  ShieldCheck,
  User,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Loader2,
  Trash2,
  X
} from 'lucide-react';

interface EditStudentScreenProps {
  student: Student | null;
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
}

export const EditStudentScreen: React.FC<EditStudentScreenProps> = ({
  student,
  onNavigate,
}) => {
  const { showToast, openDeleteModal, setDeleteLoading, closeDeleteModal } = useFeedback();

  if (!student) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <h2 className="text-lg font-bold text-slate-800">No student selected for editing</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Please select a student from the directory to edit their records.
        </p>
        <button
          onClick={() => onNavigate('students')}
          className="px-4 py-2 bg-[#0a254d] text-white text-xs font-semibold rounded-lg hover:bg-[#192d4d] transition-colors"
        >
          Return to Student Directory
        </button>
      </div>
    );
  }

  return <EditStudentForm key={student.id} student={student} onNavigate={onNavigate} />;
};

const EditStudentForm: React.FC<{student: Student; onNavigate: EditStudentScreenProps['onNavigate']}> = ({student, onNavigate}) => {
  const { showToast, openDeleteModal, setDeleteLoading, closeDeleteModal } = useFeedback();
  // Pre-load form fields
  const [fullName, setFullName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone);
  const [department, setDepartment] = useState(student.department);
  const [semester, setSemester] = useState(student.semester);
  const [marks, setMarks] = useState<number | string>(student.marks);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  // Live computed assessment
  const numericMarks = Math.max(0, Math.min(100, Number(marks) || 0));
  const gradeInfo = evaluateMarks(numericMarks);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full legal name is required.';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Institutional email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Valid institutional email format required (e.g. name@college.edu).';
    }

    if (marks === '' || isNaN(Number(marks))) {
      newErrors.marks = 'Marks must be a valid number.';
    } else if (Number(marks) < 0 || Number(marks) > 100) {
      newErrors.marks = 'Marks must be between 0.0 and 100.0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please correct highlighted errors before updating.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await StudentService.update(student.id, {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        semester,
        marks: numericMarks,
      });

      setShowSavedBanner(true);
      showToast({
        type: 'success',
        title: 'Student details updated successfully.',
        message: `Student record #${updated.rollNumber} has been updated in database.`,
      });

      // Navigate back to Student Details for updated student after brief visual confirmation
      onNavigate('student-details', updated);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update student record.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    openDeleteModal(student, async () => {
      setDeleteLoading(true);
      try {
        await StudentService.delete(student.id);
        showToast({
          type: 'success',
          title: 'Student deleted successfully.',
          message: `Record #${student.rollNumber} was permanently removed.`,
        });
        closeDeleteModal();
        onNavigate('students');
      } catch (e: any) {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: e.message || 'Could not delete record.',
        });
        setDeleteLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner if saved */}
      {showSavedBanner && (
        <div className="bg-emerald-950 text-emerald-100 rounded-xl p-4 flex items-center justify-between border border-emerald-800 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm text-white">Changes saved successfully</div>
              <div className="text-xs text-emerald-300">
                Student record #{student.rollNumber} has been synchronized with the central registrar database.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSavedBanner(false)}
            className="text-emerald-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => onNavigate('students')} className="hover:text-slate-800 transition-colors">
            Students
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('student-details', student)} className="hover:text-slate-800 transition-colors">
            Edit Student
          </button>
          <span>/</span>
          <span className="font-mono font-semibold text-slate-800">{student.rollNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('student-details', student)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Details</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Dossier</span>
          </button>
        </div>
      </div>

      {/* Screen Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Student</h1>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
            FORM REF: REG-74B
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Update academic record, institutional allocation, and enrolled contact details for {student.name}.
        </p>
      </div>

      {/* Student Badge Bar (from Image 1) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0a254d] text-white flex items-center justify-center text-lg font-bold shrink-0 relative">
            {student.name.split(' ').map((n) => n[0]).join('')}
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">{student.name}</span>
              <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded">
                {student.rollNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enrolled: {student.admissionDate || 'Not recorded'} • Degree Track: {student.degreeTrack || 'Bachelor of Technology (Honors)'} • Standing: {student.standing}
            </p>
          </div>
        </div>

        {/* Quick Readout */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs divide-x divide-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
            <span className="font-semibold text-slate-800">{student.department}</span>
          </div>
          <div className="pl-4 sm:pl-6">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Semester</span>
            <span className="font-semibold text-slate-800">{student.semester}</span>
          </div>
          <div className="pl-4 sm:pl-6">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Score</span>
            <span className="font-bold text-emerald-700 font-mono">{student.marks} / 100</span>
          </div>
          <div className="pl-4 sm:pl-6 hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Accreditation</span>
            <span className="font-semibold text-blue-700">Tier-1 Valid</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form (2 cols) */}
        <form onSubmit={handleSaveChanges} className="lg:col-span-2 space-y-6">
          {/* Section 01: Student Identity & Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm md:text-base font-bold text-slate-900">
                  Student Identity &amp; Contact
                </h2>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Section 01
              </span>
            </div>

            {/* Roll Number - System Managed / Read-only */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Roll Number</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  System Managed Field
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={student.rollNumber}
                  className="w-full px-3.5 py-2 text-xs md:text-sm font-mono rounded-lg border border-slate-200 bg-slate-100/70 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>ⓘ</span> Roll number is a permanent university identifier and cannot be modified.
              </p>
            </div>

            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                aria-label="Full Legal Name"
                  value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border bg-white focus:outline-none transition-all ${
                  errors.fullName
                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-[#243b64]'
                }`}
              />
              {errors.fullName ? (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.fullName}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Official name as recorded in secondary school transcript and government identification.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Institutional Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  aria-label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border bg-white focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-[#243b64]'
                  }`}
                />
                {errors.email ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">Used for term notifications and exam permits.</p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Primary Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  disabled
                  aria-label="Phone number (not recorded)"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#243b64]"
                />
                <p className="text-[11px] text-slate-500 mt-1">Phone numbers are not stored by the current database schema.</p>
              </div>
            </div>
          </div>

          {/* Section 02: Academic Allocation & Performance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm md:text-base font-bold text-slate-900">
                  Academic Allocation &amp; Performance
                </h2>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Section 02
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Academic Department <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#243b64]"
                >
                  <option value="Computer Science">Computer Science &amp; Engineering</option>
                  <option value="Information Tech">Information Technology</option>
                  <option value="Electronics">Electronics &amp; Communication</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil Eng">Civil Engineering</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Select the recorded academic department.</p>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Current Term / Semester <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#243b64]"
                >
                  <option value="Semester 1">Semester 1 (Freshman)</option>
                  <option value="Semester 2">Semester 2 (Freshman)</option>
                  <option value="Semester 3">Semester 3 (Sophomore)</option>
                  <option value="Semester 4">Semester 4 (Sophomore)</option>
                  <option value="Semester 5">Semester 5 (Junior)</option>
                  <option value="Semester 6">Semester 6 (Junior)</option>
                  <option value="Semester 7">Semester 7 (Senior)</option>
                  <option value="Semester 8">Semester 8 (Senior)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Current recorded semester</p>
              </div>
            </div>

            {/* Marks & Live Computed Assessment */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Academic Marks (0.0 – 100.0) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    aria-label="Academic Marks"
                  value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-28 px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#243b64]"
                  />
                  <span className="text-xs text-slate-500 font-mono">/ 100</span>
                </div>
                {errors.marks ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.marks}</p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Score based on latest verified term examinations and faculty moderation.
                  </p>
                )}
              </div>

              {/* Assessment pill */}
              <div className="bg-emerald-950 text-white p-3 rounded-lg border border-emerald-900 shrink-0 min-w-[200px]">
                <div className="text-[10px] uppercase font-bold text-emerald-400">
                  Computed Assessment
                </div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{gradeInfo.gradeLabel}</span>
                </div>
                <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                  GPA Equivalent: {gradeInfo.gpa.toFixed(2)} / 4.0
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500 order-2 sm:order-1">
              Changes are saved to MySQL after successful validation.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                type="button"
                onClick={() => onNavigate('student-details', student)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs md:text-sm font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0a254d] hover:bg-[#192d4d] text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* FERPA & Compliance Protocol Notice */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">Record Validation</div>
              <p className="mt-0.5 leading-relaxed text-slate-500">
                Changes are validated before saving. The current version stores student identity, department, semester, and overall marks.
              </p>
            </div>
          </div>
        </form>

        {/* Right Column: Cards (from Image 1) */}
        <div className="space-y-6">
          {/* Grade Progression Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Grade Progression</h3>
              <span className="text-xs text-slate-500 font-mono">No history stored</span>
            </div>

            <div className="bg-gradient-to-b from-blue-50/50 to-indigo-50/20 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Historical Average
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">Not recorded</span>
              </div>

              {/* Progress Line Simulation */}
              <div className="mt-4 flex items-end justify-between gap-1 h-14 pt-2">
                {(student.historicalGrades || []).map(item => ({sem: item.semester, pct: item.percentage})).map((item, idx) => (
                  <div key={item.sem} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      style={{ height: `${(item.pct - 60) * 2.2}px` }}
                      className={`w-full max-w-[18px] rounded-t ${
                        idx === 5 ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-500">{item.sem}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Class Rank Position</span>
                <span className="font-bold text-slate-800">Not recorded</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Earned Credits to Date</span>
                <span className="font-bold text-slate-800 font-mono">Not recorded</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Attendance Ratio</span>
                <span className="font-bold text-emerald-700">Not recorded</span>
              </div>
            </div>
          </div>

          {/* Physical Identification Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Physical Identification
            </h3>

            {/* Simulated Campus Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#0a254d] to-[#243b64] text-white rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-[10px] text-blue-200 uppercase font-semibold">
                <span>Student Campus Pass</span>
                <span>RFID: Not recorded</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-white">
                  {student.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-bold">{student.name}</div>
                  <div className="text-[11px] text-blue-200 font-mono">{student.rollNumber}</div>
                  <div className="text-[10px] text-blue-300">{student.department}</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Hostel Residence</span>
                <span className="font-medium text-slate-800">Not recorded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Library Security ID</span>
                <span className="font-mono font-medium text-emerald-700">Not recorded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Faculty Advisor</span>
                <span className="font-medium text-blue-700">Not recorded</span>
              </div>
            </div>
          </div>

          {/* Administrative Links & Delete */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Administrative Links
            </span>
            <button
              type="button"
              onClick={() => onNavigate('results')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span>View Full Grade Transcript</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => showToast({ type: 'info', message: 'Letter generation is not available in this version.' })}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span>Issue Official Warning / Letter</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => showToast({ type: 'info', message: 'Fee clearance data is not recorded in this version.' })}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span>Tuition Fee Clearance Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Student Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
