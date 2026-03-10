"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    GraduationCap, Users, Shield, LogOut, Plus, Loader2,
    ShieldCheck, LayoutDashboard, UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Admin {
    adminid: number;
    adminname: string;
    email: string;
    created: string | null;
}

const SidebarItem = ({ icon: Icon, label, active = false, danger = false, onClick }: any) => (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${danger ? "text-red-500 hover:bg-red-500/10" : active ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`}>
        <Icon className="h-5 w-5" />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const inputCls = "w-full bg-zinc-950 border border-white/10 text-white rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm";
const labelCls = "text-xs font-medium text-zinc-400 mb-1.5 block";

export default function AdminAdminsPage() {
    const router = useRouter();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user || JSON.parse(user).role !== "admin") { router.push("/auth/login"); }
    }, [router]);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/admins");
            if (res.ok) setAdmins(await res.json());
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
        if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (res.ok) {
                toast.success("Admin account created!");
                setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
                fetchAdmins();
            } else {
                const msg = await res.text();
                toast.error(msg || "Failed to create admin");
            }
        } finally { setSubmitting(false); }
    };

    const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); localStorage.removeItem("user"); router.push("/"); };

    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center"><ShieldCheck className="text-white h-5 w-5" /></div>
                    <span className="text-xl font-bold tracking-tight">SPMS Admin</span>
                </div>
                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push("/admin/dashboard")} />
                    <SidebarItem icon={GraduationCap} label="Students" onClick={() => router.push("/admin/students")} />
                    <SidebarItem icon={Users} label="Faculty" onClick={() => router.push("/admin/staff")} />
                    <SidebarItem icon={Shield} label="Admins" active />
                </nav>
                <div className="pt-6 border-t border-white/10"><SidebarItem icon={LogOut} label="Logout" danger onClick={handleLogout} /></div>
            </aside>

            <main className="flex-1 md:ml-64 p-4 md:p-8">
                <div className="absolute top-0 right-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Admin Accounts</h1>
                    <p className="text-zinc-500 text-sm">Create and view admin accounts</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create form */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><Plus className="h-5 w-5 text-indigo-400" /></div>
                            <div>
                                <h2 className="font-bold text-white">Create New Admin</h2>
                                <p className="text-xs text-zinc-500">New admin can log in immediately</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Admin User" required /></div>
                            <div><label className={labelCls}>Email *</label><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin2@gmail.com" required /></div>
                            <div><label className={labelCls}>Password *</label><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" minLength={6} required /></div>
                            <div>
                                <label className={labelCls}>Confirm Password *</label>
                                <input className={`${inputCls} ${confirmPassword && confirmPassword !== password ? "border-red-500" : ""}`} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
                                {confirmPassword && confirmPassword !== password && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
                            </div>
                            <button type="submit" disabled={submitting || (!!confirmPassword && confirmPassword !== password)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><ShieldCheck className="h-4 w-4" /> Create Admin</>}
                            </button>
                        </form>
                    </motion.div>

                    {/* Existing admins list */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><UserCheck className="h-5 w-5 text-indigo-400" /></div>
                            <div>
                                <h2 className="font-bold text-white">Existing Admins</h2>
                                <p className="text-xs text-zinc-500">{admins.length} admin account{admins.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center py-12"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" /></div>
                        ) : admins.length === 0 ? (
                            <div className="flex flex-col items-center py-12"><Shield className="h-10 w-10 text-zinc-700 mb-3" /><p className="text-zinc-500 text-sm">No admins found</p></div>
                        ) : (
                            <div className="space-y-3">
                                {admins.map((a) => (
                                    <div key={a.adminid} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-white/5">
                                        <div className="h-9 w-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                                            {a.adminname.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{a.adminname}</p>
                                            <p className="text-zinc-500 text-xs truncate">{a.email}</p>
                                        </div>
                                        <span className="text-zinc-600 text-xs shrink-0">{formatDate(a.created)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
