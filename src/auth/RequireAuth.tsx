import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser } from "@/lib/admin-api";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
  STAFF: "/staff/dashboard",
};

// Decode JWT payload without verification (for expiry check only)
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

export default function RequireAuth(props: { children: React.ReactElement; allowedRoles: string[] }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user || isTokenExpired(token)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = (user.role ?? "").toString().toUpperCase();
  if (!props.allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? "/"} replace />;
  }

  return props.children;
}

