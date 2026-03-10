import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// One-time seed endpoint: POST /api/admin/seed
export async function POST() {
    const email = "admin@gmail.com";
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ message: "Admin already exists" }, { status: 200 });
    }
    const hashedPassword = await bcrypt.hash("admin", 10);
    const admin = await prisma.admin.create({
        data: {
            adminname: "Super Admin",
            email,
            password: hashedPassword,
        },
    });
    return NextResponse.json({ message: "Admin created", email: admin.email }, { status: 201 });
}
