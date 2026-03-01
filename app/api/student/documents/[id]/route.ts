import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
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

        // Await the params
        const { id } = await context.params;
        const documentId = parseInt(id, 10);

        if (isNaN(documentId)) {
            return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
        }

        const groupMember = await prisma.projectgroupmember.findFirst({
            where: { studentid: student.studentid },
        });

        if (!groupMember || !groupMember.projectgroupid) {
            return NextResponse.json({ error: "Project group not found" }, { status: 400 });
        }

        // Fetch the document to ensure it belongs to the group
        const document = await prisma.projectdocument.findUnique({
            where: { documentid: documentId },
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (document.projectgroupid !== groupMember.projectgroupid) {
            return NextResponse.json({ error: "Unauthorized to delete this document" }, { status: 403 });
        }

        // Delete from database
        await prisma.projectdocument.delete({
            where: { documentid: documentId },
        });

        // Delete from filesystem
        try {
            const fileName = path.basename(document.filepath);
            const filePath = path.join(process.cwd(), "public", "uploads", "documents", fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fsError) {
            console.error("Failed to delete file from filesystem:", fsError);
            // Non-fatal error, record was deleted from DB
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting document:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
