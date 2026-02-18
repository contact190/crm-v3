"use server";
// Forced rebuild for Prisma schema sync

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Robustly resolve organizationId from various input names
function resolveOrgId(data: any): string {
    return data?.organizationId || data?.orgId || data?.organization?.id || "";
}


export async function checkServerStatus() {
    try {
        await db.$queryRaw`SELECT 1`;
        return { success: true, timestamp: Date.now() };
    } catch (e) {
        return { success: false };
    }
}

/**
 * Transaction Actions
 */
export async function createTransaction(formData: {
    amount: number,
    type: string,
    mode: string,
    orgId: string,
    items?: string,
    clientId?: string,
    paidAmount?: number,
    warehouseId?: string,
    accountId?: string
}) {
    try {
        const defaultAltAccount = !formData.accountId ? await db.account.findFirst({ where: { organizationId: formData.orgId, isDefault: true } }) : null;
        const targetAccountId = formData.accountId || defaultAltAccount?.id;

        const transaction = await db.transaction.create({
            data: {
                totalAmount: formData.amount,
                paidAmount: formData.paidAmount ?? formData.amount,
                type: formData.type,
                paymentMode: formData.mode,
                organizationId: resolveOrgId(formData),
                items: formData.items || "[]",
                clientId: formData.clientId || null,
                warehouseId: formData.warehouseId || null,
                accountId: targetAccountId || null
            }
        });

        // Record Account Flow if payment made
        if (targetAccountId && (formData.paidAmount ?? formData.amount) > 0) {
            const acc = await db.account.update({
                where: { id: targetAccountId },
                data: { balance: { increment: formData.paidAmount ?? formData.amount } }
            });

            await db.accountFlow.create({
                data: {
                    accountId: targetAccountId,
                    type: "IN",
                    amount: formData.paidAmount ?? formData.amount,
                    balanceAfter: acc.balance,
                    category: "SALE",
                    reason: `Vente #${transaction.id.slice(-6)}`,
                    sourceId: transaction.id,
                    organizationId: formData.orgId
                }
            });
        }

        if (formData.type === "SALE" && formData.items) {
            const items = JSON.parse(formData.items);
            const targetWarehouseId = formData.warehouseId || (await db.warehouse.findFirst({ where: { organizationId: formData.orgId } }))?.id;

            for (const item of items) {
                // Multi-Unit Logic: Deduct based on conversion factor
                // Default to 1 if no conversion provided (normal pieces)
                const conversionFactor = item.conversion || 1;
                const qtyToDeduct = item.quantity * conversionFactor;

                await db.product.update({
                    where: { id: item.id },
                    data: { stock: { decrement: qtyToDeduct } }
                });

                if (targetWarehouseId) {
                    await db.warehouseStock.upsert({
                        where: { productId_warehouseId: { productId: item.id, warehouseId: targetWarehouseId } },
                        update: { quantity: { decrement: qtyToDeduct } },
                        create: { productId: item.id, warehouseId: targetWarehouseId, quantity: -qtyToDeduct }
                    });

                    await db.stockMovement.create({
                        data: {
                            productId: item.id,
                            warehouseId: targetWarehouseId,
                            type: "OUT",
                            quantity: qtyToDeduct,
                            reason: "VENTE POS",
                            referenceId: transaction.id
                        }
                    });
                }
            }
        }

        if (formData.type === "SALE" && formData.clientId && (formData.paidAmount ?? formData.amount) < formData.amount) {
            const debt = formData.amount - (formData.paidAmount ?? formData.amount);

            // Check credit limit
            const client = await db.client.findUnique({ where: { id: formData.clientId } });
            if (client && client.creditLimit !== null && (client.totalDebt + debt) > client.creditLimit) {
                return {
                    success: false,
                    error: `Le plafond de crédit (${client.creditLimit} DA) est dépassé. Dette actuelle: ${client.totalDebt} DA.`
                };
            }

            await db.client.update({
                where: { id: formData.clientId },
                data: { totalDebt: { increment: debt } }
            });
        }

        revalidatePath("/");
        return { success: true, transaction };
    } catch (error: any) {
        console.error("Failed to create transaction:", error);
        return { success: false, error: error.message || "Erreur lors de l'enregistrement" };
    }
}

