import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getAdminUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return null;
    return payload;
}

// PATCH /api/admin/students/[id] – update student
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const { id } = await params;
    const studentId = parseInt(id);
    if (isNaN(studentId)) return NextResponse.json("Invalid ID", { status: 400 });

    const { name, email, phone, description } = await request.json();

    try {
        const updated = await prisma.student.update({
            where: { studentid: studentId },
            data: {
                ...(name && { studentname: name }),
                ...(email && { email }),
                ...(phone !== undefined && { phone }),
                ...(description !== undefined && { description }),
                modified: new Date(),
            },
            select: { studentid: true, studentname: true, email: true, phone: true, description: true },
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json("Student not found or update failed", { status: 404 });
    }
}

// DELETE /api/admin/students/[id] – delete student
export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const { id } = await params;
    const studentId = parseInt(id);
    if (isNaN(studentId)) return NextResponse.json("Invalid ID", { status: 400 });

    try {
        await prisma.student.delete({ where: { studentid: studentId } });
        return NextResponse.json({ message: "Student deleted" });
    } catch {
        return NextResponse.json("Student not found", { status: 404 });
    }
}
