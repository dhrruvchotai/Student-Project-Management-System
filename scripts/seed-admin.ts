import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
    const email = "admin@gmail.com";
    const password = "admin";
    const name = "Super Admin";

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
        console.log("Admin already exists:", email);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
        data: {
            adminname: name,
            email,
            password: hashedPassword,
        },
    });

    console.log("Admin created:", admin.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
