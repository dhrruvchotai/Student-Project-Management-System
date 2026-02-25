"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FolderOpen,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Users,
    Mail,
    Phone,
    Crown,
    User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Member {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    isLeader: boolean;
    cgpa: number | null;
    isCurrentUser: boolean;
}

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

export default function GroupMembersPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [groupName, setGroupName] = useState<string | null>(null);
    const [projectTitle, setProjectTitle] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "student") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
        fetchGroupMembers();
    }, [router]);

    const fetchGroupMembers = async () => {
        try {
            const res = await fetch("/api/student/group-members");
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || []);
                setGroupName(data.groupName);
                setProjectTitle(data.projectTitle);
            } else {
                toast.error("Failed to load group members");
            }
        } catch {
            toast.error("Error loading group members");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.status === 200) {
                localStorage.removeItem("user");
                toast.success("Logged Out Successfully!");
                router.push("/");
            } else toast.error("An Error Occurred While Logging Out!");
        } catch { console.error("Logout failed"); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const leader = members.find((m) => m.isLeader);
    const otherMembers = members.filter((m) => !m.isLeader);

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <FolderOpen className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SPMS</span>
                </div>
                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push("/student/dashboard")} />
                    <SidebarItem icon={FolderOpen} label="My Project" onClick={() => router.push("/student/project")} />
                    <SidebarItem icon={Users} label="Group Members" active />
                    <SidebarItem icon={Calendar} label="Meetings" onClick={() => router.push("/student/meetings")} />
                    <SidebarItem icon={FileText} label="Documents" />
                </nav>
                <div className="pt-6 border-t border-white/10 space-y-2">
                    <SidebarItem icon={Settings} label="Settings" />
                    <SidebarItem icon={LogOut} label="Logout" danger onClick={handleLogout} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Group Members</h1>
                        <p className="text-zinc-400 text-sm">
                            {groupName ? `${groupName}${projectTitle ? ` — ${projectTitle}` : ""}` : "Your project team"}
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                        <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                            <span className="font-bold text-md">{initial}</span>
                        </div>
                    </div>
                </header>

                {members.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                    >
                        <Users className="h-16 w-16 text-zinc-700 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Group Found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            You are not assigned to any project group yet.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                        >
                            {[
                                { label: "Total Members", value: members.length, color: "text-indigo-400" },
                                { label: "Group Leader", value: leader?.name || "None", color: "text-yellow-400" },
                                { label: "Average CGPA", value: (() => { const withCgpa = members.filter(m => m.cgpa != null); if (withCgpa.length === 0) return "N/A"; const avg = withCgpa.reduce((acc, m) => acc + parseFloat(String(m.cgpa)), 0) / withCgpa.length; return isNaN(avg) ? "N/A" : avg.toFixed(2); })(), color: "text-emerald-400" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
                                    <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
                                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* Members Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[...(leader ? [leader] : []), ...otherMembers].map((member, i) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className={`bg-zinc-900 border rounded-2xl p-6 relative overflow-hidden transition-colors ${member.isCurrentUser
                                        ? "border-indigo-500/40 bg-indigo-500/5"
                                        : "border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    {member.isCurrentUser && (
                                        <span className="absolute top-3 right-3 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                            You
                                        </span>
                                    )}

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold ${member.isLeader ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-zinc-800 text-zinc-300"
                                            }`}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-white">{member.name}</h3>
                                                {member.isLeader && <Crown className="h-3.5 w-3.5 text-yellow-400" />}
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {member.isLeader ? "Group Leader" : "Member"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {member.email && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                <Mail className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                        )}
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                <Phone className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                                                <span>{member.phone}</span>
                                            </div>
                                        )}
                                        {member.cgpa && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                <User className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                                                <span>CGPA: {member.cgpa}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
