import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, encrypt } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { identifier, password } = await request.json();

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Identifiants requis' }, { status: 400 });
        }

        // Find user by email or username
        const user = await db.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
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
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
        }

        // Extract permissions
        const permissions = user.role?.permissions.map(rp => rp.permission.slug) || [];

        // Create JWT payload
        const sessionPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            orgId: user.organizationId,
            permissions: permissions,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        const token = await encrypt(sessionPayload);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                orgId: user.organizationId,
                permissions: permissions
            },
            token: token
        });

        return response;

    } catch (error: any) {
        console.error('Mobile Login API Error:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
    }
}
