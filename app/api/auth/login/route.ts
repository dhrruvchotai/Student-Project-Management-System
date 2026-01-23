import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const data = await request.json();
  const email = data.email as string;
  const password = data.password as string;
  const role = data.role as string;

  const hashedPassword = (await bcrypt.hash(password, 10)) as string;

  if (!email || !password) {
    return new Response("All fields are required!", { status: 400 });
  }

  if (role == "student") {
    try {
      const existingStudent = await prisma.student.findUnique({
        where: { email: email},
      });


      if (!existingStudent) {
        return new Response("Student not found!", { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingStudent.password
      );

      if (!isPasswordValid) {
        return new Response("Incorrect password!", { status: 401 });
      }

      return new Response("Login successful!", { status: 200 });
    } catch (e) {
      return new Response("Error while signing in!", { status: 500 });
    }
  } else if (role == "staff") {
    try {
      const existingStaff = await prisma.staff.findUnique({
        where: { email: email},
      });

      if (!existingStaff) {
        return new Response("Staff not found!", { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingStaff.password
      );

      if (!isPasswordValid) {
        return new Response("Incorrect password!", { status: 401 });
      }

      return new Response("Login successful!", { status: 200 });
    } catch (e) {
      return new Response("Error creating staff", { status: 500 });
    }
  } else {
    return new Response("Invalid role", { status: 400 });
  }
}
