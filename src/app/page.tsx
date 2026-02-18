import { db } from "@/lib/db";
import Dashboard from "./Dashboard";
import { checkAndGenerateRecurringExpenses } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const { user } = session;
  const orgId = user.organizationId;

  // --- SELF-HEALING PERMISSIONS LOGIC ---
  // Ensures the admin always has the necessary permissions
  try {
    const superAdminSlug = 'super_admin';
    let superAdminPerm = await db.permission.findUnique({ where: { slug: superAdminSlug } });
    if (!superAdminPerm) {
      superAdminPerm = await db.permission.create({
        data: { slug: superAdminSlug, description: 'Accès total' }
      });
    }

    let superAdminRole = await db.role.findFirst({
      where: { name: 'SUPER_ADMIN', organizationId: orgId }
    });
    if (!superAdminRole) {
      superAdminRole = await db.role.create({
        data: { name: 'SUPER_ADMIN', description: 'Rôle complet', organizationId: orgId }
      });
    }

    const rolePerm = await db.rolePermission.findFirst({
      where: { roleId: superAdminRole.id, permissionId: superAdminPerm.id }
    });
    if (!rolePerm) {
      await db.rolePermission.create({
        data: { roleId: superAdminRole.id, permissionId: superAdminPerm.id }
      });
    }

    // Force-assign role to current logged-in user if they don't have super_admin
    const dbUserRaw = await db.user.findUnique({
      where: { id: user.id }
    });

    // Use the already declared superAdminRole variable

    if (dbUserRaw && !dbUserRaw.roleId && superAdminRole) {
      await db.user.update({
        where: { id: user.id },
        data: { roleId: superAdminRole.id }
      });
    }

    // AUTO-PROMOTE System Admin for the main admin email
    if (dbUserRaw && dbUserRaw.email === 'admin@ideal.dz' && !dbUserRaw.isSystemAdmin) {
      await db.user.update({
        where: { id: dbUserRaw.id },
        data: { isSystemAdmin: true }
      });
    }
  } catch (e) {
    console.error("Self-healing permissions failed:", e);
  }
  // --- END SELF-HEALING ---

  // Re-fetch or use full user for Dashboard
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: { role: { include: { permissions: { include: { permission: true } } } } }
  });

  // Generate any due recurring expenses for THIS org
  await checkAndGenerateRecurringExpenses(orgId);

  const [org, products, clients, transactions, auditLogs, expenses, categories, warehouses, movements, suppliers, accounts, flows, rawEmployees, recurringExpenses, allUsersRaw] = await Promise.all([
    db.organization.findUnique({ where: { id: orgId } }),
    db.product.findMany({
      where: { organizationId: orgId },
      include: {
        category: true,
        warehouseStock: { include: { warehouse: true } },
        units: true
      }
    }),
    db.client.findMany({ where: { organizationId: orgId } }),
    db.transaction.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    db.auditLog.count({ where: { organizationId: orgId } }),
    db.expense.findMany({ where: { organizationId: orgId } }),
    db.category.findMany({
      where: { organizationId: orgId },
      include: { children: true }
    }),
    db.warehouse.findMany({ where: { organizationId: orgId } }),
    db.stockMovement.findMany({
      where: {
        product: { organizationId: orgId }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { product: true, warehouse: true, supplier: true }
    }),
    db.supplier.findMany({ where: { organizationId: orgId } }),
    db.account.findMany({ where: { organizationId: orgId } }),
    db.accountFlow.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { account: true }
    }),
    db.employee.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { name: 'asc' },
      include: {
        attendances: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          orderBy: { clockIn: 'desc' }
        }
      }
    }),
    db.recurringExpense.findMany({
      where: { organizationId: orgId }
    }),
    db.user.findMany({
      where: { organizationId: orgId },
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
    })
  ]);

  if (!org) redirect("/login");

  // Enrich employees with status
  const employees = rawEmployees.map((emp: any) => ({
    ...emp,
    isPresent: emp.attendances.length > 0 && !emp.attendances[0].clockOut
  }));

  // Ensure default account exists for this tenant
  let finalAccounts = accounts;
  const hasDefaultAccount = accounts.some((a: any) => a.isDefault || a.name === "Caisse Boutique");

  if (!hasDefaultAccount) {
    // Attempt to find it one last time before creating to avoid race conditions
    const existingDefault = await db.account.findFirst({
      where: {
        organizationId: org.id,
        OR: [
          { isDefault: true },
          { name: "Caisse Boutique" }
        ]
      }
    });

    if (!existingDefault) {
      const defaultAcc = await db.account.create({
        data: {
          name: "Caisse Boutique",
          type: "CASH",
          balance: 0,
          isDefault: true,
          organizationId: org.id
        }
      });
      finalAccounts = [...accounts, defaultAcc];
    } else {
      finalAccounts = accounts;
    }
  }

  const stats = JSON.parse(JSON.stringify({
    todaySales: transactions.filter((t: any) => t.type === 'SALE' && new Date(t.createdAt).toDateString() === new Date().toDateString()).reduce((acc: number, curr: any) => acc + curr.totalAmount, 0),
    stockCount: products.reduce((acc: number, curr: any) => acc + curr.stock, 0),
    auditCount: auditLogs,
    orgName: org.name,
    orgId: org.id,
    license: (org as any).licenseType || "FREE",
    organization: org,
    recentTransactions: transactions,
    products: products,
    clients: clients,
    expenses: expenses,
    categories: categories,
    warehouses: warehouses,
    movements: movements,
    suppliers: suppliers,
    accounts: finalAccounts,
    flows: flows,
    employees: employees,
    totalReceivables: clients.reduce((acc: number, c: any) => acc + (c.totalDebt || 0), 0),
    totalPayables: suppliers.reduce((acc: number, s: any) => acc + (s.totalDebt || 0), 0),
    stockValue: products.reduce((acc: number, p: any) => acc + (p.stock * (p.lastCost || p.cost || 0)), 0),
    recurringExpenses: recurringExpenses,
    userName: dbUser?.name || user.email,
    user: dbUser ? {
      ...dbUser,
      isSystemAdmin: dbUser.isSystemAdmin || dbUser.email === 'admin@ideal.dz'
    } : null,
    allUsers: (allUsersRaw as any[]).map(u => ({
      ...u,
      permissions: u.role?.permissions.map((p: any) => p.permission.slug) || []
    }))
  }));

  return <Dashboard stats={stats as any} />;
}
