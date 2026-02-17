import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
    console.log("Seeding database...");

    // Create Organization
    const org = await db.organization.upsert({
        where: { slug: "eurl-ideal" },
        update: {},
        create: {
            name: "Eurl Ideal",
            legalName: "Eurl Ideal Services",
            taxId: "1234567890",
            slug: "eurl-ideal",
            licenseType: "PREMIUM",
        },
    });

    console.log("Organization created:", org.name);

    // Create Permissions
    const permissionSlugs = [
        "pos_access",
        "view_finance",
        "edit_stock",
        "manage_purchases",
        "manage_hr",
        "manage_users",
        "view_reports"
    ];

    const permissions = [];
    for (const slug of permissionSlugs) {
        const p = await db.permission.upsert({
            where: { slug },
            update: {},
            create: { slug, description: `Permission for ${slug}` }
        });
        permissions.push(p);
    }
    console.log("Permissions seeded!");

    // Create Standard Roles for this Org
    const roles = [
        { name: "Patron", perms: permissionSlugs },
        { name: "Vendeur", perms: ["pos_access", "view_reports"] },
        { name: "Magasinier", perms: ["edit_stock", "manage_purchases"] },
        { name: "Comptable", perms: ["view_finance", "view_reports", "manage_purchases"] },
    ];

    const seededRoles: any = {};
    for (const r of roles) {
        const role = await db.role.upsert({
            where: { name_organizationId: { name: r.name, organizationId: org.id } },
            update: {},
            create: {
                name: r.name,
                organizationId: org.id,
                permissions: {
                    create: r.perms.map(pSlug => ({
                        permission: { connect: { slug: pSlug } }
                    }))
                }
            }
        });
        seededRoles[r.name] = role;
    }
    console.log("Roles seeded!");

    // Create User linked to Patron role
    // Password will be 'admin123' hashed
    const adminPasswordHash = "$2b$10$sD3G2.je6GY6pW8ggo2BkOD54K6GaTtjJbD3TWcAP8YSJJR8TySe."; // This is 'admin123'

    const user = await db.user.upsert({
        where: { email: "admin@ideal.dz" },
        update: {
            roleId: seededRoles["Patron"].id,
            password: adminPasswordHash
        },
        create: {
            email: "admin@ideal.dz",
            name: "Admin User",
            password: adminPasswordHash,
            roleId: seededRoles["Patron"].id,
            organizationId: org.id,
        },
    });

    console.log("User created:", user.email, "(Password: admin123)");

    // Create some products
    const products = [
        { name: "Ciment G5", price: 1200, cost: 800, stock: 150 },
        { name: "Fer 12mm", price: 950, cost: 700, stock: 45 },
        { name: "Briques rouge", price: 45, cost: 30, stock: 1200 },
    ];

    for (const p of products) {
        await db.product.create({
            data: {
                ...p,
                organizationId: org.id,
            },
        });
    }

    console.log("Products seeded!");

    // Create some transactions
    await db.transaction.createMany({
        data: [
            { type: "SALE", totalAmount: 15000, paidAmount: 15000, paymentMode: "CASH", organizationId: org.id },
            { type: "SALE", totalAmount: 25000, paidAmount: 10000, paymentMode: "BARIDIMOB", organizationId: org.id },
            { type: "SALE", totalAmount: 5200, paidAmount: 5200, paymentMode: "CASH", organizationId: org.id },
        ]
    });

    // Log some history
    await db.auditLog.create({
        data: {
            action: "SEED",
            entity: "SYSTEM",
            details: "Initial database seed completed",
            userId: user.id,
            organizationId: org.id,
        }
    });

    console.log("Full seed complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // Adapter handles closure
    });
