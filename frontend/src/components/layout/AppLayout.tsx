import React, { useState } from 'react';
import { ScreenType, Student } from '../../types/student';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  Sparkles,
  Bell,
  Check,
  ChevronDown,
  RotateCcw,
  LogOut,
  User,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Calendar,
  Download
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

interface AppLayoutProps {
  currentScreen: ScreenType;
  selectedStudent: Student | null;
  onNavigate: (screen: ScreenType, student?: Student | null) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentScreen,
  selectedStudent,
  onNavigate,
  children,
}) => {
  const { showToast } = useFeedback();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications: {id: string; title: string; text: string; time: string; unread: boolean}[] = [];

  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as ScreenType, label: 'Students', icon: Users },
    { id: 'add-student' as ScreenType, label: 'Add Student', icon: UserPlus },
    { id: 'results' as ScreenType, label: 'Results', icon: GraduationCap },
    { id: 'feedback-states' as ScreenType, label: 'System States / UI', icon: Sparkles },
  ];

  // Breadcrumb generator
  const renderBreadcrumb = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-400">Portal</span>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">Dashboard</span>
          </div>
        );
      case 'students':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-800 transition-colors">
              Portal
            </button>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">Students Directory</span>
          </div>
        );
      case 'add-student':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-800 transition-colors">
              Portal
            </button>
            <span>&gt;</span>
            <button onClick={() => onNavigate('students')} className="hover:text-slate-800 transition-colors">
              Students
            </button>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">Add New Student</span>
          </div>
        );
      case 'student-details':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button onClick={() => onNavigate('students')} className="hover:text-slate-800 transition-colors">
              Students
            </button>
            <span>&gt;</span>
            <span className="text-slate-500">Student Detail</span>
            {selectedStudent && (
              <>
                <span>&gt;</span>
                <span className="font-mono font-semibold text-slate-800">{selectedStudent.rollNumber}</span>
              </>
            )}
          </div>
        );
      case 'edit-student':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button onClick={() => onNavigate('students')} className="hover:text-slate-800 transition-colors">
              Students
            </button>
            <span>&gt;</span>
            <span className="text-slate-500">Edit Student</span>
            {selectedStudent && (
              <>
                <span>&gt;</span>
                <span className="font-mono font-semibold text-slate-800">{selectedStudent.rollNumber}</span>
              </>
            )}
          </div>
        );
      case 'results':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-800 transition-colors">
              StudentHub
            </button>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">Academic Records</span>
          </div>
        );
      case 'feedback-states':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-800 transition-colors">
              StudentHub
            </button>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">Feedback States & Specs</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#202939] flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar (240px) */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-[#e5e9f0] shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 px-5 py-4 border-b border-[#e5e9f0] cursor-pointer hover:bg-slate-50 transition-colors"
          title="StudentHub Dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0a254d] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-[#0a254d]">StudentHub</div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Admin Portal
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentScreen === item.id ||
              (item.id === 'students' && (currentScreen === 'student-details' || currentScreen === 'edit-student'));

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#243b64] text-white shadow-xs'
                    : 'text-[#535f70] hover:bg-[#f1f3f7] hover:text-[#202939]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#697586]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / System Status */}
        <div className="p-4 border-t border-[#e5e9f0] bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-700">Local Application</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Flask / MySQL
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Top App Bar */}
        <header className="h-14 bg-white border-b border-[#e5e9f0] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile logo when sidebar is hidden */}
            <div
              onClick={() => onNavigate('dashboard')}
              className="md:hidden flex items-center gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0a254d] text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-[#0a254d]">StudentHub</span>
            </div>

            <div className="hidden md:block">
              {renderBreadcrumb()}
            </div>
          </div>

          {/* Right: Academic Term, Notifications, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Download Source Zip Button */}
            <a
              href="https://github.com/BuildWithShaurya-code/StudentHub"
              target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors shadow-2xs"
              title="View StudentHub source code on GitHub"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Source Code</span>
            </a>

            {/* Term Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              <span>Student Registry</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Academic Alerts
                    </span>
                    <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">
                      No unread alerts
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 && <p className="p-3 text-xs text-slate-500">No notifications available.</p>}
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="User profile options"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#243b64] to-[#485e89] text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100 shadow-xs">
                  AR
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    Administrator
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    Student Registry
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">Administrator</p>
                    <p className="text-[11px] text-slate-500 font-mono">dean.academic@college.edu</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                      LOCAL REGISTRY
                    </span>
                  </div>

                  <div className="py-1">
                    <a
                      href="https://github.com/BuildWithShaurya-code/StudentHub"
                      target="_blank" rel="noreferrer"
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 text-left font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Source Code</span>
                    </a>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('feedback-states');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                      <span>System Specs & States</span>
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); onNavigate('dashboard'); window.location.reload(); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Refresh Records</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        showToast({
                          type: 'info',
                          message: 'Administrator session active. Use sidebar to switch operational modes.',
                        });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Session Information</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile slide-out drawer menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentScreen === item.id ||
                (item.id === 'students' && (currentScreen === 'student-details' || currentScreen === 'edit-student'));

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-[#243b64] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (as seen in Image 9 & 13) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around z-40 px-2 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentScreen === item.id ||
              (item.id === 'students' && (currentScreen === 'student-details' || currentScreen === 'edit-student'));

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#0a254d] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.2]' : ''}`} />
                <span>{item.label === 'System States / UI' ? 'States' : item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
