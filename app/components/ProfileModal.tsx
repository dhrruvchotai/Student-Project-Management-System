"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, KeyRound, Eye, EyeOff, Loader2, Shield, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileData {
    name: string;
    email: string | null;
    phone: string | null;
    description: string | null;
    role: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"profile" | "password">("profile");

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTab("profile");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                toast.error("Failed to load profile");
            }
        } catch {
            toast.error("Error loading profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        setUpdating(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.error || "Failed to update password");
            }
        } catch {
            toast.error("Error updating password");
        } finally {
            setUpdating(false);
        }
    };

    const roleLabel = profile?.role === "staff" ? "Faculty" : "Student";
    const roleColor = profile?.role === "staff" ? "text-indigo-400" : "text-emerald-400";
    const roleBg = profile?.role === "staff" ? "bg-indigo-500/10 border-indigo-500/20" : "bg-emerald-500/10 border-emerald-500/20";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
                    >
                        <div className="bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                                <h2 className="text-lg font-bold text-white">My Profile</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-white/10">
                                {(["profile", "password"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t)}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t
                                                ? "text-white border-b-2 border-indigo-500"
                                                : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        {t === "profile" ? "Profile Info" : "Update Password"}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {tab === "profile" ? (
                                    loading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                        </div>
                                    ) : profile ? (
                                        <div className="space-y-4">
                                            {/* Avatar */}
                                            <div className="flex flex-col items-center mb-6">
                                                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] mb-3">
                                                    <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                                                        <span className="text-2xl font-bold text-white">
                                                            {profile.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                                                <span className={`mt-1 text-xs px-3 py-1 rounded-full border font-medium ${roleColor} ${roleBg}`}>
                                                    {roleLabel}
                                                </span>
                                            </div>

                                            {/* Info Rows */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Full Name</p>
                                                        <p className="text-sm font-medium text-white">{profile.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                        <Mail className="h-4 w-4 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Email</p>
                                                        <p className="text-sm font-medium text-white">{profile.email || "Not set"}</p>
                                                    </div>
                                                </div>
                                                {profile.phone && (
                                                    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                            <Phone className="h-4 w-4 text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Phone</p>
                                                            <p className="text-sm font-medium text-white">{profile.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {profile.description && (
                                                    <div className="flex items-start gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="h-4 w-4 text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Description</p>
                                                            <p className="text-sm text-zinc-300">{profile.description}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                        <Shield className="h-4 w-4 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Role</p>
                                                        <p className={`text-sm font-medium ${roleColor}`}>{roleLabel}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-zinc-500 text-center py-8">Profile not found</p>
                                    )
                                ) : (
                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <p className="text-zinc-400 text-sm mb-4">Enter your current password and set a new one.</p>

                                        {/* Current Password */}
                                        <div>
                                            <label className="text-xs text-zinc-500 mb-1.5 block">Current Password</label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                                                <input
                                                    type={showCurrent ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                    placeholder="Enter current password"
                                                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrent(!showCurrent)}
                                                    className="absolute right-3 top-2.5 text-zinc-600 hover:text-zinc-400"
                                                >
                                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="text-xs text-zinc-500 mb-1.5 block">New Password</label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                                                <input
                                                    type={showNew ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    placeholder="Min. 6 characters"
                                                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNew(!showNew)}
                                                    className="absolute right-3 top-2.5 text-zinc-600 hover:text-zinc-400"
                                                >
                                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="text-xs text-zinc-500 mb-1.5 block">Confirm New Password</label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    placeholder="Re-enter new password"
                                                    className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900 border rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${confirmPassword && confirmPassword !== newPassword
                                                            ? "border-red-500 focus:border-red-500"
                                                            : "border-white/10 focus:border-indigo-500"
                                                        }`}
                                                />
                                            </div>
                                            {confirmPassword && confirmPassword !== newPassword && (
                                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={updating || (!!confirmPassword && confirmPassword !== newPassword)}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            {updating ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
                                            ) : (
                                                "Update Password"
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
