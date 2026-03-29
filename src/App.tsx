import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Results from "./pages/Results";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import MockTestInterface from "./pages/student/MockTestInterface";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PayrollManagement from "./pages/admin/PayrollManagement";
import FeesManagement from "./pages/admin/FeesManagement";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import FeeReminders from "./pages/admin/FeeReminders";
import StudentManagement from "./pages/admin/StudentManagement";
import Announcements from "./pages/admin/Announcements";
import CourseManagement from "./pages/admin/CourseManagement";

import GSAPWrapper from "@/components/GSAPWrapper";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/results" element={<Results />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        {/* Student Portal */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/mock-test" element={<MockTestInterface />} />

        {/* Teacher Portal */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

        {/* Staff Portal */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/payroll" element={<PayrollManagement />} />
        <Route path="/admin/fees" element={<FeesManagement />} />
        <Route path="/admin/attendance" element={<AttendanceManagement />} />
        <Route path="/admin/fee-reminders" element={<FeeReminders />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/courses" element={<CourseManagement />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GSAPWrapper>
          <Navbar />
          <main className="min-h-screen">
            <AppRoutes />
          </main>
          <Footer />
          <FloatingButtons />
        </GSAPWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
