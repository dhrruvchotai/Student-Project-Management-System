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
    ArrowLeft,
    Loader2,
    Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const SidebarItem = ({ icon: Icon, label, active = false, danger = false, onClick }: any) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${danger ? "text-red-500 hover:bg-red-500/10" : active ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`}
    >
        <Icon className="h-5 w-5" />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

interface Faculty {
    staffid: number;
    staffname: string;
    email: string;
}

const inputCls = "w-full bg-zinc-900 border border-white/10 text-white rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm";
const labelCls = "text-xs font-medium text-zinc-400 mb-1.5 block";

export default function RequestProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [staffId, setStaffId] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user || JSON.parse(user).role !== "student") {
            router.push("/auth/login");
            return;
        }

        // Fetch available faculty
        fetch("/api/student/faculty")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setFacultyList(data);
                else toast.error("Failed to load faculty list");
            })
            .catch(() => toast.error("Error loading faculty"))
            .finally(() => setLoading(false));
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/student/project/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, description, staffid: staffId })
            });

            if (res.ok) {
                toast.success("Project Request Submitted Successfully!");
                router.push("/student/project");
            } else {
                toast.error("Failed to submit request.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
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
                    <SidebarItem icon={FolderOpen} label="My Project" active onClick={() => router.push("/student/project")} />
                    <SidebarItem icon={Users} label="Group Members" onClick={() => router.push("/student/group-members")} />
                    <SidebarItem icon={Calendar} label="Meetings" onClick={() => router.push("/student/meetings")} />
                    <SidebarItem icon={FileText} label="Documents" onClick={() => router.push("/student/documents")} />
                </nav>

                <div className="pt-6 border-t border-white/10 space-y-2">
                    <SidebarItem icon={Settings} label="Settings" />
                    <SidebarItem icon={LogOut} label="Logout" danger onClick={handleLogout} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

                <div className="max-w-2xl mx-auto mt-8 relative z-10">
                    <button
                        onClick={() => router.push("/student/project")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Project
                    </button>

                    <h1 className="text-2xl font-bold text-white mb-2">Request New Project</h1>
                    <p className="text-zinc-500 text-sm mb-8">Submit a project proposal to a faculty member for approval.</p>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <motion.form
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5"
                        >
                            <div>
                                <label className={labelCls}>Project Title *</label>
                                <input
                                    type="text"
                                    required
                                    className={inputCls}
                                    placeholder="e.g. Next.js Web App"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Category (Area) *</label>
                                <input
                                    type="text"
                                    required
                                    className={inputCls}
                                    placeholder="e.g. AI / Web Development"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Select Faculty *</label>
                                <select
                                    required
                                    className={`${inputCls} appearance-none`}
                                    value={staffId}
                                    onChange={(e) => setStaffId(e.target.value)}
                                >
                                    <option value="" disabled>Select a faculty member...</option>
                                    {facultyList.map(faculty => (
                                        <option key={faculty.staffid} value={faculty.staffid} className="bg-zinc-900">
                                            {faculty.staffname} ({faculty.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>Description (Optional)</label>
                                <textarea
                                    rows={4}
                                    className={inputCls}
                                    placeholder="Brief description of the project"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <><Loader2 className="h-5 w-5 animate-spin" /> Submitting Request...</>
                                    ) : (
                                        <><Send className="h-5 w-5" /> Submit Project Request</>
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </div>
            </main>
        </div>
    );
}
