"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface RoleModalProps {
    show: boolean;
    role?: any;
    organizationId: string;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function RoleModal({
    show,
    role,
    organizationId,
    onClose,
    onSave
}: RoleModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name || '',
                description: role.description || ''
            });
        } else {
            setFormData({
                name: '',
                description: ''
            });
        }
    }, [role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            organizationId,
            roleId: role?.id
        });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay no-print" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="premium-card"
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    padding: 0,
                    overflow: 'hidden',
                    background: 'white',
                    border: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--bg-deep)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'white', borderRadius: '10px', display: 'flex', color: 'var(--primary)' }}>
                            <Shield size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                            {role ? 'Modifier le Rôle' : 'Nouveau Rôle'}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                            <Shield size={14} /> Nom du Rôle
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="ex: Vendeur, Manager, Admin"
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground-muted)' }}>
                            <FileText size={14} /> Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description du rôle et de ses responsabilités..."
                            rows={3}
                            style={{ width: '100%', resize: 'none' }}
                        />
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
                            style={{ flex: 1, padding: '12px', gap: '8px' }}
                        >
                            <Save size={18} />
                            Enregistrer le Rôle
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
