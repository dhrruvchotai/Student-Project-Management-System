"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, MapPin, AlignLeft, Users, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

interface ProjectGroup {
    id: number;
    groupName: string;
    projectTitle: string;
}

export default function CreateMeetingPage() {
    const router = useRouter();

    const [groups, setGroups] = useState<ProjectGroup[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    const [formData, setFormData] = useState({
        groupId: "",
        date: "",
        time: "",
        purpose: "",
        location: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch("/api/staff/project-groups");
                if (res.ok) {
                    const data = await res.json();
                    // Filter groups to only show active ones or all, based on preference. 
                    // Assuming we show all groups they're associated with.
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.groupId || !formData.date || !formData.time || !formData.purpose) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Combine date and time
            const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

            const res = await fetch("/api/staff/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId: formData.groupId,
                    dateTime,
                    purpose: formData.purpose,
                    location: formData.location,
                }),
            });

            if (res.ok) {
                toast.success("Meeting Scheduled Successfully!");
                router.push("/staff/dashboard");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to schedule meeting");
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
                        <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                            <CalendarIcon className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Schedule Meeting</h1>
                            <p className="text-zinc-400 text-sm">Create a new meeting for your project group</p>
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
                            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                            <p className="text-zinc-500 text-sm">Loading your groups...</p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="text-center py-10">
                            <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-white mb-2">No Groups Found</h3>
                            <p className="text-zinc-500 text-sm mb-6">You need to have at least one project group to schedule a meeting.</p>
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
                                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                                    required
                                >
                                    <option value="" disabled className="text-zinc-500">Choose a group...</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.groupName} {g.projectTitle ? `(${g.projectTitle})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <AlignLeft className="h-4 w-4 text-zinc-500" /> Meeting Topic/Purpose *
                                </label>
                                <input
                                    type="text"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    placeholder="e.g. Weekly Update, Prototype Review..."
                                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-zinc-500" /> Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-zinc-500" /> Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-zinc-500" /> Location / Link
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Room 101, Google Meet Link..."
                                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                                />
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
                                    className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Schedule Meeting
                                </button>
                            </div>

                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
