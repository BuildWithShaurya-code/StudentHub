import { Student } from '../types/student';
import { apiClient, ApiError } from './apiClient';

export interface StudentFilterOptions {
  search?: string;
  department?: string;
  semester?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface StudentListResult {
  students: Student[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function parseSemesterNumber(sem: any): number {
  if (typeof sem === 'number') return sem;
  if (!sem) return 1;
  const digits = String(sem).replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 1;
}

export const StudentService = {
  /**
   * GET /api/students
   * Fetches all students from the live MySQL database.
   */
  async getAll(): Promise<Student[]> {
    const students: Student[] = [];
    let page = 1;
    while (true) {
      const data = await this.getFiltered({ page, pageSize: 500 });
      students.push(...data.students);
      if (page >= data.totalPages) return students;
      page += 1;
    }
  },

  /**
   * GET /api/students with query parameters
   * Supports search, department filter, semester filter, and pagination.
   */
  async getFiltered(options: StudentFilterOptions = {}): Promise<StudentListResult> {
    const params = new URLSearchParams();
    if (options.search?.trim()) params.append('search', options.search.trim());
    if (options.department && options.department.toLowerCase() !== 'all') {
      params.append('department', options.department);
    }
    if (options.semester && options.semester.toLowerCase() !== 'all') {
      params.append('semester', String(parseSemesterNumber(options.semester)));
    }
    if (options.page) params.append('page', String(options.page));
    if (options.pageSize) params.append('page_size', String(options.pageSize));

    const endpoint = `/students?${params.toString()}`;
    const data = await apiClient.get<any>(endpoint);

    return {
      students: data.students || [],
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.page_size || options.pageSize || 10,
      totalPages: data.total_pages || 1,
    };
  },

  /**
   * GET /api/students/<idOrRoll>
   * Fetches a student by primary database ID or roll number.
   */
  async getById(idOrRoll: string | number): Promise<Student | null> {
    try {
      const cleanId = String(idOrRoll).trim();
      const data = await apiClient.get<{ student: Student }>(`/students/${encodeURIComponent(cleanId)}`);
      return data.student || null;
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Checks if a roll number is already in use by querying the backend.
   */
  async checkRollNumberExists(rollNumber: string, excludeId?: string | number): Promise<boolean> {
    if (!rollNumber?.trim()) return false;
    const data = await apiClient.get<{ students: Student[] }>(
      `/students?roll_number=${encodeURIComponent(rollNumber.trim())}&page_size=1`
    );
    return data.students.some(student => String(student.id) !== String(excludeId ?? ''));

  },

  /**
   * POST /api/students
   * Creates a new student record in MySQL.
   */
  async create(data: Omit<Student, 'id' | 'registeredDate'>): Promise<Student> {
    const payload = {
      roll_number: data.rollNumber?.trim().toUpperCase(),
      full_name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      department: data.department?.trim(),
      semester: parseSemesterNumber(data.semester),
      marks: Math.round(Number(data.marks) * 100) / 100,
    };

    const res = await apiClient.post<{ status: string; message: string; student: Student }>(
      '/students',
      payload
    );
    return res.student;
  },

  /**
   * PUT /api/students/<id>
   * Updates an existing student record in MySQL.
   */
  async update(id: string | number, updates: Partial<Student>): Promise<Student> {
    // If incoming object only has partial keys, fetch full existing record first
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Cannot update: Student #${id} was not found in the database.`);
    }

    const payload = {
      roll_number: (updates.rollNumber ?? existing.rollNumber)?.trim().toUpperCase(),
      full_name: (updates.name ?? existing.name)?.trim(),
      email: (updates.email ?? existing.email)?.trim().toLowerCase(),
      department: (updates.department ?? existing.department)?.trim(),
      semester: parseSemesterNumber(updates.semester ?? existing.semester),
      marks: Math.round(Number(updates.marks ?? existing.marks) * 100) / 100,
    };

    const res = await apiClient.put<{ status: string; message: string; student: Student }>(
      `/students/${existing.id}`,
      payload
    );
    return res.student;
  },

  /**
   * DELETE /api/students/<id>
   * Deletes a student from MySQL.
   */
  async delete(id: string | number): Promise<boolean> {
    await apiClient.delete(`/students/${id}`);
    return true;
  },

  /**
   * GET /api/dashboard/stats
   * Retrieves aggregated statistics computed by MySQL.
   */
  async getDashboardStats() {
    const res = await apiClient.get<any>('/dashboard/stats');
    return {
      totalStudents: res.total_students ?? 0,
      avgMarks: res.average_marks ?? 0.0,
      deptCounts: res.department_distribution ?? {},
      passRate: res.pass_rate ?? 0.0,
      distinctionRate: res.distinction_rate ?? 0,
      standardPassRate: res.standard_pass_rate ?? 0,
      backlogRate: res.backlog_rate ?? 0,
      recentStudents: res.recent_students ?? [],
    };
  },

  /**
   * GET /api/students/results
   * Retrieves examination results ledger and metrics from backend.
   */
  async getResults() {
    const res = await apiClient.get<any>('/students/results');
    return {
      metrics: res.metrics,
      results: res.results || [],
    };
  },

};
