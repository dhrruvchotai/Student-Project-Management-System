import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const data = await request.json();
  const email = data.email as string;
  const password = data.password as string;
  const role = data.role as string;

  if (!email || !password) {
    return NextResponse.json("All fields are required!", { status: 400 });
  }

  if (role == "student") {
    try {
      const existingStudent = await prisma.student.findUnique({
        where: { email: email },
      });

      if (!existingStudent) {
        return NextResponse.json("Student not found!", { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingStudent.password
      );

      if (!isPasswordValid) {
        return NextResponse.json("Incorrect password!", { status: 401 });
      }

      const token = signToken({
        userId: existingStudent.studentid,
        email: existingStudent.email || "",
        role: "student",
      });

      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json(
        {
          id: existingStudent.studentid,
          name: existingStudent.studentname,
          email: existingStudent.email,
          role: "student",
        },
        { status: 200 }
      );
    } catch (e) {
      return NextResponse.json("Error while signing in!", { status: 500 });
    }
  } else if (role == "staff") {
    try {
      const existingStaff = await prisma.staff.findUnique({
        where: { email: email },
      });

      if (!existingStaff) {
        return NextResponse.json("Staff not found!", { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingStaff.password
      );

      if (!isPasswordValid) {
        return NextResponse.json("Incorrect password!", { status: 401 });
      }

      const token = signToken({
        userId: existingStaff.staffid,
        email: existingStaff.email || "",
        role: "staff",
      });

      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json(
        {
          id: existingStaff.staffid,
          name: existingStaff.staffname,
          email: existingStaff.email,
          role: "staff",
        },
        { status: 200 }
      );
    } catch (e) {
      return NextResponse.json("Error creating staff", { status: 500 });
    }
  } else {
    return NextResponse.json("Invalid role", { status: 400 });
  }
}
