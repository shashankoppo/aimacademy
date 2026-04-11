/**
 * Academic & Financial Algos for AIM Academy
 */

// 1. Attendance Logic
export type AttendanceStatus = "Excellent" | "Regular" | "Irregular" | "At Risk";

export const getAttendanceStatus = (percentage: number): AttendanceStatus => {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 75) return "Regular";
  if (percentage >= 60) return "Irregular";
  return "At Risk";
};

export const getAttendanceColor = (percentage: number): string => {
  if (percentage >= 90) return "bg-emerald-500";
  if (percentage >= 75) return "bg-blue-500";
  if (percentage >= 60) return "bg-amber-500";
  return "bg-red-500";
};

// 2. Fee Logic
export type FeeStatus = "Paid" | "Part Paid" | "Overdue";

export const calculateFeeStatus = (totalPaid: number, totalAmount: number, dueDate: Date): FeeStatus => {
  if (totalPaid >= totalAmount) return "Paid";
  if (new Date() > dueDate && totalPaid < totalAmount) return "Overdue";
  if (totalPaid > 0) return "Part Paid";
  return "Overdue"; // Or "Unpaid" but based on the system's labels
};

// 3. Payroll Logic
export type PayrollStatus = "Paid" | "Pending" | "Processing";

// 4. Mock Test Logic
export interface QuestionResult {
  isCorrect: boolean;
  skipped: boolean;
}

export const calculateMockTestScore = (results: QuestionResult[]) => {
  const total = results.length;
  const correct = results.filter(r => r.isCorrect).length;
  const wrong = results.filter(r => !r.isCorrect && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const percentage = total > 0 ? (correct / total) * 100 : 0;
  
  return {
    total,
    correct,
    wrong,
    skipped,
    percentage: parseFloat(percentage.toFixed(2))
  };
};

// 5. Fee Reminder Engine Algo
export const shouldSendReminder = (dueDate: Date, lastReminderDate?: Date): boolean => {
  const today = new Date();
  const diffInDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Logic from report: 7 days before, On due date, 3 days after, 7 days after, 14 days after
  const checkDays = [7, 0, -3, -7, -14];
  
  if (checkDays.includes(diffInDays)) {
    // Basic throttle: don't send if we sent one today
    if (lastReminderDate && lastReminderDate.toDateString() === today.toDateString()) {
      return false;
    }
    return true;
  }
  
  return false;
};
