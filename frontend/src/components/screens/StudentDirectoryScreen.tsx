import React, { useState, useEffect, useMemo } from 'react';
import { ScreenType, Student } from '../../types/student';
import { StudentService } from '../../services/studentService';
import { useFeedback } from '../../context/FeedbackContext';
import { evaluateMarks } from '../../utils/grading';
import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  X,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Mail
} from 'lucide-react';

interface StudentDirectoryScreenProps {
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
}

export const StudentDirectoryScreen: React.FC<StudentDirectoryScreenProps> = ({ onNavigate }) => {
  const { showToast, openDeleteModal, setDeleteLoading, closeDeleteModal } = useFeedback();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

  const pageSize = 6;

  // Load students
  const loadStudents = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const all = await StudentService.getAll();
      setStudents(all);
    } catch (e) {
      setLoadError(true);
      showToast({
        type: 'error',
        title: 'Error Loading Records',
        message: 'Could not fetch student records from database.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students: search and filters work together
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search by name or roll number
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesRoll = s.rollNumber.toLowerCase().includes(query);
        if (!matchesName && !matchesRoll) return false;
      }

      // Department filter
      if (selectedDept !== 'All') {
        const dLower = s.department.toLowerCase();
        const fLower = selectedDept.toLowerCase();
        if (!dLower.includes(fLower) && !fLower.includes(dLower)) {
          return false;
        }
      }

      // Semester filter
      if (selectedSemester !== 'All') {
        const semClean = selectedSemester.toLowerCase().replace(/current/g, '').trim();
        const sSemClean = s.semester.toLowerCase();
        if (!sSemClean.includes(semClean) && !semClean.includes(sSemClean)) {
          return false;
        }
      }

      return true;
    });
  }, [students, searchQuery, selectedDept, selectedSemester]);

  // Pagination calculation
  const totalRecords = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedSemester('All');
    setCurrentPage(1);
  };

  const handleClearSearchOnly = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Delete flow
  const handleDeleteClick = (student: Student) => {
    setActiveDropdownId(null);
    openDeleteModal(student, async () => {
      setDeleteLoading(true);
      try {
        await StudentService.delete(student.id);
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        showToast({
          type: 'success',
          title: 'Student deleted successfully.',
          message: `Record for ${student.name} (${student.rollNumber}) has been purged from database.`,
        });
        closeDeleteModal();
      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'Deletion Failed',
          message: err.message || 'Could not delete student record.',
        });
        setDeleteLoading(false);
      }
    });
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedDept !== 'All' || selectedSemester !== 'All';

  if (loading) return <div role="status" className="p-8 text-center text-slate-600">Loading records…</div>;
  if (loadError) return <div role="alert" className="p-8 bg-white border border-red-200 rounded-xl text-red-700">Unable to load records. Check the Flask backend and MySQL connection. <button className="underline" onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-800 transition-colors">
              Dashboard
            </button>
            <span>/</span>
            <span className="text-slate-800 font-bold">Students</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Students</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage student records, enrollment status, and academic information.
          </p>
        </div>

        {/* Add Student Button */}
        <button
          onClick={() => onNavigate('add-student')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a254d] hover:bg-[#192d4d] text-white rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-xs shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
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
              placeholder="Search by name or roll number..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#243b64] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearchOnly}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-52">
            <select
              aria-label="Filter by department"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#243b64]"
            >
              <option value="All">Dept: All</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Tech">Information Tech</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil Eng">Civil Eng</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="w-full md:w-48">
            <select
              aria-label="Filter by semester"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#243b64]"
            >
              <option value="All">Semester: All</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 8">Semester 8</option>
            </select>
          </div>

          {/* Clear Filters Button if filters are active */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
              title="Reset all search and filter values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Filter Summary Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-semibold text-slate-800">{totalRecords}</span> matching student records
            {hasActiveFilters && (
              <span className="ml-2 text-blue-600 font-medium">
                (Filtered by {selectedDept !== 'All' ? `Dept: ${selectedDept} ` : ''} {selectedSemester !== 'All' ? `Sem: ${selectedSemester} ` : ''} {searchQuery ? `Query: "${searchQuery}"` : ''})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Student List (Cards & Table) */}
      {paginatedStudents.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No students found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No records matched your search query or filter criteria. Try adjusting your parameters or clear all filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedStudents.map((student) => {
            const gradeInfo = evaluateMarks(student.marks);
            const isDropdownOpen = activeDropdownId === student.id;

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div
                    onClick={() => onNavigate('student-details', student)}
                    className="flex items-start sm:items-center gap-3.5 cursor-pointer group flex-1"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#0a254d]/5 border border-slate-200 text-[#0a254d] font-bold text-sm flex items-center justify-center shrink-0 group-hover:bg-[#0a254d] group-hover:text-white transition-colors">
                      {student.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm md:text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                          {student.name}
                        </span>
                        <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {student.rollNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="truncate">{student.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Badges & Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-center">
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      {student.department}
                    </span>
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      {student.semester}
                    </span>

                    {/* Marks & Grade Chip */}
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${gradeInfo.badgeBg}`}>
                      <span>★</span>
                      <span>{student.marks}/100</span>
                      <span>•</span>
                      <span>{gradeInfo.grade}</span>
                    </div>

                    {/* Desktop Direct Action Buttons & Dropdown */}
                    <div className="relative flex items-center gap-1">
                      <button
                        onClick={() => onNavigate('student-details', student)}
                        className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => onNavigate('edit-student', student)}
                        className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit student"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Delete</span>
                      </button>

                      {/* Dropdown Menu Toggle (visible on all screens) */}
                      <button
                        onClick={() => setActiveDropdownId(isDropdownOpen ? null : student.id)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                        aria-label="Student action menu"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in">
                          <button
                            onClick={() => {
                              setActiveDropdownId(null);
                              onNavigate('student-details', student);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveDropdownId(null);
                              onNavigate('edit-student', student);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Student</span>
                          </button>
                          <a
                            href={`mailto:${student.email}`}
                            onClick={() => setActiveDropdownId(null)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Send Email</span>
                          </a>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete Record</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{totalRecords > 0 ? startIndex + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(startIndex + pageSize, totalRecords)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{totalRecords}</span> student records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage <= 1}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors ${
                validPage === page
                  ? 'bg-[#0a254d] text-white shadow-xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage >= totalPages}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
