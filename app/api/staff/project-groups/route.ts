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
        // Get staff name for guidestaffname matching
        const staff = await prisma.staff.findUnique({
            where: { staffid: staffId },
        });

        if (!staff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        // Fetch groups where this staff is guide (by name), convener, or expert
        const groups = await prisma.projectgroup.findMany({
            where: {
                OR: [
                    { guidestaffname: staff.staffname },
                    { convenerstaffid: staffId },
                    { expertstaffid: staffId },
                ],
            },
            include: {
                projecttype: {
                    select: {
                        projecttypename: true,
                    },
                },
                projectgroupmember: {
                    select: {
                        isgroupleader: true,
                        student: {
                            select: {
                                studentname: true,
                                email: true,
                                studentid: true,
                            },
                        },
                    },
                },
                staff_projectgroup_convenerstaffidTostaff: {
                    select: {
                        staffname: true,
                    },
                },
                staff_projectgroup_expertstaffidTostaff: {
                    select: {
                        staffname: true,
                    },
                },
            },
            orderBy: {
                created: "desc",
            },
        });

        const formattedGroups = groups.map((group) => {
            const leaderMember = group.projectgroupmember.find(
                (m) => m.isgroupleader === 1 || m.isgroupleader == 1
            );

            const otherMembers = group.projectgroupmember
                .filter((m) => m !== leaderMember)
                .map((m) => m.student?.studentname);

            return {
                id: group.projectgroupid,
                groupName: group.projectgroupname,
                projectTitle: group.projecttitle,
                projectArea: group.projectarea,
                type: group.projecttype?.projecttypename || "Unassigned",
                guide: group.guidestaffname,
                convener:
                    group.staff_projectgroup_convenerstaffidTostaff?.staffname ||
                    "Not Assigned",
                expert:
                    group.staff_projectgroup_expertstaffidTostaff?.staffname ||
                    "Not Assigned",
                averageCPI: group.averagecpi,
                leaderName: leaderMember
                    ? leaderMember.student?.studentname
                    : "No Leader",
                leaderEmail: leaderMember ? leaderMember.student?.email : "",
                totalMembers: group.projectgroupmember.length,
                memberNames: otherMembers,
                status: group.projecttitle ? "Active" : "Draft",
                createdAt: group.created,
            };
        });

        return NextResponse.json(formattedGroups, { status: 200 });
    } catch (error) {
        console.error("Error fetching staff project groups:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
