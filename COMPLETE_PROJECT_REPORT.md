# COMPLETE PROJECT REPORT

## AIM Academy Integrated Academic & Financial Management Portal (Version 2.0)

**Prepared For:** AIM Academy  
**Execution Partner:** Evolucentsphere Pvt Ltd (ELSxGlobal Division)  
**Project Type:** Institutional Digital Transformation Portal  
**Architecture Status:** Core System Designed & Deployment Ready  
**Date:** March 2026

---

# 1. EXECUTIVE SUMMARY

The AIM Academy Integrated Academic & Financial Management Portal is designed as a centralized institutional platform to digitize academic operations, automate administrative workflows, and improve financial visibility across the organization.

The system introduces structured access for students, teachers, staff, and administrators while integrating mock testing infrastructure, attendance monitoring, course lifecycle control, and a mandatory automated fee reminder system.

This transformation enables AIM Academy to operate as a modern hybrid education institution with scalable infrastructure for future LMS expansion and multi-branch growth.

---

# 2. PROJECT OBJECTIVES

The primary objectives of the portal include:

* Centralized academic monitoring
* Digital attendance automation
* Mock test performance tracking
* Course lifecycle management
* Staff workflow coordination
* Mandatory financial tracking system
* Automated fee reminder engine
* Role-based administrative control
* Institutional data visibility dashboard

The system reduces manual workload and increases operational transparency across departments.

---

# 3. MULTI-ROLE PORTAL ARCHITECTURE

The portal is structured using a hierarchical institutional access model.

```
Administrator
     ↓
Academic Coordinator
     ↓
Faculty Panel
     ↓
Student Dashboard
     ↓
Support Staff Interface
```

Each role receives controlled permissions and personalized dashboards based on responsibilities.

### Implemented Routes & Pages

| Route | Module | Role |
|-------|--------|------|
| `/login` | Unified Authentication Portal | All Users |
| `/student/dashboard` | Student Excellence Center | Student |
| `/student/mock-test` | Interactive Mock Test Engine | Student |
| `/teacher/dashboard` | Faculty & Mentorship Panel | Teacher |
| `/staff/dashboard` | Operational Command Portal | Staff |
| `/admin` | Admin Command Center | Administrator |
| `/admin/students` | Student Management | Administrator |
| `/admin/courses` | Course Lifecycle Management | Administrator |
| `/admin/fees` | Fee Collection Tracker | Administrator |
| `/admin/fee-reminders` | Automated Fee Reminder Engine | Administrator |
| `/admin/payroll` | Payroll Management | Administrator |
| `/admin/attendance` | Attendance Analytics | Administrator |
| `/admin/announcements` | Broadcast & Notices | Administrator |

---

# 4. STUDENT PANEL MODULE

The Student Dashboard provides complete academic visibility and performance tracking support.

### Core Features:

- Course enrollment visibility with progress tracking bars
- Mock test participation access with direct "Start Test" links
- Performance analytics dashboard (Study Hours, Tests Taken, Global Rank)
- Academy alerts and notification panel
- Fee reminder notifications
- Success Blueprint sidebar (Download Study Plan, Book Mentor Slot)

### Mock Test Intelligence System:

- 10+ question interactive test interface
- Real-time countdown timer (auto-submit on expiry)
- Question navigator with answered/unanswered/flagged tracking
- Flag-for-review capability
- Instant result generation with percentage scoring
- Full answer review with correct/incorrect analysis
- Color-coded performance breakdown (Correct / Wrong / Skipped)

---

# 5. TEACHER PANEL MODULE

The Teacher Dashboard enables efficient classroom and evaluation management.

### Faculty Capabilities:

- **Assign Courses Tab:** Radio-select courses and assign to batches or individual students
- **Mock Test Manager Tab:** Create/edit/delete mock tests with question count, duration, and scheduling
- **Student Analytics Tab:** Performance leaderboard with Average %, Tests Taken, and Status indicators
- Batch monitoring dashboard
- Student search and filtering

---

# 6. STAFF MANAGEMENT MODULE

The Staff Panel supports operational coordination across institutional workflows.

### Key Functions:

