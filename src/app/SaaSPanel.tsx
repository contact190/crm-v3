"use client";

import React, { useState, useEffect } from "react";
import {
    Store, Building, CreditCard, Activity,
    ArrowUpRight, AlertCircle, Plus, Edit,
    Globe, Shield, Trash2, Users, Package,
    TrendingUp, BarChart3, Receipt, Eye, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getPlatformStats,
    getAllOrganizations,
    getSubscriptionPlans,
    updateOrganizationSaaS,
    createSubscriptionPlan,
    impersonateOrganization,
    getInvoices,
    provisionOrganization,
    getAdvancedAnalytics,
    getOrgAdminCredentials
} from "./actions-saas";

export default function SaaSPanel({ stats, showMessage }: { stats: any, showMessage: any }) {
    // Strictly restrict access to the system owner
    const userEmail = stats.user?.email || stats.currentUser?.email;
    if (userEmail !== 'admin@ideal.dz') {
        return (
            <div className="premium-card p-12 text-center" style={{ background: 'white', border: '1px solid var(--border)' }}>
                <Shield size={48} className="mx-auto mb-4 text-danger opacity-50" />
                <h3 className="text-xl font-bold text-danger">Accès Restreint</h3>
                <p className="text-muted mt-2">Cette section est exclusivement réservée à l'administrateur de la plateforme.</p>
            </div>
        );
    }

    const [platformStats, setPlatformStats] = useState<any>(null);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'plans' | 'analytics' | 'billing'>('tenants');
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [advancedStats, setAdvancedStats] = useState<any>(null);
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [adminCredentials, setAdminCredentials] = useState<any>(null); // State for viewing credentials

    useEffect(() => {
        loadData();
    }, []);

    // ... loadData ...

    const handleViewCredentials = async (orgId: string) => {
        const res = await getOrgAdminCredentials(orgId);
        if (res.success && res.data) {
            setAdminCredentials(res.data);
            showMessage("Succès", "Identifiants récupérés", "success");
        } else {
            showMessage("Erreur", res.error || "Erreur récupération accès", "error");
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, orgsRes, plansRes] = await Promise.all([
                getPlatformStats(),
                getAllOrganizations(),
                getSubscriptionPlans()
            ]);

            if (statsRes.success && statsRes.data) setPlatformStats(statsRes.data);
            else showMessage("Erreur", statsRes.error || "Erreur stats", "error");

            if (orgsRes.success && orgsRes.data) setOrganizations(orgsRes.data);
            else showMessage("Erreur", orgsRes.error || "Erreur orgs", "error");

            if (plansRes.success && plansRes.data) setPlans(plansRes.data);
            else showMessage("Erreur", plansRes.error || "Erreur plans", "error");

            const invRes = await getInvoices();
            if (invRes.success && invRes.data) setInvoices(invRes.data);

            const advRes = await getAdvancedAnalytics();
            if (advRes.success && advRes.data) setAdvancedStats(advRes.data);
        } catch (err) {
            console.error("Error loading SaaS data:", err);
            showMessage("Erreur", "Une erreur critique est survenue lors du chargement", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            ownerName: fd.get("ownerName"),
            planId: fd.get("planId"),
            licenseType: fd.get("licenseType"),
            licenseEnd: fd.get("licenseEnd"),
            userLimit: parseInt(fd.get("userLimit") as string),
            productLimit: parseInt(fd.get("productLimit") as string),
            employeeLimit: parseInt(fd.get("employeeLimit") as string),
            killSwitch: fd.get("killSwitch") === "on"
        };
        const res = await updateOrganizationSaaS(selectedOrg.id, data);
        if (res.success) {
            showMessage("Succès", "Organisation mise à jour", "success");
            setShowOrgModal(false);
            loadData();
        } else {
            showMessage("Erreur", res.error, "error");
        }
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            name: fd.get("name"),
            price: fd.get("price"),
            productLimit: fd.get("productLimit"),
            employeeLimit: fd.get("employeeLimit"),
            description: fd.get("description")
        };
        const res = await createSubscriptionPlan(data);
        if (res.success) {
            showMessage("Succès", "Plan créé avec succès", "success");
            setShowPlanModal(false);
            loadData();
        } else {
            showMessage("Erreur", res.error, "error");
        }
    };

    const handleImpersonate = async (orgId: string) => {
        if (!confirm("Voulez-vous vraiment vous connecter en tant qu'administrateur de cette boutique ?")) return;
        const res = await impersonateOrganization(orgId);
        if (res.success && res.data) {
            showMessage("Impersonnalisation", `Connexion en cours : ${res.data.orgName}`, "success");
            localStorage.setItem("impersonate_org", res.data.orgId);
            window.location.reload();
        } else {
            showMessage("Erreur", res.error || "Erreur impersonnation", "error");
        }
    };

    const handleProvisionOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            name: fd.get("name") as string,
            planId: fd.get("planId") as string,
            ownerName: fd.get("ownerName") as string,
            ownerEmail: fd.get("ownerEmail") as string,
            tempPassword: (fd.get("tempPassword") as string) || "welcome123",
            username: fd.get("username") as string,
            phone: fd.get("phone") as string,
            city: fd.get("city") as string,
            pinCode: fd.get("pinCode") as string
        };

        try {
            const res = await provisionOrganization(data);
            if (res.success) {
                showMessage("Succès", `Boutique ${data.name} provisionnée avec succès !`, "success");
                setShowProvisionModal(false);
                loadData();
            } else {
                showMessage("Erreur", res.error || "Erreur lors du provisioning", "error");
            }
        } catch (error) {
            console.error("Provisioning error:", error);
            showMessage("Erreur", "Une erreur inattendue est survenue", "error");
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement des données SaaS...</div>;

    return (
        <div className="space-y-6">
            {/* SaaS Metrics - Refactored Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                {[
                    { label: 'Locataires', val: platformStats?.totalOrgs || 0, icon: Building, color: 'var(--primary)', bg: 'var(--primary-fade)' },
                    { label: 'Utilisateurs', val: platformStats?.totalUsers || 0, icon: Users, color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)' },
                    { label: 'Transactions', val: platformStats?.totalTransactions || 0, icon: TrendingUp, color: 'var(--accent)', bg: 'rgba(139, 92, 246, 0.1)' },
                    { label: 'Fin de Licence', val: platformStats?.expiringCount || 0, icon: AlertCircle, color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="premium-card"
                        style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.5rem', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <div style={{ padding: '12px', borderRadius: '15px', background: item.bg, color: item.color }}>
                            <item.icon size={28} />
                        </div>
                        <div>
                            <p className="text-muted" style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>{item.label}</p>
                            <h4 style={{ margin: '2px 0 0', fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>{item.val.toLocaleString()}</h4>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Sub Tabs - Refactored Styling with more spacing */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0', marginTop: '2.5rem', paddingLeft: '0.5rem' }}>
                {[
                    { id: 'tenants', label: 'Boutique Directory', icon: Store },
                    { id: 'plans', label: 'Plans & Pricing', icon: Package },
                    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
                    { id: 'billing', label: 'Billing Central', icon: Receipt },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id as any)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 24px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderBottom: activeSubTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeSubTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                            background: activeSubTab === tab.id ? 'var(--primary-fade)' : 'transparent',
                            borderRadius: '12px 12px 0 0',
                            borderLeft: '1px solid transparent',
                            borderRight: '1px solid transparent',
                            borderTop: '1px solid transparent',
                        }}
                        className={activeSubTab === tab.id ? 'tab-active' : 'tab-inactive'}
                    >
                        <tab.icon size={18} style={{ opacity: activeSubTab === tab.id ? 1 : 0.6 }} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeSubTab === 'tenants' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', marginBottom: '0.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>Boutique Directory</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>Manage tenant lifecycles, licenses, and resource utilization</p>
                        </div>
                        <button
                            onClick={() => setShowProvisionModal(true)}
                            className="btn-primary"
                            style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 900, boxShadow: '0 10px 25px rgba(var(--primary-rgb), 0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}
                        >
                            <Plus size={18} /> Provision New Shop
                        </button>
                    </div>
                    <div className="premium-card" style={{ padding: 0, overflow: 'hidden', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', borderRadius: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1.5px', borderBottom: '1px solid var(--border)' }}>Brand & Identity</th>
                                    <th style={{ padding: '25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1.5px', borderBottom: '1px solid var(--border)' }}>Subscription Status</th>
                                    <th style={{ padding: '25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1.5px', borderBottom: '1px solid var(--border)' }}>Resource Quotas</th>
                                    <th style={{ padding: '25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1.5px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <Store size={48} />
                                                <p className="font-bold text-lg">No tenants detected in the cluster</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {organizations.map((org) => (
                                    <tr key={org.id} style={{ transition: 'all 0.2s' }}>
                                        <td style={{ padding: '25px', borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-fade)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                    <Store size={22} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontWeight: 900, color: 'var(--primary-dark)', fontSize: '1rem', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{org.name}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500, fontStyle: 'italic' }}>{org.ownerName || 'Unknown Owner'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '25px', borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    letterSpacing: '1px',
                                                    textTransform: 'uppercase',
                                                    background: org.licenseType === 'FREE' ? '#e2e8f0' : 'var(--primary-fade)',
                                                    color: org.licenseType === 'FREE' ? '#475569' : 'var(--primary)',
                                                    border: org.licenseType === 'FREE' ? 'none' : '1px solid rgba(var(--primary-rgb), 0.1)'
                                                }}>
                                                    {org.plan?.name || org.licenseType}
                                                </span>
                                                {org.killSwitch ? (
                                                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>LOCKED</span>
                                                ) : (
                                                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>ACTIVE</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase' }}>
                                                        <span>Users</span>
                                                        <span>{org._count.users} / {org.userLimit}</span>
                                                    </div>
                                                    <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ background: 'var(--primary)', height: '100%', width: `${Math.min((org._count.users / org.userLimit) * 100, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase' }}>
                                                        <span>Products</span>
                                                        <span>{org._count.products} / {org.productLimit}</span>
                                                    </div>
                                                    <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ background: 'var(--accent)', height: '100%', width: `${Math.min((org._count.products / org.productLimit) * 100, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-light)', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                <button
                                                    onClick={() => { setSelectedOrg(org); setShowOrgModal(true); }}
                                                    style={{ padding: '10px', background: 'white', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', color: 'var(--primary)' }}
                                                    title="Edit Subscription"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleImpersonate(org.id)}
                                                    style={{ padding: '10px', background: 'var(--primary-fade)', border: '1px solid rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: '12px', cursor: 'pointer' }}
                                                    title="Impersonate Admin"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSubTab === 'analytics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>MRR (Recurrent Mensuel)</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>{advancedStats?.mrr || 0} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>DA</span></h3>
                            <p style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={12} /> +12% vs mois dernier</p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>Churn Rate (Attrition)</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>{advancedStats?.churnRate?.toFixed(1) || 0} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>%</span></h3>
                            <p style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, marginTop: '8px', fontStyle: 'italic' }}>Clients inactifs sur 30j</p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>Projections M+1</p>
                            <h3 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--success)', margin: 0 }}>{Math.round(advancedStats?.projections || 0)} <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>DA</span></h3>
                            <p style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, marginTop: '8px' }}>Basé sur les renouvellements</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                            <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', margin: 0 }}><Shield size={20} style={{ color: 'var(--primary)' }} /> Santé Technique & Données</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {advancedStats?.technicalHealth?.map((h: any, i: number) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--primary-dark)' }}>{h.name}</span>
                                            <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>{h.dataVolume} records</span>
                                        </div>
                                        <div style={{ width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${Math.min(h.limitReached, 100)}%`,
                                                    background: h.limitReached > 80 ? '#ef4444' : h.limitReached > 50 ? '#f59e0b' : '#22c55e'
                                                }}
                                            ></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '6px', color: 'var(--muted)' }}>
                                            <span>Volume de stockage</span>
                                            <span>{Math.round(h.limitReached)}% de la limite pack</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                            <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', margin: 0 }}><Activity size={20} style={{ color: 'var(--success)' }} /> Utilisation des Modules</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: "Vente (POS)", val: 92, color: "var(--primary)" },
                                    { label: "Stocks", val: 65, color: "var(--success)" },
                                    { label: "RH / Paie", val: 40, color: "var(--warning)" },
                                    { label: "CRM", val: 25, color: "var(--accent)" }
                                ].map((m, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>
                                                <span>{m.label}</span>
                                                <span>{m.val}%</span>
                                            </div>
                                            <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '10px' }}>
                                                <div style={{ width: `${m.val}%`, background: m.color, height: '100%', borderRadius: '10px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'billing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Historique de Facturation</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '4px 0 0' }}>Suivi des paiements reçus par les boutiques</p>
                        </div>
                        <button className="btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 800, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(var(--primary-rgb), 0.2)' }}><Receipt size={16} /> Générer Factures Mensuelles</button>
                    </div>

                    <div style={{ borderRadius: '24px', overflow: 'hidden', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '20px 25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Référence</th>
                                    <th style={{ padding: '20px 25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Boutique</th>
                                    <th style={{ padding: '20px 25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Période</th>
                                    <th style={{ padding: '20px 25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Montant</th>
                                    <th style={{ padding: '20px 25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Statut</th>
                                    <th style={{ padding: '20px 25px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                            Aucune facture générée pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map(inv => (
                                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '20px 25px', fontFamily: 'monospace', fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>{inv.id}</td>
                                            <td style={{ padding: '20px 25px', fontWeight: 800, color: 'var(--primary-dark)' }}>{inv.orgName}</td>
                                            <td style={{ padding: '20px 25px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{inv.date ? new Date(inv.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Janvier 2024'}</td>
                                            <td style={{ padding: '20px 25px', fontWeight: 900, color: 'var(--primary-dark)' }}>{inv.amount} DA</td>
                                            <td style={{ padding: '20px 25px' }}>
                                                <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>{inv.status}</span>
                                            </td>
                                            <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                                                <button style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--primary)', background: 'white', cursor: 'pointer' }} title="Télécharger PDF"><Receipt size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSubTab === 'plans' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Packs & Souscriptions</h3>
                        <button onClick={() => setShowPlanModal(true)} className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', fontWeight: 800 }}><Plus size={16} /> Nouveau Plan</button>
                    </div>
                    {plans.length === 0 ? (
                        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)' }}>
                            Aucun plan de souscription configuré. Créez-en un pour commencer.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {plans.map(plan => (
                                <div key={plan.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{plan.name}</h4>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '12px 0' }}>{plan.price} DA<span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}> / mois</span></p>
                                    <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', margin: '16px 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Produits max:</span> <span style={{ fontWeight: 800 }}>{plan.productLimit}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Employés max:</span> <span style={{ fontWeight: 800 }}>{plan.employeeLimit}</span></div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>{plan.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Org SaaS Edit Modal */}
            <AnimatePresence mode="wait">
                {showOrgModal && selectedOrg && (
                    <div key="org-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                        <motion.div
                            key="org-modal-content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid var(--border)', position: 'relative', pointerEvents: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'var(--primary-fade)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <Edit size={22} />
                                        </div>
                                        Gestion SaaS
                                    </h2>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>{selectedOrg.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowOrgModal(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--muted)' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Propriétaire</label>
                                        <input
                                            name="ownerName"
                                            defaultValue={selectedOrg.ownerName}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Pack / Plan</label>
                                        <select
                                            name="planId"
                                            defaultValue={selectedOrg.planId}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem' }}
                                        >
                                            <option value="">-- Sélectionner Plan --</option>
                                            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={18} style={{ color: 'var(--primary)' }} />
                                        Limites & Quotas
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>Utilisateurs</label>
                                            <input name="userLimit" type="number" defaultValue={selectedOrg.userLimit} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>Produits</label>
                                            <input name="productLimit" type="number" defaultValue={selectedOrg.productLimit} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>Employés</label>
                                            <input name="employeeLimit" type="number" defaultValue={selectedOrg.employeeLimit} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Type Licence</label>
                                        <select name="licenseType" defaultValue={selectedOrg.licenseType} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }}>
                                            <option value="FREE">FREE</option>
                                            <option value="BASIC">BASIC</option>
                                            <option value="PREMIUM">PREMIUM</option>
                                            <option value="ENTERPRISE">ENTERPRISE</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Fin Contrat</label>
                                        <input name="licenseEnd" type="date" defaultValue={selectedOrg.licenseEnd ? new Date(selectedOrg.licenseEnd).toISOString().split('T')[0] : ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }} />
                                    </div>
                                </div>


                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '8px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Shield size={18} style={{ color: 'var(--primary)' }} />
                                        Accès Administrateur
                                    </h3>

                                    {!adminCredentials ? (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleViewCredentials(selectedOrg.id); }}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                                        >
                                            <Eye size={16} />
                                            Révéler les identifiants Admin
                                        </button>
                                    ) : (
                                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Identifiant</label>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'white', wordBreak: 'break-all' }}>{adminCredentials.username || "Non défini"}</div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Email</label>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'white', wordBreak: 'break-all' }}>{adminCredentials.email}</div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Mot de passe</label>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#34d399', wordBreak: 'break-all' }}>{adminCredentials.visiblePassword || "Hashé (Non visible)"}</div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>PIN</label>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fbbf24', wordBreak: 'break-all' }}>{adminCredentials.pinCode || "Non défini"}</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setAdminCredentials(null); }}
                                                style={{ marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
                                            >
                                                Masquer
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        name="killSwitch"
                                        id="killSwitch"
                                        defaultChecked={selectedOrg.killSwitch}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="killSwitch" style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertCircle size={16} />
                                        ACTIVER KILL-SWITCH (Bloquer l&apos;accès immédiat)
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowOrgModal(false)}
                                        style={{ flex: 1, padding: '16px', borderRadius: '15px', border: '1px solid var(--border)', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '16px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 20px rgba(var(--primary-rgb), 0.2)' }}
                                    >
                                        Sauvegarder
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* New Plan Modal */}
            <AnimatePresence mode="wait">
                {showPlanModal && (
                    <div key="plan-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                        <motion.div
                            key="plan-modal-content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '600px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid var(--border)', pointerEvents: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--primary-fade)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <CreditCard size={24} />
                                        </div>
                                        Nouveau Plan
                                    </h2>
                                    <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: 'var(--muted)' }}>Définir un nouveau pack de souscription</p>
                                </div>
                                <button
                                    onClick={() => setShowPlanModal(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', color: 'var(--muted)' }}
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Nom du Plan</label>
                                    <input
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Ex: Premium Gold"
                                        style={{ width: '100%', padding: '16px', borderRadius: '15px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Prix (DA / mois)</label>
                                        <input
                                            name="price"
                                            type="number"
                                            required
                                            placeholder="2000"
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontWeight: 'bold' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Limite Produits</label>
                                        <input
                                            name="productLimit"
                                            type="number"
                                            required
                                            placeholder="5000"
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Limite Employés</label>
                                    <input
                                        name="employeeLimit"
                                        type="number"
                                        required
                                        placeholder="10"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontWeight: 'bold' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Ce plan inclut..."
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', height: '100px', resize: 'none' }}
                                    ></textarea>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowPlanModal(false)}
                                        style={{ flex: 1, padding: '16px', borderRadius: '15px', border: '1px solid var(--border)', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '16px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 25px rgba(var(--primary-rgb), 0.3)' }}
                                    >
                                        CRÉER LE PLAN
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Provision Modal */}
            <AnimatePresence mode="wait">
                {showProvisionModal && (
                    <div key="provision-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                        <motion.div
                            key="provision-modal-content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '800px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto', pointerEvents: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--primary-fade)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <Plus size={24} />
                                        </div>
                                        Nouvelle Boutique
                                    </h2>
                                    <p style={{ margin: '6px 0 0', fontSize: '0.95rem', color: 'var(--muted)' }}>Provisioning automatique avec quotas système</p>
                                </div>
                                <button
                                    onClick={() => setShowProvisionModal(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', color: 'var(--muted)' }}
                                >
                                    <X size={28} />
                                </button>
                            </div>
                            <form onSubmit={handleProvisionOrganization} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Nom de l&apos;Entreprise / Boutique</label>
                                    <input
                                        name="name"
                                        required
                                        autoFocus
                                        placeholder="Ex: Ma Boutique SARL"
                                        style={{ width: '100%', padding: '16px', borderRadius: '15px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1.2rem', fontWeight: 700 }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Ville</label>
                                        <input name="city" placeholder="Ex: Alger" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Téléphone</label>
                                        <input name="phone" placeholder="0550..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Pack / Plan</label>
                                        <select name="planId" required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }}>
                                            <option value="">-- Choisir un Pack --</option>
                                            {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} DA)</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Nom du Gérant</label>
                                        <input name="ownerName" required placeholder="Ex: Ahmed Ben" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Email du Gérant</label>
                                        <input name="ownerEmail" type="email" required placeholder="gerant@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Identifiant (Login)</label>
                                        <input name="username" placeholder="Optionnel (ex: boutique1)" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>Mot de passe</label>
                                        <input name="tempPassword" type="text" defaultValue="welcome123" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontWeight: 'bold' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>PIN Admin</label>
                                        <input name="pinCode" type="text" placeholder="Ex: 0000" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', fontWeight: 'bold' }} />
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                    <Shield style={{ color: '#3b82f6', flexShrink: 0 }} size={24} />
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.5 }}>
                                        L&apos;organisation sera créée immédiatement. L&apos;administrateur pourra se connecter avec l&apos;email OU l&apos;identifiant, et le mot de passe défini.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowProvisionModal(false)}
                                        style={{ flex: 1, padding: '16px', borderRadius: '15px', border: '1px solid var(--border)', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '16px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 25px rgba(var(--primary-rgb), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <Activity size={20} />
                                        PROVISIONNER
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
