"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Users,
    ClipboardCheck,
    FileCheck,
    GraduationCap,
    ChevronRight,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    User,
    Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProfileModal from "@/app/components/ProfileModal";

interface Group {
    id: number;
    groupName: string;
    projectTitle: string;
    projectArea: string;
    type: string;
    status: string;
    guide: string;
    convener: string;
    expert: string;
    totalMembers: number;
    leaderName: string;
    leaderEmail: string | null;
    members: { id: number; name: string; email: string | null; isLeader: boolean }[];
    createdAt: string;
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

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
    Active: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
    Pending: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Clock },
    Draft: { color: "text-zinc-400", bg: "bg-zinc-800", border: "border-white/10", icon: AlertCircle },
};

export default function ApprovalsPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "active">("all");
    const [pendingGroups, setPendingGroups] = useState<Group[]>([]);
    const [activeGroups, setActiveGroups] = useState<Group[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "staff") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
        fetchApprovals();
    }, [router]);

    const fetchApprovals = async () => {
        try {
            const res = await fetch("/api/staff/approvals");
            if (res.ok) {
                const data = await res.json();
                setGroups(data.groups || []);
                setPendingGroups(data.pending || []);
                setActiveGroups(data.active || []);
            } else {
                toast.error("Failed to load approvals");
            }
        } catch {
            toast.error("Error loading approvals");
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

    const displayedGroups =
        activeTab === "pending" ? pendingGroups :
            activeTab === "active" ? activeGroups :
                groups;

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-indigo-500/30">
            <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SPMS Staff</span>
                </div>
                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push("/staff/dashboard")} />
                    <SidebarItem icon={Users} label="My Groups" onClick={() => router.push("/staff/dashboard/my-groups")} />
                    <SidebarItem icon={FileCheck} label="Approvals" active />
                    <SidebarItem icon={ClipboardCheck} label="Evaluations" onClick={() => router.push("/staff/evaluations")} />
                    <SidebarItem icon={Calendar} label="Schedule" onClick={() => router.push("/staff/meetings")} />
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
                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Approvals</h1>
                        <p className="text-zinc-400 text-sm">Review and manage project group submissions</p>
                    </div>
                    <button
                        onClick={() => setProfileOpen(true)}
                        className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] hover:scale-105 transition-transform cursor-pointer"
                        title="View Profile"
                    >
                        <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                            <span className="font-bold text-md">{initial}</span>
                        </div>
                    </button>
                </header>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { label: "Total Groups", value: groups.length, color: "text-indigo-400" },
                        { label: "Pending Review", value: pendingGroups.length, color: "text-orange-400" },
                        { label: "Active Projects", value: activeGroups.length, color: "text-emerald-400" },
                    ].map((s, i) => (
                        <div key={i} className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
                            <p className="text-zinc-500 text-xs mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(["all", "pending", "active"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab
                                    ? "bg-indigo-600 text-white"
                                    : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                                }`}
                        >
                            {tab === "all" ? `All (${groups.length})` : tab === "pending" ? `Pending (${pendingGroups.length})` : `Active (${activeGroups.length})`}
                        </button>
                    ))}
                </div>

                {/* Group Cards */}
                {displayedGroups.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                    >
                        <FileCheck className="h-12 w-12 text-zinc-700 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Groups Found</h3>
                        <p className="text-zinc-500 text-sm">No project groups to show in this category.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {displayedGroups.map((group, i) => {
                            const conf = statusConfig[group.status] || statusConfig["Draft"];
                            const StatusIcon = conf.icon;
                            const isExpanded = expandedId === group.id;

                            return (
                                <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                                >
                                    <div
                                        className="p-5 cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : group.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-white truncate">{group.groupName}</h4>
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 whitespace-nowrap ${conf.bg} ${conf.color} ${conf.border}`}>
                                                        <StatusIcon className="h-3 w-3" />{group.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-400 truncate">{group.projectTitle}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
                                                    <span>Type: {group.type}</span>
                                                    <span>Members: {group.totalMembers}</span>
                                                    <span>Leader: {group.leaderName}</span>
                                                    <span>Guide: {group.guide}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className={`h-5 w-5 text-zinc-600 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-white/5 px-5 pb-5 pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-2 font-medium">Project Info</p>
                                                    <div className="space-y-1.5 text-sm">
                                                        <p className="text-zinc-300"><span className="text-zinc-500">Area:</span> {group.projectArea}</p>
                                                        <p className="text-zinc-300"><span className="text-zinc-500">Convener:</span> {group.convener}</p>
                                                        <p className="text-zinc-300"><span className="text-zinc-500">Expert:</span> {group.expert}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-2 font-medium">Members ({group.totalMembers})</p>
                                                    <div className="space-y-1.5">
                                                        {group.members.map((m) => (
                                                            <div key={m.id} className="flex items-center gap-2 text-sm">
                                                                <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-white flex-shrink-0">
                                                                    {m.name.charAt(0)}
                                                                </div>
                                                                <span className="text-zinc-300 truncate">{m.name}</span>
                                                                {m.isLeader && <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">Leader</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
