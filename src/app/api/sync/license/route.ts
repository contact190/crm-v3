/**
 * API Route: /api/sync/license
 * Get license information for offline validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organizationId = session.user.organizationId;

        // Fetch organization license info
        const org = await db.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                licenseType: true,
                licenseEnd: true,
                killSwitch: true,
                productLimit: true,
                employeeLimit: true,
                userLimit: true,
                posLimit: true
            }
        });

        if (!org) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Check if license is expired or kill switch is active
        if (org.killSwitch) {
            return NextResponse.json(
                { error: 'Access blocked by administrator' },
                { status: 403 }
            );
        }

        if (org.licenseEnd && new Date(org.licenseEnd) < new Date()) {
            return NextResponse.json(
                { error: 'License expired. Please renew your subscription.' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            organizationId: org.id,
            licenseType: org.licenseType,
            licenseEnd: org.licenseEnd?.toISOString(),
            killSwitch: org.killSwitch,
            productLimit: org.productLimit,
            employeeLimit: org.employeeLimit,
            userLimit: org.userLimit,
            posLimit: org.posLimit
        });

    } catch (error: any) {
        console.error('License check error:', error);
        return NextResponse.json(
            { error: 'License check failed', details: error.message },
            { status: 500 }
        );
    }
}
