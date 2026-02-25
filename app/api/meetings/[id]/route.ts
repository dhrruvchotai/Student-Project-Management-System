import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const guideStaffId = Number(id);
    const meetings = await prisma.projectmeeting.findMany({
      where: {
        guidestaffid: guideStaffId,
      },
    });

    if (meetings) {
      return NextResponse.json(meetings, { status: 200 });
    } else {
      return NextResponse.json("No meetings found!", { status: 404 });
    }
  } catch (e) {
    console.error("Error while fetching project meetings!", e);
    return NextResponse.json("Error while fetching project meetings by id!", {
      status: 500,
    });
  }
}
