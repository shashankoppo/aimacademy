import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, getStoredUser, clearStoredAuth } from "@/lib/admin-api";
import { toast } from "sonner";

interface ProfileDropdownProps {
  profilePath: string;
}

export function ProfileDropdown({ profilePath }: ProfileDropdownProps) {
  const user = getStoredUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    } finally {
      clearStoredAuth();
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  if (!user) return null;

  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-black text-slate-900 leading-tight">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-[#FFFF00] flex items-center justify-center text-[#FFFF00] font-black shadow-md">
            {initials}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link to={profilePath} className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile & Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-medium">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
