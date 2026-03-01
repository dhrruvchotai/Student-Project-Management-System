import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser();

    // Check if the user is authorized (must be a logged-in staff member)
    if (!user || user.role !== "staff") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const paramsAwaited = await params;
        const meetingId = parseInt(paramsAwaited.id);

        if (isNaN(meetingId)) {
            return NextResponse.json(
                { error: "Invalid meeting ID" },
                { status: 400 }
            );
        }

        // Verify that the meeting exists and the staff member is associated with it
        const existingMeeting = await prisma.projectmeeting.findUnique({
            where: {
                projectmeetingid: meetingId,
            },
        });

        if (!existingMeeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        // Additional safeguard: check if they are the actual guide for the meeting's group
        // First get the staff member's unique info
        const staff = await prisma.staff.findUnique({
            where: { staffid: user.userId },
        });

        if (!staff) {
            return NextResponse.json({ error: "Staff profile not found" }, { status: 404 });
        }

        // Get the relevant project group
        const group = await prisma.projectgroup.findFirst({
            where: {
                projectgroupid: existingMeeting.projectgroupid || undefined,
                OR: [
                    { guidestaffname: staff.staffname },
                    { convenerstaffid: user.userId },
                    { expertstaffid: user.userId },
                ]
            }
        });

        if (!group) {
            return NextResponse.json(
                { error: "You are not authorized to delete meetings for this project group" },
                { status: 403 }
            );
        }

        // Finally, delete the meeting
        await prisma.projectmeeting.delete({
            where: {
                projectmeetingid: meetingId,
            }
        });

        return NextResponse.json(
            { message: "Meeting deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting staff meeting:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
