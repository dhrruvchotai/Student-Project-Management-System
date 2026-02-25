import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/staff/approvals — returns project groups pending approval/review for this staff member
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== "staff") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const staffId = user.userId;

        const staff = await prisma.staff.findUnique({ where: { staffid: staffId } });
        if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

        // Fetch all groups where this staff is involved
        const groups = await prisma.projectgroup.findMany({
            where: {
                OR: [
                    { guidestaffname: staff.staffname },
                    { convenerstaffid: staffId },
                    { expertstaffid: staffId },
                ],
            },
            include: {
                projecttype: { select: { projecttypename: true } },
                projectgroupmember: {
                    include: {
                        student: { select: { studentid: true, studentname: true, email: true } },
                    },
                },
                staff_projectgroup_convenerstaffidTostaff: { select: { staffname: true } },
                staff_projectgroup_expertstaffidTostaff: { select: { staffname: true } },
            },
            orderBy: { created: "desc" },
        });

        const formatted = groups.map((g) => {
            const leader = g.projectgroupmember.find((m) => m.isgroupleader === 1);
            const status = g.projecttitle && g.projecttitle.trim() !== "" ? "Active" : "Pending";
            return {
                id: g.projectgroupid,
                groupName: g.projectgroupname,
                projectTitle: g.projecttitle || "Not Submitted",
                projectArea: g.projectarea || "N/A",
                type: g.projecttype?.projecttypename || "N/A",
                status,
                guide: g.guidestaffname || "Not Assigned",
                convener: g.staff_projectgroup_convenerstaffidTostaff?.staffname || "Not Assigned",
                expert: g.staff_projectgroup_expertstaffidTostaff?.staffname || "Not Assigned",
                totalMembers: g.projectgroupmember.length,
                leaderName: leader?.student?.studentname || "No Leader",
                leaderEmail: leader?.student?.email || null,
                members: g.projectgroupmember.map((m) => ({
                    id: m.student?.studentid,
                    name: m.student?.studentname || "Unknown",
                    email: m.student?.email,
                    isLeader: m.isgroupleader === 1,
                })),
                createdAt: g.created,
            };
        });

        return NextResponse.json({
            groups: formatted,
            pending: formatted.filter((g) => g.status === "Pending"),
            active: formatted.filter((g) => g.status === "Active"),
        });
    } catch (error) {
        console.error("Approvals fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
