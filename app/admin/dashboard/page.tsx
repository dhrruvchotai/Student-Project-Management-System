"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Shield,
    LogOut,
    UserPlus,
    Loader2,
    ChevronRight,
    ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const SidebarItem = ({
    icon: Icon,
    label,
    active = false,
    danger = false,
    onClick,
}: any) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${danger
            ? "text-red-500 hover:bg-red-500/10 hover:text-red-400"
            : active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
    >
        <Icon className="h-5 w-5" />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const StatCard = ({ label, value, icon: Icon, color, delay, loading }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-zinc-900 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
    >
        <div
            className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}
        >
            <Icon className="h-16 w-16" />
        </div>
        <div className="relative z-10">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${color} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
            {loading ? (
                <div className="h-9 w-16 bg-zinc-800 rounded animate-pulse mb-1" />
            ) : (
                <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            )}
            <p className="text-zinc-500 text-sm">{label}</p>
        </div>
    </motion.div>
);

export default function AdminDashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [initial, setInitial] = useState("");
    const [stats, setStats] = useState<{
        totalStudents: number;
        totalStaff: number;
        totalAdmins: number;
    } | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsed = JSON.parse(user);
        if (parsed.role !== "admin") { router.push("/auth/login"); return; }
        setUserName(parsed.name || "");
        if (parsed.email) setInitial(parsed.email.charAt(0).toUpperCase());
    }, [router]);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data) setStats(data); })
            .finally(() => setStatsLoading(false));
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("user");
        toast.success("Logged out!");
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SPMS Admin</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
                    <SidebarItem icon={GraduationCap} label="Students" onClick={() => router.push("/admin/students")} />
                    <SidebarItem icon={Users} label="Faculty" onClick={() => router.push("/admin/staff")} />
                    <SidebarItem icon={Shield} label="Admins" onClick={() => router.push("/admin/admins")} />
                </nav>

                <div className="pt-6 border-t border-white/10 space-y-2">
                    <SidebarItem icon={LogOut} label="Logout" danger onClick={handleLogout} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-zinc-400 text-sm">
                            {userName ? `Welcome back, ${userName}` : "Manage students, faculty, and admins"}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-orange-500 p-[1px]">
                            <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                                <span className="font-bold text-sm">{initial}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon={GraduationCap} color="text-indigo-500" delay={0.1} loading={statsLoading} />
                    <StatCard label="Total Faculty" value={stats?.totalStaff ?? 0} icon={Users} color="text-emerald-500" delay={0.2} loading={statsLoading} />
                    <StatCard label="Total Admins" value={stats?.totalAdmins ?? 0} icon={Shield} color="text-indigo-500" delay={0.3} loading={statsLoading} />
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Manage Students", desc: "View, add, edit & remove students", icon: GraduationCap, color: "text-indigo-400", path: "/admin/students" },
                            { label: "Manage Faculty", desc: "View, add, edit & remove staff", icon: Users, color: "text-emerald-400", path: "/admin/staff" },
                            { label: "Create Admin", desc: "Add new admin accounts", icon: UserPlus, color: "text-indigo-400", path: "/admin/admins" },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.path)}
                                className="p-5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all group"
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 bg-zinc-700/50 group-hover:bg-zinc-700 transition-colors`}>
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <h3 className="text-white font-semibold text-sm mb-1">{item.label}</h3>
                                <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                                <div className="flex items-center gap-1 mt-3 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                    Go <ChevronRight className="h-3 w-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
