"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Loader2,
  Users,
  FileText,
  Calendar,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// --- Type Definition matching your API response ---
interface ProjectGroup {
  id: number;
  groupName: string;
  projectTitle: string;
  projectArea: string;
  type: string;
  status: string;
  averageCPI: number;
  totalMembers: number;
  guide: string;
  leaderName: string;
}

export default function MyGroupsPage() {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ProjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // Fetch Data
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/project-groups');
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
          setFilteredGroups(data);
        } else {
          toast.error("Failed to load groups");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Filter Logic (Search + Type)
  useEffect(() => {
    let result = groups;

    // Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(g => 
        g.groupName.toLowerCase().includes(lowerTerm) || 
        g.projectTitle?.toLowerCase().includes(lowerTerm) ||
        g.leaderName?.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter by Project Type (Major/Mini/Research)
    if (selectedType !== "All") {
      result = result.filter(g => g.type === selectedType);
    }

    setFilteredGroups(result);
  }, [searchTerm, selectedType, groups]);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-indigo-900/10 blur-[100px] pointer-events-none fixed" />

      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-2 mb-4 text-zinc-400 text-sm">
          <Link href="/staff/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Project Groups</h1>
            <p className="text-zinc-400">Manage and monitor all student groups under your supervision.</p>
          </div>
          
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <Users className="h-4 w-4" /> Create New Group
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="relative z-10 bg-zinc-900/50 border border-white/10 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by group name, title, or leader..." 
            className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select 
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All" className="bg-zinc-900">All Types</option>
              <option value="Major Project" className="bg-zinc-900">Major Project</option>
              <option value="Mini Project" className="bg-zinc-900">Mini Project</option>
              <option value="Research Project" className="bg-zinc-900">Research</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-zinc-500">Loading project groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
            <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No groups found</h3>
            <p className="text-zinc-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => {
              // Calculate Progress & Color Logic
              const progress = group.averageCPI ? (group.averageCPI * 10) : 10;
              const statusColor = group.status === 'Active' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
              
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                     </button>
                  </div>

                  {/* Card Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                            {group.status || "Draft"}
                        </span>
                        <span className="text-xs text-zinc-500 border border-white/5 px-2 py-0.5 rounded bg-zinc-800/50">
                            {group.type}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 leading-tight">{group.groupName}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-1">{group.projectTitle || "Untitled Project"}</p>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                        <span>Completion</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${
                                progress > 75 ? 'bg-emerald-500' : progress > 40 ? 'bg-indigo-500' : 'bg-red-500'
                            }`} 
                        />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/5 pt-4">
                    <div>
                        <p className="text-zinc-500 text-xs mb-1">Leader</p>
                        <p className="text-white font-medium truncate">{group.leaderName || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs mb-1">Members</p>
                        <div className="flex items-center gap-2 text-white">
                             <Users className="h-3 w-3 text-indigo-400" /> {group.totalMembers} Students
                        </div>
                    </div>
                    <div className="col-span-2">
                         <p className="text-zinc-500 text-xs mb-1">Domain / Area</p>
                         <p className="text-zinc-300 bg-zinc-950 py-1.5 px-3 rounded-lg border border-white/5 inline-block text-xs">
                            {group.projectArea || "General"}
                         </p>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium py-2 rounded-lg border border-white/5 transition-colors flex items-center justify-center gap-2">
                        <FileText className="h-3 w-3" /> View Details
                    </button>
                    <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium py-2 rounded-lg border border-white/5 transition-colors flex items-center justify-center gap-2">
                        <Calendar className="h-3 w-3" /> Schedule
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}