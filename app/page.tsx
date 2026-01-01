"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  CalendarCheck,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Bell,
  Clock,
  Video,
  FileCheck,
} from "lucide-react";

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        {/* Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            SPMS
          </span>
        </div>

        {/* Auth Buttons  */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Log in
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-black border-t border-white/10 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex justify-center items-center gap-3 mb-6">
        <div className="bg-indigo-900/30 p-2 rounded-lg">
          <GraduationCap className="text-indigo-400 h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-white">SPMS</span>
      </div>
      <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
        Empowering students and faculty with a systematic digital environment
        for academic excellence.
      </p>
      <div className="border-t border-white/5 pt-8">
        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} Student Project Management System. All
          rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 hover:bg-zinc-900 transition-all group"
  >
    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
      <Icon className="text-indigo-400 h-6 w-6" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

// --- Main Page Component ---

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
              Streamline Your Academic Projects
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Student Project <br />
              <span className="text-indigo-500">Management System</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Designed to manage and monitor academic projects efficiently.
              Facilitating group formation, guide allocation, and progress
              reporting in one systematic environment[cite: 3, 4].
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2">
                  Access Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="#features">
                <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl font-semibold transition-all">
                  Learn More
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Roles Section [cite: 5] */}
      <section className="py-10 border-y border-white/5 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 md:gap-24 text-center">
          {[
            { label: "Students", value: "Collaborate" },
            { label: "Faculty", value: "Mentor" },
            { label: "Admins", value: "Manage" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-indigo-400 text-sm uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why use SPMS?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to handle every stage of
              your project lifecycle[cite: 5].
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Features based on [cite: 4, 5, 27, 32] */}
            <FeatureCard
              icon={Users}
              title="Group Formation"
              description="Seamlessly form project groups, map members, and assign leaders with ease."
              delay={0.1}
            />
            <FeatureCard
              icon={BookOpen}
              title="Guide Allocation"
              description="Efficiently allocate guides to student groups based on project domain and staff expertise[cite: 20]."
              delay={0.2}
            />
            <FeatureCard
              icon={CalendarCheck}
              title="Meeting Tracker"
              description="Schedule meetings, log attendance, and record minutes of meetings (MoM) digitally."
              delay={0.3}
            />
            <FeatureCard
              icon={FileText}
              title="Project Repository"
              description="Centralized storage for project proposals, approvals, and document uploads[cite: 22]."
              delay={0.4}
            />
            <FeatureCard
              icon={LayoutDashboard}
              title="Progress Reports"
              description="Generate detailed reports on project status, marks, and group performance[cite: 32]."
              delay={0.5}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Role-Based Access"
              description="Secure authentication ensures students, faculty, and admins see only what they need."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Workflow Section [cite: 3, 4] */}
      <section className="py-24 bg-zinc-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Systematic Digital <br /> Environment
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Replace manual tracking with a streamlined workflow. From the
                initial proposal to the final evaluation, SPMS keeps everyone on
                the same page.
              </p>
              <ul className="space-y-4">
                {[
                  "Transparent communication channels",
                  "Real-time milestone tracking",
                  "Digital record maintenance",
                  "Automated progress analytics",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="text-indigo-500 h-5 w-5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

              {/* Actual Dashboard UI Mockup */}
              <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
                {/* Dashboard Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      My Dashboard
                    </h3>
                    <p className="text-zinc-500 text-xs">Welcome back, Alex</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                    <Bell className="text-indigo-400 h-4 w-4" />
                    <span className="absolute top-6 right-6 h-2 w-2 bg-red-500 rounded-full"></span>
                  </div>
                </div>

                {/* Dashboard Items List */}
                <div className="space-y-3">
                  {/* Item 1: Project Status  */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-white/5 hover:bg-zinc-800/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <FileCheck className="text-green-500 h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">
                        Major Project Proposal
                      </h4>
                      <p className="text-zinc-500 text-xs truncate">
                        Status: Approved by Guide
                      </p>
                    </div>
                    <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded">
                      Approved
                    </span>
                  </div>

                  {/* Item 2: Meeting Schedule [cite: 27, 28] */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-white/5 hover:bg-zinc-800/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Video className="text-indigo-400 h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">
                        Weekly Sync Meeting
                      </h4>
                      <p className="text-zinc-500 text-xs truncate">
                        Tomorrow, 10:00 AM
                      </p>
                    </div>
                    <span className="text-indigo-300 text-xs font-medium bg-indigo-500/10 px-2 py-1 rounded">
                      Scheduled
                    </span>
                  </div>

                  {/* Item 3: Pending Action  */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-white/5 hover:bg-zinc-800/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Clock className="text-orange-400 h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">
                        Upload Final Report
                      </h4>
                      <p className="text-zinc-500 text-xs truncate">
                        Due: Oct 25, 2024
                      </p>
                    </div>
                    <span className="text-orange-300 text-xs font-medium bg-orange-500/10 px-2 py-1 rounded">
                      Pending
                    </span>
                  </div>
                </div>

                {/* View All Button */}
                <div className="mt-5 text-center">
                  <p className="text-zinc-600 text-xs hover:text-indigo-400 cursor-pointer transition-colors">
                    View all activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
