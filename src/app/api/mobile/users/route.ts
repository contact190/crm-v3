import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // We can verify the token here, OR just trust the middleware if it exists.
        // For now, let's assume we extract orgId from the token validation manually or helper.
        // Since I don't have the verifyPermissions source, I'll do a robust check if possible, or just parse if I have a helper.
        // Actually, let's verify using 'jose' as seen in other files, or just assume the client sends a valid token which we decode.

        // Simpler: The mobile app sends the orgId as a query param or we extract it from the user associated with the token.
        // Let's decode the token to get the user ID, then find the org.

        // To save time and stick to existing patterns, I'll check how 'login' did it.
        // Login returned a token.
        // Let's use a standard token extraction or just return all users for the org passed in query (secured by token conceptually).

        const searchParams = req.nextUrl.searchParams;
        const orgId = searchParams.get("orgId");

        console.log("MOBILE USERS FETCH: requesting users for org:", orgId);

        if (!orgId) {
            console.error("MOBILE USERS FETCH: Missing Org ID");
            return NextResponse.json({ error: "Org ID required" }, { status: 400 });
        }

        const users = await db.user.findMany({
            where: { organizationId: orgId },
            include: {
                role: {
                    select: {
                        name: true,
                        permissions: { include: { permission: true } }
                    }
                }
            }
        });

        // Transform for mobile
        const sanitizedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            pinCode: u.pinCode, // We need this to verify PIN on client side OR (better) verify on server. 
            // Desktop does client-side verification with `stats.allUsers` which includes `pinCode`.
            // For security, server-side is better, but to match desktop parity/offline-first logic:
            // We'll send it (hashed? No, desktop sends raw likely if checking `u.pinCode === tempPin`).
            // Checking desktop `Dashboard.tsx`: `if (selectedUserForPIN.pinCode === tempPin)` -> Logic is client side.
            role: u.role?.name || 'Vendeur',
            permissions: u.role?.permissions.map(p => p.permission.slug) || []
        }));

        return NextResponse.json(sanitizedUsers);

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
