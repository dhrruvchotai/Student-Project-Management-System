"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Calendar,
    FileCheck,
    Settings,
    LogOut,
    Users,
    ClipboardCheck,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MapPin,
    Plus,
    Trash2,
    GraduationCap,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProfileModal from "@/app/components/ProfileModal";

// --- Types for API Data ---
interface Meeting {
    id: number;
    groupName: string;
    projectTitle: string;
    dateTime: string;
    purpose: string;
    location: string;
    notes: string;
    status: string;
    attendees: {
        studentId: number;
        studentName: string;
        isPresent: boolean;
        remarks: string;
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

function MeetingCard({ meeting, index, onDelete }: { meeting: Meeting; index: number, onDelete: (id: number) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const statusConf = statusConfig[meeting.status] || statusConfig["Scheduled"];
    const StatusIcon = statusConf.icon;
    const date = new Date(meeting.dateTime);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
            setIsDeleting(true);
            try {
                const res = await fetch(`/api/staff/meetings/${meeting.id}`, {
                    method: "DELETE",
                });

                if (res.ok) {
                    toast.success("Meeting deleted successfully");
                    onDelete(meeting.id);
                } else {
                    const data = await res.json();
                    toast.error(data.error || "Failed to delete meeting");
                    setIsDeleting(false);
                }
            } catch (error) {
                toast.error("An error occurred");
                setIsDeleting(false);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.04 }}
            className={`bg-zinc-900 border ${isDeleting ? 'border-red-500/50 opacity-50' : 'border-white/10 hover:border-white/20'} rounded-2xl overflow-hidden transition-all`}
        >
            <div className="p-5 flex items-start gap-4">
                {/* Date Block */}
                <div className="h-14 w-14 rounded-xl bg-zinc-800 border border-white/5 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-zinc-500 font-medium uppercase">{date.toLocaleString("default", { month: "short" })}</span>
                    <span className="text-lg font-bold text-white">{date.getDate()}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 hover:cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 pr-4">
                            <h4 className="text-sm font-bold text-white truncate">{meeting.purpose}</h4>
                            <p className="text-xs text-indigo-400 font-medium mt-0.5 truncate">{meeting.groupName} <span className="text-zinc-600 font-normal">({meeting.projectTitle || "N/A"})</span></p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 self-start">
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-full border ${statusConf.bg} ${statusConf.color} ${statusConf.border} flex items-center gap-1`}>
                                <StatusIcon className="h-3 w-3" />{meeting.status}
                            </span>
                            <div className="h-5 w-[1px] bg-white/10 mx-1"></div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500/20 transition-colors flex-shrink-0 border border-transparent hover:border-red-500/30"
                                title="Delete Meeting"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex-shrink-0 border border-transparent"
                            >
                                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500 mt-2">
                        <span className="flex items-center gap-1 bg-zinc-800/50 px-2 py-1 rounded-md">
                            <Clock className="h-3 w-3 text-zinc-400" />
                            {date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        {meeting.location && meeting.location !== "TBD" && (
                            <span className="flex items-center gap-1 bg-zinc-800/50 px-2 py-1 rounded-md max-w-full">
                                <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                                <span className="truncate">{meeting.location}</span>
                            </span>
                        )}
                        <span className="flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 text-indigo-300">
                            <Users className="h-3 w-3" /> {meeting.attendees.length} Expected
                        </span>
                    </div>
                </div>
            </div>

            {/* Expansion Details */}
            {expanded && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 bg-zinc-900/50">
                    {meeting.notes && (
                        <div className="mb-4">
                            <p className="text-xs text-zinc-500 mb-1 font-medium flex items-center gap-1"><FileCheck className="h-3 w-3" /> Meeting Notes</p>
                            <p className="text-sm text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">{meeting.notes}</p>
                        </div>
                    )}

                    {meeting.status === "Completed" && meeting.attendees.length > 0 && (
                        <div>
                            <p className="text-xs text-zinc-500 mb-2 font-medium">Logged Attendance</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {meeting.attendees.map(a => (
                                    <div key={a.studentId} className="bg-black/40 border border-white/5 rounded-lg p-2 flex items-center justify-between">
                                        <span className="text-sm text-zinc-300 truncate font-medium">{a.studentName}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.isPresent ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                                            {a.isPresent ? "Present" : "Absent"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default function StaffMeetingsPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [activeTab, setActiveTab] = useState<"upcoming" | "all">("upcoming");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "staff") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
        fetchMeetings();
    }, [router]);

    const fetchMeetings = async () => {
        try {
            const res = await fetch("/api/staff/meetings");
            if (res.ok) {
                const data = await res.json();
                setMeetings(data || []);
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

    const removeMeetingFromState = (id: number) => {
        setMeetings(prev => prev.filter(m => m.id !== id));
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const upcomingMeetings = meetings.filter((m) => m.status === "Scheduled");

    const completedCount = meetings.filter((m) => m.status === "Completed").length;
    const scheduledCount = upcomingMeetings.length;

    const displayedMeetings = activeTab === "upcoming" ? upcomingMeetings : meetings;

    return (
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-indigo-500/30">
            <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

            {/* Sidebar - Same as Dashboard */}
            <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-white h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SPMS Staff</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push("/staff/dashboard")} />
                    <SidebarItem
                        icon={Users}
                        label="My Groups"
                        onClick={() => router.push("/staff/dashboard/my-groups")}
                    />
                    <SidebarItem icon={FileCheck} label="Approvals" onClick={() => router.push("/staff/approvals")} />
                    <SidebarItem icon={ClipboardCheck} label="Evaluations" onClick={() => router.push("/staff/evaluations")} />
                    <SidebarItem icon={Calendar} label="Schedule" active />
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
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Staff Schedule</h1>
                        <p className="text-zinc-400 text-sm">Manage meetings for your assigned project groups</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/staff/meetings/create")}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="h-4 w-4" /> Schedule New
                        </button>
                        <button
                            onClick={() => setProfileOpen(true)}
                            className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] hover:scale-105 transition-transform cursor-pointer"
                            title="View Profile"
                        >
                            <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                                <span className="font-bold text-md">{initial}</span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: "Total Meetings", value: meetings.length, color: "text-indigo-400" },
                        { label: "Upcoming", value: scheduledCount, color: "text-blue-400" },
                        { label: "Completed", value: completedCount, color: "text-emerald-400" },
                        { label: "Cancelled", value: meetings.length - scheduledCount - completedCount, color: "text-red-400" },
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
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                                }`}
                        >
                            {tab === "upcoming" ? `Upcoming (${upcomingMeetings.length})` : `All Meetings (${meetings.length})`}
                        </button>
                    ))}
                </div>

                {/* Meeting Cards List */}
                {displayedMeetings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                    >
                        <Calendar className="h-12 w-12 text-zinc-700 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">
                            {activeTab === "upcoming" ? "No Upcoming Meetings" : "No Meetings Found"}
                        </h3>
                        <p className="text-zinc-500 text-sm max-w-xs mb-6">
                            {activeTab === "upcoming"
                                ? "You don't have any scheduled meetings with your groups."
                                : "You haven't scheduled any meetings yet."}
                        </p>
                        <button
                            onClick={() => router.push("/staff/meetings/create")}
                            className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4 text-indigo-400" /> Create Meeting
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 items-start">
                        <AnimatePresence>
                            {displayedMeetings.map((meeting, i) => (
                                <MeetingCard key={meeting.id} meeting={meeting} index={i} onDelete={removeMeetingFromState} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
