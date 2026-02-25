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
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MapPin,
    User,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Meeting {
    id: number;
    purpose: string;
    location: string;
    notes: string | null;
    status: string;
    dateTime: string;
    guide: string;
    attendance?: string;
    attendanceRemarks?: string | null;
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
    Scheduled: {
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: Clock,
    },
    Completed: {
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: CheckCircle2,
    },
    Cancelled: {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: XCircle,
    },
};

const attendanceBadge: Record<string, string> = {
    Present: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Absent: "bg-red-500/10 text-red-400 border-red-500/20",
    "Not Recorded": "bg-zinc-800 text-zinc-500 border-white/10",
};

function MeetingCard({ meeting, index }: { meeting: Meeting; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const statusConf = statusConfig[meeting.status] || statusConfig["Scheduled"];
    const StatusIcon = statusConf.icon;
    const date = new Date(meeting.dateTime);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
        >
            <div className="p-5 flex items-start gap-4">
                {/* Date Block */}
                <div className="h-14 w-14 rounded-xl bg-zinc-800 border border-white/5 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-zinc-500 font-medium uppercase">{date.toLocaleString("default", { month: "short" })}</span>
                    <span className="text-lg font-bold text-white">{date.getDate()}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-sm font-bold text-white truncate">{meeting.purpose}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConf.bg} ${statusConf.color} ${statusConf.border} flex items-center gap-1`}>
                                <StatusIcon className="h-3 w-3" />{meeting.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        {meeting.location && meeting.location !== "TBD" && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {meeting.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {meeting.guide}
                        </span>
                        {meeting.attendance && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${attendanceBadge[meeting.attendance] || attendanceBadge["Not Recorded"]}`}>
                                {meeting.attendance}
                            </span>
                        )}
                    </div>
                </div>

                {/* Expand toggle */}
                {meeting.notes && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
                    >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                )}
            </div>

            {/* Notes Expansion */}
            {expanded && meeting.notes && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                    <p className="text-xs text-zinc-500 mb-1 font-medium">Meeting Notes</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{meeting.notes}</p>
                    {meeting.attendanceRemarks && (
                        <p className="text-xs text-zinc-500 mt-2">Attendance Remarks: {meeting.attendanceRemarks}</p>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default function MeetingsPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "upcoming">("upcoming");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "student") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
        fetchMeetings();
    }, [router]);

    const fetchMeetings = async () => {
        try {
            const res = await fetch("/api/student/meetings");
            if (res.ok) {
                const data = await res.json();
                setAllMeetings(data.allMeetings || []);
                setUpcomingMeetings(data.upcomingMeetings || []);
            } else {
                toast.error("Failed to load meetings");
            }
        } catch {
            toast.error("Error loading meetings");
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

    const completedCount = allMeetings.filter((m) => m.status === "Completed").length;
    const scheduledCount = allMeetings.filter((m) => m.status === "Scheduled").length;
    const presentCount = allMeetings.filter((m) => m.attendance === "Present").length;

    const displayedMeetings = activeTab === "upcoming" ? upcomingMeetings : allMeetings;

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
                    <SidebarItem icon={Users} label="Group Members" onClick={() => router.push("/student/group-members")} />
                    <SidebarItem icon={Calendar} label="Meetings" active />
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
                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Meetings</h1>
                        <p className="text-zinc-400 text-sm">All project meetings for your group</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                        <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                            <span className="font-bold text-md">{initial}</span>
                        </div>
                    </div>
                </header>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: "Total Meetings", value: allMeetings.length, color: "text-indigo-400" },
                        { label: "Completed", value: completedCount, color: "text-emerald-400" },
                        { label: "Upcoming", value: scheduledCount, color: "text-blue-400" },
                        { label: "Attended", value: `${allMeetings.length > 0 ? Math.round((presentCount / completedCount || 0) * 100) : 0}%`, color: "text-orange-400" },
                    ].map((s, i) => (
                        <div key={i} className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
                            <p className="text-zinc-500 text-xs mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(["upcoming", "all"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                                    ? "bg-indigo-600 text-white"
                                    : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                                }`}
                        >
                            {tab === "upcoming" ? `Upcoming (${upcomingMeetings.length})` : `All Meetings (${allMeetings.length})`}
                        </button>
                    ))}
                </div>

                {/* Meeting Cards */}
                {displayedMeetings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                    >
                        <AlertCircle className="h-12 w-12 text-zinc-700 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">
                            {activeTab === "upcoming" ? "No Upcoming Meetings" : "No Meetings Found"}
                        </h3>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            {activeTab === "upcoming"
                                ? "There are no scheduled meetings for your group right now."
                                : "No meetings have been recorded for your project group yet."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {displayedMeetings.map((meeting, i) => (
                            <MeetingCard key={meeting.id} meeting={meeting} index={i} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
