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

// PATCH /api/admin/staff/[id] – update staff
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const { id } = await params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return NextResponse.json("Invalid ID", { status: 400 });

    const { name, email, phone, description } = await request.json();

    try {
        const updated = await prisma.staff.update({
            where: { staffid: staffId },
            data: {
                ...(name && { staffname: name }),
                ...(email && { email }),
                ...(phone !== undefined && { phone }),
                ...(description !== undefined && { description }),
                modified: new Date(),
            },
            select: { staffid: true, staffname: true, email: true, phone: true, description: true },
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json("Staff not found or update failed", { status: 404 });
    }
}

// DELETE /api/admin/staff/[id] – delete staff
export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json("Unauthorized", { status: 401 });

    const { id } = await params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return NextResponse.json("Invalid ID", { status: 400 });

    try {
        await prisma.staff.delete({ where: { staffid: staffId } });
        return NextResponse.json({ message: "Staff deleted" });
    } catch {
        return NextResponse.json("Staff not found", { status: 404 });
    }
}
