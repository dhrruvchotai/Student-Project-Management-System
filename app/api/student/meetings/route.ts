import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find the student by email
        const student = await prisma.student.findUnique({
            where: { email: user.email },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Find the student's project group
        const groupMember = await prisma.projectgroupmember.findFirst({
            where: { studentid: student.studentid },
        });

        if (!groupMember) {
            return NextResponse.json({
                allMeetings: [],
                upcomingMeetings: [],
            });
        }

        const groupId = groupMember.projectgroupid;
        const now = new Date();

        // Get all meetings for the group
        const allMeetings = await prisma.projectmeeting.findMany({
            where: { projectgroupid: groupId },
            include: {
                staff: {
                    select: { staffname: true },
                },
                projectmeetingattendance: {
                    where: { studentid: student.studentid },
                    select: { ispresent: true, attendanceremarks: true },
                },
            },
            orderBy: { meetingdatetime: "desc" },
        });

        // Get upcoming meetings
        const upcomingMeetings = await prisma.projectmeeting.findMany({
            where: {
                projectgroupid: groupId,
                meetingstatus: "Scheduled",
                meetingdatetime: { gt: now },
            },
            include: {
                staff: {
                    select: { staffname: true },
                },
            },
            orderBy: { meetingdatetime: "asc" },
        });

        const formatMeeting = (m: typeof allMeetings[0]) => ({
            id: m.projectmeetingid,
            purpose: m.meetingpurpose || "Meeting",
            location: m.meetinglocation || "TBD",
            notes: m.meetingnotes,
            status: m.meetingstatus,
            dateTime: m.meetingdatetime,
            guide: m.staff?.staffname || "Not Assigned",
            attendance:
                m.projectmeetingattendance.length > 0
                    ? m.projectmeetingattendance[0].ispresent === 1
                        ? "Present"
                        : "Absent"
                    : "Not Recorded",
            attendanceRemarks:
                m.projectmeetingattendance.length > 0
                    ? m.projectmeetingattendance[0].attendanceremarks
                    : null,
        });

        const formatUpcoming = (m: typeof upcomingMeetings[0]) => ({
            id: m.projectmeetingid,
            purpose: m.meetingpurpose || "Meeting",
            location: m.meetinglocation || "TBD",
            notes: m.meetingnotes,
            status: m.meetingstatus,
            dateTime: m.meetingdatetime,
            guide: m.staff?.staffname || "Not Assigned",
        });

        return NextResponse.json({
            allMeetings: allMeetings.map(formatMeeting),
            upcomingMeetings: upcomingMeetings.map(formatUpcoming),
        });
    } catch (error) {
        console.error("Error fetching student meetings:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
