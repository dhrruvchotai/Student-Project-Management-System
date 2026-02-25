import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/profile — returns profile for logged-in user (student or staff)
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (user.role === "student") {
            const student = await prisma.student.findUnique({
                where: { email: user.email },
                select: { studentid: true, studentname: true, email: true, phone: true, description: true },
            });
            if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json({ name: student.studentname, email: student.email, phone: student.phone, description: student.description, role: "student" });
        }

        if (user.role === "staff") {
            const staff = await prisma.staff.findUnique({
                where: { email: user.email },
                select: { staffid: true, staffname: true, email: true, phone: true, description: true },
            });
            if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json({ name: staff.staffname, email: staff.email, phone: staff.phone, description: staff.description, role: "staff" });
        }

        return NextResponse.json({ error: "Unknown role" }, { status: 400 });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH /api/profile — update password for logged-in user
export async function PATCH(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
        }

        if (user.role === "student") {
            const student = await prisma.student.findUnique({ where: { email: user.email } });
            if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

            const match = await bcrypt.compare(currentPassword, student.password);
            if (!match) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

            const hashed = await bcrypt.hash(newPassword, 10);
            await prisma.student.update({ where: { email: user.email }, data: { password: hashed } });
            return NextResponse.json({ message: "Password updated successfully" });
        }

        if (user.role === "staff") {
            const staff = await prisma.staff.findUnique({ where: { email: user.email } });
            if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

            const match = await bcrypt.compare(currentPassword, staff.password);
            if (!match) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

            const hashed = await bcrypt.hash(newPassword, 10);
            await prisma.staff.update({ where: { email: user.email }, data: { password: hashed } });
            return NextResponse.json({ message: "Password updated successfully" });
        }

        return NextResponse.json({ error: "Unknown role" }, { status: 400 });
    } catch (error) {
        console.error("Password update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
