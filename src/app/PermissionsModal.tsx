"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";

interface PermissionsModalProps {
    show: boolean;
    role?: any;
    allPermissions: any[];
    onClose: () => void;
    onSave: (roleId: string, permissionIds: string[]) => void;
}

export default function PermissionsModal({
    show,
    role,
    allPermissions,
    onClose,
    onSave
}: PermissionsModalProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (role) {
            const currentPerms = role.permissions?.map((rp: any) => rp.permission.id) || [];
            setSelectedPermissions(currentPerms);
        } else {
            setSelectedPermissions([]);
        }
    }, [role]);

    const togglePermission = (permId: string) => {
        if (selectedPermissions.includes(permId)) {
            setSelectedPermissions(selectedPermissions.filter(id => id !== permId));
        } else {
            setSelectedPermissions([...selectedPermissions, permId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role) {
            onSave(role.id, selectedPermissions);
        }
    };

    if (!show || !role) return null;

    return (
        <div className="modal-overlay no-print" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="premium-card"
                style={{
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    padding: 0,
                    overflow: 'hidden',
                    background: 'white',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--bg-deep)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '10px', display: 'flex', color: 'var(--primary)' }}>
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                                Gérer les Privilèges
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Rôle: {role.name}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {allPermissions.map(perm => {
                                const isSelected = selectedPermissions.includes(perm.id);
                                return (
                                    <label
                                        key={perm.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '12px',
                                            padding: '1rem',
                                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--bg-deep)'}`,
                                            borderRadius: '14px',
                                            background: isSelected ? 'var(--primary-fade)' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '6px',
                                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                            background: isSelected ? 'var(--primary)' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: '2px'
                                        }}>
                                            {isSelected && <Check size={14} color="white" strokeWidth={4} />}
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => togglePermission(perm.id)}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--primary-dark)' : 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {perm.slug.replace(/_/g, ' ')}
                                            </div>
                                            {perm.description && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                                                    {perm.description}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {allPermissions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--foreground-muted)', opacity: 0.5 }}>
                                <Shield size={48} style={{ marginBottom: '1rem' }} />
                                <p>Aucune permission disponible dans le système</p>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--bg-deep)', background: 'var(--bg-deep)', display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="glass"
                            style={{ flex: 1, padding: '12px', background: 'white', border: 'none', color: 'var(--foreground-muted)' }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 2, padding: '12px', gap: '8px' }}
                        >
                            <Save size={18} />
                            Enregistrer ({selectedPermissions.length} privilèges)
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