export async function createSupplier(data: {
    name: string,
    contactName?: string,
    phone?: string,
    email?: string,
    address?: string,
    nif?: string,
    nis?: string,
    rc?: string,
    ai?: string,
    orgId: string
}) {
    try {
        await db.supplier.create({
            data: {
                ...data,
                organizationId: resolveOrgId(data),
                orgId: undefined,
                organizationId_legacy: undefined
            } as any
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSupplier(id: string, data: any) {
    try {
        await db.supplier.update({
            where: { id },
            data
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSupplier(id: string) {
    try {
        const movements = await db.stockMovement.findFirst({ where: { supplierId: id } });
        if (movements) throw new Error("Impossible de supprimer un fournisseur lié à des mouvements de stock");

        await db.supplier.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Product Actions
 */
export async function createProduct(formData: {
    name: string,
    price: number,
    cost: number,
    stock: number,
    minStock?: number,
    sku?: string,
    barcode?: string,
    image?: string,
    unit?: string,
    orgId: string,
    categoryId?: string,
    warehouseId?: string,
    location?: { aisle?: string, shelf?: string, bin?: string }
}) {
    console.log("createProduct action called with:", formData);
    try {
        const orgId = resolveOrgId(formData);
        console.log("Resolved orgId:", orgId);
        if (!orgId) throw new Error("ID Organisation manquant");

        // Enforce product limit
        const org = await db.organization.findUnique({
            where: { id: orgId },
            select: { productLimit: true, _count: { select: { products: true } } }
        });

        if (org && org._count.products >= org.productLimit) {
            return {
                success: false,
                error: `Limite de produits atteinte (${org.productLimit}). Veuillez augmenter votre forfait.`
            };
        }
        // Auto-generate barcode if missing
        let finalBarcode = formData.barcode;
        if (!finalBarcode) {
            // Generate a unique 13-digit numeric string (EAN-13 style but random for internal use)
            finalBarcode = Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
        }

        const product = await db.product.create({
            data: {
                name: formData.name,
                price: formData.price,
                cost: formData.cost, // Legacy support
                lastCost: formData.cost,
                avgCost: formData.cost,
                previousCost: formData.cost,
                stock: formData.stock,
                minStock: formData.minStock || 0,
                sku: formData.sku || null,
                barcode: finalBarcode,
                image: formData.image || null,
                unit: formData.unit || "pcs",
                color: (formData as any).color || null,
                size: (formData as any).size || null,
                organizationId: resolveOrgId(formData),
                categoryId: formData.categoryId || null,
            }
        });

        if (formData.warehouseId) {
            await db.warehouseStock.create({
                data: {
                    productId: product.id,
                    warehouseId: formData.warehouseId,
                    quantity: formData.stock,
                    aisle: formData.location?.aisle,
                    shelf: formData.location?.shelf,
                    bin: formData.location?.bin,
                }
            });

            await db.stockMovement.create({
                data: {
                    productId: product.id,
                    warehouseId: formData.warehouseId,
                    type: "IN",
                    quantity: formData.stock,
                    previousStock: 0,
                    newStock: formData.stock,
                    reason: "INITIAL_STOCK"
                }
            });
        }

        revalidatePath("/");
        return { success: true, product };
    } catch (error: any) {
        console.error("Failed to create product:", error);
        return { success: false, error: error.message || "Erreur lors de la création du produit" };
    }
}

/**
 * Stock Management
 */
export async function adjustStock(data: {
    productId: string,
    warehouseId: string,
    type: "IN" | "OUT" | "ADJUST" | "TRANSFER",
    quantity: number,
    unitId?: string, // Optional UoM unit
    reason?: string,
    location?: { aisle?: string, shelf?: string, bin?: string },
    supplierId?: string,
    supplierName?: string,
    cost?: number,
    orgId?: string
}) {
    try {
        if (!data.productId) throw new Error("ID Produit manquant");
        const product = await db.product.findUnique({
            where: { id: data.productId },
            include: { units: true }
        });
        if (!product) throw new Error("Produit introuvable");

        let conversionFactor = 1;
        let selectedUnitName = product.unit;

        if (data.unitId) {
            const unit = product.units.find(u => u.id === data.unitId);
            if (unit) {
                conversionFactor = unit.conversion;
                selectedUnitName = unit.unitName;
            }
        }

        const baseQuantity = data.quantity * conversionFactor;
        const oldStock = product.stock;
        let newGlobalStock = oldStock;

        if (data.type === "IN") {
            newGlobalStock += baseQuantity;
            // Update Pricing Intelligence
            const newCost = data.cost || product.lastCost;
            const newAvgCost = (oldStock * product.avgCost + baseQuantity * (newCost / conversionFactor)) / (newGlobalStock || 1);

            await db.product.update({
                where: { id: data.productId },
                data: {
                    lastCost: newCost,
                    previousCost: product.lastCost,
                    avgCost: newAvgCost,
                    stock: newGlobalStock
                }
            });
        } else if (data.type === "OUT") {
            newGlobalStock -= baseQuantity;
            await db.product.update({
                where: { id: data.productId },
                data: { stock: newGlobalStock }
            });
        } else {
            newGlobalStock = baseQuantity;
            await db.product.update({
                where: { id: data.productId },
                data: { stock: newGlobalStock }
            });
        }

        await db.warehouseStock.upsert({
            where: { productId_warehouseId: { productId: data.productId, warehouseId: data.warehouseId } },
            update: {
                quantity: data.type === "IN" ? { increment: baseQuantity } : data.type === "OUT" ? { decrement: baseQuantity } : baseQuantity,
                aisle: data.location?.aisle,
                shelf: data.location?.shelf,
                bin: data.location?.bin,
            },
            create: {
                productId: data.productId,
                warehouseId: data.warehouseId,
                quantity: data.type === "IN" ? baseQuantity : data.type === "OUT" ? -baseQuantity : baseQuantity,
                aisle: data.location?.aisle,
                shelf: data.location?.shelf,
                bin: data.location?.bin,
            }
        });

        const movement = await db.stockMovement.create({
            data: {
                productId: data.productId,
                warehouseId: data.warehouseId,
                type: data.type,
                quantity: baseQuantity,
                previousStock: oldStock,
                newStock: newGlobalStock,
                supplierId: data.supplierId || null,
                supplierName: data.supplierName || null,
                reason: data.reason || (data.unitId ? `Ajustement (${data.quantity} ${selectedUnitName})` : "Ajustement manuel")
            }
        });

        revalidatePath("/");
        return { success: true, movement };
    } catch (error: any) {
        console.error("Failed to adjust stock:", error);
        return { success: false, error: error.message || "Erreur lors de l'ajustement" };
    }
}

/**
 * Warehouse & Category
 */
export async function createWarehouse(data: { name: string, address?: string, orgId: string }) {
    try {
        await db.warehouse.create({
            data: {
                name: data.name,
                address: data.address || null,
                organizationId: resolveOrgId(data)
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create warehouse:", error);
        return { success: false, error: error.message || "Erreur lors de la création du dépôt" };
    }
}

export async function createCategory(name: string, orgId: string, parentId?: string) {
    try {
        await db.category.create({
            data: {
                name,
                organizationId: orgId,
                parentId: parentId || null
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create category:", error);
        return { success: false, error: error.message || "Erreur lors de la création de la catégorie" };
    }
}

export async function deleteWarehouse(id: string) {
    try {
        // Check for dependencies
        const stock = await db.warehouseStock.findFirst({ where: { warehouseId: id, quantity: { gt: 0 } } });
        if (stock) throw new Error("Impossible de supprimer un dépôt qui contient du stock");

        await db.warehouse.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(id: string) {
    try {
        const products = await db.product.findFirst({ where: { categoryId: id } });
        if (products) throw new Error("Impossible de supprimer une catégorie liée à des articles");

        await db.category.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
/**
 * Client Actions
 */
export async function createClient(formData: {
    name: string,
    type?: string,
    phone?: string,
    email?: string,
    address?: string,
    district?: string,
    nif?: string,
    nis?: string,
    rc?: string,
    creditLimit?: number,
    orgId: string
}) {
    try {
        await db.client.create({
            data: {
                name: formData.name,
                type: formData.type || "PARTICULIER",
                phone: formData.phone || null,
                email: formData.email || null,
                address: formData.address || null,
                district: formData.district || null,
                nif: formData.nif || null,
                nis: formData.nis || null,
                rc: formData.rc || null,
                creditLimit: formData.creditLimit ? Number(formData.creditLimit) : null,
                organizationId: resolveOrgId(formData),
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create client:", error);
        return { success: false, error: error.message || "Erreur client" };
    }
}

export async function updateClient(id: string, formData: {
    name?: string,
    type?: string,
    phone?: string,
    email?: string,
    address?: string,
    district?: string,
    nif?: string,
    nis?: string,
    rc?: string,
    creditLimit?: number,
}) {
    try {
        await db.client.update({
            where: { id },
            data: {
                ...formData,
                creditLimit: formData.creditLimit !== undefined ? (formData.creditLimit === null ? null : Number(formData.creditLimit)) : undefined,
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update client:", error);
        return { success: false, error: error.message || "Erreur lors de la mise à jour" };
    }
}

export async function getClientHistory(clientId: string) {
    try {
        const transactions = await db.transaction.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
            take: 500
        });
        return { success: true, data: transactions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function collectClientDebt(clientId: string, amount: number, orgId: string, accountId: string) {
    try {
        const client = await db.client.findUnique({ where: { id: clientId } });
        if (!client) throw new Error("Client non trouvé");

        const res = await db.$transaction(async (tx) => {
            // 1. Update Client Debt
            const updatedClient = await tx.client.update({
                where: { id: clientId },
                data: { totalDebt: { decrement: amount } }
            });

            // 2. Create Transaction record
            const transaction = await tx.transaction.create({
                data: {
                    type: "DEBT_PAYMENT",
                    totalAmount: amount,
                    paidAmount: amount,
                    paymentMode: "CASH",
                    clientId: clientId,
                    organizationId: orgId,
                    accountId: accountId,
                    items: "[]"
                }
            });

            // 3. Update Account Balance & Flow
            const acc = await tx.account.update({
                where: { id: accountId },
                data: { balance: { increment: amount } }
            });

            await tx.accountFlow.create({
                data: {
                    accountId: accountId,
                    type: "IN",
                    amount: amount,
                    balanceAfter: acc.balance,
                    category: "DEBT_PAYMENT",
                    reason: `Versement Client: ${client.name}`,
                    sourceId: transaction.id,
                    organizationId: orgId
                }
            });

            return transaction;
        });

        revalidatePath("/");
        return { success: true, transaction: res };
    } catch (error: any) {
        console.error("Failed to record debt payment:", error);
        return { success: false, error: error.message || "Erreur paiement" };
    }
}

export async function paySupplierDebt(supplierId: string, amount: number, orgId: string, accountId: string) {
    try {
        const supplier = await db.supplier.findUnique({ where: { id: supplierId } });
        if (!supplier) throw new Error("Fournisseur non trouvé");

        const res = await db.$transaction(async (tx) => {
            // 1. Update Supplier Debt
            await tx.supplier.update({
                where: { id: supplierId },
                data: { totalDebt: { decrement: amount } }
            });

            // 2. Create Expense as record of payment
            const expense = await tx.expense.create({
                data: {
                    label: `Règlement Dette: ${supplier.name}`,
                    amount: amount,
                    category: "PURCHASE",
                    organizationId: orgId,
                    accountId: accountId
                }
            });

            // 3. Update Account Balance & Flow
            const acc = await tx.account.update({
                where: { id: accountId },
                data: { balance: { decrement: amount } }
            });

            await tx.accountFlow.create({
                data: {
                    accountId: accountId,
                    type: "OUT",
                    amount: amount,
                    balanceAfter: acc.balance,
                    category: "DEBT_PAYMENT",
                    reason: `Paiement Fournisseur: ${supplier.name}`,
                    sourceId: expense.id,
                    organizationId: orgId
                }
            });

            return expense;
        });

        revalidatePath("/");
        return { success: true, expense: res };
    } catch (error: any) {
        console.error("Failed to pay supplier debt:", error);
        return { success: false, error: error.message || "Erreur règlement" };
    }
}


/**
 * Other Meta
 */
// Print helper using PowerShell
export async function printJob(content: string, printerName: string) {
    "use server";
    try {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);

        const tempFile = path.join(os.tmpdir(), `ticket-${Date.now()}.txt`);
        // Basic cleanup of HTML to Text for thermal printers (if needed) or just dump content
        // For now, assuming raw text or simple content.
        fs.writeFileSync(tempFile, content);

        const cmd = `powershell -Command "Get-Content -Path '${tempFile}' | Out-Printer -Name '${printerName}'"`;
        await execAsync(cmd);

        return { success: true };
    } catch (error: any) {
        console.error("Print Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateOrganization(orgId: string, data: any) {
    try {
        await db.organization.update({
            where: { id: orgId },
            data
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProduct(id: string) {
    try {
        // Manually cascade delete StockMovements because Prisma schema doesn't have onDelete: Cascade
        await db.stockMovement.deleteMany({
            where: { productId: id }
        });

        // Now delete the product (ProductUnit and WarehouseStock cascade automatically)
        await db.product.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function updateProduct(id: string, data: {
    name?: string,
    price?: number,
    cost?: number,
    minStock?: number,
    sku?: string,
    barcode?: string,
    image?: string,
    unit?: string,
    categoryId?: string,
}) {
    try {
        await db.product.update({
            where: { id },
            data
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createExpense(data: {
    label: string,
    amount: number,
    category: string,
    accountId?: string,
    supplierId?: string,
    isPaid?: boolean,
    dueDate?: Date,
    orgId: string
}) {
    try {
        await db.$transaction(async (tx) => {
            // 1. Create the Expense record
            const expense = await tx.expense.create({
                data: {
                    label: data.label,
                    amount: data.amount,
                    category: data.category,
                    organizationId: resolveOrgId(data),
                    accountId: data.isPaid ? data.accountId : null,
                    isPaid: data.isPaid ?? true,
                    dueDate: data.dueDate || (data.isPaid ? null : new Date())
                }
            });

            // 2. Handle immediate payment effects
            if (data.isPaid && data.accountId) {
                const acc = await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { decrement: data.amount } }
                });

                await tx.accountFlow.create({
                    data: {
                        accountId: data.accountId,
                        type: "OUT",
                        amount: data.amount,
                        balanceAfter: acc.balance,
                        category: "EXPENSE",
                        reason: data.label,
                        sourceId: expense.id,
                        organizationId: data.orgId
                    }
                });
            }

            // 3. Handle Supplier Debt if unpaid
            if (data.supplierId && !data.isPaid) {
                await tx.supplier.update({
                    where: { id: data.supplierId },
                    data: { totalDebt: { increment: data.amount } }
                });
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function payExpense(expenseId: string, accountId: string, orgId: string) {
    try {
        const expense = await db.expense.findUnique({ where: { id: expenseId } });
        if (!expense) throw new Error("Charge introuvable");
        if (expense.isPaid) throw new Error("Cette charge est déjà payée");

        await db.$transaction(async (tx) => {
            // 1. Update Expense
            await tx.expense.update({
                where: { id: expenseId },
                data: {
                    isPaid: true,
                    accountId: accountId
                }
            });

            // 2. Update Account Balance
            const acc = await tx.account.update({
                where: { id: accountId },
                data: { balance: { decrement: expense.amount } }
            });

            // 3. Record Flow
            await tx.accountFlow.create({
                data: {
                    accountId: accountId,
                    type: "OUT",
                    amount: expense.amount,
                    balanceAfter: acc.balance,
                    category: "EXPENSE",
                    reason: `Règlement charge: ${expense.label}`,
                    sourceId: expense.id,
                    organizationId: orgId
                }
            });
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- RECURRING EXPENSES ---

export async function createRecurringExpense(data: any) {
    try {
        await db.recurringExpense.create({
            data: {
                label: data.label,
                amount: Number(data.amount),
                category: data.category,
                frequency: data.frequency,
                startDate: new Date(),
                nextRun: new Date(),
                organizationId: data.orgId
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRecurringExpense(id: string) {
    try {
        await db.recurringExpense.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function checkAndGenerateRecurringExpenses(orgId: string) {
    try {
        const now = new Date();
        const dueExpenses = await db.recurringExpense.findMany({
            where: {
                organizationId: orgId,
                active: true,
                nextRun: { lte: now }
            }
        });

        if (dueExpenses.length === 0) return { success: true, count: 0 };

        let count = 0;
        await db.$transaction(async (tx) => {
            for (const re of dueExpenses) {
                await tx.expense.create({
                    data: {
                        label: `${re.label}-R`,
                        amount: re.amount,
                        category: re.category,
                        organizationId: orgId,
                        accountId: null,
                        isPaid: false,
                        dueDate: re.nextRun
                    }
                });

                const nextDate = new Date(re.nextRun);
                if (re.frequency === "MONTHLY") nextDate.setMonth(nextDate.getMonth() + 1);
                else if (re.frequency === "YEARLY") nextDate.setFullYear(nextDate.getFullYear() + 1);
                else if (re.frequency === "ONCE") {
                    await tx.recurringExpense.update({ where: { id: re.id }, data: { active: false } });
                    continue;
                }

                await tx.recurringExpense.update({
                    where: { id: re.id },
                    data: { nextRun: nextDate }
                });
                count++;
            }
        });

        revalidatePath("/");
        return { success: true, count };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * ProductUnit Actions (UoM System)
 */
export async function createProductUnit(data: {
    productId: string,
    unitName: string,
    conversion: number,
    barcode?: string,
    sellPrice?: number,
    buyPrice?: number,
    isDefault?: boolean
}) {
    try {
        await db.productUnit.create({
            data: {
                productId: data.productId,
                unitName: data.unitName,
                conversion: data.conversion,
                barcode: data.barcode || null,
                sellPrice: data.sellPrice || null,
                buyPrice: data.buyPrice || null,
                isDefault: data.isDefault || false
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateProductUnit(id: string, data: any) {
    try {
        await db.productUnit.update({
            where: { id },
            data
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProductUnit(id: string) {
    try {
        await db.productUnit.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Helper: Find product by any barcode (base or unit)
 */
export async function findProductByBarcode(barcode: string, orgId: string) {
    try {
        // Search in base product barcode
        let product = await db.product.findFirst({
            where: {
                barcode: barcode,
                organizationId: orgId
            },
            include: { units: true }
        });

        // If not found, search in unit barcodes
        if (!product) {
            const unit = await db.productUnit.findFirst({
                where: { barcode: barcode },
                include: { product: { include: { units: true } } }
            });
            if (unit) {
                product = unit.product as any;
                (product as any).scannedUnit = unit; // Attach scanned unit info
            }
        }

        return { success: true, product };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Z-REPORT ACTIONS ---

export async function getZReportData(orgId: string) {
    try {
        // 1. Find last ZDate
        const lastZ = await db.zReport.findFirst({
            where: { organizationId: orgId },
            orderBy: { date: 'desc' }
        });

        const startDate = lastZ ? lastZ.date : new Date(0); // Epoch if no previous Z

        // 2. Aggregate Transactions (Sales + Debt Payments)
        const transactions = await db.transaction.findMany({
            where: {
                organizationId: orgId,
                createdAt: { gt: startDate },
                status: "COMPLETED"
            }
        });

        // 3. Aggregate Expenses
        const expenses = await db.expense.findMany({
            where: {
                organizationId: orgId,
                createdAt: { gt: startDate }
            }
        });

        // Calculate Totals
        let totalSales = 0;
        let totalDebtPayments = 0;
        const paymentModes: Record<string, number> = {};

        for (const t of transactions) {
            const amount = t.paidAmount || t.totalAmount; // Cash received
            if (t.type === "SALE" || t.type === "DEBT_PAYMENT") {
                if (t.type === "SALE") totalSales += t.totalAmount; // Actual sales value
                if (t.type === "DEBT_PAYMENT") totalDebtPayments += amount;

                // Cash in drawer contribution (Paid Amount)
                const mode = t.paymentMode || "CASH";
                paymentModes[mode] = (paymentModes[mode] || 0) + amount;
            }
        }

        const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

        // Theoretical Cash = (Total Cash In from Sales & Debt) - Expenses
        // Note: We suppose "CASH" mode is the only one affected by expenses, 
        // but typically Z-Report shows Total Cash vs Computed Cash.
        // Let's assume expenses are paid in CASH.
        const totalCashIn = paymentModes["CASH"] || 0;
        const netCashTheoretical = totalCashIn - totalExpenses;

        return {
            success: true,
            data: {
                startDate,
                totalSales,
                totalDebtPayments,
                paymentModes,
                totalExpenses,
                netCashTheoretical,
                transactionCount: transactions.length,
                expenseCount: expenses.length
            }
        };
    } catch (error: any) {
        console.error("Failed to get Z data:", error);
        return { success: false, error: error.message };
    }
}

export async function createZReport(data: {
    orgId: string,
    totalSales: number,
    totalExpenses: number,
    netTotal: number,
    cashCounted: number,
    variance: number,
    details: any
}) {
    try {
        const z = await db.zReport.create({
            data: {
                organizationId: data.orgId,
                totalSales: data.totalSales,
                totalExpenses: data.totalExpenses,
                netTotal: data.netTotal,
                cashCounted: data.cashCounted,
                variance: data.variance,
                details: JSON.stringify(data.details),
                date: new Date()
            }
        });

        revalidatePath("/");
        return { success: true, id: z.id };
    } catch (error: any) {
        console.error("Failed to create Z Report:", error);
        return { success: false, error: error.message };
    }
}

export async function getPrinters() {
    "use server";
    try {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);

        // Use PowerShell to get printer names
        const cmd = `powershell -Command "Get-Printer | Select-Object Name | ConvertTo-Json"`;
        const { stdout } = await execAsync(cmd);

        let printers = [];
        try {
            const parsed = JSON.parse(stdout);
            if (Array.isArray(parsed)) {
                printers = parsed.map((p: any) => p.Name);
            } else if (parsed && parsed.Name) {
                printers = [parsed.Name];
            }
        } catch (e) {
            console.error("JSON Parse Error for printers:", e);
        }

        return { success: true, printers };
    } catch (error: any) {
        console.error("Printer Fetch Error:", error);
        return { success: false, error: error.message, printers: [] };
    }
}

/**
 * Bulk Import Products from CSV
 */
export async function importProducts(orgId: string, products: any[]) {
    try {
        // Get or find the first warehouse for initial stock
        const warehouse = await db.warehouse.findFirst({
            where: { organizationId: orgId }
        });

        if (!warehouse) {
            return { success: false, error: "Aucun dépôt trouvé. Créez d'abord un dépôt." };
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const item of products) {
            try {
                // 1. Manage Category
                let categoryId = null;
                if (item.Categorie) {
                    let cat = await db.category.findFirst({
                        where: {
                            name: item.Categorie,
                            organizationId: orgId
                        }
                    });

                    if (!cat) {
                        cat = await db.category.create({
                            data: {
                                name: item.Categorie,
                                organizationId: orgId
                            }
                        });
                    }
                    categoryId = cat.id;
                }

                // 2. Generate Barcode if missing
                let finalBarcode = item.CodeBarres;
                if (!finalBarcode) {
                    finalBarcode = Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
                }

                // 3. Create Product
                const cleanNum = (val: any) => {
                    if (typeof val !== 'string') return Number(val) || 0;
                    return Number(val.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
                };

                const product = await db.product.create({
                    data: {
                        name: item.Nom,
                        sku: item.SKU || null,
                        barcode: finalBarcode,
                        price: cleanNum(item.PrixVente),
                        cost: cleanNum(item.PrixAchat),
                        lastCost: cleanNum(item.PrixAchat),
                        avgCost: cleanNum(item.PrixAchat),
                        previousCost: cleanNum(item.PrixAchat),
                        stock: cleanNum(item.Stock),
                        unit: item.Unite || "pcs",
                        minStock: cleanNum(item.StockMin),
                        organizationId: orgId,
                        categoryId: categoryId
                    }
                });

                // 4. Initialize Warehouse Stock
                const stockQty = cleanNum(item.Stock);
                if (stockQty > 0) {
                    await db.warehouseStock.create({
                        data: {
                            productId: product.id,
                            warehouseId: warehouse.id,
                            quantity: stockQty
                        }
                    });

                    await db.stockMovement.create({
                        data: {
                            productId: product.id,
                            warehouseId: warehouse.id,
                            type: "IN",
                            quantity: stockQty,
                            previousStock: 0,
                            newStock: stockQty,
                            reason: "IMPORT_CSV"
                        }
                    });
                }

                results.success++;
            } catch (err: any) {
                results.failed++;
                results.errors.push(`${item.Nom || 'Produit inconnu'}: ${err.message}`);
            }
        }

        revalidatePath("/");
        return { success: true, results };
    } catch (error: any) {
        console.error("Bulk import failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * --- FINANCIAL & TREASURY ACTIONS ---
 */

// Helper to record flow and update account balance
async function recordAccountFlow(data: {
    accountId: string,
    type: "IN" | "OUT",
    amount: number,
    category: string,
    reason?: string,
    sourceId?: string,
    orgId: string
}) {
    const account = await db.account.findUnique({ where: { id: data.accountId } });
    if (!account) throw new Error("Compte non trouvé");

    const newBalance = data.type === "IN" ? account.balance + data.amount : account.balance - data.amount;

    await db.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance }
    });

    return await db.accountFlow.create({
        data: {
            accountId: data.accountId,
            type: data.type,
            amount: data.amount,
            balanceAfter: newBalance,
            category: data.category,
            reason: data.reason,
            sourceId: data.sourceId,
            organizationId: data.orgId
        }
    });
}

export async function createAccount(data: { name: string, type: string, balance: number, orgId: string }) {
    try {
        await db.account.create({
            data: {
                name: data.name,
                type: data.type,
                balance: data.balance,
                organizationId: data.orgId
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function transferFunds(data: { fromId: string, toId: string, amount: number, reason: string, orgId: string }) {
    try {
        // Use transaction for atomic move
        await db.$transaction(async (tx) => {
            const from = await tx.account.update({
                where: { id: data.fromId },
                data: { balance: { decrement: data.amount } }
            });

            const to = await tx.account.update({
                where: { id: data.toId },
                data: { balance: { increment: data.amount } }
            });

            const flowOut = await tx.accountFlow.create({
                data: {
                    accountId: data.fromId,
                    type: "OUT",
                    amount: data.amount,
                    balanceAfter: from.balance,
                    category: "TRANSFER",
                    reason: `Transfert vers ${to.name}: ${data.reason}`,
                    organizationId: data.orgId
                }
            });

            await tx.accountFlow.create({
                data: {
                    accountId: data.toId,
                    type: "IN",
                    amount: data.amount,
                    balanceAfter: to.balance,
                    category: "TRANSFER",
                    reason: `Transfert depuis ${from.name}: ${data.reason}`,
                    sourceId: flowOut.id,
                    organizationId: data.orgId
                }
            });
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Redundant functions removed

// Cleanup Duplicate Accounts
export async function cleanupDuplicateAccounts(orgId: string) {
    try {
        const allAccounts = await db.account.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'asc' }
        });

        const seenNames = new Map<string, any>();
        let mergeCount = 0;

        for (const account of allAccounts) {
            const normalizedName = account.name.trim().toLowerCase();
            if (seenNames.has(normalizedName)) {
                const hostAccount = seenNames.get(normalizedName);
                const duplicate = account;

                console.log(`Merging duplicate account '${account.name}' (${duplicate.id}) into '${hostAccount.name}' (${hostAccount.id})`);

                // Update Transactions
                await db.transaction.updateMany({
                    where: { accountId: duplicate.id },
                    data: { accountId: hostAccount.id }
                });

                // Update Expenses
                await db.expense.updateMany({
                    where: { accountId: duplicate.id },
                    data: { accountId: hostAccount.id }
                });

                // Update AccountFlows
                await db.accountFlow.updateMany({
                    where: { accountId: duplicate.id },
                    data: { accountId: hostAccount.id }
                });

                // Transfer Balance
                await db.account.update({
                    where: { id: hostAccount.id },
                    data: { balance: { increment: duplicate.balance } }
                });

                // Delete Duplicate
                await db.account.delete({
                    where: { id: duplicate.id }
                });

                mergeCount++;
            } else {
                seenNames.set(normalizedName, account);
            }
        }

        revalidatePath("/");
        return { success: true, message: `Réussi: ${mergeCount} comptes fusionnés.` };
    } catch (error: any) {
        console.error("Cleanup failed:", error);
        return { success: false, error: error.message };
    }
}


export async function adjustSupplierDebt(data: { supplierId: string, amount: number, type: 'INCREMENT' | 'DECREMENT', orgId: string }) {
    try {
        await db.supplier.update({
            where: { id: data.supplierId },
            data: {
                totalDebt: data.type === 'INCREMENT' ? { increment: data.amount } : { decrement: data.amount }
            }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getFinanceDashboard(orgId: string) {
    try {
        const [accounts, clientSummary, supplierSummary, products] = await Promise.all([
            db.account.findMany({ where: { organizationId: orgId } }),
            db.client.aggregate({
                where: { organizationId: orgId },
                _sum: { totalDebt: true }
            }),
            db.supplier.aggregate({
                where: { organizationId: orgId },
                _sum: { totalDebt: true }
            }),
            db.product.findMany({
                where: { organizationId: orgId },
                select: { stock: true, lastCost: true }
            })
        ]);

        const stockValue = products.reduce((acc, p) => acc + (p.stock * p.lastCost), 0);
        const totalLiquidity = accounts.reduce((acc, a) => acc + a.balance, 0);

        return {
            success: true,
            accounts,
            summary: {
                liquidity: totalLiquidity,
                receivables: clientSummary._sum.totalDebt || 0,
                payables: supplierSummary._sum.totalDebt || 0,
                stockValue
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function recordPurchase(data: {
    supplierId?: string,
    newSupplier?: any,
    items: any[], // [{id?, name, cost, price, quantity, barcode?, categoryId?, unit?}]
    paidAmount: number,
    accountId?: string,
    warehouseId: string,
    orgId: string
}) {
    try {
        const result = await db.$transaction(async (tx) => {
            // 1. Resolve Supplier
            let finalSupplierId = data.supplierId;
            if (!finalSupplierId && data.newSupplier) {
                const s = await tx.supplier.create({
                    data: {
                        ...data.newSupplier,
                        organizationId: data.orgId
                    }
                });
                finalSupplierId = s.id;
            }

            let totalPurchaseAmount = 0;
            const processedItems = [];

            // 2. Process Items
            for (const item of data.items) {
                let productId = item.id;

                // On-the-fly product creation
                if (!productId && item.name) {
                    const p = await tx.product.create({
                        data: {
                            name: item.name,
                            barcode: item.barcode || Math.floor(Math.random() * 1000000000).toString(),
                            cost: item.cost,
                            price: item.price || item.cost * 1.2,
                            lastCost: item.cost,
                            avgCost: item.cost,
                            previousCost: item.cost,
                            stock: 0, // Will be updated below
                            unit: item.unit || "pcs",
                            organizationId: data.orgId,
                            categoryId: item.categoryId || null
                        }
                    });
                    productId = p.id;
                }

                if (!productId) continue;

                const lineTotal = item.cost * item.quantity;
                totalPurchaseAmount += lineTotal;

                // Update Product Stock & Cost
                const existingProduct = await tx.product.findUnique({ where: { id: productId } });
                if (existingProduct) {
                    const newStock = existingProduct.stock + item.quantity;
                    // Weighted Average Cost (PMP)
                    const newAvgCost = ((existingProduct.stock * existingProduct.avgCost) + (item.quantity * item.cost)) / (newStock || 1);

                    await tx.product.update({
                        where: { id: productId },
                        data: {
                            stock: { increment: item.quantity },
                            lastCost: item.cost,
                            previousCost: existingProduct.lastCost,
                            avgCost: newAvgCost
                        }
                    });

                    // Update Warehouse Stock
                    await tx.warehouseStock.upsert({
                        where: { productId_warehouseId: { productId, warehouseId: data.warehouseId } },
                        update: { quantity: { increment: item.quantity } },
                        create: { productId, warehouseId: data.warehouseId, quantity: item.quantity }
                    });

                    // Record Movement
                    await tx.stockMovement.create({
                        data: {
                            productId,
                            warehouseId: data.warehouseId,
                            type: "IN",
                            quantity: item.quantity,
                            previousStock: existingProduct.stock,
                            newStock: newStock,
                            supplierId: finalSupplierId,
                            reason: "ACHAT"
                        }
                    });
                }

                processedItems.push({
                    id: productId,
                    name: item.name || existingProduct?.name,
                    quantity: item.quantity,
                    cost: item.cost,
                    total: lineTotal
                });
            }

            // 3. Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    type: "PURCHASE",
                    totalAmount: totalPurchaseAmount,
                    paidAmount: data.paidAmount,
                    paymentMode: data.paidAmount > 0 ? "CASH" : "DEBT",
                    organizationId: data.orgId,
                    items: JSON.stringify(processedItems),
                    clientId: null,
                    warehouseId: data.warehouseId,
                    accountId: data.paidAmount > 0 ? data.accountId : null
                }
            });

            // 4. Handle Payment & Account Flow
            if (data.paidAmount > 0 && data.accountId) {
                const acc = await tx.account.update({
                    where: { id: data.accountId },
                    data: { balance: { decrement: data.paidAmount } }
                });

                await tx.accountFlow.create({
                    data: {
                        accountId: data.accountId,
                        type: "OUT",
                        amount: data.paidAmount,
                        balanceAfter: acc.balance,
                        category: "PURCHASE",
                        reason: `Achat #${transaction.id.slice(-6)}`,
                        sourceId: transaction.id,
                        organizationId: data.orgId
                    }
                });
            }

            // 5. Create Expense record
            await tx.expense.create({
                data: {
                    label: `Achat #${transaction.id.slice(-6)}`,
                    amount: totalPurchaseAmount,
                    category: "PURCHASE",
                    organizationId: data.orgId,
                    accountId: data.paidAmount > 0 ? data.accountId : null,
                    isPaid: data.paidAmount >= totalPurchaseAmount
                }
            });

            // 6. Handle Supplier Debt
            const debt = totalPurchaseAmount - data.paidAmount;
            if (debt > 0 && finalSupplierId) {
                await tx.supplier.update({
                    where: { id: finalSupplierId },
                    data: { totalDebt: { increment: debt } }
                });
            }

            return transaction;
        });

        revalidatePath("/");
        return { success: true, id: result.id };
    } catch (error: any) {
        console.error("Purchase record failed:", error);
        return { success: false, error: error.message };
    }
}

// --- GETTERS (Moved from db-wrapper to Server Actions) ---

export async function getProducts(orgId: string) {
    try {
        const products = await db.product.findMany({
            where: { organizationId: orgId }
        });
        return products;
    } catch (error: any) {
        console.error("Failed to get products:", error);
        return [];
    }
}

export async function getTransactions(orgId: string, limit = 100) {
    try {
        const transactions = await db.transaction.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return transactions;
    } catch (error: any) {
        console.error("Failed to get transactions:", error);
        return [];
    }
}

export async function getClients(orgId: string) {
    try {
        const clients = await db.client.findMany({
            where: { organizationId: orgId }
        });
        return clients;
    } catch (error: any) {
        console.error("Failed to get clients:", error);
        return [];
    }
}

export async function getWarehouses(orgId: string) {
    try {
        const warehouses = await db.warehouse.findMany({
            where: { organizationId: orgId }
        });
        return warehouses;
    } catch (error: any) {
        console.error("Failed to get warehouses:", error);
        return [];
    }
}

export async function getCategories(orgId: string) {
    try {
        const categories = await db.category.findMany({
            where: { organizationId: orgId },
            include: { children: true }
        });
        return categories;
    } catch (error: any) {
        console.error("Failed to get categories:", error);
        return [];
    }
}

export async function getSuppliers(orgId: string) {
    try {
        const suppliers = await db.supplier.findMany({
            where: { organizationId: orgId }
        });
        return suppliers;
    } catch (error: any) {
        console.error("Failed to get suppliers:", error);
        return [];
    }
}

export async function getAccounts(orgId: string) {
    try {
        const accounts = await db.account.findMany({
            where: { organizationId: orgId }
        });
        return accounts;
    } catch (error: any) {
        console.error("Failed to get accounts:", error);
        return [];
    }
}


