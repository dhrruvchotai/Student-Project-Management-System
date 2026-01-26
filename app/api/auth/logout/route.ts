import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json(
      { message: "Logout successful!" },
      { status: 200 },
    );
  } catch (e) {
    return new Response("Error in logging out!", { status: 500 });
  }
}
