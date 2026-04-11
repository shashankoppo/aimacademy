import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeeStatus, AttendanceStatus, getAttendanceStatus } from '@/lib/academic-logic';

export interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  batch: string;
  joinDate: string;
  feeStatus: FeeStatus;
  attendance: string;
  phone: string;
}

export interface Course {
  id: number;
  title: string;
  students: number;
  faculty: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  duration: string;
  fee: string;
}

interface AdminContextType {
  students: Student[];
  courses: Course[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: number, student: Partial<Student>) => void;
  deleteStudent: (id: number) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: number, course: Partial<Course>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: "Aarav Mehta", email: "aarav@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Paid", attendance: "88%", phone: "+91 98765 43210" },
  { id: 2, name: "Deepa Nair", email: "deepa@aim.edu", course: "SSC CGL Fast Track", batch: "Evening", joinDate: "Mar 2025", feeStatus: "Paid", attendance: "96%", phone: "+91 87654 32109" },
  { id: 3, name: "Rahul Kumar", email: "rahul@aim.edu", course: "Banking IBPS", batch: "Morning", joinDate: "Jun 2025", feeStatus: "Overdue", attendance: "72%", phone: "+91 76543 21098" },
  { id: 4, name: "Priya Sharma", email: "priya@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "80%", phone: "+91 65432 10987" },
  { id: 5, name: "Vikram Singh", email: "vikram@aim.edu", course: "MPPSC Evening", batch: "Evening", joinDate: "Sep 2025", feeStatus: "Paid", attendance: "92%", phone: "+91 54321 09876" },
  { id: 6, name: "Ananya Joshi", email: "ananya@aim.edu", course: "SSC CGL Fast Track", batch: "Morning", joinDate: "Feb 2025", feeStatus: "Overdue", attendance: "60%", phone: "+91 43210 98765" },
  { id: 7, name: "Kunal Thakur", email: "kunal@aim.edu", course: "MPPSC Evening", batch: "Weekend", joinDate: "Nov 2025", feeStatus: "Paid", attendance: "85%", phone: "+91 32109 87654" },
  { id: 8, name: "Meghna Rao", email: "meghna@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "78%", phone: "+91 21098 76543" },
];

const INITIAL_COURSES: Course[] = [
  { id: 1, title: "UPSC Civil Services (CSE)", students: 450, faculty: "Dr. Sandeep Kumar", status: "Active", duration: "12–18 Months", fee: "₹1,20,000" },
  { id: 2, title: "State PSC (MPPSC)", students: 320, faculty: "Meera Nair", status: "Active", duration: "6–12 Months", fee: "₹75,000" },
  { id: 3, title: "SSC CGL / CHSL", students: 280, faculty: "Rahul Verma", status: "Upcoming", duration: "6 Months", fee: "₹45,000" },
  { id: 4, title: "Banking / IBPS", students: 190, faculty: "Suresh Pillai", status: "Active", duration: "4–6 Months", fee: "₹40,000" },
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('aim_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('aim_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  useEffect(() => {
    localStorage.setItem('aim_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('aim_courses', JSON.stringify(courses));
  }, [courses]);

  const addStudent = (student: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...student, id: Date.now() }]);
  };

  const updateStudent = (id: number, student: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...student } : s));
  };

  const deleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addCourse = (course: Omit<Course, 'id'>) => {
    setCourses(prev => [...prev, { ...course, id: Date.now() }]);
  };

  const updateCourse = (id: number, course: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...course } : c));
  };

  return (
    <AdminContext.Provider value={{ students, courses, addStudent, updateStudent, deleteStudent, addCourse, updateCourse }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminProvider');
  }
  return context;
};
