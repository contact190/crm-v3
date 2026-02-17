"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ==================== ROLES ====================

export async function getRoles(organizationId: string) {
    try {
        const roles = await db.role.findMany({
            where: { organizationId },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                },
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: roles };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createRole(data: {
    name: string;
    description?: string;
    organizationId: string;
    permissionIds?: string[];
}) {
    try {
        const role = await db.role.create({
            data: {
                name: data.name,
                description: data.description,
                organizationId: data.organizationId,
                permissions: data.permissionIds ? {
                    create: data.permissionIds.map(permissionId => ({
                        permissionId
                    }))
                } : undefined
            },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        revalidatePath("/");
        return { success: true, data: role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRole(roleId: string, data: {
    name?: string;
    description?: string;
}) {
    try {
        const role = await db.role.update({
            where: { id: roleId },
            data: {
                name: data.name,
                description: data.description
            }
        });
        revalidatePath("/");
        return { success: true, data: role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRole(roleId: string) {
    try {
        // Check if role has users
        const usersCount = await db.user.count({
            where: { roleId }
        });

        if (usersCount > 0) {
            return { success: false, error: `Ce rôle est assigné à ${usersCount} utilisateur(s). Veuillez d'abord réassigner ces utilisateurs.` };
        }

        await db.role.delete({
            where: { id: roleId }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==================== PERMISSIONS ====================

export async function getPermissions() {
    try {
        const permissions = await db.permission.findMany({
            orderBy: { slug: 'asc' }
        });
        return { success: true, data: permissions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    try {
        // Delete existing permissions
        await db.rolePermission.deleteMany({
            where: { roleId }
        });

        // Create new permissions
        await db.rolePermission.createMany({
            data: permissionIds.map(permissionId => ({
                roleId,
                permissionId
            }))
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==================== USERS ====================

export async function getUsers(organizationId: string) {
    try {
        const users = await db.user.findMany({
            where: { organizationId },
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
            },
            orderBy: { name: 'asc' }
        });

        // Remove password from response
        const sanitizedUsers = users.map(({ password, ...user }) => user);

        return { success: true, data: sanitizedUsers };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createUser(data: {
    email?: string;
    name: string;
    password?: string;
    pinCode?: string;
    roleId?: string;
    organizationId: string;
    employeeId?: string;
}) {
    try {
        const userId = Math.random().toString(36).substring(2, 9);
        const finalEmail = data.email || `${userId}@shared.sina`;
        // Shared password if not provided
        const finalPassword = data.password || "SinaShared2024!";

        // Enforce user limit
        const org = await db.organization.findUnique({
            where: { id: data.organizationId },
            select: { userLimit: true, _count: { select: { users: true } } }
        });

        if (org && org._count.users >= org.userLimit) {
            return {
                success: false,
                error: `Limite d'utilisateurs atteinte (${org.userLimit}). Veuillez augmenter votre forfait.`
            };
        }

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email: finalEmail.toLowerCase() }
        });


        if (existingUser) {
            return { success: false, error: "Cet email est déjà utilisé" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(finalPassword, 10);


        const user = await db.$transaction(async (tx) => {
            let roleId = data.roleId;

            // If no role provided, check if this is the FIRST user in the organization
            if (!roleId) {
                const userCount = await tx.user.count({
                    where: { organizationId: data.organizationId }
                });

                if (userCount === 0) {
                    // Find a role with super_admin permission
                    const adminRole = await tx.role.findFirst({
                        where: {
                            organizationId: data.organizationId,
                            permissions: { some: { permission: { slug: 'super_admin' } } }
                        }
                    });
                    if (adminRole) {
                        roleId = adminRole.id;
                    }
                }
            }

            const newUser = await tx.user.create({
                data: {
                    email: finalEmail.toLowerCase(),
                    name: data.name,
                    password: hashedPassword,
                    pinCode: data.pinCode,
                    roleId: roleId,
                    organizationId: data.organizationId
                }
            });

            // If an employee is linked, update their userId and pinCode
            if (data.employeeId) {
                await tx.employee.update({
                    where: { id: data.employeeId },
                    data: {
                        userId: newUser.id,
                        pinCode: data.pinCode
                    }
                });
            }

            return tx.user.findUnique({
                where: { id: newUser.id },
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
        });

        if (!user) throw new Error("Erreur lors de la création de l'utilisateur");

        // Remove password from response
        const { password, ...sanitizedUser } = user;

        revalidatePath("/");
        return { success: true, data: sanitizedUser };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUser(userId: string, data: {
    email?: string;
    name?: string;
    password?: string;
    pinCode?: string;
    roleId?: string;
    employeeId?: string;
}) {
    try {
        const updateData: any = {
            email: data.email,
            name: data.name,
            pinCode: data.pinCode,
            roleId: data.roleId
        };

        // Only hash password if provided
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        const user = await db.$transaction(async (tx) => {
            // Check if we are promoting this user to Super Admin
            const newRole = data.roleId ? await tx.role.findUnique({
                where: { id: data.roleId },
                include: { permissions: { include: { permission: true } } }
            }) : null;

            const isBecomingAdmin = newRole?.permissions.some(p => p.permission.slug === 'super_admin');

            if (isBecomingAdmin) {
                // Find current admin(s) in the same organization
                const currentUser = await tx.user.findUnique({ where: { id: userId } });
                const currentAdmins = await tx.user.findMany({
                    where: {
                        organizationId: currentUser?.organizationId,
                        role: { permissions: { some: { permission: { slug: 'super_admin' } } } },
                        id: { not: userId }
                    }
                });

                // Get a "Base Role" to demote them to (e.g., the first non-admin role)
                const baseRole = await tx.role.findFirst({
                    where: {
                        organizationId: currentUser?.organizationId,
                        NOT: { permissions: { some: { permission: { slug: 'super_admin' } } } }
                    }
                });

                if (currentAdmins.length > 0 && baseRole) {
                    await tx.user.updateMany({
                        where: { id: { in: currentAdmins.map(u => u.id) } },
                        data: { roleId: baseRole.id }
                    });
                }
            }

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: updateData
            });


            // Update employee linkage
            if (data.employeeId) {
                // Remove linkage from other employees first (enforce unique check if necessary or just cleanup)
                await tx.employee.updateMany({
                    where: { userId: userId, id: { not: data.employeeId } },
                    data: { userId: null }
                });

                // Link new employee and sync PIN
                await tx.employee.update({
                    where: { id: data.employeeId },
                    data: {
                        userId: userId,
                        pinCode: data.pinCode
                    }
                });
            } else {
                // If employeeId is empty/null, remove any existing linkage
                await tx.employee.updateMany({
                    where: { userId: userId },
                    data: { userId: null }
                });
            }

            return tx.user.findUnique({
                where: { id: userId },
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
        });

        if (!user) throw new Error("Utilisateur introuvable après mise à jour");

        // Remove password from response
        const { password, ...sanitizedUser } = user;

        revalidatePath("/");
        return { success: true, data: sanitizedUser };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId: string) {
    try {
        await db.user.delete({
            where: { id: userId }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
