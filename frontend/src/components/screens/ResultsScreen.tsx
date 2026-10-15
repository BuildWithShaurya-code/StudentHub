import React, { useState, useEffect, useMemo } from 'react';
import { ScreenType, Student } from '../../types/student';
import { StudentService } from '../../services/studentService';
import { csvCell } from '../../utils/csv';
import { evaluateMarks } from '../../utils/grading';
import { useFeedback } from '../../context/FeedbackContext';
import {
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface ResultsScreenProps {
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ onNavigate }) => {
  const { showToast } = useFeedback();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 7;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { results: all } = await StudentService.getResults();
        if (mounted) {
          setStudents(all);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoadError(true);
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    return students.filter((s) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = s.rollNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll) return false;
      }

      // Department
      if (selectedDept !== 'All' && selectedDept !== 'All Departments') {
        const dLower = s.department.toLowerCase();
        const fLower = selectedDept.toLowerCase();
        if (!dLower.includes(fLower) && !fLower.includes(dLower)) return false;
      }

      // Semester
      if (selectedSemester !== 'All') {
        const cleanSem = selectedSemester.toLowerCase().replace(/current/g, '').trim();
        const sSem = s.semester.toLowerCase();
        if (!sSem.includes(cleanSem) && !cleanSem.includes(sSem)) return false;
      }

      // Status
      if (selectedStatus !== 'All' && selectedStatus !== 'All Statuses') {
        const evalInfo = evaluateMarks(s.marks);
        if (selectedStatus === 'Passed - Distinction' && !evalInfo.isDistinction) return false;
        if (selectedStatus === 'Passed' && (evalInfo.isDistinction || !evalInfo.isPass)) return false;
        if (selectedStatus === 'Fail / Backlog' && evalInfo.isPass) return false;
      }

      return true;
    });
  }, [students, searchQuery, selectedDept, selectedSemester, selectedStatus]);

  const evaluatedCount = students.length;
  const averageMarks = evaluatedCount ? students.reduce((sum, student) => sum + student.marks, 0) / evaluatedCount : 0;
  const passPercentage = evaluatedCount ? students.filter(student => student.marks >= 40).length * 100 / evaluatedCount : 0;
  const failPercentage = evaluatedCount ? 100 - passPercentage : 0;
  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedSemester('All');
    setSelectedStatus('All');
    setCurrentPage(1);
    showToast({
      type: 'info',
      message: 'All search and filter criteria have been reset.',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast({ type: 'warning', message: 'No student results to export.' });
      return;
    }

    const headers = ['Roll Number', 'Student Name', 'Department', 'Semester', 'Marks', 'Percentage', 'Grade', 'Result Status', 'GPA'];
    const rows = filtered.map((s) => {
      const evalInfo = evaluateMarks(s.marks);
      return [
        s.rollNumber,
        s.name,
        s.department,
        s.semester,
        s.marks,
        `${s.marks}%`,
        evalInfo.grade,
        evalInfo.status,
        evalInfo.gpa.toFixed(2),
      ].map(csvCell).join(',');
    });

    const encodedUri = URL.createObjectURL(new Blob([[headers.join(','), ...rows].join('\r\n')], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `academic_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(encodedUri);

    showToast({
      type: 'success',
      title: 'Export Completed',
      message: `Exported ${filtered.length} student grade records to CSV.`,
    });
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDept !== 'All' ||
    selectedSemester !== 'All' ||
    selectedStatus !== 'All';

  if (loading) return <div role="status" className="p-8 text-center text-slate-600">Loading records…</div>;
  if (loadError) return <div role="alert" className="p-8 bg-white border border-red-200 rounded-xl text-red-700">Unable to load records. Check the Flask backend and MySQL connection. <button className="underline" onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-800 transition-colors">
              StudentHub
            </button>
            <span>/</span>
            <span className="text-slate-800 font-bold">Academic Records</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Examination Cell
            </span>
            <span className="text-xs text-slate-500">• Current recorded results</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Academic Results
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Review student grading distribution, examination marks, and performance metrics across departments.
          </p>
        </div>

        {/* Top Validation Stamp */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs shrink-0 text-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Overall marks summary</div>
            <div className="text-[11px] text-slate-500">Calculated from recorded marks</div>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Evaluated */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Students Evaluated
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
              {evaluatedCount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Active Cycle
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Current database records</span>
          </div>
        </div>

        {/* Average Examination Marks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Average Examination Marks
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
              {averageMarks.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Overall pass benchmark: <span className="font-semibold text-slate-700">40.0</span> • <span className="text-emerald-600 font-semibold">Pass threshold</span>
          </div>
        </div>

        {/* Overall Pass Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Overall Pass Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-700 font-mono">
              {passPercentage.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Current results
            </span>
          </div>

          {/* Pass/Fail bar */}
          <div className="mt-2.5 h-2 rounded-full overflow-hidden flex bg-slate-100">
            <div style={{ width: `${passPercentage}%` }} className="bg-emerald-600" />
            <div style={{ width: `${failPercentage}%` }} className="bg-red-500" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> {passPercentage.toFixed(1)}% Pass
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> {failPercentage.toFixed(1)}% Backlog / Fail
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search students"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by student name or roll..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#243b64] focus:bg-white"
            />
          </div>

          {/* Middle: Selects */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              aria-label="Filter by department"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#243b64]"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Tech">Information Tech</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil Eng">Civil Eng</option>
            </select>

            <select
              aria-label="Filter by semester"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#243b64]"
            >
              <option value="All">All Semesters</option>
              <option value="Semester 8">Semester 8</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 1">Semester 1</option>
            </select>

            <select
              aria-label="Filter by result status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#243b64]"
            >
              <option value="All">All Statuses</option>
              <option value="Passed - Distinction">Passed - Distinction</option>
              <option value="Passed">Passed</option>
              <option value="Fail / Backlog">Fail / Backlog</option>
            </select>
          </div>

          {/* Right: Export & Print */}
          <div className="flex items-center gap-2 shrink-0">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0a254d] hover:bg-[#192d4d] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Grade Sheet</span>
            </button>
          </div>
        </div>

        {/* Sub-bar Notice */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Regular Exam Cycle • Standard Weightage Applied (Theory 70% | Lab 30%)</span>
          </div>
          <span className="font-semibold text-slate-600">Auto-moderation: Enabled</span>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4 text-right">Marks (/100)</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Result Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No student grade records found.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your filters or search query.</p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-xs"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginated.map((student) => {
                  const evalInfo = evaluateMarks(student.marks);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Roll Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <button
                          onClick={() => onNavigate('student-details', student)}
                          className="hover:text-blue-700 transition-colors"
                          title="Open Student Details"
                        >
                          {student.rollNumber}
                        </button>
                      </td>

                      {/* Student Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onNavigate('student-details', student)}
                          className="flex items-center gap-2.5 text-left font-bold text-slate-900 group-hover:text-blue-700 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {student.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span>{student.name}</span>
                        </button>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {student.department}
                      </td>

                      {/* Semester */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {student.semester.replace('Semester ', 'Sem ')}
                        </span>
                      </td>

                      {/* Marks */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {student.marks.toFixed(1)}
                      </td>

                      {/* Percentage */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {student.marks.toFixed(1)}%
                      </td>

                      {/* Grade */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                          {evalInfo.grade}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${evalInfo.badgeBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            evalInfo.isPass ? 'bg-emerald-600' : 'bg-red-600'
                          }`}></span>
                          <span>{evalInfo.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onNavigate('student-details', student)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <span>Grade Card</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{totalResults > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(startIndex + pageSize, totalResults)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{totalResults}</span> student results
          </div>

          <div className="flex items-center gap-1">
            <button
              aria-label="Previous page"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage <= 1}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  validPage === page
                    ? 'bg-[#0a254d] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              aria-label="Next page"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grading Scale Legend Card (Matching Image 3) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 mr-1">
            <span>ⓘ</span> Grading Scale:
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
            <strong>O</strong> ≥ 90%
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
            <strong>A+</strong> 80–89%
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
            <strong>A</strong> 70–79%
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
            <strong>B+</strong> 60–69%
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
            <strong>B</strong> 50–59%
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
            <strong>Pass</strong> ≥ 40%
          </span>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono font-bold">
            Fail &lt; 40%
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official marksheet records are sealed &amp; digitally signed under academic charter.</span>
        </div>
      </div>
    </div>
  );
};
