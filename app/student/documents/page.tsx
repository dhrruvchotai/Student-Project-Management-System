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
    Trash2,
    Download,
    Plus,
    File,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ProjectDocument {
    documentid: number;
    filename: string;
    filepath: string;
    uploadedat: string;
    student?: { studentname: string };
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

export default function DocumentsPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<ProjectDocument[]>([]);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "student") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
        fetchDocuments();
    }, [router]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/student/documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents || []);
            } else {
                toast.error("Failed to load documents");
            }
        } catch {
            toast.error("Error loading documents");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/student/documents/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Document deleted successfully");
                setDocuments(documents.filter(d => d.documentid !== id));
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to delete document");
            }
        } catch {
            toast.error("Error deleting document");
        } finally {
            setIsDeleting(null);
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
                    <SidebarItem icon={Calendar} label="Meetings" onClick={() => router.push("/student/meetings")} />
                    <SidebarItem icon={FileText} label="Documents" active />
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
                        <h1 className="text-2xl font-bold text-white">Project Documents</h1>
                        <p className="text-zinc-400 text-sm">Manage documents for your group</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => router.push("/student/documents/upload")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Upload Document
                        </button>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                            <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                                <span className="font-bold text-md">{initial}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Documents List */}
                {documents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                    >
                        <AlertCircle className="h-12 w-12 text-zinc-700 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No Documents Found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs mb-6">
                            There are no documents uploaded for your project group yet.
                        </p>
                        <button
                            onClick={() => router.push("/student/documents/upload")}
                            className="bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                            Upload First Document
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc, i) => (
                            <motion.div
                                key={doc.documentid}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-zinc-900 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                        <File className="h-5 w-5" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={doc.filepath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                            title="Download/View"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(doc.documentid)}
                                            disabled={isDeleting === doc.documentid}
                                            className="p-1.5 rounded-lg text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white truncate mb-1" title={doc.filename}>
                                        {doc.filename}
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-mono truncate">
                                        Uploaded by: {doc.student?.studentname || "Unknown"}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 mt-2">
                                        {new Date(doc.uploadedat).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
