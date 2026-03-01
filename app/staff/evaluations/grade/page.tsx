"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ClipboardCheck, Users, Loader2, Save, Award } from "lucide-react";
import toast from "react-hot-toast";

interface ProjectGroup {
    id: number;
    groupName: string;
    projectTitle: string;
    projectGrade: string;
}

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "Not Graded"];

export default function GradeProjectPage() {
    const router = useRouter();

    const [groups, setGroups] = useState<ProjectGroup[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    const [formData, setFormData] = useState({
        groupId: "",
        grade: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch("/api/staff/project-groups");
                if (res.ok) {
                    const data = await res.json();
                    setGroups(data);
                } else {
                    toast.error("Failed to load project groups");
                }
            } catch (error) {
                toast.error("An error occurred loading project groups");
            } finally {
                setLoadingGroups(false);
            }
        };
        fetchGroups();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // If they changed the group, auto-fill the current grade if it's already graded
        if (name === "groupId") {
            const selectedGroup = groups.find(g => g.id.toString() === value);
            if (selectedGroup && selectedGroup.projectGrade !== "Not Graded") {
                setFormData(prev => ({ ...prev, grade: selectedGroup.projectGrade }));
            } else {
                setFormData(prev => ({ ...prev, grade: "" }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.groupId || !formData.grade) {
            toast.error("Please select a group and a grade.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/staff/evaluations/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId: formData.groupId,
                    grade: formData.grade === "Not Graded" ? null : formData.grade,
                }),
            });

            if (res.ok) {
                toast.success("Project Graded Successfully!");
                router.push("/staff/dashboard");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to submit grade");
            }
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans selection:bg-indigo-500/30 flex justify-center">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none fixed" />

            <div className="max-w-3xl w-full relative z-10">
                {/* Header Section */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/staff/dashboard")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-4"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                            <ClipboardCheck className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Grade Project</h1>
                            <p className="text-zinc-400 text-sm">Evaluate and assign final grades to your project groups</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8"
                >
                    {loadingGroups ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
                            <p className="text-zinc-500 text-sm">Loading your groups...</p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="text-center py-10">
                            <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-white mb-2">No Groups Found</h3>
                            <p className="text-zinc-500 text-sm mb-6">You need to have at least one project group to submit a grade.</p>
                            <button
                                onClick={() => router.push("/staff/dashboard")}
                                className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-zinc-500" /> Select Project Group *
                                </label>
                                <select
                                    name="groupId"
                                    value={formData.groupId}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                                    required
                                >
                                    <option value="" disabled className="text-zinc-500">Choose a group...</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.groupName} {g.projectTitle ? `(${g.projectTitle})` : ""} - Current: {g.projectGrade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-zinc-500" /> Assign Grade *
                                </label>
                                <select
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                                    required
                                >
                                    <option value="" disabled className="text-zinc-500">Select Grade...</option>
                                    {GRADE_OPTIONS.map((g) => (
                                        <option key={g} value={g}>
                                            {g}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => router.push("/staff/dashboard")}
                                    className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Grade
                                </button>
                            </div>

                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
