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

// GET /api/admin/admins – list all admins
export async function GET() {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const admins = await prisma.admin.findMany({
        select: { adminid: true, adminname: true, email: true, created: true },
        orderBy: { adminid: "asc" },
    });
    return NextResponse.json(admins);
}

// POST /api/admin/admins – create new admin
export async function POST(request: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
        return NextResponse.json("All fields required", { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json("Admin with this email already exists", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
        data: { adminname: name, email, password: hashedPassword },
        select: { adminid: true, adminname: true, email: true, created: true },
    });

    return NextResponse.json(newAdmin, { status: 201 });
}
