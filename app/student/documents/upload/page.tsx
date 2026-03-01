"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FolderOpen,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Users,
    UploadCloud,
    X,
    File as FileIcon,
    ArrowLeft
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

export default function DocumentUploadPage() {
    const router = useRouter();
    const [initial, setInitial] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) { router.push("/auth/login"); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "student") { router.push("/auth/login"); return; }
        if (parsedUser.email) setInitial(parsedUser.email.charAt(0).toUpperCase());
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/student/documents", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                toast.success("Document uploaded successfully");
                router.push("/student/documents");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to upload document");
            }
        } catch (error) {
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
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
                    <SidebarItem icon={FileText} label="Documents" active onClick={() => router.push("/student/documents")} />
                </nav>
                <div className="pt-6 border-t border-white/10 space-y-2">
                    <SidebarItem icon={Settings} label="Settings" />
                    <SidebarItem icon={LogOut} label="Logout" danger onClick={handleLogout} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

                <div className="w-full max-w-2xl relative z-10">
                    <button
                        onClick={() => router.push("/student/documents")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Documents
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Upload Document</h1>
                        <p className="text-zinc-400 text-sm">Upload a project report, presentation, or any other necessary documents.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-8"
                    >
                        {file ? (
                            <div className="bg-zinc-800/50 border border-indigo-500/30 rounded-xl p-6 flex items-center justify-between mb-8 group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                        <FileIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                                            {file.name}
                                        </h4>
                                        <p className="text-zinc-400 text-xs mt-1">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-800/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-8 group"
                            >
                                <div className="h-16 w-16 rounded-full bg-zinc-800 group-hover:bg-indigo-500/20 flex items-center justify-center mb-4 transition-colors">
                                    <UploadCloud className="h-8 w-8 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                    Click to browse or drag and drop
                                </h3>
                                <p className="text-zinc-500 text-sm">
                                    Supports PDF, DOCX, PPTX, MP4 and Images up to 50MB
                                </p>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
                            <button
                                onClick={() => router.push("/student/documents")}
                                className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    "Upload Document"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
