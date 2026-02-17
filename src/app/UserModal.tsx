"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Shield, Key, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserModalProps {
    show: boolean;
    user?: any;
    roles: any[];
    employees: any[];
    organizationId: string;
    onClose: () => void;
    onSave: (data: any) => void;
    userLimit?: number;
    currentUsersCount?: number;
}

export default function UserModal({
    show,
    user,
    roles,
    employees,
    organizationId,
    onClose,
    onSave,
    userLimit = 1000,
    currentUsersCount = 0
}: UserModalProps) {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        pinCode: '',
        roleId: '',
        employeeId: ''
    });

    useEffect(() => {
        if (user) {
            const linkedEmployee = employees.find(e => e.userId === user.id);
            setFormData({
                email: user.email || '',
                name: user.name || '',
                password: '',
                pinCode: user.pinCode || '',
                roleId: user.roleId || '',
                employeeId: linkedEmployee?.id || ''
            });
        } else {
            setFormData({
                email: '',
                name: '',
                password: '',
                pinCode: '',
                roleId: '',
                employeeId: ''
            });
        }
    }, [user, employees]);

    const isLimitReached = !user && currentUsersCount >= userLimit;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLimitReached) {
            alert(`Limite d'utilisateurs atteinte (${userLimit}). Veuillez augmenter votre forfait.`);
            return;
        }
        onSave({
            ...formData,
            organizationId,
            userId: user?.id
        });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay no-print" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="premium-card"
                style={{
                    width: '100%',
                    maxWidth: '550px',
                    padding: 0,
                    overflow: 'hidden',
                    background: 'white',
                    border: 'none',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--bg-deep)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '10px', display: 'flex', color: 'var(--primary)' }}>
                            <User size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                            {user ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
                        </h3>
                    </div>
                    <button title="Fermer" onClick={onClose} style={{ background: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Limit Warning */}
                    {isLimitReached && (
                        <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <X size={16} />
                            <span><strong>Limite atteinte :</strong> Vous avez atteint votre quota de {userLimit} utilisateurs.</span>
                        </div>
                    )}

                    {/* Admin Transfer Warning */}
                    {roles.find(r => r.id === formData.roleId)?.permissions.some((p: any) => p.permission.slug === 'super_admin') && user?.roleId !== formData.roleId && (
                        <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', color: '#92400e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={16} />
                            <span><strong>Attention :</strong> En devenant Administrateur, cet utilisateur recevra le "Sceptre" et vous perdrez vos droits d'administration.</span>
                        </div>
                    )}

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                            <User size={14} /> Nom complet
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="ex: Ahmed Ben"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                                <Shield size={14} /> Rôle Système
                            </label>
                            <select
                                title="Sélectionner un rôle"
                                required
                                value={formData.roleId}
                                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                style={{ width: '100%' }}
                            >
                                <option value="">Sélectionner un rôle</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                                <Key size={14} /> Code PIN (4 chiffres)
                            </label>
                            <input
                                type="text"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                value={formData.pinCode}
                                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                style={{ width: '100%' }}
                                placeholder="ex: 1234"
                            />
                        </div>
                    </div>

                    <details style={{ cursor: 'pointer' }}>
                        <summary style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 600, padding: '4px 0' }}>📂 Paramètres de connexion (Avancé)</summary>
                        <div style={{ padding: '1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                                    <Mail size={14} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%' }}
                                    placeholder="Optionnel (Shared Identity)"
                                />
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                                    <Shield size={14} /> Mot de Passe
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%' }}
                                    placeholder="Optionnel"
                                />
                            </div>
                        </div>
                    </details>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                            <Briefcase size={14} /> Fiche Employé (RH)
                        </label>
                        <select
                            title="Lier à un employé"
                            value={formData.employeeId}
                            onChange={(e) => {
                                const empId = e.target.value;
                                const selectedEmp = employees.find(emp => emp.id === empId);
                                setFormData(prev => ({
                                    ...prev,
                                    employeeId: empId,
                                    // Auto-sync PIN if employee has one and user hasn't typed one yet or is creating new
                                    pinCode: selectedEmp?.pinCode || prev.pinCode
                                }));
                            }}
                            style={{ width: '100%' }}
                        >
                            <option value="">Aucun lien RH</option>
                            {employees.filter(e => !e.userId || e.userId === user?.id).map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="glass"
                            style={{ flex: 1, padding: '12px', background: 'var(--bg-deep)', border: 'none', color: 'var(--foreground-muted)' }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 2, padding: '12px', gap: '8px' }}
                        >
                            <Save size={18} />
                            Enregistrer l'Utilisateur
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
