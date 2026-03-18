"use client";

import { ShieldX, ArrowLeft, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans selection:bg-indigo-500/30">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-md px-6">
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-3">403</h1>
        <h2 className="text-xl font-semibold text-zinc-300 mb-4">
          Access Denied
        </h2>

        {/* Description */}
        <p className="text-zinc-500 text-sm leading-relaxed mb-10">
          You don&apos;t have permission to access this page. This area is
          restricted to authorized users only. Please log in with the correct
          account or go back.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-white/20 transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium text-white transition-all shadow-lg shadow-indigo-900/30 w-full sm:w-auto justify-center"
          >
            <LogIn className="h-4 w-4" />
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
