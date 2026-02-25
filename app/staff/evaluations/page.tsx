"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    Users,
    ClipboardCheck,
    FileCheck,
    GraduationCap,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    BarChart3,
    ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProfileModal from "@/app/components/ProfileModal";

interface AttendanceRecord {
    studentId: number;
    studentName: string;
    email: string | null;
    isPresent: boolean;
    remarks: string | null;
}

interface EvaluationMeeting {
    id: number;
    groupName: string;
    projectTitle: string;
    projectType: string;
    purpose: string;
    location: string;
    notes: string | null;
    status: string;
    dateTime: string;
    attendanceRate: number | null;
    presentCount: number;
    totalCount: number;
    attendance: AttendanceRecord[];
}

interface GroupSummary {
    groupId: number;
    groupName: string;
    projectTitle: string;
    type: string;
    totalMeetings: number;
    completedMeetings: number;
    memberAttendance: {
        studentId: number;
        studentName: string;
        attended: number;
        total: number;
        percentage: number;
    }[];
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

function formatDateTime(dateStr: string) {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return { month, day: day.toString(), time: `${hour12}:${minutes} ${ampm}` };
}

export default function EvaluationsPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [meetings, setMeetings] = useState<EvaluationMeeting[]>([]);
    const [groupSummaries, setGroupSummaries] = useState<GroupSummary[]>([]);
    const [activeTab, setActiveTab] = useState<"meetings" | "groups">("meetings");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "staff") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
        fetchEvaluations();
    }, [router]);

    const fetchEvaluations = async () => {
        try {
            const res = await fetch("/api/staff/evaluations");
            if (res.ok) {
                const data = await res.json();
                setMeetings(data.meetings || []);
                setGroupSummaries(data.groupSummaries || []);
            } else {
                toast.error("Failed to load evaluations");
            }
        } catch {
            toast.error("Error loading evaluations");
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

    const completedMeetings = meetings.filter((m) => m.status === "Completed");
    const avgAttendance =
        completedMeetings.length > 0 && completedMeetings.some((m) => m.attendanceRate !== null)
            ? Math.round(
                completedMeetings.filter((m) => m.attendanceRate !== null).reduce((acc, m) => acc + (m.attendanceRate ?? 0), 0) /
                completedMeetings.filter((m) => m.attendanceRate !== null).length
            )
            : null;

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
                    <SidebarItem icon={FileCheck} label="Approvals" onClick={() => router.push("/staff/approvals")} />
                    <SidebarItem icon={ClipboardCheck} label="Evaluations" active />
                    <SidebarItem icon={Calendar} label="Schedule" />
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
                        <h1 className="text-2xl font-bold text-white">Evaluations</h1>
                        <p className="text-zinc-400 text-sm">Meeting attendance and project evaluation overview</p>
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

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: "Total Meetings", value: meetings.length, color: "text-indigo-400" },
                        { label: "Completed", value: completedMeetings.length, color: "text-emerald-400" },
                        { label: "Upcoming", value: meetings.filter((m) => m.status === "Scheduled").length, color: "text-blue-400" },
                        { label: "Avg. Attendance", value: avgAttendance !== null ? `${avgAttendance}%` : "N/A", color: "text-orange-400" },
                    ].map((s, i) => (
                        <div key={i} className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
                            <p className="text-zinc-500 text-xs mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(["meetings", "groups"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab
                                    ? "bg-indigo-600 text-white"
                                    : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                                }`}
                        >
                            {tab === "meetings" ? `Meetings (${meetings.length})` : `Group Summary (${groupSummaries.length})`}
                        </button>
                    ))}
                </div>

                {/* Meetings Tab */}
                {activeTab === "meetings" && (
                    <div className="space-y-3">
                        {meetings.length === 0 ? (
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                <ClipboardCheck className="h-12 w-12 text-zinc-700 mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">No Meetings Found</h3>
                                <p className="text-zinc-500 text-sm">No meetings have been recorded yet.</p>
                            </div>
                        ) : (
                            meetings.map((meeting, i) => {
                                const dt = formatDateTime(meeting.dateTime);
                                const isExpanded = expandedId === meeting.id;
                                const statusColor =
                                    meeting.status === "Completed"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : meeting.status === "Scheduled"
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            : "bg-zinc-800 text-zinc-400 border-white/10";

                                return (
                                    <motion.div
                                        key={meeting.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                                    >
                                        <div
                                            className="p-5 cursor-pointer flex items-center gap-4"
                                            onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                                        >
                                            {/* Date Block */}
                                            <div className="h-12 w-12 rounded-xl bg-zinc-800 flex flex-col items-center justify-center border border-white/5 flex-shrink-0">
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase">{dt.month}</span>
                                                <span className="text-lg font-bold text-white leading-none">{dt.day}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-white truncate">{meeting.purpose}</h4>
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${statusColor}`}>
                                                        {meeting.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                                                    <span>{meeting.groupName}</span>
                                                    <span>{dt.time}</span>
                                                    {meeting.location && <span>{meeting.location}</span>}
                                                    {meeting.attendanceRate !== null && (
                                                        <span className={meeting.attendanceRate >= 75 ? "text-emerald-400" : "text-orange-400"}>
                                                            Attendance: {meeting.attendanceRate}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                {meeting.totalCount > 0 && (
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-white">{meeting.presentCount}/{meeting.totalCount}</p>
                                                        <p className="text-[10px] text-zinc-500">present</p>
                                                    </div>
                                                )}
                                                <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-white/5 px-5 pb-5 pt-4">
                                                {meeting.notes && (
                                                    <div className="mb-4 p-3 bg-black/40 rounded-xl border border-white/5">
                                                        <p className="text-xs text-zinc-500 mb-1">Notes</p>
                                                        <p className="text-sm text-zinc-300">{meeting.notes}</p>
                                                    </div>
                                                )}
                                                <p className="text-xs text-zinc-500 mb-3 font-medium">Attendance</p>
                                                <div className="space-y-2">
                                                    {meeting.attendance.length === 0 ? (
                                                        <p className="text-zinc-600 text-sm">No attendance records</p>
                                                    ) : (
                                                        meeting.attendance.map((a) => (
                                                            <div key={a.studentId} className="flex items-center gap-3 text-sm">
                                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${a.isPresent ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                                                    {a.isPresent ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                                                                </div>
                                                                <span className="text-zinc-300 flex-1">{a.studentName}</span>
                                                                {a.remarks && <span className="text-zinc-500 text-xs">{a.remarks}</span>}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Groups Summary Tab */}
                {activeTab === "groups" && (
                    <div className="space-y-4">
                        {groupSummaries.length === 0 ? (
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                <BarChart3 className="h-12 w-12 text-zinc-700 mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">No Data Available</h3>
                                <p className="text-zinc-500 text-sm">No group evaluation data found.</p>
                            </div>
                        ) : (
                            groupSummaries.map((group, i) => (
                                <motion.div
                                    key={group.groupId}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
                                >
                                    <div className="flex items-start justify-between mb-5">
                                        <div>
                                            <h4 className="font-bold text-white">{group.groupName}</h4>
                                            <p className="text-sm text-zinc-400">{group.projectTitle}</p>
                                            <span className="text-xs text-zinc-500">{group.type}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-zinc-400">
                                                <span className="text-white font-bold">{group.completedMeetings}</span>/{group.totalMeetings} meetings
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-zinc-500 mb-3 font-medium">Member Attendance</p>
                                    <div className="space-y-3">
                                        {group.memberAttendance.map((m) => (
                                            <div key={m.studentId}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-zinc-300">{m.studentName}</span>
                                                    <span className={m.percentage >= 75 ? "text-emerald-400" : m.percentage >= 50 ? "text-orange-400" : "text-red-400"}>
                                                        {m.attended}/{m.total} ({m.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${m.percentage}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        className={`h-full rounded-full ${m.percentage >= 75 ? "bg-emerald-500" : m.percentage >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
