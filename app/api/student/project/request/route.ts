import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "student" || !payload.userId) return NextResponse.json("Unauthorized", { status: 401 });

    try {
        const { title, category, description, staffid } = await request.json();

        const newRequest = await prisma.projectrequest.create({
            data: {
                studentid: payload.userId,
                staffid: parseInt(staffid),
                title,
                category,
                description,
                status: "Pending",
            }
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json("Error creating project request", { status: 500 });
    }
}

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "student" || !payload.userId) return NextResponse.json("Unauthorized", { status: 401 });

    try {
        const requests = await prisma.projectrequest.findMany({
            where: { studentid: payload.userId },
            include: {
                staff: { select: { staffname: true } }
            },
            orderBy: { created: 'desc' }
        });
        return NextResponse.json(requests);
    } catch (err) {
        console.error(err);
        return NextResponse.json("Error fetching requests", { status: 500 });
    }
}
