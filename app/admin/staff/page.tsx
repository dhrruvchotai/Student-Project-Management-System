"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap, Users, Shield, LogOut, Plus, Pencil, Trash2,
    X, Loader2, Search, ShieldCheck, LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Staff {
    staffid: number;
    staffname: string;
    email: string | null;
    phone: string | null;
    description: string | null;
}

const SidebarItem = ({ icon: Icon, label, active = false, danger = false, onClick }: any) => (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${danger ? "text-red-500 hover:bg-red-500/10" : active ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`}>
        <Icon className="h-5 w-5" />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md">
                <div className="bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <h2 className="text-base font-bold text-white">{title}</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

const inputCls = "w-full bg-zinc-900 border border-white/10 text-white rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm";
const labelCls = "text-xs font-medium text-zinc-400 mb-1.5 block";

export default function AdminStaffPage() {
    const router = useRouter();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Staff | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [addName, setAddName] = useState(""); const [addEmail, setAddEmail] = useState("");
    const [addPhone, setAddPhone] = useState(""); const [addPassword, setAddPassword] = useState("");
    const [addDesc, setAddDesc] = useState("");
    const [editName, setEditName] = useState(""); const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState(""); const [editDesc, setEditDesc] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user || JSON.parse(user).role !== "admin") { router.push("/auth/login"); return; }
    }, [router]);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/staff");
            if (res.ok) setStaffList(await res.json());
            else toast.error("Failed to load faculty");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true);
        try {
            const res = await fetch("/api/admin/staff", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: addName, email: addEmail, phone: addPhone, password: addPassword, description: addDesc }),
            });
            if (res.ok) { toast.success("Faculty member added!"); setAddOpen(false); setAddName(""); setAddEmail(""); setAddPhone(""); setAddPassword(""); setAddDesc(""); fetchStaff(); }
            else { const msg = await res.text(); toast.error(msg || "Failed to add faculty"); }
        } finally { setSubmitting(false); }
    };

    const openEdit = (s: Staff) => {
        setEditTarget(s); setEditName(s.staffname); setEditEmail(s.email || ""); setEditPhone(s.phone || ""); setEditDesc(s.description || ""); setEditOpen(true);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editTarget) return; setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/staff/${editTarget.staffid}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, email: editEmail, phone: editPhone, description: editDesc }),
            });
            if (res.ok) { toast.success("Faculty updated!"); setEditOpen(false); fetchStaff(); }
            else toast.error("Failed to update faculty");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Remove faculty member "${name}"? This cannot be undone.`)) return;
        const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Faculty removed!"); fetchStaff(); }
        else toast.error("Failed to remove faculty");
    };

    const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); localStorage.removeItem("user"); router.push("/"); };
    const filtered = staffList.filter((s) => s.staffname.toLowerCase().includes(search.toLowerCase()) || (s.email || "").toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center"><ShieldCheck className="text-white h-5 w-5" /></div>
                    <span className="text-xl font-bold tracking-tight">SPMS Admin</span>
                </div>
                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push("/admin/dashboard")} />
                    <SidebarItem icon={GraduationCap} label="Students" onClick={() => router.push("/admin/students")} />
                    <SidebarItem icon={Users} label="Faculty" active />
                    <SidebarItem icon={Shield} label="Admins" onClick={() => router.push("/admin/admins")} />
                </nav>
                <div className="pt-6 border-t border-white/10"><SidebarItem icon={LogOut} label="Logout" danger onClick={handleLogout} /></div>
            </aside>

            <main className="flex-1 md:ml-64 p-4 md:p-8">
                <div className="absolute top-0 right-0 w-full h-[300px] bg-emerald-900/10 blur-[100px] pointer-events-none" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Faculty</h1>
                        <p className="text-zinc-500 text-sm">Manage all faculty / staff accounts</p>
                    </div>
                    <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                        <Plus className="h-4 w-4" /> Add Faculty
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full max-w-sm bg-zinc-900 border border-white/10 text-white rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500/50" />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center py-20"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" /><p className="text-zinc-500 text-sm">Loading faculty...</p></div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-20"><Users className="h-10 w-10 text-zinc-700 mb-3" /><p className="text-zinc-500">No faculty found</p></div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left px-5 py-4 text-zinc-500 font-medium">#</th>
                                    <th className="text-left px-5 py-4 text-zinc-500 font-medium">Name</th>
                                    <th className="text-left px-5 py-4 text-zinc-500 font-medium hidden md:table-cell">Email</th>
                                    <th className="text-left px-5 py-4 text-zinc-500 font-medium hidden lg:table-cell">Phone</th>
                                    <th className="text-right px-5 py-4 text-zinc-500 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <tr key={s.staffid} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4 text-zinc-600">{i + 1}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">{s.staffname.charAt(0).toUpperCase()}</div>
                                                <span className="text-white font-medium">{s.staffname}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-zinc-400 hidden md:table-cell">{s.email || "—"}</td>
                                        <td className="px-5 py-4 text-zinc-400 hidden lg:table-cell">{s.phone || "—"}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Pencil className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(s.staffid, s.staffname)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </motion.div>
                <p className="text-zinc-600 text-xs mt-3">{filtered.length} faculty member{filtered.length !== 1 ? "s" : ""}</p>
            </main>

            {addOpen && (
                <Modal title="Add Faculty Member" onClose={() => setAddOpen(false)}>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Dr. Jane Doe" required /></div>
                        <div><label className={labelCls}>Email *</label><input className={inputCls} type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="dr.jane@university.edu" required /></div>
                        <div><label className={labelCls}>Password *</label><input className={inputCls} type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="Min. 6 characters" minLength={6} required /></div>
                        <div><label className={labelCls}>Phone</label><input className={inputCls} value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
                        <div><label className={labelCls}>Description</label><textarea className={inputCls} value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Optional notes" rows={2} /></div>
                        <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : "Add Faculty"}
                        </button>
                    </form>
                </Modal>
            )}

            {editOpen && editTarget && (
                <Modal title={`Edit: ${editTarget.staffname}`} onClose={() => setEditOpen(false)}>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div><label className={labelCls}>Full Name</label><input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
                        <div><label className={labelCls}>Email</label><input className={inputCls} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
                        <div><label className={labelCls}>Phone</label><input className={inputCls} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
                        <div><label className={labelCls}>Description</label><textarea className={inputCls} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} /></div>
                        <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