- Daily attendance log (clock-in/out tracking, Present/Late/On Leave status)
- Financial reports download (PDF/DOCX)
- Academic audit generation
- Important task checklist (interactive)
- Upcoming events calendar panel
- Quick stats (Staff Present, Today's Collection, New Admissions, Pending Tasks)

---

# 7. ADMINISTRATOR CONTROL PANEL

The Administrator Dashboard functions as the institutional command center.

### Management Modules (8 Modules):

| Module | Description |
|--------|-------------|
| **Student Management** | Full CRUD operations, filtering by course/status, attendance bars, pagination |
| **Course Management** | Course cards with lifecycle (Active/Upcoming/Completed), batch/students/faculty allocation |
| **Fees Management** | Student fee table with Paid/Overdue/Part Paid status, collection analytics |
| **Fee Reminder Engine** | Overdue tracking, bulk reminders, notification channels, automated workflow |
| **Payroll Management** | Staff salary table with payment status, CSV import, payroll analytics |
| **Attendance Tracker** | Dual-view (Students/Staff), attendance rates, At Risk identification |
| **Announcements** | Create/publish notices, audience targeting, pinning, type categorization |
| **System Settings** | Platform configuration (future expansion) |

### Additional Features:

- Recent Transactions feed
- Portal preview links (Student/Teacher/Staff)
- System Health monitoring (Database, Payment Gateway, Notification Engine)
- Financial Reports download

---

# 8. MOCK TEST INTELLIGENCE SYSTEM

The Mock Test Engine strengthens competitive exam readiness through structured assessment workflows.

### Technical Implementation:

- React state-managed question engine
- `useEffect`-powered countdown timer
- Answer persistence across question navigation
- Flag/unflag system using `Set` data structure
- Auto-submission on timer expiry
- Post-test analytics with question-by-question review

### Features Include:

- Subject-wise test creation (Indian Polity, History, Geography, etc.)
- Timed assessments with visual countdown
- Question navigator grid with status indicators
- Performance comparison analytics
- Weak-area identification through answer review

---

# 9. COURSE MANAGEMENT FRAMEWORK

The Course Lifecycle Module supports structured academic program delivery.

### Capabilities Include:

- Course card grid with status badges (Active / Upcoming / Completed)
- Batch count and student enrollment numbers
- Faculty allocation display
- Duration and fee information
- Completion progress bars
- View / Edit / Assign Students actions per course

### Courses Managed:

| Course | Duration | Fee |
|--------|----------|-----|
| UPSC Civil Services (CSE) | 12–18 Months | ₹1,20,000 |
| State PSC (MPPSC) | 6–12 Months | ₹75,000 |
| SSC CGL / CHSL | 6 Months | ₹45,000 |
| Banking / IBPS | 4–6 Months | ₹40,000 |
| Railways / Defence / Teaching | 3–6 Months | ₹30,000 |

---

# 10. ATTENDANCE AUTOMATION MODULE

The Attendance Intelligence System converts daily attendance into structured institutional data.

### Functions Include:

- Dual-view toggle: Student Attendance / Staff Attendance
- Student attendance with batch, present/absent counts, rate percentage, and status classification
- Staff attendance with clock-in/out times and status
- Search and filter by name, batch, or role
- Export report capability
- Quick stats: Total Present, Absent, Staff Present, Average Rate

### Status Classifications:

- **Excellent:** 90%+ attendance
- **Regular:** 75–89%
- **Irregular:** 60–74%
- **At Risk:** Below 60%

---

# 11. MANDATORY FEES REMINDER & FINANCIAL CONTROL MODULE

This module is implemented as a core administrative system within Version 2.0 architecture.

### Purpose:

- Ensure timely fee collection
- Reduce manual follow-ups
- Automate reminder workflows
- Improve financial transparency
- Provide real-time revenue tracking

---

## ADMIN FINANCIAL DASHBOARD FEATURES

The administrator receives real-time financial visibility including:

- Total Outstanding amount
- Overdue student count
- Reminders sent (MTD)
- Revenue collected after reminders

---

## AUTOMATED FEES REMINDER ENGINE

The system supports reminders for:

- Upcoming installment payments
- Due-date alerts
- Overdue payment notifications
- Final reminder escalations

### Supported Notification Channels:

| Channel | Status |
|---------|--------|
| Dashboard Alerts | ✅ Active |
| SMS Notifications | ✅ Active |
| WhatsApp Messages | 🔵 Ready |
| Email Reminders | 🔵 Ready |

---

## INSTALLMENT MANAGEMENT SYSTEM

### Flexible payment structures supported:

- Full-payment mode
- Installment-based payment plans
- Custom due-date configuration

### Administrator controls include:

- Individual reminder sending (bell button per student)
- Bulk reminder broadcasting (select all + send)
- Payment status tracking
- Outstanding student filtering
- Overdue days counter

---

## AUTOMATED REMINDER WORKFLOW

```
Admission Completed
        ↓
Installment Schedule Generated
        ↓
7 Days Before → Gentle Reminder
        ↓
On Due Date → Alert Triggered
        ↓
3 Days After → Overdue Notice
        ↓
7 Days After → Escalation Alert
        ↓
14 Days After → Admin Notification
```

---

# 12. PAYROLL VISIBILITY SYSTEM

### Coverage Includes:

- Faculty payment tracking (Dr. Sandeep Kumar, Meera Nair, etc.)
- Staff salary monitoring with Paid/Pending/Processing status
- CSV template import for bulk staff records
- Total Payroll MTD analytics
- Export functionality

---

# 13. DESIGN SYSTEM

## THE SCHOLARLY EDITORIAL INTERFACE FRAMEWORK

### Design Goals:

- Institutional authority
- High readability
- Structured navigation clarity
- Professional academic interface consistency

### Typography:

| Use Case | Font | Weight |
|----------|------|--------|
| Headlines | Inter | 900 (Black) |
| Body Text | Inter | 400–500 |
| Labels/Badges | Inter | 700 (Bold), UPPERCASE |
| Editorial Accents | Playfair Display | Italic |

---

## COLOR STRATEGY (60–30–10 MODEL)

| Layer | Weight | Color | Purpose |
|-------|--------|-------|---------|
| Academic Base | 60% | White / #F8FAFC | Readability |
| Authority | 30% | Coursera Blue #0056D2 | Headers, CTAs |
| Interaction | 10% | Status colors | Alerts, badges |

### Status Color System:

| Status | Color | Usage |
|--------|-------|-------|
| Paid / Excellent / Present | Emerald Green | Positive states |
| Overdue / At Risk | Red | Critical alerts |
| Part Paid / Irregular / Late | Amber | Warning states |
| Processing / Active | Blue | Neutral active |

---

# 14. TECHNICAL INFRASTRUCTURE STACK

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | React 18 (component-based modular UI) |
| **Language** | TypeScript (type-safe development) |
| **Build Engine** | Vite (high-speed bundling) |
| **Routing** | React Router v6 (SPA navigation) |
| **State Management** | React Hooks (useState, useEffect) |
| **Animation** | GSAP + Framer Motion |
| **Styling** | Tailwind CSS (custom academic theme) |
| **Icons** | Lucide-React (200+ icons) |
| **Data Fetching** | TanStack React Query |
| **Notifications** | Sonner Toast System |
| **Deployment** | AWS-ready architecture |

### File Structure:

```
src/
├── pages/
│   ├── Index.tsx              (Homepage)
│   ├── About.tsx              (About Us)
│   ├── Courses.tsx            (Course Catalog)
│   ├── Results.tsx            (Results Page)
│   ├── Resources.tsx          (Study Resources)
│   ├── Contact.tsx            (Contact/Enrollment)
│   ├── Login.tsx              (Unified Auth Portal)
│   ├── student/
│   │   ├── StudentDashboard.tsx
│   │   └── MockTestInterface.tsx
│   ├── teacher/
│   │   └── TeacherDashboard.tsx
│   ├── staff/
│   │   └── StaffDashboard.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── StudentManagement.tsx
│       ├── CourseManagement.tsx
│       ├── FeesManagement.tsx
│       ├── FeeReminders.tsx
│       ├── PayrollManagement.tsx
│       ├── AttendanceManagement.tsx
│       └── Announcements.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── GSAPWrapper.tsx
│   └── ui/ (shadcn components)
└── App.tsx (Router Configuration)
```

---

# 15. SECURITY ARCHITECTURE MODEL

### Protection Layers Include:

- Role-based authentication (Student / Teacher / Staff / Admin)
- Visual role selection with distinct color coding
- Secure session management architecture
- Activity logging readiness
- Cloud-secure deployment compatibility

### Future-ready for:

- OTP login systems
- Biometric attendance integration
- Single sign-on expansion
- JWT token-based API authentication

---

# 16. DATA STRUCTURE STRATEGY

Academic datasets managed within the portal include:

- Student academic records (enrollment, attendance, performance)
- Course allocation structures (batches, faculty, schedules)
- Mock test analytics (scores, time spent, weak areas)
- Attendance intelligence reports (daily, monthly, trends)
- Faculty activity logs (teaching hours, evaluations)
- Payroll metadata (salaries, payment history)
- Fee payment tracking records (installments, reminders, receipts)

---

# 17. FUTURE EXPANSION ROADMAP

| Phase | Module | Timeline |
|-------|--------|----------|
| Phase 3A | Online Live Classes Module | Q2 2026 |
| Phase 3B | Video Lecture Library | Q2 2026 |
| Phase 4A | Digital Certification Engine | Q3 2026 |
| Phase 4B | Parent Monitoring Dashboard | Q3 2026 |
| Phase 5 | Mobile Application (iOS & Android) | Q4 2026 |
| Phase 6A | AI-based Performance Analytics ("AIM-BOT") | Q1 2027 |
| Phase 6B | Multi-branch Campus Sync | Q1 2027 |
| Phase 7 | Online Payment Gateway + Auto Receipts | Q2 2027 |

---

# 18. VERIFICATION PLAN

System validation checklist:

- [x] Role-based login verification (4 roles tested)
- [x] Student dashboard testing (courses, stats, alerts)
- [x] Mock test engine (timer, navigation, scoring, review)
- [x] Teacher module functionality (assign, create tests, analytics)
- [x] Staff dashboard (attendance, reports, tasks)
- [x] Admin command center (all 8 modules linked)
- [x] Student management (CRUD, filtering, pagination)
- [x] Course management (lifecycle, cards, progress)
- [x] Attendance workflow (dual view, stats)
- [x] Fee collection tracker (table, status badges)
- [x] Fee reminder engine (overdue list, bulk send, workflow)
- [x] Payroll management (table, export, analytics)
- [x] Announcements (create, pin, categorize, target)
- [x] TypeScript compilation — Zero errors
- [x] Route integrity — All 20+ routes active
- [x] Responsive design — Mobile-ready layouts
- [x] Accessibility — aria-labels on all icon buttons

---

# 19. INSTITUTIONAL IMPACT SUMMARY

After implementation, AIM Academy gains:

- ✅ Centralized academic monitoring system
- ✅ Automated attendance tracking (Students + Staff)
- ✅ Structured mock test infrastructure with instant results
- ✅ Integrated course lifecycle management
- ✅ Mandatory financial reminder automation
- ✅ Improved fee collection efficiency
- ✅ Administrative transparency dashboards
- ✅ Faculty workflow optimization
- ✅ Multi-channel notification readiness (Dashboard, SMS, WhatsApp, Email)
- ✅ Future-ready LMS expansion foundation

This positions AIM Academy as a digitally structured competitive education institution prepared for hybrid learning scale-up. 🚀

---

# 20. AUTHORIZATION SUMMARY

| Field | Detail |
|-------|--------|
| **Project Title** | AIM Academy Integrated Academic & Financial Portal |
| **Version** | 2.0 |
| **Technology Partner** | Evolucentsphere Pvt Ltd |
| **Strategic Division** | ELSxGlobal |
| **Total Pages Implemented** | 20+ |
| **Total Admin Modules** | 8 |
| **Portal Roles** | 4 (Student, Teacher, Staff, Admin) |
| **TypeScript Compilation** | ✅ Zero Errors |
| **Deployment Stage** | ARCHITECTURE COMPLETE — READY FOR IMPLEMENTATION PHASE ✅ |

---

*This document is confidential and intended solely for AIM Academy and Evolucentsphere Pvt Ltd stakeholders.*  
*© 2026 Evolucentsphere Pvt Ltd — ELSxGlobal Division. All Rights Reserved.*
