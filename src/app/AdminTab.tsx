"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCog, Shield, Key, Edit, Trash2, Plus, Save, Users, Lock } from "lucide-react";

interface AdminTabProps {
    adminSubTab: 'users' | 'roles';
    setAdminSubTab: (tab: 'users' | 'roles') => void;
    allSystemUsers: any[];
    allRoles: any[];
    allPermissions: any[];
    employees: any[];
    setShowUserModal: (val: { show: boolean, user?: any }) => void;
    setShowRoleModal: (val: { show: boolean, role?: any }) => void;
    setShowPermissionsModal: (val: { show: boolean, role?: any }) => void;
    onDeleteUser: (userId: string) => void;
    onDeleteRole: (roleId: string) => void;
}

export default function AdminTab({
    adminSubTab,
    setAdminSubTab,
    allSystemUsers,
    allRoles,
    allPermissions,
    employees,
    setShowUserModal,
    setShowRoleModal,
    setShowPermissionsModal,
    onDeleteUser,
    onDeleteRole
}: AdminTabProps) {
    console.log("🛠️ AdminTab Rendering", { adminSubTab, allSystemUsers: allSystemUsers?.length, allRoles: allRoles?.length });

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header Section */}
            <div className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'white', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground-heading)', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
                        <div style={{ padding: '10px', background: 'var(--primary-fade)', borderRadius: '12px', display: 'flex' }}>
                            <Shield size={28} style={{ color: 'var(--primary)' }} />
                        </div>
                        Gestion Sécurité & Accès
                    </h2>
                    <p className="text-muted" style={{ margin: '0.5rem 0 0 3.5rem', fontSize: '0.9rem' }}>
                        Contrôle des privilèges, rôles et accès utilisateurs
                    </p>
                </div>

                <div className="glass" style={{ display: 'flex', padding: '4px', background: 'var(--bg-deep)', borderRadius: '14px' }}>
                    <button
                        onClick={() => setAdminSubTab('users')}
                        className="nav-link"
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            background: adminSubTab === 'users' ? 'white' : 'transparent',
                            color: adminSubTab === 'users' ? 'var(--primary)' : 'var(--foreground-muted)',
                            boxShadow: adminSubTab === 'users' ? 'var(--shadow-sm)' : 'none',
                            border: 'none',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <UserCog size={18} /> Utilisateurs
                    </button>
                    <button
                        onClick={() => setAdminSubTab('roles')}
                        className="nav-link"
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            background: adminSubTab === 'roles' ? 'white' : 'transparent',
                            color: adminSubTab === 'roles' ? 'var(--primary)' : 'var(--foreground-muted)',
                            boxShadow: adminSubTab === 'roles' ? 'var(--shadow-sm)' : 'none',
                            border: 'none',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Lock size={18} /> Rôles
                    </button>
                </div>
            </div>

            {/* Users Tab Content */}
            {adminSubTab === 'users' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="font-bold" style={{ fontSize: '1.4rem' }}>Utilisateurs du Système</h3>
                        <button
                            onClick={() => setShowUserModal({ show: true })}
                            className="btn-primary"
                            style={{ padding: '12px 20px', gap: '8px' }}
                        >
                            <Plus size={20} /> Ajouter Utilisateur
                        </button>
                    </div>

                    <div className="premium-card" style={{ padding: 0, overflow: 'hidden', background: 'white' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-deep)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Identité</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Rôle</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Employé Lié</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>PIN</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allSystemUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
                                                <Users size={48} />
                                                <p>Aucun utilisateur trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    allSystemUsers.map((user) => {
                                        const linkedEmployee = employees.find(e => e.userId === user.id);
                                        return (
                                            <tr key={user.id} className="hover-row" style={{ borderBottom: '1px solid var(--bg-deep)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '40px', height: '40px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: 'white', fontWeight: 800, fontSize: '1rem'
                                                        }}>
                                                            {user.name?.[0] || user.email?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700 }}>{user.name || 'Sans nom'}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                                        {user.role?.name || 'Aucun'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {linkedEmployee ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} />
                                                            {linkedEmployee.name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Non lié</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: user.pinCode ? 'var(--primary)' : 'var(--foreground-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                        <Key size={14} />
                                                        {user.pinCode ? 'Défini' : 'Vierge'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            onClick={() => setShowUserModal({ show: true, user })}
                                                            style={{ padding: '8px', background: 'var(--bg-deep)', borderRadius: '8px', color: 'var(--primary)' }}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteUser(user.id)}
                                                            style={{ padding: '8px', background: 'var(--danger-bg)', borderRadius: '8px', color: 'var(--danger)' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Roles Tab Content */}
            {adminSubTab === 'roles' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="font-bold" style={{ fontSize: '1.4rem' }}>Rôles & Permissions</h3>
                        <button
                            onClick={() => setShowRoleModal({ show: true })}
                            className="btn-primary"
                            style={{ padding: '12px 20px', gap: '8px' }}
                        >
                            <Plus size={20} /> Nouveau Rôle
                        </button>
                    </div>

                    <div className="premium-card" style={{ padding: 0, overflow: 'hidden', background: 'white' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-deep)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Rôle</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Description</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Permissions</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                                            <p>Aucun rôle configuré</p>
                                        </td>
                                    </tr>
                                ) : (
                                    allRoles.map((role) => (
                                        <tr key={role.id} className="hover-row" style={{ borderBottom: '1px solid var(--bg-deep)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 700 }}>{role.name}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{role.description || '-'}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {role.permissions?.length > 0 ? (
                                                        role.permissions.map((rp: any) => (
                                                            <span key={rp.permission.id} style={{
                                                                fontSize: '10px',
                                                                padding: '2px 6px',
                                                                background: 'var(--bg-deep)',
                                                                borderRadius: '4px',
                                                                fontWeight: 600,
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {rp.permission.slug}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontStyle: 'italic' }}>Aucune</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button
                                                        onClick={() => setShowPermissionsModal({ show: true, role })}
                                                        style={{ padding: '8px', background: 'var(--primary-fade)', borderRadius: '8px', color: 'var(--primary)' }}
                                                    >
                                                        <Shield size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRoleModal({ show: true, role })}
                                                        style={{ padding: '8px', background: 'var(--bg-deep)', borderRadius: '8px', color: 'var(--foreground-muted)' }}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteRole(role.id)}
                                                        style={{ padding: '8px', background: 'var(--danger-bg)', borderRadius: '8px', color: 'var(--danger)' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <style jsx>{`
                .hover-row:hover {
                    background-color: var(--bg-deep) !important;
                }
            `}</style>
        </div>
    );
}
