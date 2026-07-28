import { authedRoute, parseBody } from "lib/api";
import prisma from "lib/prisma";
import { settingsSchema } from "lib/schemas";

/** Saves onboarding answers and account settings. */
export default authedRoute(["POST"], async ({ req, userId }) => {
    const input = parseBody(settingsSchema, req.body);

    const {
        displayName,
        emailAssignmentDue,
        emailModuleReleased,
        emailFeedback,
        emailCertificate,
        ...profileFields
    } = input;

    const hasProfileUpdate = Object.values(profileFields).some(
        (value) => value !== undefined
    );
    const hasNotificationUpdate = [
        emailAssignmentDue,
        emailModuleReleased,
        emailFeedback,
        emailCertificate,
    ].some((value) => value !== undefined);

    await prisma.$transaction(async (tx) => {
        if (displayName !== undefined) {
            await tx.user.update({
                where: { id: userId },
                data: { displayName },
            });
        }

        if (hasProfileUpdate) {
            await tx.userProfile.upsert({
                where: { userId },
                create: { userId, ...profileFields, onboardedAt: new Date() },
                update: { ...profileFields, onboardedAt: new Date() },
            });
        }

        if (hasNotificationUpdate) {
            const notificationData = {
                ...(emailAssignmentDue !== undefined && { emailAssignmentDue }),
                ...(emailModuleReleased !== undefined && {
                    emailModuleReleased,
                }),
                ...(emailFeedback !== undefined && { emailFeedback }),
                ...(emailCertificate !== undefined && { emailCertificate }),
            };
            await tx.notificationPreference.upsert({
                where: { userId },
                create: { userId, ...notificationData },
                update: notificationData,
            });
        }
    });

    return { saved: true };
});
