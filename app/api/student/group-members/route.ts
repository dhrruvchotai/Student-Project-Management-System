import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { email: user.email },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Find the student's group
        const myGroupMember = await prisma.projectgroupmember.findFirst({
            where: { studentid: student.studentid },
        });

        if (!myGroupMember) {
            return NextResponse.json({ members: [], groupName: null });
        }

        const groupId = myGroupMember.projectgroupid;

        if (groupId === null) {
            return NextResponse.json({ members: [], groupName: null });
        }

        // Get group info
        const group = await prisma.projectgroup.findUnique({
            where: { projectgroupid: groupId },
            select: { projectgroupname: true, projecttitle: true },
        });

        // Get all members of the group
        const members = await prisma.projectgroupmember.findMany({
            where: { projectgroupid: groupId },
            include: {
                student: {
                    select: {
                        studentid: true,
                        studentname: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        return NextResponse.json({
            groupName: group?.projectgroupname || null,
            projectTitle: group?.projecttitle || null,
            members: members.map((m) => ({
                id: m.student?.studentid,
                name: m.student?.studentname || "Unknown",
                email: m.student?.email,
                phone: m.student?.phone,
                isLeader: m.isgroupleader === 1,
                cgpa: m.studentcgpa,
                isCurrentUser: m.studentid === student.studentid,
            })),
        });
    } catch (error) {
        console.error("Error fetching group members:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
