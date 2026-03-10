import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

async function getAdminUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return null;
    return payload;
}

// GET /api/admin/students – list all students
export async function GET() {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const students = await prisma.student.findMany({
        select: {
            studentid: true,
            studentname: true,
            email: true,
            phone: true,
            description: true,
            created: true,
        },
        orderBy: { studentid: "asc" },
    });
    return NextResponse.json(students);
}

// POST /api/admin/students – add a student
export async function POST(request: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const { name, email, phone, password, description } = await request.json();
    if (!name || !email || !password) {
        return NextResponse.json("Name, email and password are required", { status: 400 });
    }

    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json("Student with this email already exists", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
        data: {
            studentname: name,
            email,
            phone: phone || null,
            description: description || null,
            password: hashedPassword,
        },
        select: { studentid: true, studentname: true, email: true, phone: true, description: true, created: true },
    });

    return NextResponse.json(student, { status: 201 });
}
