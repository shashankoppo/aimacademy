import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, GraduationCap, Briefcase, ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/admin-api";



type RoleKey = "student" | "teacher" | "staff" | "admin";

const Login = () => {
  const [role, setRole] = useState<"student" | "teacher" | "staff" | "admin">("student");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userId.trim().toLowerCase(), password, role }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        const actualRole = (data.user?.role ?? "").toString().toUpperCase();
        const redirects: Record<string, string> = {
          STUDENT: "/student/dashboard",
          TEACHER: "/teacher/dashboard",
          STAFF: "/staff/dashboard",
          ADMIN: "/admin",
        };
        navigate(redirects[actualRole] || "/");
      } else {
        setError(data.message || "Invalid User ID or Password.");
      }
    } catch (err) {
      setError("Server is not responding. Please check backend connection.");
    }
  };

  const roles = [
    { id: "student", label: "Student", icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
    { id: "teacher", label: "Teacher", icon: User, color: "bg-emerald-50 text-emerald-600" },
    { id: "staff", label: "Staff", icon: Briefcase, color: "bg-amber-50 text-amber-600" },
    { id: "admin", label: "Administrator", icon: Shield, color: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center py-20 px-6">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-white opacity-10" />
          <div className="relative z-10">
            <Link to="/" className="text-white font-black text-2xl tracking-tighter flex items-center gap-2">
              <GraduationCap className="w-8 h-8" />
              AIM ACADEMY
            </Link>
            <div className="mt-20">
              <h2 className="heading-display text-4xl text-white mb-6 leading-tight">
                Welcome to the <br /><span className="text-blue-200 italic">Academic Portal.</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                Access your personalized dashboard, track progress, and manage educational resources all in one place.
              </p>
            </div>


          </div>
          <div className="relative z-10 flex items-center gap-4 text-white/50 text-xs font-bold uppercase tracking-widest">
            <span>Powered by ELSxGlobal</span>
            <div className="w-1 h-1 bg-white/30 rounded-full" />
            <span>2026 Academic Year</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="heading-display text-3xl text-slate-900 mb-2">Sign In</h1>
            <p className="text-slate-500">Please select your role and enter credentials.</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id as RoleKey); setError(""); setUserId(""); setPassword(""); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  role === r.id 
                    ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
              >
                <div className={`p-2 rounded-lg ${r.color}`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${role === r.id ? "text-primary" : "text-slate-400"}`}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>



          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Account ID / Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Enter your email or ID"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setError(""); }}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                <Link to="#" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-900"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full btn-coursera py-5 text-lg group">
              Login as {role.charAt(0).toUpperCase() + role.slice(1)}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400">
              New to the academy? <Link to="/contact" className="text-primary font-bold hover:underline">Request Access</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
