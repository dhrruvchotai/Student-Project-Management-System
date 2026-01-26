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
  Bell,
  Search,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  UploadCloud,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const studentProject = {
  title: "AI-Based Traffic Management System",
  type: "Major Project",
  guide: "Dr. Sarah Wilson",
  status: "In Progress",
  progress: 65,
  members: [
    { name: "Alex Johnson", role: "Leader", id: "CS001" },
    { name: "Sam Smith", role: "Member", id: "CS002" },
    { name: "Emily Davis", role: "Member", id: "CS003" },
  ],
};

const upcomingMeetings = [
  {
    id: 1,
    title: "Weekly Progress Review",
    date: "Oct 24, 2:00 PM",
    status: "Scheduled",
    location: "Lab 3",
  }, //
  {
    id: 2,
    title: "Phase 2 Evaluation",
    date: "Nov 01, 10:00 AM",
    status: "Pending",
    location: "Conf Room",
  },
];

//components
const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  danger = false,
  onClick,
}: any) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      danger
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

const StatCard = ({ label, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-zinc-900 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
  >
    <div
      className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}
    >
      <Icon className="h-16 w-16" />
    </div>
    <div className="relative z-10">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${color} bg-opacity-10`}
      >
        <Icon className={`h-5 w-5 ${color.replace("text-", "text-")}`} />
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-zinc-500 text-sm">{label}</p>
    </div>
  </motion.div>
);

export default function StudentDashboard() {
  const router = useRouter();
  const [initial, setInitial] = useState<string>("");
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      const email = parsedUser.email;
      if (email) {
        setInitial(email.charAt(0).toUpperCase());
      }
    }
  }, []);

  //logout function
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.status == 200) {
        localStorage.removeItem("user");
        toast.success("Logged Out Successfully!");
        router.push(`/`);
      } else {
        toast.error("An Error Occurred While Logging Out!");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">SPMS</span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={FolderOpen} label="My Project" />
          <SidebarItem icon={Users} label="Group Members" />
          <SidebarItem icon={Calendar} label="Meetings" />
          <SidebarItem icon={FileText} label="Documents" />
        </nav>

        <div className="pt-6 border-t border-white/10 space-y-2">
          <SidebarItem icon={Settings} label="Settings" />
          <SidebarItem
            icon={LogOut}
            label="Logout"
            danger
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
            <p className="text-zinc-400 text-sm">
              Overview of your academic project progress
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-zinc-900 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
            <button className="h-10 w-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-colors relative">
              <Bell className="h-4 w-4 text-zinc-400" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-zinc-900"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
              <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                <span className="font-bold text-md">{initial}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Attendance"
            value="85%"
            icon={Users}
            color="text-emerald-500"
            delay={0.1}
          />
          <StatCard
            label="Tasks Pending"
            value="3"
            icon={Clock}
            color="text-orange-500"
            delay={0.2}
          />
          <StatCard
            label="Meetings Done"
            value="12"
            icon={CheckCircle2}
            color="text-blue-500"
            delay={0.3}
          />
          <StatCard
            label="Documents"
            value="5"
            icon={FileText}
            color="text-purple-500"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Project Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full mb-3 border border-indigo-500/20">
                    {studentProject.type}
                  </span>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {studentProject.title}
                  </h2>
                  <p className="text-zinc-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Guide: {studentProject.guide}
                  </p>
                </div>
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                  <MoreVertical className="h-5 w-5 text-zinc-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Project Completion</span>
                  <span className="text-white font-medium">
                    {studentProject.progress}%
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${studentProject.progress}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>

              {/* Group Members Mini List */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs font-medium text-white"
                    >
                      {i === 1 ? "L" : "M"}
                    </div>
                  ))}
                  <div className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-400">
                    +
                  </div>
                </div>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  View Details <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Upcoming Meetings Section [cite: 55, 57] */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Upcoming Meetings</h3>
                <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                  <Calendar className="h-4 w-4 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-zinc-800 flex flex-col items-center justify-center border border-white/5">
                      <span className="text-xs text-zinc-500 font-medium uppercase">
                        {meeting.date.split(",")[0].split(" ")[0]}
                      </span>
                      <span className="text-lg font-bold text-white">
                        {meeting.date.split(",")[0].split(" ")[1]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1 group-hover:text-indigo-400 transition-colors">
                        {meeting.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {meeting.date.split(",")[1]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {meeting.location}
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-600/20">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10">
                  <UploadCloud className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Upload Doc
                  </span>
                </button>
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10">
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Contact Guide
                  </span>
                </button>
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Schedule
                  </span>
                </button>
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Reports
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Team Members List [cite: 48] */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="font-bold text-white mb-4">Project Group</h3>
              <div className="space-y-4">
                {studentProject.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">
                        {member.name}
                      </h4>
                      <p className="text-xs text-zinc-500">{member.role}</p>
                    </div>
                    {member.role === "Leader" && (
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 border border-white/10 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                Manage Group
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
