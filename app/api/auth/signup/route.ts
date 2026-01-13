import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const data = await request.json();

  const fullName = data.fullname as string;
  const phoneNumber = data.phone_number as string;
  const email = data.email as string;
  const password = data.password as string;
  const role = data.role as string;
  const hashedPassword = await bcrypt.hash(password, 10) as string;

  console.log(data);

  if (!fullName || !phoneNumber || !email || !password) {
    return new Response("All fields are required!", { status: 400 });
  }

  if (role == "student") {
    try {
      const existingStudent = await prisma.student.findUnique({
        where: { email: email },
      });

      if (existingStudent) {
        return new Response("Student with this email already exists!", {
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
      return new Response("Student Registration successful", { status: 201 });
    } catch (error) {
      return new Response("Error creating student!", { status: 500 });
    }
  } else if (role == "staff") {
    try {
      console.log(data);
      const existingStaff = await prisma.staff.findUnique({
        where: { email: email },
      });

      if (existingStaff) {
        return new Response("Staff with this email already exists!", {
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

      return new Response("Staff Registration successful", { status: 201 });
    } catch (error) {
      return new Response("Error creating staff", { status: 500 });
    }
  } else {
    return new Response("Invalid role", { status: 400 });
  }
}
