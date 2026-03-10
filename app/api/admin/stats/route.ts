import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json("Unauthorized", { status: 401 });

    const [totalStudents, totalStaff, totalAdmins] = await Promise.all([
        prisma.student.count(),
        prisma.staff.count(),
        prisma.admin.count(),
    ]);

    return NextResponse.json({ totalStudents, totalStaff, totalAdmins });
}
