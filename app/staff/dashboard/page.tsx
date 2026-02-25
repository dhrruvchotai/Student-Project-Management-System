"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  Users,
  ClipboardCheck,
  FileCheck,
  Plus,
  GraduationCap,
  ChevronRight,
  Loader2,
  Clock,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProfileModal from "@/app/components/ProfileModal";

// --- Types for API Data ---
interface ProjectGroup {
  id: number;
  groupName: string;
  projectTitle: string;
  projectArea: string;
  type: string;
  status: string;
  averageCPI: number;
  totalMembers: number;
}

interface DashboardStats {
  groupsSupervised: number;
  totalMeetings: number;
  totalStudents: number;
  upcomingMeetings: number;
}

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

// --- Components ---
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

const StatCard = ({ label, value, icon: Icon, color, delay, loading }: any) => (
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
      {loading ? (
        <div className="h-9 w-16 bg-zinc-800 rounded animate-pulse mb-1" />
      ) : (
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      )}
      <p className="text-zinc-500 text-sm">{label}</p>
    </div>
  </motion.div>
);

export default function StaffDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [initial, setInitial] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);

  // State for Project Groups API
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [projectGroupsLoading, setProjectGroupsLoading] = useState(true);

  // State for Dashboard Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // State for Meetings
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);

  // 1. Fetch User Info & Auth Check
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "staff") {
      router.push("/auth/login");
      return;
    }
    setUserName(parsedUser.name || "");
    const email = parsedUser.email;
    if (email) {
      setInitial(email.charAt(0).toUpperCase());
    }
  }, [router]);

  // 2. Fetch Dashboard Stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/staff/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else if (response.status === 401) {
          router.push("/auth/login");
        } else {
          console.error("Failed to fetch stats");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  // 3. Fetch Project Groups for this Staff
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/staff/project-groups");
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        } else if (response.status === 401) {
          router.push("/auth/login");
        } else {
          console.error("Failed to fetch groups");
          toast.error("Could not load project groups");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setProjectGroupsLoading(false);
      }
    };
    fetchGroups();
  }, [router]);

  // 4. Fetch Meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch("/api/staff/meetings");
        if (response.ok) {
          const data = await response.json();
          setMeetings(data);
        } else if (response.status === 401) {
          router.push("/auth/login");
        } else {
          console.error("Failed to fetch meetings");
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setMeetingsLoading(false);
      }
    };
    fetchMeetings();
  }, [router]);

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

  // Helper to format meeting date
  const formatMeetingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return {
      month,
      day: day.toString(),
      time: `${hour12}:${minutes} ${ampm}`,
    };
  };

  // Get upcoming meetings (status = Scheduled)
  const upcomingMeetingsList = meetings
    .filter((m) => m.status === "Scheduled")
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-indigo-500/30">
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-xl hidden md:flex flex-col p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">SPMS Staff</span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem
            icon={Users}
            label="My Groups"
            onClick={() => router.push("/staff/dashboard/my-groups")}
          />
          <SidebarItem icon={FileCheck} label="Approvals" onClick={() => router.push("/staff/approvals")} />
          <SidebarItem icon={ClipboardCheck} label="Evaluations" onClick={() => router.push("/staff/evaluations")} />
          <SidebarItem icon={Calendar} label="Schedule" />
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
        <div className="absolute top-0 right-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1>
            <p className="text-zinc-400 text-sm">
              {userName ? `Welcome back, ${userName}` : "Manage your project groups and evaluations"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search students or groups..."
                className="bg-zinc-900 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
            <button className="h-10 w-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-colors relative">
              <Bell className="h-4 w-4 text-zinc-400" />
              {stats && stats.upcomingMeetings > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-zinc-900"></span>
              )}
            </button>
            {/* Clickable Profile Avatar */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Groups Supervised"
            value={stats?.groupsSupervised?.toString() || "0"}
            icon={Users}
            color="text-indigo-500"
            delay={0.1}
            loading={statsLoading}
          />
          <StatCard
            label="Total Students"
            value={stats?.totalStudents?.toString() || "0"}
            icon={GraduationCap}
            color="text-orange-500"
            delay={0.2}
            loading={statsLoading}
          />
          <StatCard
            label="Total Meetings"
            value={stats?.totalMeetings?.toString() || "0"}
            icon={Calendar}
            color="text-emerald-500"
            delay={0.3}
            loading={statsLoading}
          />
          <StatCard
            label="Upcoming Meetings"
            value={stats?.upcomingMeetings?.toString() || "0"}
            icon={Clock}
            color="text-blue-500"
            delay={0.4}
            loading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Active Groups */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supervised Groups Overview - LINKED TO API */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Supervised Groups</h3>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1" onClick={() => {
                  router.push('/staff/dashboard/my-groups')
                }}>
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {projectGroupsLoading ? (
                // Loading Skeleton for Groups
                <div className="space-y-4 flex flex-col items-center py-10">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <p className="text-zinc-500 text-sm">
                    Loading project groups...
                  </p>
                </div>
              ) : groups.length === 0 ? (
                // Empty State
                <div className="text-center py-10">
                  <p className="text-zinc-500 text-sm">
                    No project groups found.
                  </p>
                </div>
              ) : (
                // Real Data List
                <div className="grid gap-4">
                  {groups.slice(0, 5).map((group) => {
                    const progressPercentage = group.averageCPI
                      ? group.averageCPI * 10
                      : 10;
                    const statusColor =
                      group.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

                    return (
                      <div
                        key={group.id}
                        className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-bold">
                              {group.groupName}
                            </h4>
                            <p className="text-xs text-zinc-500">
                              {group.projectTitle || "No Title Assigned"}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-1 rounded border ${statusColor}`}
                          >
                            {group.status || "Draft"}
                          </span>
                        </div>

                        {/* Mini Progress Bar based on CPI */}
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-2">
                          <div
                            className={`h-1.5 rounded-full ${progressPercentage > 75 ? "bg-emerald-500" : progressPercentage > 40 ? "bg-indigo-500" : "bg-red-500"}`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Type: {group.type}</span>
                          <span>CPI: {group.averageCPI || "N/A"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Schedule & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions for Staff */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10">
                  <Plus className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Create Meeting
                  </span>
                </button>
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10">
                  <ClipboardCheck className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Grade Project
                  </span>
                </button>
                <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10" onClick={() => router.push("/staff/dashboard/my-groups")}>
                  <Users className="h-5 w-5 text-orange-400" />
                  <span className="text-xs font-medium text-gray-300">
                    Manage Groups
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

            {/* Upcoming Meetings - REAL DATA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Upcoming Meetings</h3>
                <button className="text-zinc-400 hover:text-white">
                  <Calendar className="h-4 w-4" />
                </button>
              </div>

              {meetingsLoading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mb-2" />
                  <p className="text-zinc-500 text-sm">Loading meetings...</p>
                </div>
              ) : upcomingMeetingsList.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">No upcoming meetings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetingsList.map((meeting) => {
                    const dateInfo = formatMeetingDate(meeting.dateTime);
                    return (
                      <div
                        key={meeting.id}
                        className="flex gap-3 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex flex-col items-center justify-center border border-white/5 shrink-0">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">
                            {dateInfo.month}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {dateInfo.day}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white leading-tight mb-1 truncate">
                            {meeting.purpose || meeting.groupName}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Clock className="h-3 w-3 shrink-0" /> {dateInfo.time}
                            {meeting.location && (
                              <>
                                <span className="text-zinc-700">•</span>
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{meeting.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button className="w-full mt-4 py-2 border border-white/10 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                View Full Schedule
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
