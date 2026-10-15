import React from 'react';
import { ScreenType, Student } from '../../types/student';
import { useFeedback } from '../../context/FeedbackContext';
import { evaluateMarks } from '../../utils/grading';
import { StudentService } from '../../services/studentService';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Calendar,
  User,
  Building2,
  FileText,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  BarChart2
} from 'lucide-react';

interface StudentDetailsScreenProps {
  student: Student | null;
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
}

export const StudentDetailsScreen: React.FC<StudentDetailsScreenProps> = ({
  student,
  onNavigate,
}) => {
  const { showToast, openDeleteModal, setDeleteLoading, closeDeleteModal } = useFeedback();

  if (!student) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <h2 className="text-lg font-bold text-slate-800">No student selected</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Please select a student record from the directory to inspect their full profile.
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

  const gradeInfo = evaluateMarks(student.marks);

  // Handle Delete
  const handleDelete = () => {
    openDeleteModal(student, async () => {
      setDeleteLoading(true);
      try {
        await StudentService.delete(student.id);
        showToast({
          type: 'success',
          title: 'Student deleted successfully.',
          message: `Record for ${student.name} (${student.rollNumber}) was deleted.`,
        });
        closeDeleteModal();
        // Return to students directory after deletion
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('students')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ACTIVE • ENROLLED</span>
          </span>
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0a254d] text-white flex items-center justify-center text-xl font-extrabold shadow-sm relative shrink-0">
            {student.name.split(' ').map((n) => n[0]).join('')}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md">
                {student.rollNumber}
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {student.department} • {student.semester} • {student.batch || 'Batch of 2026'}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                {student.degreeTrack || 'B.Tech Undergraduate'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {student.standing || 'Good Standing'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Edit, View Results, Print */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigate('edit-student', student)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a254d] hover:bg-[#192d4d] text-white rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Student</span>
          </button>

          <button
            onClick={() => onNavigate('results')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs md:text-sm font-semibold transition-colors"
            title="View Academic Results with student filter"
          >
            <BarChart2 className="w-4 h-4 text-slate-500" />
            <span>View Results</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Print Dossier / Transcript"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Academic Standing Summary Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm md:text-base font-bold text-slate-900">Academic Standing</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Current recorded semester</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Marks
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {student.marks}/100
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">
              Recorded marks
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Score
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {student.marks.toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-500">Semester Agg.</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Grade
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-emerald-700 mt-1">
              {gradeInfo.grade}
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">
              {gradeInfo.gradeLabel.includes('Distinction') ? 'Distinction' : 'Standard'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Grade point estimate
            </span>
            <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {gradeInfo.gpa.toFixed(2)} / 4.00
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {gradeInfo.isPass ? 'Pass threshold met' : 'Below pass threshold'}
            </span>
          </div>
        </div>

        {/* GPA Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Min passing: 2.00</span>
            <span className="font-semibold text-slate-700">Dean's List Threshold: 3.75</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden relative">
            <div
              style={{ width: `${(gradeInfo.gpa / 4.0) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-700 to-indigo-800 rounded-full"
            />
            {/* 3.75 Marker */}
            <div
              style={{ left: `${(3.75 / 4.0) * 100}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
              title="Dean's List (3.75)"
            />
          </div>
        </div>
      </div>

      {/* Personal & Academic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Personal & Academic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-700" />
              Personal &amp; Academic Info
            </h3>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Full Name</span>
              <span className="font-bold text-slate-900">{student.name}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Roll Number</span>
              <span className="font-mono font-semibold text-slate-900">{student.rollNumber}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Institutional Email</span>
              <a
                href={`mailto:${student.email}`}
                className="font-medium text-blue-700 hover:underline flex items-center gap-1"
                title="Send email"
              >
                <span>{student.email}</span>
                <Mail className="w-3 h-3" />
              </a>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Phone Contact</span>
              <a href={`tel:${student.phone || 'Not recorded'}`} className="font-medium text-slate-800 hover:text-blue-700">
                {student.phone || 'Not recorded'}
              </a>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Department</span>
              <span className="font-medium text-slate-900">{student.department}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Current Term</span>
              <span className="font-medium text-slate-900">{student.semester}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Admission Date</span>
              <span className="font-medium text-slate-800">{student.admissionDate || 'Not recorded'}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Academic Advisor</span>
              <span className="font-medium text-blue-700 flex items-center gap-1">
                {student.advisor || 'Not recorded'}
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Right: Coursework Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              {student.semester} Coursework
            </h3>
            <span className="text-xs text-slate-500">{student.coursework?.length || 0} Subjects • {(student.coursework || []).reduce((total, course) => total + course.credits, 0)} Credits</span>
          </div>

          <div className="space-y-2.5">
            {!student.coursework?.length && <p className="text-xs text-slate-500">Coursework is not recorded in the current database.</p>}
            {(student.coursework || []).map((course) => (
              <div
                key={course.id}
                className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-900">{course.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {course.code} • {course.credits} Credits • {course.type}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-800">
                    {course.marks}/100
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Grade {course.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Administrative Actions Card */}
      <div className="bg-white rounded-xl border border-red-200 p-5 md:p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900">Administrative Actions</h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Deleting permanently removes this student record and its overall marks.
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Student Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
