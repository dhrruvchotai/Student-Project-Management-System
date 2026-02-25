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

        // Get Project Group
        const groupMember = await prisma.projectgroupmember.findFirst({
            where: { studentid: student.studentid },
            include: {
                projectgroup: {
                    include: {
                        projecttype: true,
                    },
                },
            },
        });

        if (!groupMember || !groupMember.projectgroup) {
            return NextResponse.json({
                stats: {
                    attendance: 0,
                    tasksPending: 0,
                    meetingsDone: 0,
                    documents: 0,
                },
                project: null,
                upcomingMeetings: [],
                members: [],
            });
        }

        const groupId = groupMember.projectgroupid;

        // Fetch Meetings Stats
        // Assuming 'Completed' is a status, if not we can adjust. 
        // Schema default says "Scheduled".
        const meetingsDoneCount = await prisma.projectmeeting.count({
            where: {
                projectgroupid: groupId,
                meetingstatus: "Completed",
            },
        });

        // Attendance
        // We need to find all meeting attendances for this student that are marked present
        // First find IDs of meetings that this group had? 
        // or just check projectmeetingattendance directly for this student.
        // However, to calculate percentage, we need total meetings held.
        // Let's assume 'total meetings' is the number of attendance records created for this student.
        const attendanceRecords = await prisma.projectmeetingattendance.findMany({
            where: { studentid: student.studentid }
        });

        const presentCount = attendanceRecords.filter(r => r.ispresent === 1).length;
        const totalAttendancePossibilities = attendanceRecords.length;

        // If no records, maybe check total meetings of group? 
        // Usually attendance records are created when a meeting is taken.
        const attendancePercentage = totalAttendancePossibilities > 0
            ? Math.round((presentCount / totalAttendancePossibilities) * 100)
            : 0;

        // Upcoming Meetings
        const upcomingMeetings = await prisma.projectmeeting.findMany({
            where: {
                projectgroupid: groupId,
                meetingdatetime: { gt: new Date() },
            },
            orderBy: { meetingdatetime: "asc" },
            take: 3,
        });

        // Group Members
        const members = await prisma.projectgroupmember.findMany({
            where: { projectgroupid: groupId },
            include: { student: true },
        });

        const project = {
            title: groupMember.projectgroup.projecttitle || "Untitled Project",
            type: groupMember.projectgroup.projecttype?.projecttypename || "N/A",
            guide: groupMember.projectgroup.guidestaffname || "Not Assigned",
            status: "In Progress", // functionality for status not explicit in schema, defaulting
            progress: 65, // Placeholder, as no progress field in group
            description: groupMember.projectgroup.projectdescription,
        };

        return NextResponse.json({
            stats: {
                attendance: attendancePercentage,
                tasksPending: 0, // Placeholder
                meetingsDone: meetingsDoneCount,
                documents: 0, // Placeholder
            },
            project,
            upcomingMeetings: upcomingMeetings.map((m) => ({
                id: m.projectmeetingid,
                title: m.meetingpurpose || "Meeting",
                date: new Date(m.meetingdatetime).toLocaleString(), // Simple formatting
                status: m.meetingstatus,
                location: m.meetinglocation,
            })),
            members: members.map((m) => ({
                id: m.studentid,
                name: m.student?.studentname || "Unknown",
                role: m.isgroupleader === 1 ? "Leader" : "Member",
            })),
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
