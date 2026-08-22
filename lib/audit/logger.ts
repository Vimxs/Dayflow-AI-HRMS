import { prisma } from "@/lib/db/prisma";

export async function createAuditLog({
  actorId,
  action,
  entity,
  entityId,
  metadata,
}: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | string | null;
}) {
  try {
    const metaString =
      typeof metadata === "object" && metadata !== null
        ? JSON.stringify(metadata)
        : metadata || null;

    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        entity,
        entityId: entityId || null,
        metadata: metaString,
      },
    });
  } catch (err) {
    // Audit logging failure should not crash the app, but log to server
    console.error("Failed to write audit log:", err);
  }
}
