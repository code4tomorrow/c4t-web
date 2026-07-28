/**
 * Promotes an existing account to a role. Run after signing in once, so the
 * account exists.
 *
 *   npm run db:make-admin -- you@example.com
 *   npm run db:make-admin -- teacher@example.com INSTRUCTOR
 */
import { PrismaClient, type Role } from "@prisma/client";

const prisma = new PrismaClient();

const VALID_ROLES: Role[] = [
    "LEARNER",
    "INSTRUCTOR",
    "CONTENT_EDITOR",
    "ADMIN",
];

const main = async () => {
    const email = process.argv[2];
    const role = (process.argv[3] || "ADMIN").toUpperCase() as Role;

    if (!email) {
        console.error("Usage: npm run db:make-admin -- <email> [ROLE]");
        console.error(`ROLE is one of: ${VALID_ROLES.join(", ")}`);
        process.exit(1);
    }

    if (!VALID_ROLES.includes(role)) {
        console.error(
            `Invalid role "${role}". Use one of: ${VALID_ROLES.join(", ")}`
        );
        process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.error(
            `No account found for ${email}. Sign in once at /login first, then re-run this.`
        );
        process.exit(1);
    }

    await prisma.user.update({ where: { email }, data: { role } });
    console.log(`✓ ${email} is now ${role}.`);
};

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
