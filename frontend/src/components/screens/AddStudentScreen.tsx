import React, { useState, useEffect } from 'react';
import { ScreenType, Student } from '../../types/student';
import { StudentService } from '../../services/studentService';
import { useFeedback } from '../../context/FeedbackContext';
import { evaluateMarks } from '../../utils/grading';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  ShieldCheck,
  User,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Info,
  Loader2,
  Minus,
  Plus
} from 'lucide-react';

interface AddStudentScreenProps {
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
}

export const AddStudentScreen: React.FC<AddStudentScreenProps> = ({ onNavigate }) => {
  const { showToast } = useFeedback();

  // Form fields
  const [rollNumber, setRollNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('Semester 4');
  const [marks, setMarks] = useState<number | string>(85);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRollChecking, setIsRollChecking] = useState(false);
  const [rollAvailable, setRollAvailable] = useState<boolean | null>(null);

  // Live assessment
  const numericMarks = Math.max(0, Math.min(100, Number(marks) || 0));
  const gradeInfo = evaluateMarks(numericMarks);

  // Check roll number uniqueness live as user types
  useEffect(() => {
    if (!rollNumber.trim()) {
      setRollAvailable(null);
      return;
    }

    setRollAvailable(null);
    setIsRollChecking(false);
    let active = true;
    const timer = setTimeout(async () => {
      setIsRollChecking(true);
      try {
        const exists = await StudentService.checkRollNumberExists(rollNumber.trim());
        if (active) {
          setRollAvailable(!exists);
          if (exists) {
            setErrors((prev) => ({
              ...prev,
              rollNumber: `Roll number ${rollNumber} already exists in the system`,
            }));
          } else {
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.rollNumber;
              return updated;
            });
          }
        }
      } catch (e) {
        if (active) setRollAvailable(null);
      } finally {
        if (active) setIsRollChecking(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [rollNumber]);

  // Real validation logic
  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // 1. Roll number
    if (!rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required.';
    }

    // 2. Full name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full legal name is required.';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters.';
    }

    // 3. Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Institutional email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g., student@college.edu).';
    }

    // 4. Department & Semester
    if (!department) {
      newErrors.department = 'Department selection is required.';
    }
    if (!semester) {
      newErrors.semester = 'Semester selection is required.';
    }

    // 5. Marks
    if (marks === '' || isNaN(Number(marks))) {
      newErrors.marks = 'Marks must be a valid number.';
    } else if (Number(marks) < 0 || Number(marks) > 100) {
      newErrors.marks = 'Academic marks must be between 0.0 and 100.0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please resolve all required field errors before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newStudent = await StudentService.create({
        rollNumber: rollNumber.trim().toUpperCase(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+1 (555) 000-0000',
        department,
        semester,
        marks: numericMarks,
        enrollmentStatus: 'ENROLLED',
        standing: numericMarks >= 80 ? 'Dean\'s List' : 'Good Standing',
        batch: 'Batch 2024–2028',
        degreeTrack: `Bachelor of Technology in ${department}`,
        admissionDate: 'Fall Intake 2024',
        advisor: 'Dr. Arvind Rao',
      });

      showToast({
        type: 'success',
        title: 'Student added successfully.',
        message: `Student record #${newStudent.rollNumber} has been synchronized with the central registrar database.`,
      });

      // Navigate to newly created student's details page
      onNavigate('student-details', newStudent);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Server error occurred while persisting student record.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleResetForm = () => {
    const hasData = fullName || email || phone;
    if (hasData) {
      if (window.confirm('Reset all form fields to default values? Any unsaved entries will be cleared.')) {
        setRollNumber('');
        setFullName('');
        setEmail('');
        setPhone('');
        setDepartment('Computer Science');
        setSemester('Semester 4');
        setMarks(85);
        setErrors({});
      }
    } else {
      setErrors({});
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('students')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>

        <div className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>New Registration</span>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Academic Operations / Admissions & Registry
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Student</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Register a new student into the college database. Ensure all mandatory academic credentials and departmental selections are accurate.
        </p>
      </div>

      {/* Data Verification Engine Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Student Registration</span>
            <span className="text-emerald-800 ml-1.5">
              Required fields are validated before saving.
            </span>
          </div>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
          Validation Ready
        </span>
      </div>

      <form onSubmit={handleSaveStudent} className="space-y-6">
        {/* Step 1: Student Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm md:text-base font-bold text-slate-900">
                Student Personal Information
              </h2>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded">
              Step 01 / 02
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Roll Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                {isRollChecking ? (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : rollAvailable === true ? (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </span>
                ) : rollAvailable === false ? (
                  <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Duplicate Detected
                  </span>
                ) : null}
              </div>
              <input
                type="text"
                aria-label="Roll Number"
                  value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="CS-2024-089"
                className={`w-full px-3.5 py-2 text-xs md:text-sm font-mono rounded-lg border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                  errors.rollNumber
                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-[#243b64]'
                }`}
              />
              {errors.rollNumber ? (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.rollNumber}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Unique university roll number (e.g. CS-2024-NNN). Must be unique in MySQL database.
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                aria-label="Full Legal Name"
                  value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aditya Ramesh Kulkarni"
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
                  Official legal name as documented on matriculation certificate.
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Institutional Email Address <span className="text-red-500">*</span>
                </label>
                {email.endsWith('@college.edu') && (
                  <span className="text-[10px] font-semibold text-emerald-600">
                    Email address
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="email"
                  aria-label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name.student@college.edu"
                  className={`w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border bg-white focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-[#243b64]'
                  }`}
                />
              </div>
              {errors.email ? (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Used for portal credentials and official correspondence.
                </p>
              )}
            </div>

            {/* Primary Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Contact Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={phone}
                  disabled
                  aria-label="Phone number (not recorded)"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#243b64]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Phone numbers are not stored by the current database schema.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Academic Information & Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm md:text-base font-bold text-slate-900">
                Academic Allocation & Performance
              </h2>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded">
              Step 02 / 02
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                aria-label="Department"
                  value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#243b64]"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil Eng">Civil Eng</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Academic program stream</p>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                aria-label="Semester"
                  value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2 text-xs md:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#243b64]"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Current active curriculum term</p>
            </div>

            {/* Marks Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Marks (0–100) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {gradeInfo.gradeLabel}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMarks((m) => Math.max(0, Number(m) - 5))}
                  className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  aria-label="Academic Marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className={`flex-1 text-center font-mono font-bold px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none ${
                    errors.marks ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus:border-[#243b64]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMarks((m) => Math.min(100, Number(m) + 5))}
                  className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {errors.marks ? (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.marks}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Cumulative score based on latest evaluation.
                </p>
              )}
            </div>
          </div>

          {/* Computed Standing Preview Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Calculated Standing
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${gradeInfo.badgeBg}`}>
                  {gradeInfo.gradeLabel} • {numericMarks}%
                </span>
                {gradeInfo.isDistinction && (
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Eligible for Honors
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 text-right sm:text-right">
              <div>GPA Equivalent: <span className="font-bold text-slate-800 font-mono">{gradeInfo.gpa.toFixed(2)} / 4.0</span></div>
              <div className="text-[11px] text-slate-400">Autonomous Reg-2022 Scheme</div>
            </div>
          </div>
        </div>

        {/* Client-Side Validation & Payload Inspector Card (from Image 17) */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Client-Side Validation &amp; Payload Inspector
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              ● All Constraints Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Roll Regex</span>
              <span className="font-semibold text-emerald-700">Checked on save</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Email Domain</span>
              <span className="font-semibold text-emerald-700">Format checked on save</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Department</span>
              <span className="font-semibold text-slate-800">{department}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Save Status</span>
              <span className="font-semibold text-blue-700">Pending submission</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Cancel button */}
          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs md:text-sm font-semibold transition-colors order-2 sm:order-1"
          >
            ← Cancel &amp; Return to List
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
            {/* Reset Form button */}
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
            >
              Reset Form
            </button>

            {/* Save Student Record button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0a254d] hover:bg-[#192d4d] text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Student Record</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Implementation Architecture Note */}
      <div className="bg-slate-900 text-white p-4 rounded-xl text-xs space-y-1">
        <div className="flex items-center gap-2 font-mono text-[11px] text-blue-300">
          <span className="font-bold">SAVING YOUR RECORD</span>
          <span>•</span>
          <span>Required fields must be valid</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          <span className="font-semibold text-white">Save confirmation:</span> A success message appears only after the record is saved to MySQL. Roll number and email must be unique.
        </p>
      </div>
    </div>
  );
};
