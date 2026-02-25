import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const meetings = await prisma.projectmeeting.findMany({});

    if (meetings) {
      return NextResponse.json(meetings, { status: 200 });
    } else {
      return NextResponse.json("No meetings found!", { status: 404 });
    }
  } catch (e) {
    return NextResponse.json("Error in fetching all project meetings!", {
      status: 500,
    });
  }
}
