export interface GradeEvaluation {
  grade: string;
  gradeLabel: string;
  gpa: number;
  status: 'Passed - Distinction' | 'Passed' | 'Fail / Backlog';
  isPass: boolean;
  isDistinction: boolean;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function evaluateMarks(marks: number): GradeEvaluation {
  const score = Math.max(0, Math.min(100, Number(marks) || 0));

  if (score >= 90) {
    return {
      grade: 'O',
      gradeLabel: 'Grade O (Outstanding)',
      gpa: 4.0,
      status: 'Passed - Distinction',
      isPass: true,
      isDistinction: true,
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-300',
    };
  } else if (score >= 80) {
    return {
      grade: 'A+',
      gradeLabel: 'Grade A+ (Distinction)',
      gpa: 3.85,
      status: 'Passed - Distinction',
      isPass: true,
      isDistinction: true,
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-300',
    };
  } else if (score >= 70) {
    return {
      grade: 'A',
      gradeLabel: 'Grade A (Very Good)',
      gpa: 3.5,
      status: 'Passed',
      isPass: true,
      isDistinction: false,
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-300',
    };
  } else if (score >= 60) {
    return {
      grade: 'B+',
      gradeLabel: 'Grade B+ (Good)',
      gpa: 3.0,
      status: 'Passed',
      isPass: true,
      isDistinction: false,
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      badgeText: 'text-indigo-700',
      badgeBorder: 'border-indigo-300',
    };
  } else if (score >= 50) {
    return {
      grade: 'B',
      gradeLabel: 'Grade B (Above Average)',
      gpa: 2.5,
      status: 'Passed',
      isPass: true,
      isDistinction: false,
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-300',
    };
  } else if (score >= 40) {
    return {
      grade: 'Pass',
      gradeLabel: 'Pass',
      gpa: 2.0,
      status: 'Passed',
      isPass: true,
      isDistinction: false,
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeText: 'text-amber-700',
      badgeBorder: 'border-amber-300',
    };
  } else {
    return {
      grade: 'Fail',
      gradeLabel: 'Fail (Below 40% Threshold)',
      gpa: 0.0,
      status: 'Fail / Backlog',
      isPass: false,
      isDistinction: false,
      badgeBg: 'bg-red-50 text-red-800 border-red-200',
      badgeText: 'text-red-700',
      badgeBorder: 'border-red-300',
    };
  }
}
