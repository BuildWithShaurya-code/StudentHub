export interface Coursework {
  id: string;
  code: string;
  title: string;
  credits: number;
  type: string; // "Theory & Lab" | "Theory" | "Lab"
  marks: number;
  grade: string;
}

export interface Student {
  id: number;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  semester: string; // e.g. "Semester 4" or "Semester 6"
  batch: string; // e.g. "Batch of 2026"
  marks: number; // 0 - 100
  enrollmentStatus: 'ACTIVE' | 'ENROLLED' | 'PENDING' | 'PROBATION' | 'DISMISSED';
  standing: 'Good Standing' | 'Dean\'s List' | 'Academic Warning';
  degreeTrack: string;
  admissionDate: string;
  advisor: string;
  hostelResidence?: string;
  rfidTag?: string;
  librarySecurityId?: string;
  registeredDate: string;
  coursework?: Coursework[];
  historicalGrades?: { semester: string; percentage: number }[];
}

export type ScreenType =
  | 'dashboard'
  | 'students'
  | 'student-details'
  | 'add-student'
  | 'edit-student'
  | 'results'
  | 'feedback-states';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}
