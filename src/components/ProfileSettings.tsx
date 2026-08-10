import React, { useState, useEffect } from "react";
import { User, KeyRound, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, getStoredUser, setStoredUser } from "@/lib/admin-api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettings() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Refresh user data from API if possible
    apiRequest("/api/auth/me", { method: "GET" })
      .then((res) => {
        if (res.user) {
          setUser(res.user);
          setStoredUser(res.user);
          setFormData({
            name: res.user.name || "",
            email: res.user.email || "",
            phone: res.user.phone || "",
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiRequest("/api/auth/update-profile", {
        method: "PUT",
        body: formData,
      });
      toast.success("Profile updated successfully!");
      if (res.user) {
        setUser({ ...user, ...res.user });
        setStoredUser({ ...user, ...res.user });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      setPasswordLoading(true);
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-[#FFFF00] flex items-center justify-center text-[#FFFF00] text-2xl font-black shadow-md">
            {user?.name?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{user?.name}</h2>
            <p className="text-[#FFFF00] font-bold tracking-wider text-sm">{user?.role}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Details Form */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <User className="w-5 h-5 mr-2 text-slate-500" /> Personal Details
              </h3>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    placeholder="example@aimacademy.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    placeholder="+91..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-[#FFFF00] hover:bg-slate-800 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Details</span>
                </button>
              </form>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <KeyRound className="w-5 h-5 mr-2 text-slate-500" /> Security
              </h3>
              <form onSubmit={savePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
