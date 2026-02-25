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
    ChevronRight,
    BookOpen,
    User,
    Briefcase,
    Tag,
    MapPin,
    Star,
    Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Project {
    groupId: number;
    groupName: string;
    title: string;
    area: string | null;
    description: string | null;
    type: string;
    guide: string;
    convener: string;
    expert: string;
    averageCPI: number | null;
    status: string;
    isLeader: boolean;
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

const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
            <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-white">{value || "N/A"}</p>
        </div>
    </div>
);

export default function MyProjectPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "student") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());

        fetchProject();
    }, [router]);

    const fetchProject = async () => {
        try {
            const res = await fetch("/api/student/project");
            if (res.ok) {
                const data = await res.json();
                setProject(data.project);
            } else {
                toast.error("Failed to load project data");
            }
        } catch {
            toast.error("Error loading project");
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
            } else {
                toast.error("An Error Occurred While Logging Out!");
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
                    <SidebarItem icon={FolderOpen} label="My Project" active />
                    <SidebarItem icon={Users} label="Group Members" onClick={() => router.push("/student/group-members")} />
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
                        <h1 className="text-2xl font-bold text-white">My Project</h1>
                        <p className="text-zinc-400 text-sm">Details of your assigned academic project</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                        <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                            <span className="font-bold text-md">{initial}</span>
                        </div>
                    </div>
                </header>

                {!project ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                    >
                        <FolderOpen className="h-16 w-16 text-zinc-700 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Project Assigned</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">
                            You are not currently part of any project group. Please contact your coordinator.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {/* Project Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full mb-3 border border-indigo-500/20">
                                            {project.type}
                                        </span>
                                        <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
                                        <p className="text-zinc-400 text-sm">{project.groupName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${project.status === "Active"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-zinc-800 text-zinc-400 border-white/10"
                                            }`}>
                                            {project.status}
                                        </span>
                                        {project.isLeader && (
                                            <span className="px-3 py-1.5 text-xs font-medium rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                                                Group Leader
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {project.description && (
                                    <p className="text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                        {project.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Project Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-indigo-400" /> Project Details
                                </h3>
                                <InfoRow icon={Tag} label="Project Type" value={project.type} />
                                <InfoRow icon={MapPin} label="Project Area" value={project.area} />
                                <InfoRow icon={Briefcase} label="Group Name" value={project.groupName} />
                                {project.averageCPI && (
                                    <InfoRow icon={Star} label="Average CPI" value={String(project.averageCPI)} />
                                )}
                            </motion.div>

                            {/* Faculty Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-indigo-400" /> Faculty Details
                                </h3>
                                <InfoRow icon={User} label="Guide" value={project.guide} />
                                <InfoRow icon={User} label="Convener" value={project.convener} />
                                <InfoRow icon={User} label="Expert Evaluator" value={project.expert} />
                            </motion.div>
                        </div>

                        {/* Navigation Shortcuts */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <button
                                onClick={() => router.push("/student/group-members")}
                                className="flex items-center justify-between p-5 bg-zinc-900 border border-white/10 rounded-2xl hover:border-indigo-500/40 hover:bg-zinc-800/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                        <Users className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">Group Members</p>
                                        <p className="text-xs text-zinc-500">View your project team</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                            </button>

                            <button
                                onClick={() => router.push("/student/meetings")}
                                className="flex items-center justify-between p-5 bg-zinc-900 border border-white/10 rounded-2xl hover:border-indigo-500/40 hover:bg-zinc-800/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">Meetings</p>
                                        <p className="text-xs text-zinc-500">View all project meetings</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
