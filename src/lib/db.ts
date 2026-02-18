import { PrismaClient } from "../generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaPg } from "@prisma/adapter-pg";

// Resolve database URL (especially for Electron production)
const databaseUrl = process.env.DATABASE_URL || "file:dev.db";

// Use LibSQL adapter for local file/libsql URLs (Electron desktop)
// Use PostgreSQL adapter for cloud PostgreSQL connections (Render/Supabase)
const isLibSql = databaseUrl.startsWith("file:") || databaseUrl.startsWith("libsql:") || !databaseUrl.includes("://");
const isPostgres = databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://");

let prismaOptions: any = {};

if (isLibSql) {
    const adapter = new PrismaLibSql({
        url: databaseUrl,
    });
    prismaOptions.adapter = adapter;
} else if (isPostgres) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    prismaOptions.adapter = adapter;
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
