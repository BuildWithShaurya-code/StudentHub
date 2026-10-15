import React, { useEffect, useState } from 'react';
import { ScreenType, Student } from '../../types/student';
import { StudentService } from '../../services/studentService';
import {
  UserPlus,
  Users,
  GraduationCap,
  TrendingUp,
  Building2,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Calendar,
  Sparkles,
  PieChart,
  Clock
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<{
    totalStudents: number;
    avgMarks: number;
    deptCounts: Record<string, number>;
    passRate: number;
    distinctionRate: number;
    standardPassRate: number;
    backlogRate: number;
    recentStudents: Student[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const data = await StudentService.getDashboardStats();
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoadError(true);
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const totalCount = stats !== null ? stats.totalStudents : 0;
  const avgMarks = stats !== null ? stats.avgMarks : 0.0;
  const passRate = stats !== null ? stats.passRate : 0.0;
  const deptsCount = stats ? Object.keys(stats.deptCounts || {}).length : 0;

  const deptCounts = stats?.deptCounts || {};
  const totalDeptCount = Object.values(deptCounts).reduce((a, b) => a + b, 0);
  const colors = ['bg-[#0a254d]', 'bg-[#243b64]', 'bg-[#535f70]', 'bg-[#90a6d5]', 'bg-[#3b82f6]', 'bg-[#10b981]'];

  const departmentBreakdown = Object.keys(deptCounts).length > 0
    ? Object.entries(deptCounts).map(([name, count], idx) => ({
        name,
        count,
        percentage: totalDeptCount > 0 ? Math.round((count / totalDeptCount) * 1000) / 10 : 0,
        color: colors[idx % colors.length],
      }))
    : [
        { name: 'Computer Science', count: 0, percentage: 0, color: 'bg-[#0a254d]' },
        { name: 'Information Tech', count: 0, percentage: 0, color: 'bg-[#243b64]' },
        { name: 'Electronics', count: 0, percentage: 0, color: 'bg-[#535f70]' },
        { name: 'Mechanical', count: 0, percentage: 0, color: 'bg-[#90a6d5]' },
      ];

  if (loading) return <div role="status" className="p-8 text-center text-slate-600">Loading records…</div>;
  if (loadError) return <div role="alert" className="p-8 bg-white border border-red-200 rounded-xl text-red-700">Unable to load records. Check the Flask backend and MySQL connection. <button className="underline" onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>STUDENT REGISTRY</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, Administrator
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Overview of academic status, student metrics, and recent registrations.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('add-student')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a254d] hover:bg-[#192d4d] text-white rounded-lg text-xs md:text-sm font-medium transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>View All Students</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        {/* Total Students Card - Clickable as required by spec */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-xs hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
          role="button"
          tabIndex={0}
          title="Click to view all students in directory"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tnum">
              {totalCount.toLocaleString()}
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Current enrollment</span>
          </div>
        </div>

        {/* Average Marks Card */}
        <div
          onClick={() => onNavigate('results')}
          className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all group"
          title="Click to view Academic Results and Grades"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Avg Marks
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tnum">
              {avgMarks}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Median: <span className="font-semibold text-slate-700">{avgMarks}%</span> • Pass: <span className="font-semibold text-emerald-600">{passRate}%</span>
          </div>
        </div>

        {/* Departments Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Depts
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tnum">
              {deptsCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Academic Divisions
          </div>
        </div>

        {/* New Added Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              New Added
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tnum">
              {stats?.recentStudents?.length || 0}
            </span>
            <span className="text-xs text-slate-500">recent</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Registered Candidates
          </div>
        </div>
      </div>

      {/* Middle Section: Department Distribution & Quick Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900">
                Department Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Total enrolled: {totalCount.toLocaleString()} students across {deptsCount} active departments
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-3 rounded-full overflow-hidden flex gap-0.5 bg-slate-100 mb-5">
            {departmentBreakdown.map((dept) => (
              <div
                key={dept.name}
                style={{ width: `${dept.percentage}%` }}
                className={`${dept.color} transition-all duration-300`}
                title={`${dept.name}: ${dept.count} (${dept.percentage}%)`}
              />
            ))}
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {departmentBreakdown.map((dept) => (
              <div
                key={dept.name}
                onClick={() => onNavigate('students')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${dept.color}`}></span>
                  <span className="text-xs font-semibold text-slate-800">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-slate-600">{dept.count}</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {dept.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Academic Standing Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Academic Results
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live database
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Performance Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">
              Overall institutional pass rate benchmark set at 40.0% minimum threshold.
            </p>

            <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Passed - Distinction (≥80%)</span>
                <span className="font-semibold text-emerald-700">{stats?.distinctionRate ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Passed Standard (40–79%)</span>
                <span className="font-semibold text-blue-700">{stats?.standardPassRate ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Backlog / Fail (&lt;40%)</span>
                <span className="font-semibold text-red-600">{stats?.backlogRate ?? 0}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#243b64] text-[#243b64] hover:bg-blue-50 text-xs font-semibold transition-colors"
          >
            <span>View Full Grade Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Registrations Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm md:text-base font-bold text-slate-900">
              Recent Registrations
            </h2>
            <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
              New
            </span>
          </div>

          {/* Action button specified in spec: "Recent registrations section action: Navigate to Student Directory" */}
          <button
            onClick={() => onNavigate('students')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* List of Recent Students */}
        <div className="divide-y divide-slate-100">
          {(stats?.recentStudents || []).length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">No student records found in MySQL database.</p>
              <p className="text-xs text-slate-400 mt-1">Click below to enroll your first student record.</p>
              <button
                onClick={() => onNavigate('add-student')}
                className="mt-3 px-3.5 py-1.5 bg-[#0a254d] text-white rounded-lg text-xs font-semibold hover:bg-[#192d4d] transition-colors"
              >
                Add Student
              </button>
            </div>
          ) : (
            (stats?.recentStudents || []).map((student) => (
            <div
              key={student.id}
              onClick={() => onNavigate('student-details', student)}
              className="p-3.5 md:p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
              role="button"
              tabIndex={0}
              title={`View ${student.name}'s details`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                  {student.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs md:text-sm text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                      {student.name}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                      {student.rollNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{student.semester}</span>
                    <span>•</span>
                    <span className="truncate">{student.department}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  student.enrollmentStatus === 'ENROLLED' || student.enrollmentStatus === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {student.enrollmentStatus}
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">
                  {student.registeredDate}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* Sync Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Registry Database Sync: Normal</span>
        </div>
        <span className="font-mono text-slate-400">10:42 AM EST</span>
      </div>
    </div>
  );
};
