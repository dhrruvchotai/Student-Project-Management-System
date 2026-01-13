"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, GraduationCap, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <GraduationCap className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              SPMS
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">
            Please sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection (Custom Dropdown/Tab UI) */}
          <div className="bg-zinc-950/50 p-1 rounded-xl border border-white/5 flex relative mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                role === "student"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                role === "staff"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" /> Faculty
            </button>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-medium text-gray-300">
                Password
              </label>
              <a
                href="/"
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="password"
                required
                className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
