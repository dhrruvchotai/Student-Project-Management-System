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

export async function POST(req: Request) {
    const user = await getAuthUser();
    if (!user || user.role !== "staff") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { groupId, dateTime, purpose, location } = body;

        if (!groupId || !dateTime || !purpose) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get staff name
        const staff = await prisma.staff.findUnique({
            where: { staffid: user.userId },
        });

        if (!staff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 });
        }

        // Verify that the staff is associated with this group
        const group = await prisma.projectgroup.findFirst({
            where: {
                projectgroupid: parseInt(groupId),
                OR: [
                    { guidestaffname: staff.staffname },
                    { convenerstaffid: user.userId },
                    { expertstaffid: user.userId },
                ]
            }
        });

        if (!group) {
            return NextResponse.json(
                { error: "You are not authorized to schedule a meeting for this group" },
                { status: 403 }
            );
        }

        const newMeeting = await prisma.projectmeeting.create({
            data: {
                projectgroupid: parseInt(groupId),
                guidestaffid: user.userId,
                meetingdatetime: new Date(dateTime),
                meetingpurpose: purpose,
                meetinglocation: location || "",
                meetingstatus: "Scheduled",
            }
        });

        return NextResponse.json(newMeeting, { status: 201 });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
