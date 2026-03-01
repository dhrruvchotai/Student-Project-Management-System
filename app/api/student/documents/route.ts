import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { email: user.email },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const groupMember = await prisma.projectgroupmember.findFirst({
            where: { studentid: student.studentid },
        });

        if (!groupMember || !groupMember.projectgroupid) {
            return NextResponse.json({ documents: [] });
        }

        const documents = await prisma.projectdocument.findMany({
            where: { projectgroupid: groupMember.projectgroupid },
            include: {
                student: {
                    select: { studentname: true },
                },
            },
            orderBy: { uploadedat: "desc" },
        });

        return NextResponse.json({ documents });
    } catch (error) {
        console.error("Error fetching documents:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser();

        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { email: user.email },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const groupMember = await prisma.projectgroupmember.findFirst({
            where: { studentid: student.studentid },
        });

        if (!groupMember || !groupMember.projectgroupid) {
            return NextResponse.json({ error: "Project group not found" }, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Clean filename, make it unique
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueFilename = `${Date.now()}-${originalName}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Save file to disk
        fs.writeFileSync(filePath, buffer);

        // Relative path for client access
        const relativeFilePath = `/uploads/documents/${uniqueFilename}`;

        // Save to DB
        const newDocument = await prisma.projectdocument.create({
            data: {
                projectgroupid: groupMember.projectgroupid,
                studentid: student.studentid,
                filename: file.name,
                filepath: relativeFilePath,
            },
            include: {
                student: { select: { studentname: true } }
            }
        });

        return NextResponse.json({ success: true, document: newDocument });

    } catch (error) {
        console.error("Upload Document Error:", error);
        return NextResponse.json(
            { error: "Failed to upload document" },
            { status: 500 }
        );
    }
}
