import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET || "your-fallback-secret-key-change-it";
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}

export async function getSession(request?: NextRequest) {
    // 1. Check cookies (for browser/web)
    const cookieSession = (await cookies()).get("session")?.value;
    if (cookieSession) {
        return await decrypt(cookieSession);
    }

    // 2. Check Authorization header (for Electron sync)
    // We try to get it from the request if provided, or from headers()
    const authHeader = request
        ? request.headers.get("Authorization")
        : (await (await import("next/headers")).headers()).get("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        return await decrypt(token);
    }

    return null;
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}
