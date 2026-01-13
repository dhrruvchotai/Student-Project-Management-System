"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { form } from "framer-motion/client";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    const formData = new FormData(e.target as HTMLFormElement);

    console.log({
      full_name: formData.get(
        role == "student" ? "student_full_name" : "faculty_full_name"
      ),
      phone_number: formData.get(
        role == "student" ? "student_phone_number" : "faculty_phone_number"
      ),
      email: formData.get(
        role == "student" ? "student_email" : "faculty_email"
      ),
      password: formData.get(
        role == "student" ? "student_password" : "faculty_password"
      ),
    });
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname: formData.get(
          role == "student" ? "student_full_name" : "faculty_full_name"
        ),
        phone_number: formData.get(
          role == "student" ? "student_phone_number" : "faculty_phone_number"
        ),
        email: formData.get(
          role == "student" ? "student_email" : "faculty_email"
        ),
        password: formData.get(
          role == "student" ? "student_password" : "faculty_password"
        ),
        role: role,
      }),
    });
    if (res.status == 201) {
      localStorage.setItem(
        "username",
        JSON.stringify({
          name: formData.get(
            role == "student" ? "student_full_name" : "faculty_full_name"
          ),
          role: role,
        })
      );
      toast.success("Account Created Successfully!");
      router.push(`/dashboard/${role}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience - slightly shifted for variety */}
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-full h-[500px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[500px] bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-zinc-700 transition-colors border border-white/5">
              <GraduationCap className="text-indigo-400 h-5 w-5" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">
            Join SPMS to manage your academic projects
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Role Selection */}
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
              <GraduationCap className="w-4 h-4" /> I am a Student
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
              <UserCheck className="w-4 h-4" /> I am Faculty
            </button>
          </div>

          {/* Full Name */}
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 ml-1">
                {role === "student" ? "Student Name" : "Staff Full Name"}
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name={
                    role == "student"
                      ? "student_full_name"
                      : "faculty_full_name"
                  }
                  type="text"
                  required
                  className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                  placeholder={
                    role === "student" ? "John Doe" : "Dr. Jane Smith"
                  }
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 ml-1">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name={
                    role == "student"
                      ? "student_phone_number"
                      : "faculty_phone_number"
                  }
                  type="tel"
                  required
                  className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                name={role == "student" ? "student_email" : "faculty_email"}
                type="email"
                required
                className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                name={
                  role == "student" ? "student_password" : "faculty_password"
                }
                type="password"
                required
                className="w-full bg-zinc-950/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                placeholder="Create a strong password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-zinc-500 text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Log in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
