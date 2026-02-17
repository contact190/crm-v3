"use server";
// Cache bust: v3-offline-support

import { db } from "@/lib/db";
import { encrypt, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Import offline utilities (client-side only, so we'll handle this differently)
async function loginOffline(loginInput: string, password: string) {
    // This will be called from client-side
    // Server actions can't directly use IndexedDB
    return { error: "Offline login must be handled client-side" };
}

export async function login(formData: FormData) {
    const loginInput = formData.get("email") as string; // Can be email or username
    const password = formData.get("password") as string;

    if (!loginInput || !password) {
        return { error: "Veuillez remplir tous les champs." };
    }

    try {
        const user = await db.user.findFirst({
            where: {
                OR: [
                    { email: loginInput.toLowerCase() },
                    { username: loginInput },
                    { username: loginInput.toLowerCase() },
                    { username: loginInput.toUpperCase() }
                ]
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                },
                organization: {
                    select: {
                        id: true,
                        licenseEnd: true,
                        killSwitch: true
                    }
                }
            }
        });

        if (!user) {
            console.warn(`Login failed: User not found [${loginInput}]`);
            return { error: "Identifiants incorrects." };
        }

        // Check organization license and kill switch
        if (user.organization?.killSwitch) {
            return { error: "Accès bloqué par l'administrateur." };
        }

        if (user.organization?.licenseEnd && new Date(user.organization.licenseEnd) < new Date()) {
            return { error: "Licence expirée. Veuillez renouveler votre abonnement." };
        }

        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
            console.warn(`Login failed: Invalid password for [${loginInput}]`);
            return { error: "Identifiants incorrects." };
        }

        // Create JWT
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                organizationId: user.organizationId,
                role: user.role?.name,
                permissions: user.role?.permissions.map(p => p.permission.slug) || []
            },
            expires
        });

        // Set Cookie
        (await cookies()).set("session", session, { expires, httpOnly: true });

        return { success: true, token: session };
    } catch (error: any) {
        console.error("Login error:", error);

        // If database connection failed, suggest offline mode
        if (error.code === 'P1001' || error.message?.includes('connect')) {
            return {
                error: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet.",
                offline: true
            };
        }

        return { error: `Erreur: ${error.message || "Inconnue"}` };
    }
}


export async function logout() {
    (await cookies()).set("session", "", { expires: new Date(0) });
    redirect("/login");
}
