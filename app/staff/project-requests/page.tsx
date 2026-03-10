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
    CheckCircle2,
    XCircle,
    Clock,
    UserPlus,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProfileModal from "@/app/components/ProfileModal";

interface ProjectRequest {
    requestid: number;
    title: string;
    category: string;
    description: string | null;
    status: string;
    staffremarks: string | null;
    created: string;
    student: {
        studentname: string;
        email: string;
    };
}

const SidebarItem = ({ icon: Icon, label, active = false, danger = false, onClick }: any) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${danger ? "text-red-500 hover:bg-red-500/10 hover:text-red-400" : active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`}
    >
        <Icon className="h-5 w-5" />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

export default function ProjectRequestsPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [requests, setRequests] = useState<ProjectRequest[]>([]);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "staff") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
        fetchRequests();
    }, [router]);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/staff/project-requests");
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            } else {
                toast.error("Failed to load project requests");
            }
        } catch {
            toast.error("Error loading project requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, status: "Approved" | "Denied") => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/staff/project-requests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, remarks: status === "Approved" ? "Approved by faculty" : "Denied by faculty" })
            });
            if (res.ok) {
                toast.success(`Request ${status}!`);
                fetchRequests();
            } else {
                toast.error(`Failed to ${status.toLowerCase()} request`);
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.status === 200) {
                localStorage.removeItem("user");
                toast.success("Logged Out Successfully!");
                router.push("/");
            }
        } catch { console.error("Logout failed"); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === "Pending");
    const pastRequests = requests.filter(r => r.status !== "Pending");

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
                    <SidebarItem icon={UserPlus} label="Project Requests" active />
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
                        <h1 className="text-2xl font-bold text-white">Project Requests</h1>
                        <p className="text-zinc-400 text-sm">Review incoming project proposals from students</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
                        <p className="text-zinc-500 text-xs mb-1">Pending Requests</p>
                        <p className="text-2xl font-bold text-orange-400">{pendingRequests.length}</p>
                    </div>
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
                        <p className="text-zinc-500 text-xs mb-1">Past Requests</p>
                        <p className="text-2xl font-bold text-indigo-400">{pastRequests.length}</p>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">Pending Proposals</h2>
                    {pendingRequests.length === 0 ? (
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                            <Clock className="h-12 w-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Caught up!</h3>
                            <p className="text-zinc-500 text-sm">No new project requests waiting for your approval.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 bg-zinc-900/50">
                            {pendingRequests.map(r => (
                                <motion.div key={r.requestid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-5 rounded-2xl">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-bold text-white">{r.title}</h3>
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/20">Pending</span>
                                            </div>
                                            <p className="text-sm text-zinc-400 mb-1"><span className="text-zinc-500">Category:</span> {r.category}</p>
                                            <p className="text-sm text-zinc-400 mb-3"><span className="text-zinc-500">Student:</span> {r.student?.studentname} ({r.student?.email})</p>
                                            {r.description && <p className="text-sm text-zinc-300 bg-black/40 p-3 rounded-lg border border-white/5">{r.description}</p>}
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <button onClick={() => handleAction(r.requestid, "Approved")} disabled={actionLoading === r.requestid} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                                                {actionLoading === r.requestid ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve
                                            </button>
                                            <button onClick={() => handleAction(r.requestid, "Denied")} disabled={actionLoading === r.requestid} className="flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                                                {actionLoading === r.requestid ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Deny
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {pastRequests.length > 0 && (
                        <>
                            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2 mt-10">Past Requests</h2>
                            <div className="grid gap-4 mb-20">
                                {pastRequests.map(r => (
                                    <motion.div key={r.requestid} className="bg-zinc-900 border border-white/10 p-5 rounded-2xl opacity-70">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <h3 className="text-md font-bold text-white line-through">{r.title}</h3>
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400">Student: {r.student?.studentname}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
