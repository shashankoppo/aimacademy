import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest, getStoredUser } from "@/lib/admin-api";

export type FeeStatus = "Paid" | "Part Paid" | "Overdue";
export type CourseStatus = "Active" | "Upcoming" | "Completed";
export type PayrollStatus = "Paid" | "Pending" | "Processing";
export type StaffAttendanceStatus = "Present" | "Late" | "On Leave";

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
  totalFee: number;
  paidFee: number;
  nextInstallmentLabel: string;
  nextInstallmentAmount: number;
  nextDueDate: string;
  remindersSent: number;
  lastReminderAt?: string | null;
  courseId?: number | null;
}

export interface Course {
  id: number;
  title: string;
  students: number;
  faculty: string;
  status: CourseStatus;
  duration: string;
  fee: string;
}

export interface Announcement {
  id: string;
  title: string;
  target: string;
  content: string;
  isPinned: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  salary: number;
  payrollStatus: PayrollStatus;
  payrollDate: string;
  attendanceStatus: StaffAttendanceStatus;
  clockIn: string;
  clockOut: string;
}

export interface FacultyMember {
  name: string;
  sub: string;
  img: string;
}

export interface WebsiteSettings {
  id?: number;
  bannerText: string;
  slides: string[];
  faculty: FacultyMember[];
}

export interface NoteItem {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string | null;
  fileUrl?: string | null;
  viewUrl?: string | null;
  isVisible: boolean;
  displayOrder: number;
}

export interface VideoItem {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

interface DashboardData {
  students: Student[];
  courses: Course[];
  announcements: Announcement[];
  staff: StaffMember[];
  notes: NoteItem[];
  videos: VideoItem[];
  websiteSettings: WebsiteSettings | null;
}

type PublicContentData = Pick<DashboardData, "notes" | "videos" | "websiteSettings">;

interface AdminContextType extends DashboardData {
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addStudent: (student: Omit<Student, "id" | "remindersSent" | "lastReminderAt" | "courseId">) => Promise<Student>;
  updateStudent: (id: number, student: Partial<Student>) => Promise<Student>;
  deleteStudent: (id: number) => Promise<void>;
  addCourse: (course: Omit<Course, "id">) => Promise<Course>;
  updateCourse: (id: number, course: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: number) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt">) => Promise<Announcement>;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
  processPayroll: () => Promise<void>;
  markAttendance: () => Promise<void>;
  sendFeeReminders: (studentIds: number[]) => Promise<void>;
  updateWebsiteSettings: (settings: WebsiteSettings) => Promise<WebsiteSettings>;
  addNote: (note: Omit<NoteItem, "id">) => Promise<NoteItem>;
  updateNote: (id: number, note: Partial<NoteItem>) => Promise<NoteItem>;
  deleteNote: (id: number) => Promise<void>;
  addVideo: (video: Omit<VideoItem, "id" | "thumbnailUrl"> & { thumbnailUrl?: string }) => Promise<VideoItem>;
  updateVideo: (id: number, video: Partial<VideoItem>) => Promise<VideoItem>;
  deleteVideo: (id: number) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const defaultSettings: WebsiteSettings = {
  bannerText: "New Batch Admissions Open for MP PSC & UPSC Foundation 2026-27 | AIM Academy: Synonym of Success | Call: +91 70672 31189",
  slides: ["/images/HEROMAIN 007.jpeg", "/images/STUDENT BANNER 01.jpeg", "/images/STUDENT_BANNER.jpeg"],
  faculty: [
    { name: "Rahul Sir", sub: "History Strategy Expert", img: "/images/faculty_1.png" },
    { name: "Priya Ma'am", sub: "Science Specialist", img: "/images/faculty_2.png" },
    { name: "Amit Sir", sub: "Maths Wizard", img: "/images/faculty_3.png" },
    { name: "Vikas Sir", sub: "Geography Mentor", img: "/images/faculty_4.png" },
    { name: "Neha Ma'am", sub: "Current Affairs Analysis", img: "/images/faculty_5.png" },
  ],
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncLocalWebsiteSettings = useCallback((settings: WebsiteSettings | null) => {
    if (!settings) return;
    localStorage.setItem("aim_top_banner", settings.bannerText);
    localStorage.setItem("aim_hero_slides", JSON.stringify(settings.slides));
    localStorage.setItem("aim_faculty_data", JSON.stringify(settings.faculty));
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<DashboardData>("/admin/overview");
      setStudents(data.students);
      setCourses(data.courses);
      setAnnouncements(data.announcements);
      setStaff(data.staff);
      setNotes(data.notes);
      setVideos(data.videos);
      setWebsiteSettings(data.websiteSettings ?? defaultSettings);
      syncLocalWebsiteSettings(data.websiteSettings ?? defaultSettings);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load admin data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [syncLocalWebsiteSettings]);

  const refreshPublicData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<PublicContentData>("/public/content");
      setNotes(data.notes);
      setVideos(data.videos);
      setWebsiteSettings(data.websiteSettings ?? defaultSettings);
      syncLocalWebsiteSettings(data.websiteSettings ?? defaultSettings);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load public content";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [syncLocalWebsiteSettings]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();
    const isAdmin = (user?.role ?? "").toString().toUpperCase() === "ADMIN";
    const isAdminRoute = location.pathname.startsWith("/admin");
    if (isAdminRoute) {
      if (token && isAdmin) {
        void refreshData();
      } else {
        setLoading(false);
      }
      return;
    }
    void refreshPublicData();
  }, [location.pathname, refreshData, refreshPublicData]);

