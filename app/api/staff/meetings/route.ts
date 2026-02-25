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
        const meetings = await prisma.projectmeeting.findMany({
            where: {
                guidestaffid: staffId,
            },
            include: {
                projectgroup: {
                    select: {
                        projectgroupname: true,
                        projecttitle: true,
                    },
                },
                projectmeetingattendance: {
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
            orderBy: {
                meetingdatetime: "desc",
            },
        });

        const formattedMeetings = meetings.map((meeting) => ({
            id: meeting.projectmeetingid,
            groupName: meeting.projectgroup?.projectgroupname || "Unknown Group",
            projectTitle: meeting.projectgroup?.projecttitle || "Untitled",
            dateTime: meeting.meetingdatetime,
            purpose: meeting.meetingpurpose,
            location: meeting.meetinglocation,
            notes: meeting.meetingnotes,
            status: meeting.meetingstatus || "Scheduled",
            statusDescription: meeting.meetingstatusdescription,
            attendees: meeting.projectmeetingattendance.map((a) => ({
                studentId: a.student?.studentid,
                studentName: a.student?.studentname || "Unknown",
                isPresent: a.ispresent === 1,
                remarks: a.attendanceremarks,
            })),
            createdAt: meeting.created,
        }));

        return NextResponse.json(formattedMeetings, { status: 200 });
    } catch (error) {
        console.error("Error fetching staff meetings:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
