import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const data = await request.json();

  const fullName = data.fullname as string;
  const phoneNumber = data.phone_number as string;
  const email = data.email as string;
  const password = data.password as string;
  const role = data.role as string;
  const hashedPassword = (await bcrypt.hash(password, 10)) as string;

  if (!fullName || !phoneNumber || !email || !password) {
    return NextResponse.json("All fields are required!", { status: 400 });
  }

  if (role == "student") {
    try {
      const existingStudent = await prisma.student.findUnique({
        where: { email: email },
      });

      if (existingStudent) {
        return NextResponse.json("Student with this email already exists!", {
          status: 409,
        });
      }
      const student = await prisma.student.create({
        data: {
          studentname: fullName,
          email: email,
          phone: phoneNumber,
          password: hashedPassword,
          description: "",
        },
      });

      const token = signToken({
        userId: student.studentid,
        email: student.email || "",
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
          id: student.studentid,
          name: student.studentname,
          email: student.email,
          role: "student",
        },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json("Error creating student!", { status: 500 });
    }
  } else if (role == "staff") {
    try {
      const existingStaff = await prisma.staff.findUnique({
        where: { email: email },
      });

      if (existingStaff) {
        return NextResponse.json("Staff with this email already exists!", {
          status: 409,
        });
      }
      const staff = await prisma.staff.create({
        data: {
          staffname: fullName,
          email: email,
          phone: phoneNumber,
          password: hashedPassword,
        },
      });

      const token = signToken({
        userId: staff.staffid,
        email: staff.email || "",
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
          id: staff.staffid,
          name: staff.staffname,
          email: staff.email,
          role: "staff",
        },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json("Error creating staff!", { status: 500 });
    }
  } else {
    return NextResponse.json("Invalid role!", { status: 400 });
  }
}
