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

        // Get student's group membership
        const groupMember = await prisma.projectgroupmember.findFirst({
            where: { studentid: student.studentid },
            include: {
                projectgroup: {
                    include: {
                        projecttype: { select: { projecttypename: true } },
                        staff_projectgroup_convenerstaffidTostaff: {
                            select: { staffname: true },
                        },
                        staff_projectgroup_expertstaffidTostaff: {
                            select: { staffname: true },
                        },
                    },
                },
            },
        });

        if (!groupMember || !groupMember.projectgroup) {
            return NextResponse.json({ project: null });
        }

        const group = groupMember.projectgroup;

        return NextResponse.json({
            project: {
                groupId: group.projectgroupid,
                groupName: group.projectgroupname,
                title: group.projecttitle || "Untitled Project",
                area: group.projectarea,
                description: group.projectdescription,
                type: group.projecttype?.projecttypename || "N/A",
                guide: group.guidestaffname || "Not Assigned",
                convener:
                    group.staff_projectgroup_convenerstaffidTostaff?.staffname ||
                    "Not Assigned",
                expert:
                    group.staff_projectgroup_expertstaffidTostaff?.staffname ||
                    "Not Assigned",
                averageCPI: group.averagecpi,
                status: group.projecttitle ? "Active" : "Draft",
                isLeader: groupMember.isgroupleader === 1,
            },
        });
    } catch (error) {
        console.error("Error fetching student project:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
