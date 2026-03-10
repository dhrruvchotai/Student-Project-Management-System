import { prisma } from "./lib/prisma";

async function main() {
    try {
        const newRequest = await prisma.projectrequest.create({
            data: {
                studentid: 1, // Let's hope student 1 exists
                staffid: 1, // Let's hope staff 1 exists
                title: "Test",
                category: "Test",
                description: "Test",
                status: "Pending",
            }
        });

        console.log("Success:", newRequest);
    } catch (err) {
        console.error("Prisma Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
