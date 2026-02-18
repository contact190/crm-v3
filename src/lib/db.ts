import { PrismaClient } from "../generated/client";
// Cache bust: v3-sync-fix
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Resolve database URL (especially for Electron production)
const databaseUrl = process.env.DATABASE_URL || "file:dev.db";

// Use LibSQL adapter only for local file/libsql URLs
const isLibSql = databaseUrl.startsWith("file:") || databaseUrl.startsWith("libsql:") || !databaseUrl.includes("://");

let prismaOptions: any = {
    datasources: {
        db: {
            url: databaseUrl
        }
    }
};

if (isLibSql) {
    const adapter = new PrismaLibSql({
        url: databaseUrl,
    });
    prismaOptions.adapter = adapter;
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
