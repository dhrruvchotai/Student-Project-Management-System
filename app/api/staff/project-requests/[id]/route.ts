import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "staff" || !payload.userId) return NextResponse.json("Unauthorized", { status: 401 });

    const { id } = await params;
    const reqId = parseInt(id);
    if (isNaN(reqId)) return NextResponse.json("Invalid ID", { status: 400 });

    try {
        const { status, remarks } = await request.json(); // "Approved" or "Denied"

        const existingReq = await prisma.projectrequest.findUnique({ where: { requestid: reqId } });
        if (!existingReq || existingReq.staffid !== payload.userId) {
            return NextResponse.json("Request not found", { status: 404 });
        }

        const updated = await prisma.projectrequest.update({
            where: { requestid: reqId },
            data: {
                status,
                staffremarks: remarks,
                modified: new Date(),
            }
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json("Error updating request", { status: 500 });
    }
}
