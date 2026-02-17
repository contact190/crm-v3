import { db } from "./db";

export async function logAction({
    action,
    entity,
    entityId,
    details,
    userId,
    organizationId,
    ipAddress
}: {
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    userId: string;
    organizationId: string;
    ipAddress?: string;
}) {
    try {
        const log = await db.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : null,
                userId,
                organizationId,
                ipAddress
            }
        });
        return log;
    } catch (error) {
        console.error("Failed to log action:", error);
    }
}
