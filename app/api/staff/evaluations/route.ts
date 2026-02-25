import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/staff/evaluations — returns meetings and attendance data for evaluation
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== "staff") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const staffId = user.userId;

        const staff = await prisma.staff.findUnique({ where: { staffid: staffId } });
        if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

        // Meetings conducted by this staff member with attendance details
        const meetings = await prisma.projectmeeting.findMany({
            where: { guidestaffid: staffId },
            include: {
                projectgroup: {
                    include: {
                        projecttype: { select: { projecttypename: true } },
                    },
                },
                projectmeetingattendance: {
                    include: {
                        student: { select: { studentid: true, studentname: true, email: true } },
                    },
                },
            },
            orderBy: { meetingdatetime: "desc" },
        });

        const formattedMeetings = meetings.map((m) => {
            const presentCount = m.projectmeetingattendance.filter((a) => a.ispresent === 1).length;
            const totalCount = m.projectmeetingattendance.length;

            return {
                id: m.projectmeetingid,
                groupName: m.projectgroup?.projectgroupname || "N/A",
                projectTitle: m.projectgroup?.projecttitle || "N/A",
                projectType: m.projectgroup?.projecttype?.projecttypename || "N/A",
                purpose: m.meetingpurpose || "Meeting",
                location: m.meetinglocation || "N/A",
                notes: m.meetingnotes,
                status: m.meetingstatus,
                dateTime: m.meetingdatetime,
                attendanceRate: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null,
                presentCount,
                totalCount,
                attendance: m.projectmeetingattendance.map((a) => ({
                    studentId: a.student?.studentid,
                    studentName: a.student?.studentname || "Unknown",
                    email: a.student?.email,
                    isPresent: a.ispresent === 1,
                    remarks: a.attendanceremarks,
                })),
            };
        });

        // Summary stats per group
        const groupIds = [...new Set(meetings.map((m) => m.projectgroupid).filter(Boolean))];
        const groupSummaries = await Promise.all(
            groupIds.map(async (gid) => {
                const group = await prisma.projectgroup.findUnique({
                    where: { projectgroupid: gid! },
                    include: {
                        projecttype: { select: { projecttypename: true } },
                        projectgroupmember: {
                            include: { student: { select: { studentid: true, studentname: true } } },
                        },
                    },
                });
                if (!group) return null;

                const groupMeetings = meetings.filter((m) => m.projectgroupid === gid);
                const completedMeetings = groupMeetings.filter((m) => m.meetingstatus === "Completed");

                const memberAttendance = group.projectgroupmember.map((member) => {
                    const attended = completedMeetings.filter((mt) =>
                        mt.projectmeetingattendance.some((a) => a.studentid === member.studentid && a.ispresent === 1)
                    ).length;
                    return {
                        studentId: member.studentid,
                        studentName: member.student?.studentname || "Unknown",
                        attended,
                        total: completedMeetings.length,
                        percentage: completedMeetings.length > 0 ? Math.round((attended / completedMeetings.length) * 100) : 0,
                    };
                });

                return {
                    groupId: gid,
                    groupName: group.projectgroupname,
                    projectTitle: group.projecttitle || "N/A",
                    type: group.projecttype?.projecttypename || "N/A",
                    totalMeetings: groupMeetings.length,
                    completedMeetings: completedMeetings.length,
                    memberAttendance,
                };
            })
        );

        return NextResponse.json({
            meetings: formattedMeetings,
            groupSummaries: groupSummaries.filter(Boolean),
        });
    } catch (error) {
        console.error("Evaluations fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
