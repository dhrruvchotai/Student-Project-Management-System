import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const groups = await prisma.projectgroup.findMany({
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

      // Filter other members
      const otherMembers = group.projectgroupmember.filter(
        (m) => m !== leaderMember
      ).map((m) => m.student?.studentname);

      return {
        id: group.projectgroupid,
        groupName: group.projectgroupname,
        projectTitle: group.projecttitle,
        projectArea: group.projectarea,

        type: group.projecttype?.projecttypename || "Unassigned",
        guide: group.guidestaffname,

        convener: group.staff_projectgroup_convenerstaffidTostaff?.staffname || "Not Assigned",
        expert: group.staff_projectgroup_expertstaffidTostaff?.staffname || "Not Assigned",

        averageCPI: group.averagecpi,

        leaderName: leaderMember ? leaderMember.student?.studentname : "No Leader",
        leaderEmail: leaderMember ? leaderMember.student?.email : "",
        totalMembers: group.projectgroupmember.length,
        memberNames: otherMembers,

        status: group.projecttitle ? "Active" : "Draft",
        createdAt: group.created,
      };
    });

    return NextResponse.json(formattedGroups, { status: 200 });

  } catch (error) {
    console.error("Error fetching admin project groups:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: "Failed to fetch project groups" },
      { status: 500 }
    );
  }
}