import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenType, Student } from './types/student';
import { StudentService } from './services/studentService';
import { FeedbackProvider } from './context/FeedbackContext';
import { DeleteConfirmModal, ToastContainer } from './components/common/FeedbackModals';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { StudentDirectoryScreen } from './components/screens/StudentDirectoryScreen';
import { StudentDetailsScreen } from './components/screens/StudentDetailsScreen';
import { AddStudentScreen } from './components/screens/AddStudentScreen';
import { EditStudentScreen } from './components/screens/EditStudentScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { FeedbackStatesScreen } from './components/screens/FeedbackStatesScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const navigationVersion = useRef(0);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  // Sync state with URL hash
  const syncFromHash = useCallback(async () => {
    const version = ++navigationVersion.current;
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    setNavigationError(null);
    setIsInitializing(true);
    try {
      if (hash.startsWith('students/')) {
        const parts = hash.split('/');
        const student = await StudentService.getById(decodeURIComponent(parts[1]));
        if (version !== navigationVersion.current) return;
        if (!student) {
          setSelectedStudent(null);
          setNavigationError('Student not found. Return to the directory to select a record.');
          setCurrentScreen('students');
          return;
        }
        setSelectedStudent(student);
        setCurrentScreen(parts[2] === 'edit' ? 'edit-student' : 'student-details');
        return;
      }
      const screens: Record<string, ScreenType> = {'': 'dashboard', dashboard: 'dashboard', students: 'students', 'add-student': 'add-student', results: 'results', 'feedback-states': 'feedback-states', states: 'feedback-states'};
      setCurrentScreen(screens[hash] || 'dashboard');
    } catch {
      if (version === navigationVersion.current) {
        setSelectedStudent(null);
        setCurrentScreen('students');
        setNavigationError('Unable to load this student. Check the backend connection.');
      }
    } finally {
      if (version === navigationVersion.current) setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    syncFromHash();

    const handleHashChange = () => {
      syncFromHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      navigationVersion.current += 1;
    };
  }, [syncFromHash]);

  // Unified navigation handler
  const handleNavigate = useCallback(
    (screen: ScreenType, student?: Student | null) => {
      navigationVersion.current += 1;
      setNavigationError(null);
      // Update URL hash
      let newHash = '';
      switch (screen) {
        case 'dashboard':
          newHash = 'dashboard';
          break;
        case 'students':
          newHash = 'students';
          break;
        case 'add-student':
          newHash = 'add-student';
          break;
        case 'student-details':
          if (student) {
            newHash = `students/${student.id}`;
          } else if (selectedStudent) {
            newHash = `students/${selectedStudent.id}`;
          } else {
            newHash = 'students';
          }
          break;
        case 'edit-student':
          if (student) {
            newHash = `students/${student.id}/edit`;
          } else if (selectedStudent) {
            newHash = `students/${selectedStudent.id}/edit`;
          } else {
            newHash = 'students';
          }
          break;
        case 'results':
          newHash = 'results';
          break;
        case 'feedback-states':
          newHash = 'feedback-states';
          break;
      }

      const targetHash = `#/${newHash}`;
      if (window.location.hash !== targetHash) {
        setIsInitializing(true);
        window.location.hash = targetHash;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [selectedStudent]
  );

  if (isInitializing) return <div role="status" className="p-8 text-center text-slate-600">Loading student portal…</div>;

  return (
    <FeedbackProvider>
      <AppLayout
        currentScreen={currentScreen}
        selectedStudent={selectedStudent}
        onNavigate={handleNavigate}
      >
        {navigationError && <p role="alert" className="p-4 bg-red-50 text-red-700 rounded-lg">{navigationError}</p>}
        {currentScreen === 'dashboard' && (
          <DashboardScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'students' && (
          <StudentDirectoryScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'student-details' && (
          <StudentDetailsScreen
            student={selectedStudent}
            onNavigate={handleNavigate}
          />
        )}
        {currentScreen === 'add-student' && (
          <AddStudentScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'edit-student' && (
          <EditStudentScreen
            student={selectedStudent}
            onNavigate={handleNavigate}
          />
        )}
        {currentScreen === 'results' && (
          <ResultsScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === 'feedback-states' && (
          <FeedbackStatesScreen onNavigate={handleNavigate} />
        )}
      </AppLayout>

      {/* Global Modals & Toast Notifications */}
      <DeleteConfirmModal />
      <ToastContainer />
    </FeedbackProvider>
  );
}