  const addStudent = async (student: Omit<Student, "id" | "remindersSent" | "lastReminderAt" | "courseId">) => {
    const created = await apiRequest<Student>("/admin/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
    setStudents((prev) => [...prev, created]);
    setCourses((prev) => prev.map((course) => (course.title === created.course ? { ...course, students: course.students + 1 } : course)));
    return created;
  };

  const updateStudent = async (id: number, student: Partial<Student>) => {
    const previousStudent = students.find((entry) => entry.id === id);
    const updated = await apiRequest<Student>(`/admin/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(student),
    });
    setStudents((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    setCourses((prev) =>
      prev.map((course) => {
        if (previousStudent?.course === course.title && updated.course !== course.title) {
          return { ...course, students: Math.max(0, course.students - 1) };
        }
        if (updated.course === course.title && previousStudent?.course !== course.title) {
          return { ...course, students: course.students + 1 };
        }
        return course;
      }),
    );
    return updated;
  };

  const deleteStudent = async (id: number) => {
    const existing = students.find((entry) => entry.id === id);
    await apiRequest<{ success: true }>(`/admin/students/${id}`, { method: "DELETE" });
    setStudents((prev) => prev.filter((entry) => entry.id !== id));
    if (existing) {
      setCourses((prev) =>
        prev.map((course) => (course.title === existing.course ? { ...course, students: Math.max(0, course.students - 1) } : course)),
      );
    }
  };

  const addCourse = async (course: Omit<Course, "id">) => {
    const created = await apiRequest<Course>("/admin/courses", {
      method: "POST",
      body: JSON.stringify(course),
    });
    setCourses((prev) => [...prev, created]);
    return created;
  };

  const updateCourse = async (id: number, course: Partial<Course>) => {
    const previous = courses.find((entry) => entry.id === id);
    const updated = await apiRequest<Course>(`/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(course),
    });
    setCourses((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    if (previous && course.title && course.title !== previous.title) {
      setStudents((prev) => prev.map((student) => (student.course === previous.title ? { ...student, course: course.title! } : student)));
    }
    return updated;
  };

  const deleteCourse = async (id: number) => {
    await apiRequest<{ success: true }>(`/admin/courses/${id}`, { method: "DELETE" });
    setCourses((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addAnnouncement = async (announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt">) => {
    const created = await apiRequest<Announcement>("/admin/announcements", {
      method: "POST",
      body: JSON.stringify(announcement),
    });
    setAnnouncements((prev) => [created, ...prev]);
    return created;
  };

  const updateAnnouncement = async (id: string, announcement: Partial<Announcement>) => {
    const updated = await apiRequest<Announcement>(`/admin/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(announcement),
    });
    setAnnouncements((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    return updated;
  };

  const deleteAnnouncement = async (id: string) => {
    await apiRequest<{ success: true }>(`/admin/announcements/${id}`, { method: "DELETE" });
    setAnnouncements((prev) => prev.filter((entry) => entry.id !== id));
  };

  const processPayroll = async () => {
    const updated = await apiRequest<StaffMember[]>("/admin/payroll/process", { method: "POST" });
    setStaff(updated);
  };

  const markAttendance = async () => {
    const updated = await apiRequest<Student[]>("/admin/attendance/mark-today", { method: "POST" });
    setStudents(updated);
    const latestStaff = await apiRequest<StaffMember[]>("/admin/staff");
    setStaff(latestStaff);
  };

  const sendFeeReminders = async (studentIds: number[]) => {
    const updatedStudents = await apiRequest<Student[]>("/admin/fee-reminders/send", {
      method: "POST",
      body: JSON.stringify({ studentIds }),
    });
    setStudents((prev) =>
      prev.map((student) => updatedStudents.find((entry) => entry.id === student.id) ?? student),
    );
  };

  const updateWebsiteSettingsAction = useCallback(async (settings: WebsiteSettings) => {
    const updated = await apiRequest<WebsiteSettings>("/admin/website-settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    setWebsiteSettings(updated);
    syncLocalWebsiteSettings(updated);
    return updated;
  }, [syncLocalWebsiteSettings]);

  const addNote = async (note: Omit<NoteItem, "id">) => {
    const created = await apiRequest<NoteItem>("/admin/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });
    setNotes((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
    return created;
  };

  const updateNote = async (id: number, note: Partial<NoteItem>) => {
    const updated = await apiRequest<NoteItem>(`/admin/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(note),
    });
    setNotes((prev) => prev.map((entry) => (entry.id === id ? updated : entry)).sort((a, b) => a.displayOrder - b.displayOrder));
    return updated;
  };

  const deleteNote = async (id: number) => {
    await apiRequest<{ success: true }>(`/admin/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addVideo = async (video: Omit<VideoItem, "id" | "thumbnailUrl"> & { thumbnailUrl?: string }) => {
    const created = await apiRequest<VideoItem>("/admin/videos", {
      method: "POST",
      body: JSON.stringify(video),
    });
    setVideos((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
    return created;
  };

  const updateVideo = async (id: number, video: Partial<VideoItem>) => {
    const updated = await apiRequest<VideoItem>(`/admin/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(video),
    });
    setVideos((prev) => prev.map((entry) => (entry.id === id ? updated : entry)).sort((a, b) => a.displayOrder - b.displayOrder));
    return updated;
  };

  const deleteVideo = async (id: number) => {
    await apiRequest<{ success: true }>(`/admin/videos/${id}`, { method: "DELETE" });
    setVideos((prev) => prev.filter((entry) => entry.id !== id));
  };

  const value = useMemo<AdminContextType>(
    () => ({
      students,
      courses,
      announcements,
      staff,
      notes,
      videos,
      websiteSettings,
      loading,
      error,
      refreshData,
      addStudent,
      updateStudent,
      deleteStudent,
      addCourse,
      updateCourse,
      deleteCourse,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      processPayroll,
      markAttendance,
      sendFeeReminders,
      updateWebsiteSettings: updateWebsiteSettingsAction,
      addNote,
      updateNote,
      deleteNote,
      addVideo,
      updateVideo,
      deleteVideo,
    }),
    [
      students,
      courses,
      announcements,
      staff,
      notes,
      videos,
      websiteSettings,
      loading,
      error,
      refreshData,
      deleteStudent,
      updateCourse,
      updateStudent,
      updateWebsiteSettingsAction,
      addNote,
      updateNote,
      deleteNote,
      addVideo,
      updateVideo,
      deleteVideo,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdminData = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminProvider");
  }
  return context;
};
