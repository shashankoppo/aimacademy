import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
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
import LeadManagement from "./pages/admin/LeadManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import AdminWebsiteSettings from "./pages/admin/AdminWebsiteSettings";
import WhatsAppCenter from "./pages/admin/WhatsAppCenter";
import NotesManagement from "./pages/admin/NotesManagement";
import VideoManagement from "./pages/admin/VideoManagement";
import UserManagement from "./pages/admin/UserManagement";
import MockTestManagement from "./pages/admin/MockTestManagement";

import GSAPWrapper from "@/components/GSAPWrapper";
import { AdminProvider } from "@/hooks/useAdminData";
import AdminLayout from "@/components/AdminLayout";
import RequireAuth from "@/auth/RequireAuth";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence 
      mode="wait" 
      onExitComplete={() => {
        if (typeof window !== "undefined") {
          if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo(0, 0);
          }
        }
      }}
    >
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/results" element={<Results />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Panel Redirects */}
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />

        {/* Student Portal */}
        <Route
          path="/student/dashboard"
          element={
            <RequireAuth allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/student/mock-test"
          element={
            <RequireAuth allowedRoles={["STUDENT"]}>
              <MockTestInterface />
            </RequireAuth>
          }
        />

        {/* Teacher Portal */}
        <Route
          path="/teacher/dashboard"
          element={
            <RequireAuth allowedRoles={["TEACHER"]}>
              <TeacherDashboard />
            </RequireAuth>
          }
        />

        {/* Staff Portal */}
        <Route
          path="/staff/dashboard"
          element={
            <RequireAuth allowedRoles={["STAFF"]}>
              <StaffDashboard />
            </RequireAuth>
          }
        />

        {/* Admin Portal */}
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/payroll"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <PayrollManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <FeesManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <AttendanceManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/fee-reminders"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <FeeReminders />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/students"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <StudentManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <Announcements />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/notes"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <NotesManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <VideoManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <CourseManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/mock-tests"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <MockTestManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <LeadManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/website-settings"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <AdminWebsiteSettings />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/admin/whatsapp"
          element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <WhatsAppCenter />
              </AdminLayout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    const simplifiedHindiReplacements: [RegExp, string][] = [
      [/लक्ष्य अकादमी/gi, "ए आई एम एकेडमी"],
      [/लक्ष्य एकेडमी/gi, "ए आई एम एकेडमी"],
      [/एआईएम अकादमी/gi, "ए आई एम एकेडमी"],
      [/एआईएम एकेडमी/gi, "ए आई एम एकेडमी"],
      [/ए आई एम अकादमी/gi, "ए आई एम एकेडमी"],
      [/ए\.आई\.एम\./gi, "ए आई एम"],
      [/एआईएम/gi, "ए आई एम"],
      [/परामर्श/gi, "काउंसलिंग"],
      [/शुल्क/gi, "फीस"],
      [/प्रवेश/gi, "एडमिशन"],
      [/पाठ्यक्रम/gi, "सिलेबस/कोर्सेस"],
      [/वेतनपत्रक/gi, "पेरोल (सैलरी)"]
    ];

    const simplifyText = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let val = node.nodeValue || "";
        let modified = false;
        simplifiedHindiReplacements.forEach(([regex, replacement]) => {
          if (regex.test(val)) {
            val = val.replace(regex, replacement);
            modified = true;
          }
        });
        if (modified) {
          node.nodeValue = val;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList?.contains("notranslate") || el.getAttribute("translate") === "no") {
          return;
        }
        el.childNodes.forEach(simplifyText);
      }
    };

    const observer = new MutationObserver(() => {
      const isHindi = document.documentElement.lang === "hi";
      if (isHindi) {
        observer.disconnect();
        simplifyText(document.body);
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  const isDashboard = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/student') || 
                      location.pathname.startsWith('/teacher') || 
                      location.pathname.startsWith('/staff');

  const content = (
    <>
      <ScrollToTop />
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? "" : "min-h-screen"}>
        <AppRoutes />
      </main>
      {!isDashboard && <Footer />}
      {!isDashboard && <FloatingButtons />}
    </>
  );

  return isDashboard ? content : <GSAPWrapper>{content}</GSAPWrapper>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
