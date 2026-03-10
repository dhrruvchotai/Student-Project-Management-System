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

// GET /api/admin/staff – list all staff
export async function GET() {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const staffList = await prisma.staff.findMany({
        select: {
            staffid: true,
            staffname: true,
            email: true,
            phone: true,
            description: true,
            created: true,
        },
        orderBy: { staffid: "asc" },
    });
    return NextResponse.json(staffList);
}

// POST /api/admin/staff – add a staff member
export async function POST(request: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const { name, email, phone, password, description } = await request.json();
    if (!name || !email || !password) {
        return NextResponse.json("Name, email and password are required", { status: 400 });
    }

    const existing = await prisma.staff.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json("Staff with this email already exists", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await prisma.staff.create({
        data: {
            staffname: name,
            email,
            phone: phone || null,
            description: description || null,
            password: hashedPassword,
        },
        select: { staffid: true, staffname: true, email: true, phone: true, description: true, created: true },
    });

    return NextResponse.json(staff, { status: 201 });
}
