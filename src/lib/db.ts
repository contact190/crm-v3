import { PrismaClient } from "../generated/client";
// Cache bust: v3-sync-fix
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Resolve database URL (especially for Electron production)
const databaseUrl = process.env.DATABASE_URL || "file:dev.db";

const adapter = new PrismaLibSql({
    url: databaseUrl,
});

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
