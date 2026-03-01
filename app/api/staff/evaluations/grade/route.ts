import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
    const user = await getAuthUser();
    if (!user || user.role !== "staff") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { groupId, grade } = body;

        if (!groupId || !grade) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const staff = await prisma.staff.findUnique({
            where: { staffid: user.userId },
        });

        if (!staff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        // Verify that the staff is associated with this group
        const group = await prisma.projectgroup.findFirst({
            where: {
                projectgroupid: parseInt(groupId),
                OR: [
                    { guidestaffname: staff.staffname },
                    { convenerstaffid: user.userId },
                    { expertstaffid: user.userId },
                ]
            }
        });

        if (!group) {
            return NextResponse.json(
                { error: "You are not authorized to grade this group" },
                { status: 403 }
            );
        }

        const updatedGroup = await prisma.projectgroup.update({
            where: { projectgroupid: parseInt(groupId) },
            data: { projectgrade: grade }
        });

        return NextResponse.json(updatedGroup, { status: 200 });
    } catch (error) {
        console.error("Error grading project:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
