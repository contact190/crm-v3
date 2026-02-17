"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/client";
import os from "os";

// Robustly resolve organizationId from various input names
function resolveOrgId(data: any): string {
    return data?.organizationId || data?.orgId || data?.organization?.id || "";
}


// --- Utility Actions ---

export async function getServerIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        if (!iface) continue;
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return "localhost";
}

// --- Employee Actions ---

export async function createEmployee(data: any) {
    try {
        const orgId = resolveOrgId(data);
        if (!orgId) throw new Error("ID Organisation manquant");

        // Enforce employee limit
        const org = await db.organization.findUnique({
            where: { id: orgId },
            select: { employeeLimit: true, _count: { select: { employees: true } } }
        });

        if (org && org._count.employees >= org.employeeLimit) {
            return {
                success: false,
                error: `Limite d'employés atteinte (${org.employeeLimit}). Veuillez augmenter votre forfait.`
            };
        }

        const employee = await db.$transaction(async (tx) => {
            const newEmp = await tx.employee.create({
                data: {
                    ...data,
                    organizationId: resolveOrgId(data),
                    orgId: undefined, // cleanup
                    baseSalary: Number(data.baseSalary),
                    commissionPct: Number(data.commissionPct || 0),
                    monthlyGoal: Number(data.monthlyGoal || 0),
                }
            });

            // If linked to a user, sync PIN
            if (newEmp.userId && newEmp.pinCode) {
                await tx.user.update({
                    where: { id: newEmp.userId },
                    data: { pinCode: newEmp.pinCode }
                });
            }

            return newEmp;
        });

        revalidatePath("/hrm");
        return { success: true, data: employee };
    } catch (error: any) {
        console.error("Create Employee Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateEmployee(id: string, data: any) {
    try {
        const employee = await db.$transaction(async (tx) => {
            const updatedEmp = await tx.employee.update({
                where: { id },
                data: {
                    ...data,
                    baseSalary: data.baseSalary ? Number(data.baseSalary) : undefined,
                    commissionPct: data.commissionPct ? Number(data.commissionPct) : undefined,
                    monthlyGoal: data.monthlyGoal ? Number(data.monthlyGoal) : undefined,
                }
            });

            // If linked to a user, sync PIN
            if (updatedEmp.userId && updatedEmp.pinCode) {
                await tx.user.update({
                    where: { id: updatedEmp.userId },
                    data: { pinCode: updatedEmp.pinCode }
                });
            }

            return updatedEmp;
        });

        revalidatePath("/hrm");
        return { success: true, data: employee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getEmployees(orgId: string) {
    try {
        const employees = await db.employee.findMany({
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
        });

        // Enrich with status
        const enriched = employees.map(emp => ({
            ...emp,
            isPresent: emp.attendances.length > 0 && !emp.attendances[0].clockOut
        }));

        return { success: true, data: enriched };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generatePin(id: string) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    try {
        await db.$transaction(async (tx) => {
            const employee = await tx.employee.update({
                where: { id },
                data: { pinCode: pin }
            });

            if (employee.userId) {
                await tx.user.update({
                    where: { id: employee.userId },
                    data: { pinCode: pin }
                });
            }
        });

        revalidatePath("/hrm");
        return { success: true, pin };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Attendance Actions ---

export async function clockIn(pin: string, orgId: string, ip: string) {
    try {
        const employee = await db.employee.findFirst({
            where: { pinCode: pin, organizationId: orgId }
        });

        if (!employee) return { success: false, error: "Code PIN invalide" };

        // Check if already clocked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await db.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: { gte: today }
            }
        });

        if (existing && !existing.clockOut) {
            return { success: false, error: "Déjà pointé présent" };
        }

        await db.attendance.create({
            data: {
                employeeId: employee.id,
                organizationId: resolveOrgId({ ...employee, orgId }),
                ipAddress: ip,
                date: today, // Normalize to start of day
                clockIn: new Date(),
                status: "PRESENT"
            }
        });

        revalidatePath("/hrm");
        revalidatePath("/");

        return { success: true, employeeName: employee.name };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function clockOut(pin: string, orgId: string) {
    try {
        const employee = await db.employee.findFirst({
            where: { pinCode: pin, organizationId: orgId }
        });

        if (!employee) return { success: false, error: "Code PIN invalide" };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessions = await db.attendance.findMany({
            where: {
                employeeId: employee.id,
                date: { gte: today },
                clockOut: null
            }
        });

        if (sessions.length === 0) return { success: false, error: "Pas de session active trouvée" };

        // Close all open sessions (should be one usually)
        for (const session of sessions) {
            await db.attendance.update({
                where: { id: session.id },
                data: { clockOut: new Date() }
            });
        }

        revalidatePath("/hrm");
        revalidatePath("/");

        return { success: true, employeeName: employee.name };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAttendanceHistory(employeeId: string, month: string) {
    try {
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        const records = await db.attendance.findMany({
            where: {
                employeeId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        });

        return { success: true, data: records };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function setAttendanceManual(data: { employeeId: string, organizationId: string, date: string, status: string }) {
    try {
        const targetDate = new Date(data.date);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Check if record exists for this day (ignoring clockIn/Out for manual status)
        const existing = await db.attendance.findFirst({
            where: {
                employeeId: data.employeeId,
                date: {
                    gte: targetDate,
                    lt: nextDay
                }
            }
        });

        if (existing) {
            await db.attendance.update({
                where: { id: existing.id },
                data: { status: data.status }
            });
        } else {
            await db.attendance.create({
                data: {
                    employeeId: data.employeeId,
                    organizationId: resolveOrgId(data),
                    date: targetDate,
                    clockIn: targetDate, // Placeholder for manual entry
                    status: data.status
                }
            });
        }
        revalidatePath("/hrm");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Finance / Advances ---

export async function requestAdvance(data: any) {
    try {
        // Create the advance request
        const advance = await db.salaryAdvance.create({
            data: {
                employeeId: data.employeeId,
                organizationId: resolveOrgId(data),
                amount: Number(data.amount),
                requestDate: new Date(),
                reason: data.reason,
                status: "APPROVED"
            }
        });

        // Also create a cash outflow (Expense)
        if (advance.status === "APPROVED") {
            await db.expense.create({
                data: {
                    label: `Avance Salaire: ${data.employeeName}`,
                    amount: Number(data.amount),
                    category: "SALARY_ADVANCE",
                    organizationId: resolveOrgId(data)
                }
            });
        }

        revalidatePath("/hrm");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getHROverview(orgId: string) {
    try {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        const employees = await db.employee.findMany({ where: { organizationId: orgId, isActive: true } });

        const totalBaseSalary = employees.reduce((acc, e) => acc + e.baseSalary, 0);

        const advances = await db.salaryAdvance.findMany({
            where: {
                organizationId: orgId,
                requestDate: { gte: firstDay }
            }
        });

        const totalAdvances = advances.reduce((acc, a) => acc + (a.status !== 'REJECTED' ? a.amount : 0), 0);

        return {
            success: true,
            data: {
                employeeCount: employees.length,
                totalBaseSalary,
                totalAdvances
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Payroll Actions ---

export async function generatePayroll(employeeId: string, month: string) {
    try {
        const employee = await db.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return { success: false, error: "Employé introuvable" };

        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        // 1. Base Salary
        const baseSalary = employee.baseSalary;

        // 2. Attendance Deductions (BaseSalary / 26 working days * absent days)
        // Let's assume 26 working days for simplicity
        const attendances = await db.attendance.findMany({
            where: {
                employeeId,
                date: { gte: startDate, lte: endDate }
            }
        });
        const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
        const dailyRate = baseSalary / 26;
        const attendanceDed = absentDays * dailyRate;

        // 3. Advances
        const advances = await db.salaryAdvance.findMany({
            where: {
                employeeId,
                requestDate: { gte: startDate, lte: endDate },
                status: 'APPROVED',
                isDeducted: false
            }
        });
        const advancesDed = advances.reduce((acc, a) => acc + a.amount, 0);

        // 4. Commissions (Optional: based on transactions if linked)
        // For now, we return 0 as we haven't linked transactions to employees yet in the schema explicitly
        // (but we could check transactions where the user linked to this employee is the creator)
        const commissions = 0;

        const netPayable = baseSalary - attendanceDed - advancesDed + commissions;

        return {
            success: true,
            data: {
                employeeId,
                employeeName: employee.name,
                month,
                baseSalary,
                attendanceDed,
                advancesDed,
                commissions,
                netPayable,
                absentDays,
                advanceCount: advances.length
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function savePayroll(data: any) {
    try {
        const payroll = await db.payroll.create({
            data: {
                employeeId: data.employeeId,
                month: data.month,
                baseSalary: data.baseSalary,
                attendanceDed: data.attendanceDed,
                advancesDed: data.advancesDed,
                commissions: data.commissions,
                netPayable: data.netPayable,
                organizationId: resolveOrgId(data),
                status: "ISSUED"
            }
        });

        // Mark advances as deducted
        const [year, monthNum] = data.month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        await db.salaryAdvance.updateMany({
            where: {
                employeeId: data.employeeId,
                requestDate: { gte: startDate, lte: endDate },
                status: 'APPROVED'
            },
            data: { isDeducted: true, status: 'DEDUCTED' }
        });

        revalidatePath("/hrm");
        return { success: true, data: payroll };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
