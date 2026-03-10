import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "student") return NextResponse.json("Unauthorized", { status: 401 });

    try {
        const faculty = await prisma.staff.findMany({
            select: { staffid: true, staffname: true, email: true },
        });
        return NextResponse.json(faculty);
    } catch (err) {
        return NextResponse.json("Error fetching faculty", { status: 500 });
    }
}
