import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
    const user = await getAuthUser();
    if (!user || user.role !== "staff") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = user.userId;

    try {
        // Get the staff's name for guidestaffname matching
        const staff = await prisma.staff.findUnique({
            where: { staffid: staffId },
        });

        if (!staff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        // Find all groups where this staff is guide (by name), convener, or expert
        const groups = await prisma.projectgroup.findMany({
            where: {
                OR: [
                    { guidestaffname: staff.staffname },
                    { convenerstaffid: staffId },
                    { expertstaffid: staffId },
                ],
            },
            include: {
                projectgroupmember: {
                    include: {
                        student: {
                            select: {
                                studentid: true,
                                studentname: true,
                            },
                        },
                    },
                },
            },
        });

        const groupsSupervised = groups.length;

        // Count unique students across all supervised groups
        const studentIds = new Set<number>();
        groups.forEach((group) => {
            group.projectgroupmember.forEach((member) => {
                if (member.studentid) {
                    studentIds.add(member.studentid);
                }
            });
        });
        const totalStudents = studentIds.size;

        // Count total meetings conducted by this staff
        const totalMeetings = await prisma.projectmeeting.count({
            where: { guidestaffid: staffId },
        });

        // Count upcoming meetings — matches frontend logic (Status = Scheduled)
        const upcomingMeetingsCount = await prisma.projectmeeting.count({
            where: {
                guidestaffid: staffId,
                meetingstatus: "Scheduled",
            },
        });

        return NextResponse.json(
            {
                groupsSupervised,
                totalMeetings,
                totalStudents,
                upcomingMeetings: upcomingMeetingsCount,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching staff dashboard stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
