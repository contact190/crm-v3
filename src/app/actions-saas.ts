"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth";

export async function getPlatformStats() {
    try {
        const [orgs, users, transactions, totalMRR] = await Promise.all([
            db.organization.count(),
            db.user.count(),
            db.transaction.count(),
            db.organization.findMany({
                where: { isActive: true },
                include: { plan: true }
            }).then(orgs => orgs.reduce((acc, o) => acc + (o.plan?.price || 0), 0))
        ]);

        const expiringOrgs = await db.organization.findMany({
            where: {
                licenseEnd: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
                    gte: new Date()
                }
            },
            include: { _count: { select: { users: true } } }
        });

        return {
            success: true,
            data: {
                totalOrgs: orgs,
                totalUsers: users,
                totalTransactions: transactions,
                totalMRR,
                expiringCount: expiringOrgs.length,
                expiringOrgs
            }
        };
    } catch (error) {
        return { success: false, error: "Erreur stats plateforme" };
    }
}

export async function getAllOrganizations() {
    try {
        const orgs = await db.organization.findMany({
            include: {
                plan: true,
                _count: {
                    select: { users: true, products: true, transactions: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: orgs };
    } catch (error) {
        return { success: false, error: "Erreur récupération organisations" };
    }
}

export async function getSubscriptionPlans() {
    try {
        const plans = await db.subscriptionPlan.findMany();
        return { success: true, data: plans };
    } catch (error) {
        return { success: false, error: "Erreur récupération plans" };
    }
}

export async function updateOrganizationSaaS(orgId: string, data: any) {
    try {
        const updated = await db.organization.update({
            where: { id: orgId },
            data: {
                licenseType: data.licenseType,
                licenseEnd: data.licenseEnd ? new Date(data.licenseEnd) : null,
                killSwitch: data.killSwitch,
                planId: data.planId,
                userLimit: data.userLimit,
                productLimit: data.productLimit,
                employeeLimit: data.employeeLimit,
                ownerName: data.ownerName
            }
        });
        revalidatePath('/');
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: "Erreur mise à jour organisation" };
    }
}

export async function createSubscriptionPlan(data: any) {
    try {
        const plan = await db.subscriptionPlan.create({
            data: {
                name: data.name,
                price: parseFloat(data.price),
                productLimit: parseInt(data.productLimit),
                employeeLimit: parseInt(data.employeeLimit),
                description: data.description
            }
        });
        return { success: true, data: plan };
    } catch (error) {
        return { success: false, error: "Erreur création plan" };
    }
}

export async function impersonateOrganization(orgId: string) {
    try {
        // En Next.js App Router, l'impersonation "propre" nécessite souvent 
        // de modifier le token JWT dans les cookies. 
        // Pour cette démo, nous allons simuler en renvoyant l'ID 
        // et le Dashboard pourra stocker cela en session/state local.
        const org = await db.organization.findUnique({
            where: { id: orgId },
            include: { users: { take: 1 } }
        });

        if (!org) return { success: false, error: "Organisation non trouvée" };

        // On récupère le premier utilisateur de la boutique pour "devenir" lui
        const targetUser = org.users[0];
        if (!targetUser) return { success: false, error: "Aucun utilisateur dans cette boutique" };

        return {
            success: true,
            data: {
                orgId: org.id,
                userId: targetUser.id,
                orgName: org.name
            }
        };
    } catch (error) {
        return { success: false, error: "Erreur impersonation" };
    }
}

export async function getInvoices() {
    try {
        // Simulé pour l'instant car le modèle Invoice n'existe pas encore dans schema.prisma
        // Mais on peut lister les "dernières facturations" basées sur lastInvoiced des orgs
        const orgs = await db.organization.findMany({
            where: { lastInvoiced: { not: null } },
            orderBy: { lastInvoiced: 'desc' },
            take: 20
        });

        return {
            success: true,
            data: orgs.map(o => ({
                id: `INV-${o.id.slice(0, 5)}`,
                orgName: o.name,
                date: o.lastInvoiced,
                amount: o.planId ? "Sur mesure" : "0",
                status: "Payé"
            }))
        };
    } catch (error) {
        return { success: false, error: "Erreur facturation" };
    }
}

export async function provisionOrganization(data: any) {
    try {
        // Validation basique
        if (!data.name || !data.ownerEmail || !data.ownerName) {
            return { success: false, error: "Données manquantes" };
        }

        // 1. Déterminer les limites basées sur le plan sélectionné
        let productLimit = 1000;
        let employeeLimit = 5;
        let posLimit = 1;
        let price = 0;

        if (data.planId) {
            const plan = await db.subscriptionPlan.findUnique({ where: { id: data.planId } });
            if (plan) {
                productLimit = plan.productLimit;
                employeeLimit = plan.employeeLimit;
                posLimit = plan.posLimit;
                price = plan.price;
            }
        }

        // 2. Création atomique de l'Organisation et de l'Utilisateur
        // Utilisation d'une transaction Prisma pour garantir l'intégrité
        const result = await db.$transaction(async (tx) => {
            // Création de l'organisation
            const org = await tx.organization.create({
                data: {
                    name: data.name,
                    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
                    ownerName: data.ownerName,
                    phone: data.phone,
                    city: data.city,
                    planId: data.planId,
                    productLimit,
                    employeeLimit,
                    licenseType: data.planId ? "PREMIUM" : "FREE",
                    licenseEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
                }
            });

            // Création de l'utilisateur admin
            const user = await tx.user.create({
                data: {
                    email: data.ownerEmail,
                    username: data.username || null,
                    name: data.ownerName,
                    password: await hashPassword(data.tempPassword || "welcome123"),
                    visiblePassword: data.tempPassword || "welcome123", // Stocké pour l'admin
                    pinCode: data.pinCode || null,
                    organizationId: org.id,
                    isSystemAdmin: false,
                }
            });

            return { org, user };
        });

        revalidatePath('/');
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Provisioning error:", error);
        if (error.code === 'P2002') return { success: false, error: "Cet email ou nom de boutique existe déjà" };
        return { success: false, error: "Erreur lors du provisionnement" };
    }
}

export async function getAdvancedAnalytics() {
    try {
        const orgs = await db.organization.findMany({
            include: {
                plan: true,
                _count: { select: { transactions: true, products: true, users: true } }
            }
        });

        // Calcul MRR (Monthly Recurring Revenue)
        const mrr = orgs.reduce((acc, o) => acc + (o.plan?.price || 0), 0);

        // Churn Rate (Simulé : Boutiques sans transactions depuis 30 jours)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const inactiveCount = orgs.filter(o => o.createdAt < thirtyDaysAgo && o._count.transactions === 0).length;
        const churnRate = orgs.length > 0 ? (inactiveCount / orgs.length) * 100 : 0;

        // Projections (Revenu du mois prochain basé sur les renouvellements)
        const projections = mrr * 1.05; // Simulation de croissance de 5%

        // Santé Technique (Top 5 Orgs par volume de données)
        const technicalHealth = orgs.map(o => ({
            name: o.name,
            dataVolume: o._count.transactions + o._count.products + o._count.users,
            limitReached: (o._count.products / o.productLimit) * 100
        })).sort((a, b) => b.dataVolume - a.dataVolume).slice(0, 5);

        return {
            success: true,
            data: {
                mrr,
                churnRate,
                projections,
                technicalHealth
            }
        };
    } catch (error) {
        return { success: false, error: "Erreur analytics avancés" };
    }
}

export async function getOrgAdminCredentials(orgId: string) {
    try {
        const user = await db.user.findFirst({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'asc' } // Usually the first user is the owner
        });

        if (!user) return { success: false, error: "Aucun utilisateur trouvé" };

        return {
            success: true,
            data: {
                username: user.username,
                email: user.email,
                visiblePassword: user.visiblePassword,
                pinCode: user.pinCode
            }
        };
    } catch (error) {
        return { success: false, error: "Erreur récupération accès" };
    }
}
