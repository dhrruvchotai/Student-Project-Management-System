import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "staff" || !payload.userId) return NextResponse.json("Unauthorized", { status: 401 });

    try {
        const requests = await prisma.projectrequest.findMany({
            where: { staffid: payload.userId },
            include: {
                student: { select: { studentname: true, email: true } },
            },
            orderBy: { created: 'desc' }
        });
        return NextResponse.json(requests);
    } catch (err) {
        return NextResponse.json("Error fetching requests", { status: 500 });
    }
}
