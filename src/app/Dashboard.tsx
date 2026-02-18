"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart3,
    Users,
    Package,
    Settings,
    CreditCard,
    Zap,
    Activity,
    ShieldCheck,
    Power,
    ShoppingCart,
    ChevronRight,
    X,
    Search,
    QrCode,
    Plus,
    Trash2,
    AlertCircle,
    Phone,
    Mail,
    Clock,
    ArrowUpRight,
    TrendingUp,
    LayoutDashboard,
    Wallet,
    Printer,
    FileText,
    Download,
    Receipt,
    History as HistoryIcon,
    ArrowDownCircle,
    PieChart,
    Store,
    MapPin,
    Hash,
    Truck,
    Scale,
    LogOut,
    Save,
    Minus,
    ChevronDown,
    Share2,
    Briefcase,
    Calendar,
    ArrowLeftRight,
    ArrowDownLeft,
    Globe,
    Building,
    Folder,
    UserCog,
    Shield,
    Key,
    Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "./auth-actions";
import EmployeeModal from "./EmployeeModal";
import AdminTab from "./AdminTab";
import UserModal from "./UserModal";
import RoleModal from "./RoleModal";
import PermissionsModal from "./PermissionsModal";
import SaaSPanel from "./SaaSPanel";
import { QRCodeCanvas } from "qrcode.react";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { Repository } from "@/lib/repository";
import { connectionMonitor } from "@/lib/offline/connection-monitor";
import { syncManager } from "@/lib/offline/sync-manager";
import { offlineDB } from "@/lib/offline/db";


function PrinterConfig({ stats, showMessage }: { stats: any, showMessage: (title: string, message: string, type?: 'success' | 'error' | 'info') => void }) {
    const [printers, setPrinters] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPrinters();
    }, []);

    const loadPrinters = async () => {
        const res = await Repository.getPrinters();
        if (res.success) setPrinters(res.printers);
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const res = await Repository.updateOrganization(stats.orgId, {
            printerTicket: fd.get("printerTicket") as string,
            printerLabel: fd.get("printerLabel") as string,
            printerA4: fd.get("printerA4") as string,
            ticketWidth: fd.get("ticketWidth") as string,
            ticketHeader: fd.get("ticketHeader") as string,
            ticketFooter: fd.get("ticketFooter") as string,
        });
        setLoading(false);
        if (res.success) showMessage("Succès", "Configuration sauvegardée !", "success");
        else showMessage("Erreur", "Erreur sauvegarde", "error");
    };

    const testPrint = async (printer: string) => {
        if (!printer) return;
        const res = await Repository.printJob(`\nTEST IMPRESSION\n----------------\nCeci est un test.\nImprimante: ${printer}\n----------------\n\n\n`, printer);
        if (res.success) showMessage("Succès", "Test envoyé !", "success");
        else showMessage("Erreur", "Erreur test: " + (res as any).error, "error");
    }

    return (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={loadPrinters} style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--primary-dark)' }}>Rafraîchir Liste</button>
            </div>

            <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Imprimante Tickets (Reçu)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <select name="printerTicket" defaultValue={stats.organization?.printerTicket || ''} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'var(--foreground)' }}>
                        <option value="">-- Aucune --</option>
                        {printers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button type="button" onClick={() => testPrint(stats.organization?.printerTicket)} title="Test" style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '0 10px', color: 'white' }}><Printer size={16} /></button>
                </div>
            </div>

            <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Imprimante Étiquettes</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <select name="printerLabel" defaultValue={stats.organization?.printerLabel || ''} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'var(--foreground)' }}>
                        <option value="">-- Aucune --</option>
                        {printers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button type="button" onClick={() => testPrint(stats.organization?.printerLabel)} title="Test" style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '0 10px', color: 'white' }}><Printer size={16} /></button>
                </div>
            </div>

            <div>
                <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Imprimante A4 (Documents/Rapports)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <select name="printerA4" defaultValue={stats.organization?.printerA4 || ''} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'var(--foreground)' }}>
                        <option value="">-- Aucune --</option>
                        {printers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button type="button" onClick={() => testPrint(stats.organization?.printerA4)} title="Test" style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '0 10px', color: 'white' }}><Printer size={16} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-deep)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '5px', display: 'block' }}>Format Ticket</label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input type="radio" name="ticketWidth" value="80mm" defaultChecked={stats.organization?.ticketWidth === "80mm" || !stats.organization?.ticketWidth} /> 80mm (Standard)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input type="radio" name="ticketWidth" value="58mm" defaultChecked={stats.organization?.ticketWidth === "58mm"} /> 58mm (Petit)
                        </label>
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>En-tête Ticket</label>
                    <input name="ticketHeader" defaultValue={stats.organization?.ticketHeader} placeholder="Bienvenue !" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--foreground)', fontSize: '0.8rem' }} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Pied de page</label>
                    <input name="ticketFooter" defaultValue={stats.organization?.ticketFooter} placeholder="Merci..." style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--foreground)', fontSize: '0.8rem' }} />
                </div>
            </div>

            <button disabled={loading} className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>SAUVEGARDER CONFIG</button>
        </form>
    );
}

interface DashboardProps {
    stats: {
        todaySales: number;
        stockCount: number;
        auditCount: number;
        orgName: string;
        orgId: string;
        license: string;
        organization: any;
        recentTransactions: any[];
        products: any[];
        clients: any[];
        expenses: any[];
        categories: any[];
        warehouses: any[];
        movements: any[];
        suppliers: any[];
        accounts: any[];
        flows: any[];
        totalReceivables: number;
        totalPayables: number;
        stockValue: number;
        recurringExpenses: any[];
        employees: any[];
        userName?: string;
        user?: any;
        allUsers: any[];
    }
}

export default function Dashboard({ stats }: DashboardProps) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(false);
    const [isOffline] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState<{ show: boolean, client?: any }>({ show: false });
    const [showProductModal, setShowProductModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showSuperAdmin, setShowSuperAdmin] = useState(false);

    // FORCE SW UNREGISTRATION FOR DEBUGGING
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister().then(() => {
                        console.log("SW Unregistered successfully");
                    });
                }
            });
        }
    }, []);

    // Local data state for offline support
    const [products, setProducts] = useState<any[]>(stats.products || []);
    const [clients, setClients] = useState<any[]>(stats.clients || []);
    const [recentTransactions, setRecentTransactions] = useState<any[]>(stats.recentTransactions || []);
    const [warehouses, setWarehouses] = useState<any[]>(stats.warehouses || []);
    const [categories, setCategories] = useState<any[]>(stats.categories || []);
    const [suppliers, setSuppliers] = useState<any[]>(stats.suppliers || []);
    const [accounts, setAccounts] = useState<any[]>(stats.accounts || []);
    const [isOnline, setIsOnline] = useState(true);

    const [posSearch, setPosSearch] = useState("");

    const [cart, setCart] = useState<any[]>([]);
    const [cartClient, setCartClient] = useState<any | null>(null);
    const [cartPaidAmount, setCartPaidAmount] = useState<string>("");
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [selectedHistoryTransactions, setSelectedHistoryTransactions] = useState<string[]>([]);
    const [inventorySearch, setInventorySearch] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
    const [selectedPosWarehouse, setSelectedPosWarehouse] = useState<string>(stats.warehouses?.[0]?.id || "");
    const [posCategory, setPosCategory] = useState<string>("all");
    const [showAdjustModal, setShowAdjustModal] = useState<{ show: boolean, product?: any }>({ show: false });
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showFastReception, setShowFastReception] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [barcodePreview, setBarcodePreview] = useState<any>(null);
    const [barcodeUnit, setBarcodeUnit] = useState<any>(null);
    const [historyFilterProduct, setHistoryFilterProduct] = useState<string>("all");
    const [showSupplierModal, setShowSupplierModal] = useState<{ show: boolean, supplier?: any }>({ show: false });
    const [showUnitsModal, setShowUnitsModal] = useState<{ show: boolean, product?: any }>({ show: false });
    const [showSuppliers, setShowSuppliers] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const [activityFilter, setActivityFilter] = useState<'day' | 'week' | 'month'>('day');

    // Advanced POS State
    const [receivedAmount, setReceivedAmount] = useState<string>("");
    const [heldCarts, setHeldCarts] = useState<any[][]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showQuickExpense, setShowQuickExpense] = useState(false);
    const [showZReportModal, setShowZReportModal] = useState(false);
    const [zReportData, setZReportData] = useState<any>(null);
    const [clientHistory, setClientHistory] = useState<any[]>([]);
    const [showClientHistoryModal, setShowClientHistoryModal] = useState(false);
    const [clientFormType, setClientFormType] = useState('PARTICULIER');
    const [selectedPosAccount, setSelectedPosAccount] = useState<string>(stats.accounts?.find(a => a.isDefault)?.id || stats.accounts?.[0]?.id || "");

    // HR State
    const [showAdjustSupplierDebtModal, setShowAdjustSupplierDebtModal] = useState<{ show: boolean, supplier?: any }>({ show: false });
    const [hrOverview, setHrOverview] = useState<any>(null);
    const [serverIP, setServerIP] = useState<string>("localhost");
    const [showAttendanceHistory, setShowAttendanceHistory] = useState<{ show: boolean, employee?: any }>({ show: false });
    const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
    const [attendanceMonth, setAttendanceMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [showPayrollModal, setShowPayrollModal] = useState<{ show: boolean, employee?: any }>({ show: false });
    const [showPayExpenseModal, setShowPayExpenseModal] = useState<{ show: boolean, expense: any }>({ show: false, expense: null });
    const [modalExpenseIsPaid, setModalExpenseIsPaid] = useState(true);

    // Purchase Module States
    const [purchaseCart, setPurchaseCart] = useState<any[]>([]);
    const [purchaseSupplier, setPurchaseSupplier] = useState<any | null>(null);
    const [purchasePaidAmount, setPurchasePaidAmount] = useState<string>("");
    const [selectedPurchaseAccount, setSelectedPurchaseAccount] = useState<string>(stats.accounts?.find(a => a.isDefault)?.id || stats.accounts?.[0]?.id || "");
    const [purchaseSearch, setPurchaseSearch] = useState("");
    const [showQuickProductModal, setShowQuickProductModal] = useState(false);
    const [showQuickSupplierModal, setShowQuickSupplierModal] = useState(false);
    const [creationContext, setCreationContext] = useState<'standard' | 'purchase'>('standard');
    const [payrollData, setPayrollData] = useState<any | null>(null);

    // Administration Module States
    const [adminSubTab, setAdminSubTab] = useState<'users' | 'roles'>('users');
    const [allRoles, setAllRoles] = useState<any[]>([]);
    const [allPermissions, setAllPermissions] = useState<any[]>([]);
    const [allSystemUsers, setAllSystemUsers] = useState<any[]>([]);
    const [showUserModal, setShowUserModal] = useState<{ show: boolean, user?: any }>({ show: false });
    const [showRoleModal, setShowRoleModal] = useState<{ show: boolean, role?: any }>({ show: false });
    const [showPermissionsModal, setShowPermissionsModal] = useState<{ show: boolean, role?: any }>({ show: false });


    // Move HR State and other state variables above to avoid duplicate definitions
    const [employees, setEmployees] = useState<any[]>(stats.employees || []);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

    // Finance States moved up
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showZakatCalc, setShowZakatCalc] = useState(false);
    const [financeSubTab, setFinanceSubTab] = useState<'treasury' | 'debts' | 'performance' | 'tax' | 'recurring'>('performance');
    const [showCollectDebtModal, setShowCollectDebtModal] = useState<{ show: boolean, client?: any }>({ show: false });
    const [showPaySupplierModal, setShowPaySupplierModal] = useState<{ show: boolean, supplier?: any }>({ show: false });
    const [showRecurringExpenseModal, setShowRecurringExpenseModal] = useState(false);


    // Custom Modal States
    const [messageModal, setMessageModal] = useState<{ show: boolean, title: string, message: string, type: 'success' | 'error' | 'info', onClose?: () => void }>({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState<{ show: boolean, title: string, message: string, onConfirm: () => void, onCancel?: () => void }>({ show: false, title: '', message: '', onConfirm: () => { } });
    const [promptModal, setPromptModal] = useState<{ show: boolean, title: string, label: string, defaultValue: string, type?: string, allowFileUpload?: boolean, onConfirm: (val: string) => void, onCancel?: () => void }>({ show: false, title: '', label: '', defaultValue: '', onConfirm: () => { } });

    // Multi-User PIN Auth State
    const [isLocked, setIsLocked] = useState(stats.allUsers?.length > 1);
    const [currentUser, setCurrentUser] = useState(stats.allUsers?.length === 1 ? stats.allUsers[0] : null);
    const [selectedUserForPIN, setSelectedUserForPIN] = useState<any | null>(null);
    const [tempPin, setTempPin] = useState("");

    // --- HELPER: Silent Printing (Hidden Iframe) ---
    const printSilent = (content: string) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(content);
            doc.close();
            // Wait for resources to load then print
            iframe.contentWindow?.focus();
            setTimeout(() => {
                iframe.contentWindow?.print();
                // Check if browser is strictly blocking close or if we can remove it
                // We remove it after a delay to ensure print dialog has captured it
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }
    };

    // Helper Functions for Modals
    const showMessage = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', onClose?: () => void) => {
        setMessageModal({ show: true, title, message, type, onClose });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
        setConfirmModal({ show: true, title, message, onConfirm, onCancel });
    };

    const showPrompt = (title: string, label: string, defaultValue: string = '', onConfirm: (val: string) => void, type: string = 'text', allowFileUpload: boolean = false, onCancel?: () => void) => {
        setPromptModal({ show: true, title, label, defaultValue, type, allowFileUpload, onConfirm, onCancel });
    };

    useEffect(() => {
        setCurrentDate(new Date().toLocaleString());

        // Sync online status
        setIsOnline(connectionMonitor.isOnline());
        const unsubscribe = connectionMonitor.on(status => {
            setIsOnline(status === 'online');
            if (status === 'online') {
                refreshData();
            }
        });

        // Initial data refresh from local DB if offline
        if (!connectionMonitor.isOnline()) {
            refreshData();
        }

        return () => unsubscribe();
    }, []);

    const refreshData = async () => {
        try {
            const [localProds, localClients, localWarehouses, localCategories, localSuppliers, localRoles, localUsers, localEmployees] = await Promise.all([
                Repository.getProducts(stats.orgId),
                Repository.getClients(stats.orgId),
                Repository.getWarehouses(stats.orgId),
                Repository.getCategories(stats.orgId),
                Repository.getSuppliers(stats.orgId),
                Repository.getRoles(stats.orgId),
                Repository.getUsers(stats.orgId),
                Repository.getEmployees(stats.orgId)
            ]);
            if (localProds?.success) setProducts(localProds.data || []);
            if (localClients?.success) setClients(localClients.data || []);
            if (localWarehouses?.success) setWarehouses(localWarehouses.data || []);
            if (localCategories?.success) setCategories(localCategories.data || []);
            if (localSuppliers?.success) setSuppliers(localSuppliers.data || []);
            if (localRoles?.success) setAllRoles(localRoles.data || []);
            if (localUsers?.success) setAllSystemUsers(localUsers.data || []);
            if (localEmployees?.success) setEmployees(localEmployees.data || []);

            // Also fetch recent transactions
            const transactions = await Repository.getTransactions(stats.orgId, 20);
            if (transactions?.success && transactions.data?.length > 0) setRecentTransactions(transactions.data);

            // Fetch accounts
            const accountList = await Repository.getAccounts(stats.orgId);
            if (accountList?.success && accountList.data?.length > 0) setAccounts(accountList.data);

        } catch (err) {
            console.error("Dashboard refresh failed:", err);
        }
    };


    // Load HR data when tab is active
    useEffect(() => {
        if (activeTab === "hr" && stats.orgId) {
            loadHR();
        }
    }, [activeTab, stats.orgId]);

    useEffect(() => {
        if (stats.employees) setEmployees(stats.employees);
    }, [stats.employees]);

    const loadHR = async () => {
        setLoading(true);
        try {
            const [empRes, overviewRes, ipRes] = await Promise.all([
                Repository.getEmployees(stats.orgId),
                Repository.getHROverview(stats.orgId),
                Repository.getServerIP()
            ]);
            if (empRes?.success) setEmployees((empRes.data || []) as any[]);
            if (overviewRes?.success) setHrOverview(overviewRes.data);
            if (ipRes) setServerIP(ipRes);
        } catch (error) {
            console.error("Dashboard: Load HR failed", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes, usersRes] = await Promise.all([
                Repository.getRoles(stats.orgId),
                Repository.getPermissions(),
                Repository.getUsers(stats.orgId)
            ]);
            if (rolesRes?.success) setAllRoles(rolesRes.data || []);
            if (permsRes?.success) setAllPermissions(permsRes.data || []);
            if (usersRes?.success) setAllSystemUsers(usersRes.data || []);
        } catch (error) {
            console.error("Dashboard: Load Admin Data failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Load Admin data when tab is active
    useEffect(() => {
        if (activeTab === "admin" && stats.orgId) {
            loadAdminData();
        }
    }, [activeTab, stats.orgId]);

    const loadPayroll = async (empId: string, month: string) => {
        setLoading(true);
        try {
            const res = await Repository.generatePayroll(empId, month);
            if (res?.success) {
                setPayrollData(res.data);
                setShowPayrollModal({ show: true, employee: employees.find((e: any) => e.id === empId) });
            } else {
                showMessage("Erreur", res.error || "Erreur lors de la génération de la paie", "error");
            }
        } catch (error) {
            console.error("Dashboard: Load Payroll failed", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAttendance = async (empId: string, month: string) => {
        setLoading(true);
        try {
            const res = await Repository.getAttendanceHistory(empId, month);
            if (res.success) {
                setAttendanceHistory(res.data || []);
            }
        } catch (error) {
            console.error("Dashboard: Load Attendance failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Admin Handlers
    const handleSaveUser = async (data: any) => {
        setLoading(true);
        try {
            let result;
            if (data.userId) {
                result = await Repository.updateUser(data.userId, {
                    email: data.email,
                    name: data.name,
                    password: data.password || undefined,
                    pinCode: data.pinCode,
                    roleId: data.roleId,
                    employeeId: data.employeeId
                });
            } else {
                result = await Repository.createUser({
                    email: data.email,
                    name: data.name,
                    password: data.password,
                    pinCode: data.pinCode,
                    roleId: data.roleId,
                    organizationId: data.organizationId,
                    employeeId: data.employeeId
                });
            }

            if (result.success) {
                showMessage('Succès', 'Utilisateur enregistré avec succès', 'success');
                setShowUserModal({ show: false });
                await loadAdminData();

                if (data.employeeId && result.success && (result as any).data) {
                    await Repository.updateEmployee(data.employeeId, {
                        userId: (result as any).data.id,
                        pinCode: data.pinCode
                    });
                }
            } else {
                showMessage('Erreur', result.error || 'Erreur lors de l\'enregistrement', 'error');
            }
        } catch (error: any) {
            showMessage('Erreur', error.message, 'error');
        }
        setLoading(false);
    };

    const handleDeleteUser = async (userId: string) => {
        showConfirm(
            'Confirmer la suppression',
            'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
            async () => {
                setLoading(true);
                const result = await Repository.deleteUser(userId);
                if (result.success) {
                    showMessage('Succès', 'Utilisateur supprimé', 'success');
                    await loadAdminData();
                } else {
                    showMessage('Erreur', result.error || 'Erreur lors de la suppression', 'error');
                }
                setLoading(false);
            }
        );
    };

    const handleSaveRole = async (data: any) => {
        setLoading(true);
        try {
            let result;
            if (data.roleId) {
                result = await Repository.updateRole(data.roleId, {
                    name: data.name,
                    description: data.description
                });
            } else {
                result = await Repository.createRole({
                    name: data.name,
                    description: data.description,
                    organizationId: data.organizationId
                });
            }

            if (result.success) {
                showMessage('Succès', 'Rôle enregistré avec succès', 'success');
                setShowRoleModal({ show: false });
                await loadAdminData();
            } else {
                showMessage('Erreur', result.error || 'Erreur lors de l\'enregistrement', 'error');
            }
        } catch (error: any) {
            showMessage('Erreur', error.message, 'error');
        }
        setLoading(false);
    };

    const handleDeleteRole = async (roleId: string) => {
        showConfirm(
            'Confirmer la suppression',
            'Êtes-vous sûr de vouloir supprimer ce rôle ?',
            async () => {
                setLoading(true);
                const result = await Repository.deleteRole(roleId);
                if (result.success) {
                    showMessage('Succès', 'Rôle supprimé', 'success');
                    await loadAdminData();
                } else {
                    showMessage('Erreur', result.error || 'Erreur lors de la suppression', 'error');
                }
                setLoading(false);
            }
        );
    };

    const handleSavePermissions = async (roleId: string, permissionIds: string[]) => {
        setLoading(true);
        const result = await Repository.assignPermissionsToRole(roleId, permissionIds);
        if (result.success) {
            showMessage('Succès', 'Permissions mises à jour', 'success');
            setShowPermissionsModal({ show: false });
            await loadAdminData();
        } else {
            showMessage('Erreur', result.error || 'Erreur lors de la mise à jour', 'error');
        }
        setLoading(false);
    };


    const handleSelectClient = async (client: any) => {
        setSelectedClient(client);
        setLoading(true);
        const res = await Repository.getClientHistory(client.id);
        setLoading(false);
        if (res.success) {
            setClientHistory((res.data || []) as any[]);
        } else {
            showMessage("Erreur", "Erreur récupération historique", "error");
        }
    };

    const handleViewHistory = async (clientId: string) => {
        setLoading(true);
        const res = await Repository.getClientHistory(clientId);
        setLoading(false);
        if (res.success) {
            setClientHistory((res.data || []) as any[]);
            setShowClientHistoryModal(true);
        } else {
            showMessage("Erreur", "Erreur réseau historique", "error");
        }
    };

    const openWhatsApp = (phone: string, name: string, debt: number) => {
        if (!phone) return showMessage("Erreur", "Pas de numéro de téléphone", "error");
        const message = `Bonjour ${name}, sauf erreur de notre part, le solde de votre compte est de ${debt.toLocaleString()} DA. Merci de régulariser.`;
        const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tempPin) return; // Guard against empty submissions

        if (selectedUserForPIN && selectedUserForPIN.pinCode === tempPin) {
            setCurrentUser(selectedUserForPIN);
            setIsLocked(false);
            setTempPin("");
            setSelectedUserForPIN(null);
        } else {
            showMessage("Erreur", "PIN Incorrect", "error");
            setTempPin("");
        }
    };


    // Move hooks before the early return to follow Rules of Hooks
    useEffect(() => {
        if (!stats?.orgId || stats.orgId === "N/A") {
            console.error("DASHBOARD CRITICAL: stats.orgId is missing or invalid!", stats);
            // We don't block the UI yet, but we log the state for debugging
        }
    }, [stats]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                setShowProductModal(true);
            }
            if (e.key === 'F2') {
                e.preventDefault();
                setShowClientModal(true);
            }
            if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCheckout();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, cartClient, cartPaidAmount]);

    useEffect(() => {
        let timeoutId: any;
        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsLocked(true);
                setCurrentUser(null);
            }, 300000); // 5 minutes inactivity
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        resetTimer();

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            clearTimeout(timeoutId);
        };
    }, []);

    // Auto-add to cart when barcode is scanned in POS
    useEffect(() => {
        if (!posSearch || posSearch.length < 3) return; // Minimum 3 characters to avoid false positives

        // Debounce to distinguish typing from scanning (scanners are instant)
        const timeoutId = setTimeout(() => {
            // Find exact match by barcode or SKU
            let matchedProduct = products.find(p =>
                p.barcode === posSearch || p.sku === posSearch
            );

            // If not found, try unit barcodes
            if (!matchedProduct) {
                for (const product of products) {
                    if (product.units?.some((u: any) => u.barcode === posSearch)) {
                        matchedProduct = product;
                        break;
                    }
                }
            }

            if (matchedProduct) {
                addToCart(matchedProduct);
                setPosSearch(""); // Clear search for next scan
            }
        }, 100); // 100ms debounce

        return () => clearTimeout(timeoutId);
    }, [posSearch, products]);

    // Auto-add to purchase cart when barcode is scanned in Achats
    useEffect(() => {
        if (!purchaseSearch || purchaseSearch.length < 3) return;

        const timeoutId = setTimeout(() => {
            // Find exact match by barcode or SKU
            let matchedProduct = products.find(p =>
                p.barcode === purchaseSearch || p.sku === purchaseSearch
            );

            // If not found, try unit barcodes
            if (!matchedProduct) {
                for (const product of products) {
                    if (product.units?.some((u: any) => u.barcode === purchaseSearch)) {
                        matchedProduct = product;
                        break;
                    }
                }
            }

            if (matchedProduct) {
                handleAddToPurchaseCart(matchedProduct);
                setPurchaseSearch(""); // Clear search for next scan
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [purchaseSearch, products]);


    const [selectedForPrint, setSelectedForPrint] = useState<string[]>([]);

    if (isLocked) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: 'radial-gradient(circle at center, #f0f4f8 0%, #d9e2ec 100%)',
                zIndex: 9999,
                overflowY: 'auto'
            }}>
                {/* Brand */}
                <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        margin: 0,
                        letterSpacing: '-2px',
                        color: 'var(--primary)',
                        textTransform: 'uppercase'
                    }}>IDEAL GESTION</h1>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '1200px',
                        zIndex: 10
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '10px', letterSpacing: '-0.05em' }}>Sélectionner Utilisateur</h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.9rem', opacity: 0.7 }}>Accès Sécurisé au Système</p>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '40px',
                        width: '100%'
                    }}>
                        {stats.allUsers.map(u => (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -10 }}
                                whileTap={{ scale: 0.95 }}
                                key={u.id}
                                onClick={() => setSelectedUserForPIN(u)}
                                className="glass"
                                style={{
                                    flex: '0 1 320px',
                                    padding: '50px 30px',
                                    borderRadius: '40px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '30px',
                                    background: 'rgba(255, 255, 255, 0.4)',
                                    border: '2px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '4rem',
                                    fontWeight: 900,
                                    color: 'white',
                                    boxShadow: '0 15px 30px rgba(0,101,255,0.3)',
                                    border: '4px solid white'
                                }}>
                                    {u.name?.[0] || u.email[0]}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-dark)', margin: 0 }}>{u.name || u.email}</h3>
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '10px',
                                        padding: '5px 15px',
                                        background: 'rgba(0,101,255,0.1)',
                                        color: 'var(--primary)',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        borderRadius: '10px',
                                        textTransform: 'uppercase'
                                    }}>{u.role?.name || 'Vendeur'}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* PIN Modal */}
                <AnimatePresence>
                    {selectedUserForPIN && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10000,
                                padding: '20px'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                style={{
                                    width: '100%',
                                    maxWidth: '480px',
                                    background: 'white',
                                    borderRadius: '60px',
                                    padding: '60px 40px',
                                    boxShadow: '0 40px 80px rgba(0,0,0,0.15)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    position: 'relative'
                                }}
                            >
                                <button
                                    onClick={() => { setSelectedUserForPIN(null); setTempPin(""); }}
                                    style={{
                                        position: 'absolute',
                                        top: '30px',
                                        right: '30px',
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#64748b'
                                    }}
                                >
                                    <X size={24} />
                                </button>

                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'rgba(0,101,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
                                        <ShieldCheck size={40} />
                                    </div>
                                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary-dark)', margin: 0 }}>{selectedUserForPIN.name || selectedUserForPIN.email}</h2>
                                    <p style={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.2em', marginTop: '10px' }}>Saisir code PIN</p>
                                </div>

                                <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
                                    {/* PIN Display */}
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        {[1, 2, 3, 4].map(idx => (
                                            <div
                                                key={idx}
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: tempPin.length >= idx ? 'var(--primary)' : '#e2e8f0',
                                                    transform: tempPin.length >= idx ? 'scale(1.2)' : 'scale(1)',
                                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    boxShadow: tempPin.length >= idx ? '0 0 15px rgba(0,101,255,0.5)' : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Keypad */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '20px',
                                        width: '100%',
                                        maxWidth: '360px'
                                    }}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map(val => (
                                            <motion.button
                                                whileHover={{ scale: 1.05, background: val === 'OK' ? 'var(--primary-dark)' : '#f8f9fa' }}
                                                whileTap={{ scale: 0.95 }}
                                                key={val}
                                                type={val === 'OK' ? 'submit' : 'button'}
                                                onClick={() => {
                                                    if (val === 'C') setTempPin("");
                                                    else if (val === 'OK') return;
                                                    else if (tempPin.length < 4) setTempPin(tempPin + val);
                                                }}
                                                style={{
                                                    height: '80px',
                                                    borderRadius: '25px',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 900,
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    background: val === 'OK' ? 'var(--primary)' : (val === 'C' ? 'rgba(239, 68, 68, 0.1)' : '#f1f5f9'),
                                                    color: val === 'OK' ? 'white' : (val === 'C' ? '#ef4444' : 'var(--primary-dark)'),
                                                    boxShadow: val === 'OK' ? '0 10px 20px rgba(0,101,255,0.3)' : 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {val === 'OK' ? <ChevronRight size={32} /> : val}
                                            </motion.button>
                                        ))}
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ position: 'absolute', bottom: '30px', opacity: 0.4 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--primary-dark)' }}>by IDEAL GESTION</p>
                </div>
            </div>
        );
    }

    const logoutPIN = () => {
        setIsLocked(true);
        setCurrentUser(null);
        setSelectedUserForPIN(null);
    };

    const toggleFullScreen = () => {
        const element = document.getElementById("pos-area");
        if (!element) return;
        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => console.error(err));
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    const holdCurrentCart = () => {
        if (cart.length === 0) return;
        setHeldCarts([...heldCarts, cart]);
        setCart([]);
        setCartClient(null);
        setReceivedAmount("");
    };

    const resumeCart = (index: number) => {
        const cartToResume = heldCarts[index];
        const newHeld = heldCarts.filter((_, i) => i !== index);
        setHeldCarts(newHeld);
        setCart(cartToResume);
    };


    const sidebarLinks = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: "view_reports" },
        { id: 'pos', label: 'Vente Boutique', icon: Store, permission: "pos_access" },
        { id: 'inventory', label: 'Général Stock', icon: Package, permission: "edit_stock" },
        { id: 'purchases', label: 'Achats & Fournisseurs', icon: Truck, permission: "manage_purchases" },
        { id: 'finance', label: 'Volet Finance', icon: Wallet, permission: "view_finance" },
        { id: 'clients', label: 'Fichier Clients', icon: Users, permission: "view_reports" },
        { id: 'hr', label: 'RH & Paie', icon: Briefcase, permission: "manage_hr" },
        { id: 'admin', label: 'Administration', icon: ShieldCheck, permission: "super_admin" },
        { id: 'saas', label: 'Contrôle SaaS', icon: Globe, permission: "system_admin" },
        { id: 'settings', label: 'Configurations', icon: Settings, permission: "manage_users" },
    ];

    const currentPermissions = currentUser?.permissions || stats.user?.permissions || [];
    const isSuperAdmin = currentPermissions.includes("super_admin");

    const filteredSidebarLinks = sidebarLinks.filter(link => {
        // SaaS Control: Strictly only for the platform owner
        const isSysAdmin = currentUser?.email === 'admin@ideal.dz' || stats.user?.email === 'admin@ideal.dz';
        if (link.id === 'saas') return isSysAdmin;

        // Administration tab only for super_admin
        if (link.id === 'admin') return isSuperAdmin;

        // Super admins see everything else too
        if (isSuperAdmin) return true;

        // Others follow regular permissions
        return !link.permission || currentPermissions.includes(link.permission);
    });


    // Logic: Handle Sale from POS

    const handlePrintStock = async () => {
        if (selectedForPrint.length === 0) return;

        const productsToPrint = products.filter((p: any) => selectedForPrint.includes(p.id));

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Inventaire de Stock</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background: #f4f4f4; }
                    .img-cell { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${stats.organization?.name || 'RAPPORT DE STOCK'}</h1>
                    <p>${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Article</th>
                            <th>SKU/Barcode</th>
                            <th>Emplacement</th>
                            <th>Prix</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsToPrint.map(p => {
            const loc = p.warehouseStock?.find((ws: any) => ws.quantity > 0) || p.warehouseStock?.[0];
            return `
                                <tr>
                                    <td>${p.image ? `<img src="${p.image}" class="img-cell" />` : '<div style="width:60px; height:60px; background:#eee; display:flex; align-items:center; justify-content:center; color:#999">N/A</div>'}</td>
                                    <td><b>${p.name}</b></td>
                                    <td>${p.barcode || p.sku || '-'}</td>
                                    <td>${loc ? `Aisle: ${loc.aisle || '-'} / Shelf: ${loc.shelf || '-'}` : '-'}</td>
                                    <td>${p.price.toLocaleString()} DA</td>
                                    <td>${p.stock} ${p.unit}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 20px; text-align: right;">
                    <p>Total Articles: ${productsToPrint.length}</p>
                </div>
                <script>
                    window.onload = () => { window.print(); window.close(); };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handlePrintBlankInventory = () => {
        const productsToPrint = products;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Fiche d'Inventaire Vierge</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 0.9rem; }
                    th { background: #f4f4f4; }
                    .check-col { width: 120px; }
                    .header { text-align: center; border-bottom: 1px solid #000; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>FICHE D'INVENTAIRE MANUELLE</h1>
                    <p>${stats.organization?.name || 'SI GESTION'}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    Dépôt: ________________________ &nbsp;&nbsp;&nbsp; Date: ____/____/________ &nbsp;&nbsp;&nbsp; Responsable: ________________
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Code/SKU</th>
                            <th>Emplacement (A/E/C)</th>
                            <th class="check-col">Stock Système</th>
                            <th class="check-col">Comptage Physique</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.barcode || p.sku || '-'}</td>
                                <td>${p.aisle || '-'} / ${p.shelf || '-'} / ${p.bin || '-'}</td>
                                <td style="text-align:center; color:#888">${p.stock} ${p.unit}</td>
                                <td></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                    <div>Visa Responsable Dépôt</div>
                    <div>Visa Direction</div>
                </div>
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handlePrintZakat = () => {
        const assets = (stats.accounts.reduce((acc: number, a: any) => acc + a.balance, 0) + stats.stockValue + stats.totalReceivables - (stats.totalPayables || 0));
        const zakat = assets * 0.025;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Rapport de Zakat</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 20px; margin-bottom: 30px; }
                    .box { background: #f9f9f9; padding: 25px; border-radius: 12px; border: 1px solid #ddd; margin-bottom: 20px; }
                    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #eee; }
                    .total { font-size: 1.5rem; font-weight: 900; color: #16a34a; margin-top: 20px; text-align: right; }
                    .footer { margin-top: 50px; font-size: 0.8rem; text-align: center; opacity: 0.6; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 style="margin:0">RAPPORT D'ESTIMATION ZAKAT</h1>
                    <p>${stats.organization?.name || 'SI GESTION'}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="box">
                    <div class="row"><span>Liquidités (Trésorerie):</span> <span>${stats.accounts.reduce((acc: number, a: any) => acc + a.balance, 0).toLocaleString()} DA</span></div>
                    <div class="row"><span>Valeur Marchandise (Stock):</span> <span>${stats.stockValue.toLocaleString()} DA</span></div>
                    <div class="row"><span>Créances Clients:</span> <span>${stats.totalReceivables.toLocaleString()} DA</span></div>
                    <div class="row" style="color: #dc2626"><span>Dettes Fournisseurs:</span> <span>-${(stats.totalPayables || 0).toLocaleString()} DA</span></div>
                    <div class="row" style="border:none; font-weight:bold; margin-top:10px"><span>ASSIETTE IMPOSABLE (Actif - Passif):</span> <span>${assets.toLocaleString()} DA</span></div>
                </div>
                <div class="total">
                    MONTANT ZAKAT (2.5%): ${zakat.toLocaleString()} DA
                </div>
                <div class="footer">
                    * Ce rapport est une estimation automatisée basée sur les données du système.<br>
                    Logiciel SI-GESTION v3
                </div>
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintProforma = () => {
        if (cart.length === 0) return;
        const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>PRO-FORMA (DEVIS)</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #333; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #333; color: white; padding: 12px; text-align: left; }
                    td { padding: 12px; border-bottom: 1px solid #ddd; }
                    .total-box { text-align: right; margin-top: 30px; font-size: 1.2rem; font-weight: bold; }
                    .validity { font-style: italic; font-size: 0.8rem; margin-top: 50px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 style="margin:0">DEVIS / PRO-FORMA</h1>
                        <p>${stats.organization?.name || 'SI GESTION'}</p>
                    </div>
                    <div style="text-align:right">
                        <p><b>Date:</b> ${new Date().toLocaleDateString()}</p>
                        <p><b>N°:</b> PRF-${new Date().getTime().toString().slice(-6)}</p>
                    </div>
                </div>
                <p>Client: ${cartClient?.name || 'Client de passage'}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Désignation</th>
                            <th>Quantité</th>
                            <th>P.U</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map(i => `
                            <tr>
                                <td>${i.name}</td>
                                <td>${i.quantity} ${i.selectedUnit || i.unit}</td>
                                <td>${i.price.toLocaleString()}</td>
                                <td>${(i.price * i.quantity).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total-box">
                    TOTAL GENERAL: ${total.toLocaleString()} DA
                </div>
                <div class="validity">
                    Offre valable pendant 7 jours à compter de la date d'émission.
                </div>
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintZReport = async (data: any) => {
        if (!data) return;
        const printer = stats.organization?.printerTicket;
        if (printer) {
            const ticket = `
CLOTURE DE CAISSE (Z)
${stats.organization.name}
${new Date().toLocaleString()}
--------------------------------
Ventes: ${data.totalSales.toLocaleString()} DA
Charges: ${data.totalExpenses.toLocaleString()} DA
THEORIQUE: ${data.netCashTheoretical.toLocaleString()} DA
REEL: ${data.cashCounted?.toLocaleString() || '---'} DA
ECART: ${data.variance?.toLocaleString() || '---'} DA
--------------------------------
Signé: ${stats.userName || 'Admin'}
            `;
            await Repository.printJob(ticket, printer);
        } else {
            // Client-side Ticket (Silent Iframe)
            const ticketHtml = `
                    <html>
                    <body style="font-family:monospace; padding:10px; font-size:12px; width: 80mm;">
                        <center>
                            <h3 style="margin:5px 0">CLOTURE DE CAISSE (Z)</h3>
                            <p style="margin:0">${stats.organization.name}</p>
                            <p style="margin:0; font-size:10px">${new Date().toLocaleString()}</p>
                        </center>
                        <hr style="border-top: 1px dashed black;">
                        <p style="margin:5px 0">Ventes: <b>${data.totalSales.toLocaleString()} DA</b></p>
                        <p style="margin:5px 0">Charges: ${data.totalExpenses.toLocaleString()} DA</p>
                        <p style="margin:5px 0">THEORIQUE: ${data.netCashTheoretical.toLocaleString()} DA</p>
                        <hr style="border-top: 1px dashed black;">
                        <p style="text-align:center; margin-top:10px;">Signature</p>
                        <br><br>
                    </body>
                    </html>
            `;
            printSilent(ticketHtml);
        }
    };



    const handlePrintFullStockReport = () => {
        setSelectedForPrint(products.map(p => p.id));
        setTimeout(() => handlePrintStock(), 100);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const paid = cartPaidAmount === "" ? total : Number(cartPaidAmount);

        try {
            setLoading(true);

            // Check if we can operate (license valid)
            const opCheck = await Repository.canOperate();
            if (!opCheck.allowed) {
                showMessage("Accès Bloqué", opCheck.message || "Licence non valide", "error");
                return;
            }

            const res = await Repository.createTransaction({
                amount: total,
                paidAmount: paid,
                type: "SALE",
                mode: "CASH",
                orgId: stats.orgId,
                organizationId: stats.orgId,
                items: JSON.stringify(cart),
                clientId: cartClient?.id || undefined,
                warehouseId: selectedPosWarehouse || undefined,
                accountId: selectedPosAccount || undefined
            }) as any;


            if (res.success) {
                showMessage("Succès", "Vente enregistrée !", "success");
                // Printing logic...
                const isCredit = paid < total;
                const clientSnapshot = cartClient;
                const cartSnapshot = [...cart];
                const printer = stats.organization?.printerTicket;
                const ticketWidth = stats.organization?.ticketWidth || "80mm";
                const header = stats.organization?.ticketHeader || "";
                const footer = stats.organization?.ticketFooter || "";

                // Determine title based on credit status
                const title = isCredit ? "TICKET DE DETTE" : "TICKET DE CAISSE";

                if (printer && printer !== 'NONE') {
                    if (printer.includes('XP-') || printer.includes('58mm') || printer.includes('80mm')) {
                        // Server-side Ticket (Text)
                        const ticket = `
${header}
${title}
${stats.organization.name || 'SI GESTION'}
${new Date().toLocaleString()}
--------------------------------
${cartSnapshot.map((i: any) => `${i.quantity} x ${i.name} = ${(i.quantity * i.price).toLocaleString()}`).join('\n')}
--------------------------------
TOTAL:     ${total.toLocaleString()} DA
${isCredit ? `VERSEMENT:  ${paid.toLocaleString()} DA\nRESTE:      ${(total - paid).toLocaleString()} DA` : `RECU:       ${receivedAmount || total} DA\nRENDU:      ${(Number(receivedAmount || total) - total).toLocaleString()} DA`}
--------------------------------
${isCredit ? `Client: ${clientSnapshot?.name}` : footer || 'Merci de votre visite!'}
                        `;
                        await Repository.printJob(ticket, printer);
                    } else {
                        // Client-side Ticket (Silent Iframe)
                        const ticketHtml = `
                            <html>
                            <body style="font-family:monospace; padding:10px; font-size:12px; width: ${ticketWidth};">
                                <center>
                                    <p style="margin:0; font-weight:bold;">${header}</p>
                                    <h3 style="margin:5px 0">${title}</h3>
                                    <p style="margin:0">${stats.organization.name}</p>
                                    <p style="margin:0; font-size:10px">${new Date().toLocaleString()}</p>
                                </center>
                                <hr style="border-top: 1px dashed black;">
                                ${cartSnapshot.map((i: any) => `<div style="display:flex; justify-content:space-between"><span>${i.quantity}x ${i.name}</span><span>${(i.quantity * i.price).toLocaleString()}</span></div>`).join('')}
                                <hr style="border-top: 1px dashed black;">
                                <div style="display:flex; justify-content:space-between"><b>TOTAL:</b><b>${total.toLocaleString()} DA</b></div>
                                <div style="display:flex; justify-content:space-between"><span>${isCredit ? 'VERS.' : 'RECU'}:</span><span>${(isCredit ? paid : (receivedAmount || total)).toLocaleString()} DA</span></div>
                                <div style="display:flex; justify-content:space-between"><span>${isCredit ? 'RESTE' : 'RENDU'}:</span><span>${(isCredit ? (total - paid) : (Number(receivedAmount || total) - total)).toLocaleString()} DA</div>
                                <hr style="border-top: 1px dashed black;">
                                <center>${isCredit ? `Client: ${clientSnapshot?.name}` : footer || 'Merci de votre visite!'}</center>
                            </body>
                            </html>
                        `;
                        printSilent(ticketHtml);
                    }
                }

                // Clear cart AFTER printing
                setCart([]);
                setCartClient(null);
                setCartPaidAmount("");
                setSelectedPosWarehouse("");
                setReceivedAmount("");
                refreshData();
            } else {
                showMessage("Erreur", (res as any).error || "Une erreur est survenue lors de la vente", "error");
            }
        } catch (error) {
            console.error("handleCheckout error:", error);
            showMessage("Erreur", "Erreur de communication avec le serveur", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Supprimer ce produit ?")) return;
        setLoading(true);
        try {
            const res: any = await Repository.deleteProduct(id);
            if (!res.success && res.error) showMessage("Erreur", res.error, "error");
            else refreshData();
        } catch (error) {
            showMessage("Erreur", "Erreur réseau suppression produit", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSupplier = async (id: string) => {
        if (!confirm("Supprimer ce fournisseur ?")) return;
        setLoading(true);
        try {
            const res = await Repository.deleteSupplier(id);
            if (!res.success) showMessage("Erreur", (res as any).error || "Échec suppression", "error");
            else refreshData();
        } catch (error) {
            showMessage("Erreur", "Erreur réseau suppression fournisseur", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            setLoading(true);
            const res = await Repository.updateOrganization(stats.orgId, {
                name: fd.get("name") as string,
                phone: fd.get("phone") as string,
                address: fd.get("address") as string,
                taxId: fd.get("taxId") as string,
            });
            if (res.success) showMessage("Succès", "Paramètres mis à jour !", "success");
            else showMessage("Erreur", "Échec de la mise à jour", "error");
        } catch (error) {
            showMessage("Erreur", "Erreur serveur paramètres", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoiceFromHistory = () => {
        if (!selectedClient || selectedHistoryTransactions.length === 0) return;

        const selectedTransactions = clientHistory.filter((t: any) => selectedHistoryTransactions.includes(t.id));

        // Aggregate items from all selected transactions
        const itemsMap = new Map<string, { name: string, quantity: number, price: number }>();

        selectedTransactions.forEach((t: any) => {
            try {
                const items = JSON.parse(t.items || "[]");
                items.forEach((item: any) => {
                    if (itemsMap.has(item.name)) {
                        const existing = itemsMap.get(item.name)!;
                        itemsMap.set(item.name, { ...existing, quantity: existing.quantity + item.quantity });
                    } else {
                        itemsMap.set(item.name, { name: item.name, quantity: item.quantity, price: item.price });
                    }
                });
            } catch (e) {
                console.error("Error parsing items for transaction", t.id, e);
            }
        });

        const items = Array.from(itemsMap.values());
        const totalHT = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const tvaRate = 0.19; // 19% standard in Algeria
        const totalTVA = totalHT * tvaRate;
        const totalTTC = totalHT + totalTVA;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>FACTURE - ${selectedClient.name}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.4; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .org-info h1 { margin: 0; color: #000; }
                    .org-info p { margin: 2px 0; font-size: 0.9rem; }
                    .doc-details { text-align: right; }
                    .doc-details h2 { margin: 0; color: #555; }
                    .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    .info-box { background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee; }
                    .info-box h4 { margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #333; color: white; padding: 12px; text-align: left; text-transform: uppercase; font-size: 0.85rem; }
                    td { padding: 12px; border-bottom: 1px solid #eee; }
                    .totals-container { display: flex; justify-content: flex-end; }
                    .totals-table { width: 300px; border-top: 2px solid #333; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .total-row.grand { font-weight: 900; font-size: 1.2rem; border-top: 1px solid #333; margin-top: 10px; padding-top: 15px; }
                    .footer { margin-top: 100px; display: flex; justify-content: space-between; }
                    .stamp-box { border: 1px dashed #ccc; width: 200px; height: 120px; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 0.8rem; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="org-info">
                        <h1>${stats.organization.name || 'SI GESTION'}</h1>
                        <p>${stats.organization.address || 'Adresse non configurée'}</p>
                        <p>Tél: ${stats.organization.phone || '---'}</p>
                        ${stats.organization.taxId ? `<p>NIF/RC: ${stats.organization.taxId}</p>` : ''}
                    </div>
                    <div class="doc-details">
                        <h2>FACTURE</h2>
                        <p>N°: FACT-${new Date().getTime().toString().slice(-6)}</p>
                        <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                <div class="client-info">
                    <div class="info-box">
                        <h4>CLIENT</h4>
                        <p><strong>${selectedClient.name}</strong></p>
                        <p>${selectedClient.address || ''}</p>
                        <p>Tél: ${selectedClient.phone || '---'}</p>
                    </div>
                    ${selectedClient.nif ? `
                    <div class="info-box">
                        <h4>INFORMATIONS FISCALES</h4>
                        <p>NIF: ${selectedClient.nif}</p>
                        <p>NIS: ${selectedClient.nis || '---'}</p>
                        <p>RC: ${selectedClient.rc || '---'}</p>
                    </div>` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Désignation</th>
                            <th style="text-align:center">Qté</th>
                            <th style="text-align:right">P.U HT</th>
                            <th style="text-align:right">Total HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(i => `
                            <tr>
                                <td>${i.name}</td>
                                <td style="text-align:center">${i.quantity}</td>
                                <td style="text-align:right">${i.price.toLocaleString()} DA</td>
                                <td style="text-align:right">${(i.quantity * i.price).toLocaleString()} DA</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-container">
                    <div class="totals-table">
                        <div class="total-row"><span>Total HT:</span><span>${totalHT.toLocaleString()} DA</span></div>
                        <div class="total-row"><span>TVA (19%):</span><span>${totalTVA.toLocaleString()} DA</span></div>
                        <div class="total-row grand"><span>TOTAL TTC:</span><span>${totalTTC.toLocaleString()} DA</span></div>
                    </div>
                </div>

                <p style="margin-top: 30px; font-size: 0.9rem">
                    <strong>Arrêtée la présente facture à la somme de :</strong><br/>
                    ${totalTTC.toLocaleString()} Dinars Algériens.
                </p>

                <div class="footer">
                    <div>
                        <p>Le Client</p>
                        <div class="stamp-box">Signature</div>
                    </div>
                    <div>
                        <p>Service Commercial</p>
                        <div class="stamp-box">Cachet & Signature</div>
                    </div>
                </div>

                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();

        // Clear selection after generation
        setSelectedHistoryTransactions([]);
    };

    const handlePrintClientHistory = (client: any) => {
        const transactions = recentTransactions.filter((t: any) => t.clientId === client.id);
        const totalPurchases = transactions.filter((t: any) => t.type === 'SALE').reduce((acc: number, t: any) => acc + t.totalAmount, 0);
        const totalPayments = transactions.filter((t: any) => t.type === 'PAYMENT').reduce((acc: number, t: any) => acc + t.totalAmount, 0);

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Historique Client - ${client.name}</title>
                <style>
                    @media print {
                        @page { margin: 1cm; }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .client-info {
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    .client-info h2 {
                        margin: 0 0 10px 0;
                        font-size: 20px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background: #333;
                        color: white;
                        font-weight: bold;
                    }
                    .sale { color: #dc2626; }
                    .payment { color: #16a34a; }
                    .summary {
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 8px 0;
                        font-size: 16px;
                    }
                    .summary-row.total {
                        font-weight: bold;
                        font-size: 18px;
                        border-top: 2px solid #333;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${stats.organization?.name || 'Mon Commerce'}</h1>
                    <p>${stats.organization?.address || ''}</p>
                    <p>${stats.organization?.phone || ''}</p>
                </div>

                <div class="client-info">
                    <h2>Historique Client</h2>
                    <div class="info-row">
                        <strong>Nom:</strong>
                        <span>${client.name}</span>
                    </div>
                    ${client.nif ? `<div class="info-row"><strong>NIF:</strong><span>${client.nif}</span></div>` : ''}
                    ${client.nis ? `<div class="info-row"><strong>NIS:</strong><span>${client.nis}</span></div>` : ''}
                    ${client.rc ? `<div class="info-row"><strong>RC:</strong><span>${client.rc}</span></div>` : ''}
                    <div class="info-row">
                        <strong>Téléphone:</strong>
                        <span>${client.phone || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <strong>Date d'impression:</strong>
                        <span>${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</span>
                    </div>
                </div>

                <h3>Transactions</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Mode de Paiement</th>
                            <th style="text-align: right;">Montant (DA)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.length > 0 ? transactions.map((t: any) => `
                            <tr>
                                <td>${new Date(t.createdAt).toLocaleDateString('fr-FR')} ${new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                                <td class="${t.type === 'SALE' ? 'sale' : 'payment'}">${t.type === 'SALE' ? 'Achat' : 'Versement'}</td>
                                <td>${t.paymentMode}</td>
                                <td style="text-align: right;" class="${t.type === 'SALE' ? 'sale' : 'payment'}">
                                    ${t.type === 'SALE' ? '-' : '+'}${t.totalAmount.toLocaleString()} DA
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align: center; opacity: 0.5;">Aucune transaction trouvée</td></tr>'}
                    </tbody>
                </table>

                <div class="summary">
                    <h3 style="margin-top: 0;">Résumé</h3>
                    <div class="summary-row">
                        <span>Total Achats:</span>
                        <span class="sale">${totalPurchases.toLocaleString()} DA</span>
                    </div>
                    <div class="summary-row">
                        <span>Total Versements:</span>
                        <span class="payment">${totalPayments.toLocaleString()} DA</span>
                    </div>
                    <div class="summary-row total">
                        <span>Dette Actuelle:</span>
                        <span style="color: ${client.totalDebt > 0 ? '#dc2626' : '#16a34a'}">${client.totalDebt.toLocaleString()} DA</span>
                    </div>
                </div>

                <script>
                    window.onload = () => {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const isPaid = fd.get("isPaid") === "on";
        const dueDateStr = fd.get("dueDate") as string;
        try {
            setLoading(true);
            const res = await Repository.createExpense({
                label: fd.get("label") as string,
                amount: Number(fd.get("amount")),
                category: fd.get("category") as string,
                orgId: stats.orgId,
                accountId: fd.get("accountId") as string || undefined,
                supplierId: fd.get("supplierId") as string || undefined,
                isPaid: isPaid,
                dueDate: dueDateStr ? new Date(dueDateStr) : undefined
            });
            if (res.success) {
                setShowExpenseModal(false);
                setModalExpenseIsPaid(true);
            }
            else showMessage("Erreur", "Erreur lors de l'ajout de la charge", "error");
        } catch (error) {
            showMessage("Erreur", "Erreur de connexion", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRecurringExpense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
            setLoading(true);
            const res = await Repository.createRecurringExpense({
                label: fd.get("label") as string,
                amount: Number(fd.get("amount")),
                category: fd.get("category") as string,
                frequency: fd.get("frequency") as any,
                startDate: new Date(fd.get("startDate") as string),
                orgId: stats.orgId,
                organizationId: stats.orgId
            });
            if (res.success) {
                showMessage("Succès", "Charge récurrente créée !", "success");
                setShowRecurringExpenseModal(false);
            } else {
                showMessage("Erreur", (res as any).error || "Erreur création", "error");
            }
        } catch (error) {
            showMessage("Erreur", "Erreur réseau", "error");
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: any) => {
        const existingIndex = cart.findIndex(item => item.id === product.id && item.selectedUnit === (product.unit || 'pcs'));
        if (existingIndex > -1) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, {
                ...product,
                quantity: 1,
                selectedUnit: product.unit || 'pcs',
                conversion: 1,
                originalPrice: product.price
            }]);
        }
        // Auto-focus search after adding
        setTimeout(() => document.getElementById("pos-search")?.focus(), 100);
    };

    const handleAddToPurchaseCart = (product: any) => {
        const existing = purchaseCart.find(i => i.id === product.id);
        if (existing) {
            setPurchaseCart(purchaseCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setPurchaseCart([...purchaseCart, { id: product.id, name: product.name, quantity: 1, cost: product.lastCost || 0, price: product.price || 0 }]);
        }
    };

    const handleUpdatePurchaseCartItem = (index: number, field: string, value: any) => {
        const newCart = [...purchaseCart];
        newCart[index][field] = value;
        setPurchaseCart(newCart);
    };

    const handleProcessPurchase = async () => {
        if (purchaseCart.length === 0) return;
        setLoading(true);
        try {
            const res = await Repository.recordPurchase({
                supplierId: purchaseSupplier?.id,
                items: purchaseCart,
                paidAmount: Number(purchasePaidAmount) || 0,
                accountId: selectedPurchaseAccount,
                warehouseId: selectedPosWarehouse || stats.warehouses[0]?.id,
                orgId: stats.orgId,
                organizationId: stats.orgId
            });

            if (res.success) {
                showMessage("Succès", "Bon d'achat enregistré et stock mis à jour.", "success");

                // --- PRINTING LOGIC ---
                const purchaseSnapshot = [...purchaseCart];
                const supplierSnapshot = purchaseSupplier;
                const paidSnapshot = Number(purchasePaidAmount) || 0;
                const total = purchaseSnapshot.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

                showConfirm("Impression", "Voulez-vous imprimer le Bon d'Achat ?", () => {
                    const title = "BON D'ACHAT";
                    const printer = stats.organization?.printerA4; // Use A4 printer for Purchase Orders

                    const contentHtml = `
                        <html>
                        <head>
                            <title>${title}</title>
                            <style>
                                body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                                .company-info h1 { margin: 0; color: #1a365d; }
                                .document-title { text-align: right; }
                                .document-title h2 { margin: 0; color: #718096; text-transform: uppercase; }
                                .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                                .details h4 { margin-bottom: 10px; color: #4a5568; border-bottom: 1px solid #edf2f7; padding-bottom: 5px; }
                                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #edf2f7; font-size: 0.9rem; }
                                td { padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 0.95rem; }
                                .footer { margin-top: 50px; display: flex; justify-content: flex-end; }
                                .totals-box { width: 300px; background: #f8fafc; padding: 20px; borderRadius: 10px; }
                                .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                                .total-row.grand-total { border-top: 2px solid #e2e8f0; paddingTop: 10px; margin-top: 10px; font-weight: bold; font-size: 1.2rem; }
                                .signature-area { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 100px; text-align: center; font-size: 0.8rem; }
                                .signature-box { border-top: 1px dashed #cbd5e0; padding-top: 10px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <div class="company-info">
                                    <h1>${stats.organization.name || 'GESTION SYSTÈME'}</h1>
                                    <p>${stats.organization.address || ''}<br>${stats.organization.phone || ''}</p>
                                </div>
                                <div class="document-title">
                                    <h2>${title}</h2>
                                    <p>Date: ${new Date().toLocaleDateString()}</p>
                                    <p>N°: BA-${Date.now().toString().slice(-6)}</p>
                                </div>
                            </div>

                            <div class="details">
                                <div class="supplier-info">
                                    <h4>FOURNISSEUR</h4>
                                    <p><strong>${supplierSnapshot?.name || 'Comptant / Divers'}</strong></p>
                                    <p>${supplierSnapshot?.phone || ''}</p>
                                    <p>${supplierSnapshot?.address || ''}</p>
                                </div>
                                <div class="payment-info">
                                    <h4>INFORMATIONS</h4>
                                    <p>Mode de paiement: Espèces / Caisse</p>
                                    <p>Statut: ${paidSnapshot >= total ? 'PAYÉ' : 'CRÉDIT PARTIEL'}</p>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>ARTICLE</th>
                                        <th style="text-align: center">QUANTITÉ</th>
                                        <th style="text-align: right">P.U ACHAT</th>
                                        <th style="text-align: right">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${purchaseSnapshot.map(item => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td style="text-align: center">${item.quantity}</td>
                                            <td style="text-align: right">${item.cost.toLocaleString()} DA</td>
                                            <td style="text-align: right">${(item.cost * item.quantity).toLocaleString()} DA</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>

                            <div class="footer">
                                <div class="totals-box">
                                    <div class="total-row">
                                        <span>TOTAL HT:</span>
                                        <span>${total.toLocaleString()} DA</span>
                                    </div>
                                    <div class="total-row">
                                        <span>NET À PAYER:</span>
                                        <span>${total.toLocaleString()} DA</span>
                                    </div>
                                    <div class="total-row">
                                        <span>VERSÉ:</span>
                                        <span>${paidSnapshot.toLocaleString()} DA</span>
                                    </div>
                                    <div class="total-row grand-total">
                                        <span>RESTE:</span>
                                        <span>${(total - paidSnapshot).toLocaleString()} DA</span>
                                    </div>
                                </div>
                            </div>

                            <div class="signature-area">
                                <div class="signature-box">Signature Fournisseur</div>
                                <div class="signature-box">Cachet & Signature Magasinier</div>
                            </div>
                            
                            <script>
                                window.onload = () => {
                                    window.print();
                                    setTimeout(() => window.close(), 1000);
                                };
                            </script>
                        </body>
                        </html>
                    `;

                    if (printer) {
                        // Attempt server-side print if printer configured
                        Repository.printJob(contentHtml, printer);
                    } else {
                        // Fallback to client-side window
                        const win = window.open('', '_blank');
                        if (win) {
                            win.document.open();
                            win.document.write(contentHtml);
                            win.document.close();
                        }
                    }
                });

                setPurchaseCart([]);
                setPurchasePaidAmount("");
                setPurchaseSupplier(null);
            } else {
                showMessage("Erreur", (res as any).error || "Échec de l'enregistrement", "error");
            }
        } catch (error) {
            showMessage("Erreur", "Erreur réseau lors de l'achat", "error");
        } finally {
            setLoading(false);
        }
    };
    const updateItemUnit = (index: number, unitName: string) => {
        const newCart = [...cart];
        const item = newCart[index];

        if (unitName === item.unit) { // Base unit
            item.selectedUnit = item.unit;
            item.conversion = 1;
            item.price = item.originalPrice;
        } else {
            const unitDef = item.units?.find((u: any) => u.unitName === unitName);
            if (unitDef) {
                item.selectedUnit = unitName;
                item.conversion = unitDef.conversion;
                item.price = unitDef.sellPrice || (item.originalPrice * unitDef.conversion);
            }
        }
        setCart(newCart);
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
            if (lines.length < 2) return showMessage("Erreur", "Fichier vide ou invalide", "error");

            // Identify separator
            const headerLine = lines[0];
            const separator = headerLine.includes(';') ? ';' : ',';
            const rawHeaders = headerLine.split(separator).map(h => h.trim());

            // Normalize headers for easier mapping
            const normalizedHeaders = rawHeaders.map(h => h.toLowerCase()
                .replace(/\s+/g, '')
                .replace('produit', '')
                .replace('article', '')
                .replace('barcode', 'codebarres')
                .replace('pachat', 'prixachat')
                .replace('pvente', 'prixvente')
                .replace('qty', 'stock')
                .replace('quantite', 'stock')
            );

            const products = lines.slice(1).map(line => {
                const values = line.split(separator).map(v => v.trim());
                const obj: any = {};

                // Flexible mapping
                rawHeaders.forEach((h, i) => {
                    const normalized = normalizedHeaders[i];
                    if (normalized === 'nom' || normalized === 'name') obj.Nom = values[i];
                    else if (normalized === 'sku') obj.SKU = values[i];
                    else if (normalized === 'codebarres' || normalized === 'barcode') obj.CodeBarres = values[i];
                    else if (normalized === 'categorie' || normalized === 'category') obj.Categorie = values[i];
                    else if (normalized === 'prixachat' || normalized === 'cost') obj.PrixAchat = values[i];
                    else if (normalized === 'prixvente' || normalized === 'price') obj.PrixVente = values[i];
                    else if (normalized === 'stock' || normalized === 'qty' || normalized === 'quantity') obj.Stock = values[i];
                    else if (normalized === 'unite' || normalized === 'unit') obj.Unite = values[i];
                    else if (normalized === 'stockmin' || normalized === 'minstock') obj.StockMin = values[i];
                    else obj[h] = values[i]; // Fallback
                });
                return obj;
            });

            // Filter out invalid products (must have a name)
            const validProducts = products.filter(p => p.Nom);

            if (validProducts.length === 0) {
                return showMessage("Erreur", "Aucun produit valide trouvé. Vérifiez les entêtes (Nom, SKU, etc.)", "error");
            }

            showConfirm("Confirmation", `Importer ${validProducts.length} produits ?`, async () => {
                setLoading(true);
                try {
                    const res = await Repository.importProducts(validProducts, stats.orgId);
                    if (res.success && res.results) {
                        showMessage("Succès", `Importation réussie !\nSuccès: ${res.results.success}\nÉchecs: ${res.results.failed}`, "success");
                        if (res.results.errors && res.results.errors.length > 0) {
                            console.error("Erreurs import:", res.results.errors);
                        }
                    } else {
                        showMessage("Erreur", res.error || "Erreur lors de l'importation", "error");
                    }
                } catch (err: any) {
                    showMessage("Erreur", "Erreur de communication avec le serveur", "error");
                    console.error(err);
                } finally {
                    setLoading(false);
                    // Reset file input
                    e.target.value = '';
                }
            });
        };
        reader.readAsText(file);
    };

    // Calculate Financials
    const totalExpenses = stats.expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = stats.todaySales - totalExpenses;

    return (
        <div className={`main-layout ${barcodePreview ? 'print-barcode-mode' : ''} ${showPayrollModal.show ? 'print-payroll-mode' : ''}`}>
            <style jsx global>{`
                @media print {
                    /* Hide everything by default for precision */
                    body { visibility: hidden !important; background: white !important; }
                    
                    /* Reset everything in main-layout to hidden */
                    .main-layout * { visibility: hidden !important; }

                    /* Common logic for Print Targets */
                    .print-only, #thermal-label, .printable-card,
                    .print-only *, #thermal-label *, .printable-card * {
                        visibility: visible !important;
                    }

                    /* Handle Modal Overlays during print */
                    .modal-overlay { 
                        visibility: visible !important; 
                        background: transparent !important;
                        position: absolute !important;
                        top: 0 !important; left: 0 !important;
                        width: 100% !important; height: 100% !important;
                        display: block !important;
                    }

                    /* Positioning and Layout */
                    #thermal-label, .print-only, .printable-card { 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        display: block !important;
                        box-shadow: none !important;
                        border: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }

                    .print-barcode-mode #thermal-label {
                        width: 50mm !important; /* Standard label size */
                        padding: 0 !important;
                    }
                    
                    #thermal-label, .print-only { width: 80mm !important; }

                    /* Context-specific hiding to prevent overlaps */
                    .print-barcode-mode .print-only, .print-barcode-mode .printable-card:not(.premium-card) { display: none !important; }
                    .print-payroll-mode .print-only, .print-payroll-mode #thermal-label { display: none !important; }
                    
                    /* If no specific mode, hide the modals and show the pocket ticket */
                    .main-layout:not(.print-barcode-mode):not(.print-payroll-mode) .modal-overlay { display: none !important; }
                }
                .print-only { display: none; }
                
                @keyframes pulse-red {
                    0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0.7)); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 10px rgba(239, 68, 68, 1)); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0)); }
                }
                .low-stock {
                    animation: pulse-red 2s infinite;
                    display: inline-block;
                }
            `}</style>
            <style>{`
                @media (max-width: 900px) {
                    #pos-area {
                        grid-template-columns: 1fr 300px !important;
                        gap: 0.8rem !important;
                    }
                }
                @media (max-width: 600px) {
                    #pos-area {
                        grid-template-columns: 1fr 220px !important;
                        gap: 0.5rem !important;
                    }
                    /* Keep 2 columns but scale everything down */
                    #pos-area .premium-card {
                        padding: 8px !important;
                    }
                    #pos-area h4 { font-size: clamp(0.5rem, 2vw, 0.8rem) !important; }
                    #pos-area .text-primary { font-size: clamp(0.7rem, 2.5vw, 1.1rem) !important; }
                    #pos-area .text-muted { font-size: 0.6rem !important; }
                    #pos-area select, #pos-area input { font-size: 0.7rem !important; padding: 4px !important; }
                    #pos-area .btn-primary, #pos-area .glass { font-size: 0.7rem !important; padding: 6px !important; }
                    
                    /* Adjust Image Height */
                    #pos-area .glass > div:first-child { height: 60px !important; }
                    #pos-area .cart-items { gap: 0.3rem !important; }
                    #pos-area .cart-item-info { font-size: 0.75rem !important; }
                }
                #pos-area {
                    height: calc(100vh - 180px);
                    max-height: calc(100vh - 180px);
                }
                .is-fullscreen #pos-area {
                    height: 100vh;
                    max-height: 100vh;
                }
                .cart-items {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding-right: 5px;
                }
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 1rem;
                    overflow-y: auto;
                    flex: 1;
                    padding-right: 5px;
                }
            `}</style>

            {/* Sidebar */}
            <aside className="sidebar no-print" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
                <div style={{ padding: '0 1rem' }}>
                    <h1 className="text-primary-gradient" style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>IDEAL GESTION</h1>
                    <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '5px' }}>Premium SaaS</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredSidebarLinks.map(link => (
                        <div
                            key={link.id}
                            onClick={() => setActiveTab(link.id)}
                            className={`nav-link ${activeTab === link.id ? 'active' : ''}`}
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ color: activeTab === link.id ? 'var(--primary)' : 'var(--foreground-muted)' }}>
                                <link.icon size={20} strokeWidth={activeTab === link.id ? 2.5 : 1.5} />
                            </div>
                            <span style={{ color: activeTab === link.id ? 'var(--primary-dark)' : 'var(--foreground)' }}>{link.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem' }}>
                    {/* Sync Status Indicator */}
                    <div style={{ marginBottom: '1rem' }}>
                        <SyncStatusIndicator />
                    </div>

                    <div className="glass" style={{ padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--primary-fade)', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 5px var(--success)' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{currentUser?.role?.name || stats.user?.role || 'Utilisateur'} en ligne</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)' }}>{currentUser?.name || stats.userName}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>{stats.organization?.name || stats.orgName}</span>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
                                    await logout();
                                }
                            }}
                            className="glass text-accent"
                            style={{ padding: '8px', borderRadius: '12px', marginTop: '10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <LogOut size={14} /> DÉCONNEXION
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <section className="content-area">
                {/* Visual Ticket for Printing - Dynamic Data */}
                <div className="print-only" style={{ width: '80mm', padding: '10px', color: 'black', background: 'white', fontFamily: 'monospace', fontSize: '12px' }}>
                    <center>
                        <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase' }}>{stats.organization?.name || stats.orgName}</h2>
                        {stats.organization?.address && <p style={{ margin: 0 }}>{stats.organization.address}</p>}
                        {stats.organization?.phone && <p style={{ margin: 0 }}>Tél: {stats.organization.phone}</p>}
                        {stats.organization?.taxId && <p style={{ margin: 0 }}>RC/NIF: {stats.organization.taxId}</p>}
                        <p>--------------------------------</p>
                        <p style={{ fontWeight: 'bold' }}>TICKET DE CAISSE</p>
                        <p>{currentDate}</p>
                        <p>--------------------------------</p>
                    </center>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px dashed #ccc' }}>
                                <th style={{ textAlign: 'left' }}>ART</th>
                                <th style={{ textAlign: 'right' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id}>
                                    <td style={{ padding: '4px 0' }}>{item.quantity}x {item.name}</td>
                                    <td style={{ textAlign: 'right' }}>{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p>--------------------------------</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                        <span>A PAYER:</span>
                        <span>{cart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()} DA</span>
                    </div>
                    <p>--------------------------------</p>
                    <center>
                        <p>Merci de votre confiance !</p>
                        <p style={{ fontSize: '10px' }}>Système IDÉAL GESTION</p>
                    </center>
                </div>

                {/* Top Header */}
                <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 className="text-primary-dark" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{sidebarLinks.find(l => l.id === activeTab)?.label}</h2>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>{stats.organization?.name || stats.orgName}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {stats.allUsers.length > 1 && (
                            <button
                                title="Changer d'utilisateur"
                                className="glass"
                                onClick={logoutPIN}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '12px 20px', background: 'white' }}
                            >
                                <Users size={20} className="text-warning" />
                                <span className="text-primary-dark" style={{ fontWeight: 600 }}>Session: {currentUser?.name || currentUser?.email}</span>
                            </button>
                        )}
                        {/* Force visible for testing */}
                        {isSuperAdmin && (
                            <button
                                title="Administration"
                                className="glass"
                                onClick={() => setActiveTab('admin')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '12px 20px', background: 'white' }}
                            >
                                <ShieldCheck size={20} className="text-primary" />
                                <span className="text-primary-dark" style={{ fontWeight: 600 }}>Administration {stats.user?.isSystemAdmin ? '(SA)' : ''} [{stats.user?.email}]</span>
                            </button>
                        )}
                    </div>
                </header>

                {activeTab === "dashboard" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="no-print">
                        {/* Financial Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="premium-card">
                                <div style={{ background: 'var(--success-bg)', width: 'fit-content', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                                    <TrendingUp className="text-success" size={24} />
                                </div>
                                <p className="text-muted" style={{ margin: '0', fontSize: '0.85rem' }}>Ventes Aujourd'hui</p>
                                <h3 className="font-black text-success" style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>{stats.todaySales.toLocaleString()} DA</h3>
                            </div>
                            <div className="premium-card">
                                <div style={{ background: 'var(--danger-bg)', width: 'fit-content', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                                    <ArrowDownCircle className="text-danger" size={24} />
                                </div>
                                <p className="text-muted" style={{ margin: '0', fontSize: '0.85rem' }}>Charges (Dépenses)</p>
                                <h3 className="font-black text-danger" style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>{totalExpenses.toLocaleString()} DA</h3>
                            </div>
                            <div className="premium-card">
                                <div style={{ background: 'var(--primary-fade)', width: 'fit-content', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                                    <Wallet className="text-primary" size={24} />
                                </div>
                                <p className="text-muted" style={{ margin: '0', fontSize: '0.85rem' }}>Bénéfice Net</p>
                                <h3 className={`font-black ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`} style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>{netProfit.toLocaleString()} DA</h3>
                            </div>
                            <div className="premium-card">
                                <div style={{ background: 'var(--warning-bg)', width: 'fit-content', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
                                    <AlertCircle className="text-warning" size={24} />
                                </div>
                                <p className="text-muted" style={{ margin: '0', fontSize: '0.85rem' }}>Dettes Globales</p>
                                <h3 className="font-black text-warning" style={{ margin: '0.5rem 0', fontSize: '1.8rem' }}>{stats.clients.reduce((acc, c) => acc + c.totalDebt, 0).toLocaleString()} DA</h3>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
                            <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Alert for Overdue Programmed Expenses */}
                                {stats.expenses?.filter((e: any) => !e.isPaid && e.dueDate && new Date(e.dueDate) <= new Date(new Date().setHours(23, 59, 59, 999))).length > 0 && (
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px', border: '1px solid var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}
                                    >
                                        <div style={{ background: 'var(--danger)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AlertCircle color="white" size={24} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>Charges en attente !</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Vous avez {stats.expenses.filter((e: any) => !e.isPaid && e.dueDate && new Date(e.dueDate) <= new Date(new Date().setHours(23, 59, 59, 999))).length} charge(s) programmée(s) à régler aujourd'hui ou en retard.</div>
                                        </div>
                                        <button onClick={() => { setActiveTab('finance'); setFinanceSubTab('recurring'); }} className="glass" style={{ padding: '8px 15px', fontSize: '0.75rem' }}>Voir les charges</button>
                                    </motion.div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Activités Récentes</h3>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {['day', 'week', 'month'].map((f: any) => (
                                                <button
                                                    key={f}
                                                    onClick={() => setActivityFilter(f)}
                                                    className="glass"
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: activityFilter === f ? 800 : 600,
                                                        cursor: 'pointer',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        border: activityFilter === f ? '1px solid var(--primary)' : '1px solid transparent',
                                                        background: activityFilter === f ? 'var(--primary-fade)' : 'white',
                                                        color: activityFilter === f ? 'var(--primary)' : 'var(--muted)',
                                                        boxShadow: activityFilter === f ? '0 4px 12px rgba(var(--primary-rgb), 0.15)' : 'none',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    {f === 'day' ? 'Jour' : f === 'week' ? 'Semaine' : 'Mois'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => setShowExpenseModal(true)} className="glass text-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600 }}>+ Charge</button>
                                        <button onClick={() => setActiveTab('pos')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>+ Vente</button>
                                    </div>
                                </div>

                                <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
                                    {recentTransactions
                                        .filter((t: any) => {
                                            const now = new Date();
                                            const tDate = new Date(t.createdAt);
                                            if (activityFilter === 'day') {
                                                return tDate.toDateString() === now.toDateString();
                                            }
                                            if (activityFilter === 'week') {
                                                const weekAgo = new Date();
                                                weekAgo.setDate(now.getDate() - 7);
                                                return tDate >= weekAgo;
                                            }
                                            if (activityFilter === 'month') {
                                                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
                                            }
                                            return true;
                                        })
                                        .map((t: any) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={t.id}
                                                className="glass"
                                                style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center', background: 'var(--bg-deep)', boxShadow: 'none', border: '1px solid var(--border)' }}
                                            >
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <div className={t.type === 'SALE' ? 'badge-success' : 'badge-warning'} style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        {t.type === 'SALE' ? <ShoppingCart size={18} /> : <Receipt size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-primary-dark" style={{ margin: 0, fontSize: '0.95rem' }}>{t.type === 'SALE' ? 'Vente Boutique' : 'Règlement Dette'}</p>
                                                        <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>{new Date(t.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p className={`font-bold ${t.type === 'SALE' ? 'text-success' : 'text-primary'}`} style={{ margin: 0, fontSize: '1rem' }}>+{t.totalAmount.toLocaleString()} DA</p>
                                                    <span className="badge" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.7rem', marginTop: '5px', color: 'var(--text-muted)' }}>{t.paymentMode}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    {recentTransactions.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Aucune activité récente</p>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="premium-card">
                                    <h3 style={{ color: 'var(--primary-dark)', margin: 0, fontSize: '1.1rem' }}>Répartition des Charges</h3>
                                    <div className="custom-scroll" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
                                        {stats.expenses.map((e: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '10px', borderBottom: '1px solid var(--border)' }}>
                                                <span className="text-muted">{e.label}</span>
                                                <b className="font-bold text-danger">{e.amount.toLocaleString()} DA</b>
                                            </div>
                                        ))}
                                        {stats.expenses.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Aucune charge saisie</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- PURCHASES (ACHATS) MODULE --- */}
                {activeTab === "purchases" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                            {/* Left: Product Search and Selection */}
                            <div className="premium-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3>Nouveau Bon d'Achat</h3>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => { setCreationContext('purchase'); setShowProductModal(true); }} className="glass text-primary"><Plus size={18} /> Nouveau Produit</button>
                                        <button onClick={() => { setCreationContext('purchase'); setShowSupplierModal({ show: true }); }} className="glass text-accent"><Plus size={18} /> Nouveau Fournisseur</button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                        <input
                                            title="Recherche Produit"
                                            placeholder="Chercher un produit à approvisionner..."
                                            value={purchaseSearch}
                                            onChange={(e) => setPurchaseSearch(e.target.value)}
                                            style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', padding: '15px 15px 15px 50px', borderRadius: '15px', color: 'white' }}
                                        />
                                    </div>
                                    <div className="custom-scroll" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                                        {products
                                            .filter((p: any) => p.name.toLowerCase().includes(purchaseSearch.toLowerCase()) || p.barcode?.includes(purchaseSearch))
                                            .slice(0, 10)
                                            .map((p: any) => (
                                                <button key={p.id} onClick={() => handleAddToPurchaseCart(p)} className="glass hover-row" style={{ padding: '15px', borderRadius: '12px', textAlign: 'left', border: '1px solid var(--border)' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '5px' }}>Stock: {p.stock} {p.unit}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '2px' }}>DPA: {p.lastCost.toLocaleString()} DA</div>
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                <div className="custom-scroll" style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.5, textAlign: 'left', fontSize: '0.8rem' }}>
                                                <th style={{ padding: '10px' }}>Produit</th>
                                                <th style={{ padding: '10px' }}>Qte</th>
                                                <th style={{ padding: '10px' }}>P.Achat</th>
                                                <th style={{ padding: '10px' }}>P.Vente</th>
                                                <th style={{ padding: '10px' }}>Total</th>
                                                <th style={{ padding: '10px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchaseCart.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '10px', fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <input
                                                            title="Quantité"
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleUpdatePurchaseCartItem(idx, 'quantity', Number(e.target.value))}
                                                            style={{ width: '65px', background: 'var(--glass)', border: '1px solid var(--border)', padding: '5px', borderRadius: '5px', color: 'white', textAlign: 'center' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <input
                                                            title="Coût"
                                                            type="number"
                                                            value={item.cost}
                                                            onChange={(e) => handleUpdatePurchaseCartItem(idx, 'cost', Number(e.target.value))}
                                                            style={{ width: '90px', background: 'var(--glass)', border: '1px solid var(--border)', padding: '5px', borderRadius: '5px', color: 'white', textAlign: 'center' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <input
                                                            title="Prix Vente"
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => handleUpdatePurchaseCartItem(idx, 'price', Number(e.target.value))}
                                                            style={{ width: '90px', background: 'var(--glass)', border: '1px solid var(--border)', padding: '5px', borderRadius: '5px', color: 'white', textAlign: 'center' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px', fontWeight: 700 }}>{(item.cost * item.quantity).toLocaleString()}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <button title="Supprimer" onClick={() => setPurchaseCart(purchaseCart.filter((_, i) => i !== idx))} className="text-danger glass" style={{ padding: '5px' }}><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {purchaseCart.length === 0 && (
                                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', opacity: 0.3 }}>Recherchez des produits pour commencer l'achat.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right: Supplier and Checkout */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="premium-card">
                                    <h4 style={{ marginBottom: '1.5rem' }}>Détails de l'Achat</h4>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="text-muted" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '5px' }}>Fournisseur</label>
                                        <select
                                            title="Sélectionner Fournisseur"
                                            className="glass"
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', color: 'white' }}
                                            value={purchaseSupplier?.id || ""}
                                            onChange={(e) => setPurchaseSupplier(stats.suppliers.find(s => s.id === e.target.value))}
                                        >
                                            <option value="">-- Sélectionner --</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 0', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span className="text-muted">Total Achat</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{purchaseCart.reduce((sum, item) => sum + (item.cost * item.quantity), 0).toLocaleString()} DA</span>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="text-muted" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '5px' }}>Versé (Caisse)</label>
                                        <input
                                            title="Versement"
                                            type="number"
                                            placeholder="Montant payé..."
                                            className="glass font-bold"
                                            value={purchasePaidAmount}
                                            onChange={(e) => setPurchasePaidAmount(e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', color: 'var(--success)', fontSize: '1.1rem' }}
                                        />
                                    </div>

                                    {Number(purchasePaidAmount) > 0 && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label className="text-muted" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '5px' }}>Compte de Paiement</label>
                                            <select
                                                title="Compte de Paiement"
                                                className="glass"
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', color: 'white' }}
                                                value={selectedPurchaseAccount}
                                                onChange={(e) => setSelectedPurchaseAccount(e.target.value)}
                                            >
                                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid var(--danger)', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                                            <span style={{ fontSize: '0.7rem' }}>DETTE GÉNÉRÉE</span>
                                            <b style={{ fontSize: '1.1rem' }}>{Math.max(0, purchaseCart.reduce((sum, item) => sum + (item.cost * item.quantity), 0) - Number(purchasePaidAmount)).toLocaleString()} DA</b>
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading || purchaseCart.length === 0}
                                        onClick={handleProcessPurchase}
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '1.2rem', fontWeight: 900, fontSize: '1rem' }}
                                    >
                                        {loading ? "TRAITEMENT..." : "VALIDER LA RÉCEPTION"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- POS TAB --- */}
                {activeTab === "pos" && (
                    <motion.div id="pos-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 380px',
                        gap: '1.5rem',
                        height: isFullScreen ? '100vh' : 'calc(100vh - 200px)',
                        background: isFullScreen ? 'var(--bg-deep)' : 'transparent',
                        padding: isFullScreen ? '20px' : '0'
                    }} className="no-print">
                        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden', background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--primary)' }} size={18} />
                                    <input
                                        id="pos-search"
                                        autoFocus
                                        value={posSearch}
                                        onChange={(e) => setPosSearch(e.target.value)}
                                        placeholder="Scanner ou chercher (Alt+F)..."
                                        style={{ width: '100%', paddingLeft: '3rem', fontSize: '1.1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                    />
                                </div>
                                <button onClick={toggleFullScreen} title="Plein Écran" className="glass" style={{ padding: '12px', borderRadius: '12px', color: 'var(--primary-dark)' }}>
                                    {isFullScreen ? <X size={20} /> : <Zap size={20} />}
                                </button>
                                <button onClick={() => setShowQuickExpense(true)} title="Sortie Caisse" className="glass text-warning" style={{ padding: '12px', borderRadius: '12px' }}>
                                    <Minus size={20} />
                                </button>
                                <button onClick={async () => {
                                    setLoading(true);
                                    const res = await Repository.getZReportData(stats.orgId) as any;
                                    setLoading(false);
                                    if (res.success) {
                                        setZReportData(res.data);
                                        setShowZReportModal(true);
                                    } else {
                                        showMessage("Erreur", "Erreur récupération données: " + (res as any).error, "error");
                                    }
                                }} title="Clôture Caisse (Z)" className="glass text-primary" style={{ padding: '12px', borderRadius: '12px' }}>
                                    <FileText size={20} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                <button
                                    onClick={() => setPosCategory('all')}
                                    className={posCategory === 'all' ? 'btn-primary' : 'glass'}
                                    style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem', whiteSpace: 'nowrap', boxShadow: posCategory === 'all' ? 'var(--shadow-md)' : 'none' }}
                                >
                                    Tous
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setPosCategory(cat.id)}
                                        className={posCategory === cat.id ? 'btn-primary' : 'glass'}
                                        style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem', whiteSpace: 'nowrap', boxShadow: posCategory === cat.id ? 'var(--shadow-md)' : 'none' }}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="product-grid">
                                {products
                                    .filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.barcode?.includes(posSearch))
                                    .filter(p => posCategory === 'all' || p.categoryId === posCategory)
                                    .map(product => {
                                        const stockToShow = selectedPosWarehouse
                                            ? (product.warehouseStock?.find((ws: any) => ws.warehouseId === selectedPosWarehouse)?.quantity || 0)
                                            : product.stock;

                                        return (
                                            <motion.div key={product.id} whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }} whileTap={{ scale: 0.95 }} onClick={() => addToCart(product)} className="glass" style={{ padding: '1rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--border)' }}>
                                                <div style={{ width: '100%', height: '120px', marginBottom: '12px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Package size={32} className="text-muted" style={{ opacity: 0.5 }} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.9rem', marginBottom: '5px', lineHeight: '1.2', color: 'var(--primary-dark)' }}>{product.name}</h4>
                                                    <div>
                                                        <p className="font-black text-primary" style={{ margin: '4px 0', fontSize: '1.2rem' }}>{product.price.toLocaleString()} DA</p>
                                                        <div style={{ fontSize: '0.75rem', opacity: stockToShow <= 0 ? 0.5 : 0.8 }} className={stockToShow <= (product.minStock || 5) ? 'text-danger' : 'text-muted'}>
                                                            {stockToShow} {product.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                            </div>

                            {heldCarts.length > 0 && (
                                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.5, alignSelf: 'center' }}>Attente:</span>
                                    {heldCarts.map((hc, i) => (hc && hc.length > 0 && (
                                        <button key={i} onClick={() => resumeCart(i)} className="glass" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', whiteSpace: 'nowrap', border: '1px solid var(--warning)', color: 'var(--warning-dark)' }}>
                                            Panier #{i + 1} ({hc.length} art.)
                                        </button>
                                    )))}
                                </div>
                            )}
                        </div>

                        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Vente Actuelle</h3>
                                <button onClick={holdCurrentCart} disabled={cart.length === 0} className="glass" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>Mettre en Attente</button>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <select
                                        title="Client"
                                        value={cartClient?.id || ""}
                                        onChange={(e) => {
                                            const client = stats.clients.find(c => c.id === e.target.value);
                                            setCartClient(client || null);
                                        }}
                                        style={{ width: '100%', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}
                                    >
                                        <option value="">-- Client Anonyme --</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 0.8 }}>
                                    <select
                                        title="Dépôt"
                                        value={selectedPosWarehouse}
                                        onChange={(e) => setSelectedPosWarehouse(e.target.value)}
                                        style={{ width: '100%', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}
                                    >
                                        <option value="">-- Dépôt Principal --</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="cart-items">
                                {cart.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="glass" style={{ padding: '0.8rem', borderRadius: '12px', flexShrink: 0, background: 'white', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <b className="cart-item-info" style={{ color: 'var(--primary-dark)' }}>{item.name}</b>
                                            <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} title="Retirer du panier" style={{ background: 'none', border: 'none', color: 'var(--danger)', opacity: 0.5, cursor: 'pointer' }}><X size={14} /></button>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newCart = [...cart];
                                                        newCart[idx].quantity = Number(e.target.value);
                                                        setCart(newCart);
                                                    }}
                                                    style={{ width: '50px', padding: '4px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px' }}
                                                />
                                                <select
                                                    value={item.selectedUnit}
                                                    onChange={(e) => updateItemUnit(idx, e.target.value)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 'bold', padding: 0 }}
                                                >
                                                    <option value={item.unit}>{item.unit}</option>
                                                    {item.units?.map((u: any) => <option key={u.unitName} value={u.unitName}>{u.unitName}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className="font-black text-primary-dark" style={{ fontSize: '0.9rem' }}>{(item.price * item.quantity).toLocaleString()} DA</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                        <ShoppingCart size={48} className="text-muted" />
                                        <p className="text-muted">Panier Vide</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 900 }}>
                                    <span className="text-muted">TOTAL</span>
                                    <span className="text-primary">{cart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()} DA</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Montant Reçu</label>
                                        <input
                                            type="number"
                                            value={receivedAmount}
                                            onChange={(e) => setReceivedAmount(e.target.value)}
                                            placeholder="Ex: 2000"
                                            style={{ width: '100%', fontSize: '1.1rem', fontWeight: 'bold', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Rendu (Monnaie)</label>
                                        <div className="text-success font-black" style={{ fontSize: '1.5rem', marginTop: '5px' }}>
                                            {receivedAmount ? (Number(receivedAmount) - cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)).toLocaleString() : 0} DA
                                        </div>
                                    </div>
                                </div>

                                {cartClient && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Versé (si crédit)</label>
                                            <input
                                                type="number"
                                                value={cartPaidAmount}
                                                onChange={(e) => setCartPaidAmount(e.target.value)}
                                                placeholder="Montant..."
                                                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Compte d'Encaissement</label>
                                            <select
                                                value={selectedPosAccount}
                                                onChange={(e) => setSelectedPosAccount(e.target.value)}
                                                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px' }}
                                            >
                                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {!cartClient && (
                                    <div>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Compte d'Encaissement</label>
                                        <select
                                            value={selectedPosAccount}
                                            onChange={(e) => setSelectedPosAccount(e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px' }}
                                        >
                                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <button
                                        disabled={cart.length === 0}
                                        onClick={handleCheckout}
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 900, boxShadow: '0 10px 20px rgba(74, 144, 255, 0.3)' }}
                                    >
                                        ENCAISSER
                                    </button>
                                    <button
                                        disabled={cart.length === 0 || loading}
                                        onClick={handlePrintProforma}
                                        className="glass text-primary-dark"
                                        style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 900, background: 'var(--bg-card)' }}
                                    >
                                        PRO-FORMA
                                    </button>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '0.65rem', opacity: 0.4 }}>Shortcut: Ctrl + Enter to validate quickly</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- CRM Module (Client Details/List) --- */}
                {activeTab === "clients" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                        {selectedClient ? (
                            <div className="premium-card" style={{ background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                                    <button onClick={() => setSelectedClient(null)} className="glass" style={{ padding: '8px', color: 'var(--primary)' }}><ChevronRight style={{ transform: 'rotate(180deg)' }} /></button>
                                    <div>
                                        <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>Détails Client : {selectedClient.name}</h2>
                                        <p className="text-muted" style={{ margin: 0 }}>Historique des achats et crédits</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Dette Actuelle</p>
                                        <h3 className={`font-black ${selectedClient.totalDebt > 0 ? 'text-danger' : 'text-success'}`} style={{ margin: '5px 0', fontSize: '1.8rem' }}>{selectedClient.totalDebt.toLocaleString()} DA</h3>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ color: 'var(--primary-dark)' }}>Dernières opérations</h3>
                                    {selectedHistoryTransactions.length > 0 && (
                                        <button
                                            onClick={() => handleGenerateInvoiceFromHistory()}
                                            className="btn-primary"
                                            style={{ padding: '8px 15px', fontSize: '0.8rem' }}
                                        >
                                            <FileText size={14} style={{ marginRight: '5px' }} />
                                            Générer Facture ({selectedHistoryTransactions.length})
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {clientHistory.map((t: any) => (
                                        <div
                                            key={t.id}
                                            onClick={() => {
                                                if (t.type !== 'SALE') return;
                                                setSelectedHistoryTransactions(prev =>
                                                    prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                                                );
                                            }}
                                            className="glass"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: selectedHistoryTransactions.includes(t.id) ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                cursor: t.type === 'SALE' ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                background: selectedHistoryTransactions.includes(t.id) ? 'var(--primary-fade)' : 'white'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                {t.type === 'SALE' && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedHistoryTransactions.includes(t.id)}
                                                        readOnly
                                                        style={{ transform: 'scale(1.2)', accentColor: 'var(--primary)' }}
                                                    />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{t.type === 'SALE' ? 'Achat Boutique' : 'Versement Dette'}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(t.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className={`font-black ${t.type === 'SALE' ? 'text-warning' : 'text-success'}`}>
                                                    {t.type === 'SALE' ? '-' : '+'}{t.totalAmount.toLocaleString()} DA
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.6rem' }}>{t.paymentMode}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {clientHistory.length === 0 && (
                                        <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Aucune transaction trouvée pour ce client.</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="premium-card" style={{ background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                    <h3 style={{ color: 'var(--primary-dark)' }}>Fichier Clients</h3>
                                    <button className="btn-primary" onClick={() => setShowClientModal(true)}><Plus size={18} /> Ajouter un Client</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {clients.map(c => (
                                        <div key={c.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900, color: 'var(--primary-dark)' }}>{c.name[0]}</div>
                                                    <div>
                                                        <h4 style={{ margin: 0, color: 'var(--primary-dark)' }}>{c.name}</h4>
                                                        <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>{c.phone || 'Pas de tel'}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleSelectClient(c)} title="Voir Historique" className="text-primary" style={{ background: 'none', border: 'none' }}><ArrowUpRight size={18} /></button>
                                            </div>

                                            {(c.nif || c.nis || c.rc) && (
                                                <div className="text-muted" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '1rem', fontSize: '0.65rem' }}>
                                                    {c.nif && <div><b>NIF:</b> {c.nif}</div>}
                                                    {c.rc && <div><b>RC:</b> {c.rc}</div>}
                                                    {c.nis && <div style={{ gridColumn: 'span 2' }}><b>NIS:</b> {c.nis}</div>}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '10px', borderRadius: '8px' }}>
                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Solde / Plafond:</span>
                                                <div style={{ textAlign: 'right' }}>
                                                    <b className={c.totalDebt > 0 ? 'text-danger' : 'text-success'} style={{ display: 'block' }}>{c.totalDebt.toLocaleString()} DA</b>
                                                    {c.creditLimit && <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Max: {c.creditLimit.toLocaleString()} DA</span>}
                                                </div>
                                            </div>
                                            {c.totalDebt > 0 && (
                                                <button onClick={() => setShowPaymentModal({ show: true, client: c })} className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '8px', fontSize: '0.8rem' }}>ENCAISSER CRÉDIT</button>
                                            )}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                                <button onClick={() => handlePrintClientHistory(c)} className="glass text-primary-dark" style={{ padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'var(--bg-card)' }}><Printer size={14} /> Imprimer</button>
                                                <button onClick={() => openWhatsApp(c.phone, c.name, c.totalDebt)} className="glass" style={{ padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#25D366', borderColor: '#25D366', background: 'white' }}><Share2 size={14} /> WhatsApp</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* --- HR TAB --- */}
                {activeTab === "hr" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                            <div className="premium-card" style={{ height: 'fit-content', background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-dark)' }}><Users /> Ressources Humaines</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <div className="glass" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Effectif Total</div>
                                        <div className="font-black" style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>{hrOverview?.employeeCount || 0}</div>
                                    </div>
                                    <div className="glass" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Masse Salariale (Est.)</div>
                                        <div className="font-bold text-primary" style={{ fontSize: '1.5rem' }}>{(hrOverview?.totalBaseSalary || 0).toLocaleString()} DA</div>
                                    </div>
                                    <div className="glass" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Avances ce mois</div>
                                        <div className="font-bold text-warning" style={{ fontSize: '1.5rem' }}>{(hrOverview?.totalAdvances || 0).toLocaleString()} DA</div>
                                    </div>
                                </div>

                                <button onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true); }} className="btn-primary" style={{ width: '100%', padding: '12px' }}>+ Nouvel Employé</button>
                                <button onClick={() => window.open("/clock-in?orgId=" + stats.orgId, "_blank")} className="glass text-primary-dark" style={{ width: '100%', padding: '12px', marginTop: '10px', background: 'var(--bg-card)' }}>Ouvrir Borne Pointage</button>

                                <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: '1px solid var(--border)' }}>
                                    <div id="hr-qrcode">
                                        <QRCodeCanvas
                                            value={(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                                                ? `http://${serverIP}:3000`
                                                : window.location.origin) + "/clock-in?orgId=" + stats.orgId}
                                            size={150}
                                            level={"H"}
                                            includeMargin={true}
                                        />
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>IP: {serverIP}</div>
                                    <div style={{ color: 'var(--primary-dark)', fontSize: '0.8rem', fontWeight: 600 }}>Borne de Pointage</div>
                                    <button onClick={() => {
                                        const canvas = document.querySelector("#hr-qrcode canvas") as HTMLCanvasElement;
                                        if (!canvas) return;
                                        const win = window.open('', '_blank');
                                        if (!win) return;
                                        win.document.write(`
                                            <html>
                                                <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
                                                    <h2 style="margin-bottom:20px;">Borne de Pointage</h2>
                                                    <img src="${canvas.toDataURL()}" style="width:300px; height:300px; padding:20px; border:1px solid #eee; border-radius:15px;" />
                                                    <p style="margin-top:20px; opacity:0.6;">Scannez pour pointer</p>
                                                    <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
                                                </body>
                                            </html>
                                        `);
                                    }} className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}>
                                        <QrCode size={14} style={{ marginRight: '5px' }} /> Imprimer QR
                                    </button>
                                </div>
                            </div>

                            <div className="premium-card" style={{ background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                <h3 style={{ color: 'var(--primary-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Employés
                                    <button onClick={loadHR} className="glass" style={{ padding: '5px 10px', fontSize: '0.7rem' }}>Rafraîchir</button>
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    {employees.map(emp => (
                                        <div key={emp.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: emp.isPresent ? 'var(--success)' : 'var(--danger)', boxShadow: `0 0 10px ${emp.isPresent ? 'var(--success)' : 'var(--danger)'}` }} title={emp.isPresent ? "Présent" : "Absent"}></div>
                                            </div>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                                                {emp.name[0]}
                                            </div>
                                            <h4 style={{ color: 'var(--primary-dark)' }}>{emp.name}</h4>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{emp.role}</div>
                                            <div className="text-primary" style={{ marginTop: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>{emp.baseSalary.toLocaleString()} DA</div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '1rem' }}>
                                                <button onClick={() => { setEditingEmployee(emp); setShowEmployeeModal(true); }} className="glass text-primary-dark" style={{ flex: 1, padding: '5px', fontSize: '0.7rem', background: 'var(--bg-card)' }}>Modifier</button>
                                                <button onClick={() => {
                                                    setShowAttendanceHistory({ show: true, employee: emp });
                                                    loadAttendance(emp.id, attendanceMonth);
                                                }} className="glass text-primary-dark" style={{ flex: 1, padding: '5px', fontSize: '0.7rem', background: 'var(--bg-card)' }}>Présences</button>
                                                <button onClick={() => {
                                                    loadPayroll(emp.id, attendanceMonth);
                                                }} className="glass text-primary-dark" style={{ flex: 1, padding: '5px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', background: 'var(--bg-card)' }}><FileText size={12} /> Paie</button>
                                                <button onClick={() => {
                                                    showPrompt("Demande d'Avance", "Montant de l'avance :", "", async (amount) => {
                                                        if (!amount) return;
                                                        const res = await Repository.requestAdvance({
                                                            employeeId: emp.id,
                                                            amount: Number(amount),
                                                            organizationId: stats.orgId
                                                        });
                                                        if (res.success) {
                                                            showMessage("Succès", "Demande d'avance enregistrée", "success");
                                                            loadHR();
                                                            refreshData();
                                                        } else {
                                                            showMessage("Erreur", res.error || "Échec de l'opération", "error");
                                                        }
                                                    }, "number");
                                                }} className="glass" style={{ flex: 1, padding: '5px', fontSize: '0.7rem', color: 'var(--warning)', borderColor: 'var(--warning)', background: 'white' }}>Avance</button>
                                            </div>
                                        </div>
                                    ))}

                                    {employees.length === 0 && (
                                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, gridColumn: '1/-1' }}>
                                            Aucun employé enregistré.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- ADMIN TAB --- */}
                {activeTab === "admin" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                        <AdminTab
                            adminSubTab={adminSubTab}
                            setAdminSubTab={setAdminSubTab}
                            allSystemUsers={allSystemUsers}
                            allRoles={allRoles}
                            allPermissions={allPermissions}
                            employees={employees}
                            setShowUserModal={setShowUserModal}
                            setShowRoleModal={setShowRoleModal}
                            setShowPermissionsModal={setShowPermissionsModal}
                            onDeleteUser={handleDeleteUser}
                            onDeleteRole={handleDeleteRole}
                        />
                    </motion.div>
                )}

                {/* --- SAAS CONTROL TAB --- */}
                {activeTab === "saas" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                        <SaaSPanel stats={stats} showMessage={showMessage} />
                    </motion.div>
                )}

                {/* --- SETTINGS TAB (SHOP INFO) --- */}
                {activeTab === "settings" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                            <div className="premium-card" style={{ background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-dark)' }}><Store size={20} /> Ma Boutique</h3>
                                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Ces informations apparaitront sur vos tickets de caisse.</p>

                                <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label className="text-muted" style={{ fontSize: '0.8rem' }}>Nom de l'Enseigne</label>
                                        <div style={{ position: 'relative' }}>
                                            <Store size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input name="name" defaultValue={stats.organization?.name} required style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label className="text-muted" style={{ fontSize: '0.8rem' }}>Numéro de Téléphone</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input name="phone" defaultValue={stats.organization?.phone} placeholder="Ex: 0555 00 00 00" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label className="text-muted" style={{ fontSize: '0.8rem' }}>Adresse Physique</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input name="address" defaultValue={stats.organization?.address} placeholder="Ex: Cité 500 logts, Alger" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>NIF</label>
                                            <div style={{ position: 'relative' }}>
                                                <Hash size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                                <input name="nif" defaultValue={stats.organization?.nif || stats.organization?.taxId} placeholder="Numéro Identification Fiscale" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>NIS</label>
                                            <div style={{ position: 'relative' }}>
                                                <Hash size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                                <input name="nis" defaultValue={stats.organization?.nis} placeholder="Numéro Identification Statistique" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>RC</label>
                                            <div style={{ position: 'relative' }}>
                                                <FileText size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                                <input name="rc" defaultValue={stats.organization?.rc} placeholder="Registre Commerce" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>Article d'Imposition (AI)</label>
                                            <div style={{ position: 'relative' }}>
                                                <FileText size={16} className="text-primary" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                                <input name="ai" defaultValue={stats.organization?.ai} placeholder="Article Imposition" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 12px 12px 40px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <button disabled={loading} className="btn-primary" style={{ padding: '15px' }}>SAUVEGARDER LES INFOS</button>
                                </form>
                            </div>

                            <div className="premium-card" style={{ background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                <h3 style={{ color: 'var(--primary-dark)' }}>Paramètres Additionnels</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <h4 style={{ color: 'var(--primary-dark)' }}>Imprimantes (Serveur)</h4>
                                        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Configuration des imprimantes détectées sur le serveur.</p>

                                        <PrinterConfig stats={stats} showMessage={showMessage} />
                                    </div>
                                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', opacity: 0.5, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        <h4 style={{ color: 'var(--primary-dark)' }}>Sauvegarde</h4>
                                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Exporte tes données en CSV</p>
                                        <button className="glass text-primary-dark" style={{ width: '100%', padding: '10px', background: 'white' }}>Exporter .csv</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- INVENTORY TAB --- */}
                {activeTab === "inventory" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                            {/* Sidebar Inventory */}
                            <div className="premium-card" style={{ height: 'fit-content', background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>Dépôts & Sites</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setSelectedWarehouse('all')}
                                        className={selectedWarehouse === 'all' ? 'btn-primary' : 'glass'}
                                        style={{ width: '100%', textAlign: 'left', padding: '10px', background: selectedWarehouse === 'all' ? 'var(--primary)' : 'var(--bg-card)', color: selectedWarehouse === 'all' ? 'white' : 'var(--primary-dark)' }}>
                                        <Globe size={16} style={{ marginRight: '8px' }} /> Tous les sites
                                    </button>
                                    {warehouses.map(w => (
                                        <div key={w.id} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <button
                                                onClick={() => setSelectedWarehouse(w.id)}
                                                className={selectedWarehouse === w.id ? 'btn-primary' : 'glass'}
                                                style={{ flex: 1, textAlign: 'left', padding: '10px', background: selectedWarehouse === w.id ? 'var(--primary)' : 'var(--bg-card)', color: selectedWarehouse === w.id ? 'white' : 'var(--primary-dark)' }}>
                                                <Building size={16} style={{ marginRight: '8px' }} /> {w.name}
                                            </button>
                                            <button onClick={() => {
                                                showConfirm("Confirmation", "Supprimer ce dépôt ? - " + w.name, async () => {
                                                    const res = await Repository.deleteWarehouse(w.id);
                                                    if (res.success) {
                                                        showMessage("Succès", "Dépôt supprimé avec succès !", "success");
                                                        // Refresh warehouses list
                                                        const updatedWarehouses = await Repository.getWarehouses(stats.orgId) as any;
                                                        if (updatedWarehouses.success) setWarehouses(updatedWarehouses.data);
                                                    } else {
                                                        showMessage("Erreur", (res as any).error, "error");
                                                    }
                                                });
                                            }} title="Supprimer dépôt" style={{ background: 'none', border: 'none', color: 'var(--danger)', opacity: 0.8 }}><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setShowWarehouseModal(true)} style={{ marginTop: '1rem', background: 'none', border: '1px dashed var(--border)', color: 'var(--text-muted)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>+ Nouveau Dépôt</button>

                                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        <h4 style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Catégories</h4>
                                        {categories.map(cat => (
                                            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}><Folder size={16} className="text-primary" /> {cat.name}</span>
                                                <button onClick={() => {
                                                    showConfirm("Confirmation", "Supprimer cette catégorie ? - " + cat.name, async () => {
                                                        const res = await Repository.deleteCategory(cat.id);
                                                        if (!res.success) showMessage("Erreur", (res as any).error, "error");
                                                    });
                                                }} title="Supprimer catégorie" style={{ background: 'none', border: 'none', color: 'var(--danger)', opacity: 0.8 }}><Trash2 size={12} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setShowCategoryModal(true)} style={{ width: '100%', marginTop: '0.5rem', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer' }}>+ Nouvelle Catégorie</button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2.5rem' }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Flux Récents</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {stats.movements.slice(0, 5).map(m => (
                                            <div key={m.id} style={{ fontSize: '0.7rem', padding: '8px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontWeight: 700, color: m.type === 'IN' ? 'var(--success)' : 'var(--danger)' }}>
                                                    {m.type === 'IN' ? '+' : '-'}{m.quantity} {m.product.name}
                                                </div>
                                                <div className="text-muted" style={{ opacity: 0.8 }}>{m.warehouse.name} - {m.reason}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Inventory Content */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Fast Reception / Scanner Mode */}
                                {showFastReception && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="premium-card" style={{ border: '2px solid var(--primary)', background: 'white', boxShadow: 'var(--shadow-lg)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-dark)' }}><Zap color="var(--primary)" /> Réception Rapide (Scanner)</h3>
                                            <button onClick={() => setShowFastReception(false)} title="Fermer" className="glass" style={{ padding: '5px', color: 'var(--primary-dark)' }}><X size={18} /></button>
                                        </div>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const fd = new FormData(e.currentTarget);
                                            const code = fd.get("code") as string;
                                            const qty = Number(fd.get("qty"));
                                            const cost = Number(fd.get("cost"));
                                            const supplierId = fd.get("supplierId") as string;

                                            // Updated logic to find product by unit barcode
                                            let product = products.find(p => p.barcode === code || p.sku === code);
                                            let unitId = undefined;

                                            if (!product) {
                                                // Try finding by unit barcode
                                                product = products.find(p => p.units?.some((u: any) => u.barcode === code));
                                                if (product) {
                                                    const unit = product.units?.find((u: any) => u.barcode === code);
                                                    unitId = unit.id;
                                                }
                                            }

                                            if (!product) return showMessage("Erreur", "Produit non trouvé", "error");

                                            setLoading(true);
                                            const res = await Repository.adjustStock({
                                                productId: product.id,
                                                warehouseId: selectedWarehouse === 'all' ? stats.warehouses[0]?.id : selectedWarehouse,
                                                type: "IN",
                                                quantity: qty,
                                                unitId: unitId, // Pass the identified unit ID
                                                reason: "Réception Scanner",
                                                cost: cost || undefined,
                                                supplierId: supplierId || undefined
                                            } as any);

                                            setLoading(false);
                                            if (res.success) {
                                                showMessage("Succès", `Réception réussie : ${product.name} (+${qty})`, "success");
                                                (e.target as HTMLFormElement).reset();
                                                (e.target as HTMLFormElement).querySelector<HTMLInputElement>("input[name='code']")?.focus();
                                            } else showMessage("Erreur", (res as any).error || "Échec de l'opération", "error");
                                        }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label className="text-muted" style={{ fontSize: '0.7rem' }}>Code-barres / SKU</label>
                                                <input name="code" autoFocus required placeholder="Scannez ici..." style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label className="text-muted" style={{ fontSize: '0.7rem' }}>Quantité</label>
                                                <input name="qty" type="number" required defaultValue="1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label className="text-muted" style={{ fontSize: '0.7rem' }}>Prix Achat (DA)</label>
                                                <input name="cost" type="number" placeholder="Optionnel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--primary-dark)' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <label className="text-muted" style={{ fontSize: '0.7rem' }}>Fournisseur</label>
                                                <select name="supplierId" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--primary-dark)' }}>
                                                    <option value="">-- Optionnel --</option>
                                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <button className="btn-primary" style={{ padding: '12px 24px' }}>Ajouter</button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* --- Supplier Management View --- */}
                                {showSuppliers && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-card" style={{ background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Truck size={24} className="text-primary" />
                                                <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Gestion des Fournisseurs</h3>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setShowSupplierModal({ show: true })} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}><Plus size={16} /> Nouveau Fournisseur</button>
                                                <button onClick={() => setShowSuppliers(false)} title="Fermer" className="glass" style={{ padding: '5px', color: 'var(--primary-dark)' }}><X size={18} /></button>
                                            </div>
                                        </div>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                                        <th style={{ padding: '10px' }}>NOM / ENTREPRISE</th>
                                                        <th style={{ padding: '10px' }}>CONTACT</th>
                                                        <th style={{ padding: '10px' }}>LOCALISATION</th>
                                                        <th style={{ padding: '10px' }}>IDENTIFIANTS</th>
                                                        <th style={{ padding: '10px' }}>ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {suppliers.map(s => (
                                                        <tr key={s.id} className="hover-row" style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '10px' }}>
                                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>{s.name}</div>
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <div style={{ fontSize: '0.85rem' }}>{s.contactName || '-'}</div>
                                                                <div className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={10} /> {s.phone || 'N/A'}</div>
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <div style={{ fontSize: '0.8rem', opacity: 0.8, display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                                                                    <MapPin size={12} style={{ marginTop: '2px' }} />
                                                                    <span>{s.address || 'Pas d\'adresse'}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <div className="text-muted" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px', fontSize: '0.7rem' }}>
                                                                    <span style={{ fontWeight: 700 }}>NIF:</span> <span>{s.nif || '---'}</span>
                                                                    <span style={{ fontWeight: 700 }}>RC:</span> <span>{s.rc || '---'}</span>
                                                                    <span style={{ fontWeight: 700 }}>AI:</span> <span>{s.ai || '---'}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                    <button onClick={() => setShowSupplierModal({ show: true, supplier: s })} title="Modifier" className="glass text-primary-dark" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px', borderRadius: '6px' }}><Settings size={14} /></button>
                                                                    <button onClick={() => {
                                                                        showConfirm("Confirmation", `Supprimer ${s.name} ?`, async () => {
                                                                            setLoading(true);
                                                                            const res = await Repository.deleteSupplier(s.id);
                                                                            setLoading(false);
                                                                            if (res.success) {
                                                                                showMessage("Succès", "Fournisseur supprimé avec succès !", "success");
                                                                                // Refresh suppliers list
                                                                                const updatedSuppliers = await Repository.getSuppliers(stats.orgId) as any;
                                                                                if (updatedSuppliers.success) setSuppliers(updatedSuppliers.data);
                                                                            } else {
                                                                                showMessage("Erreur", (res as any).error, "error");
                                                                            }
                                                                        });
                                                                    }} title="Supprimer" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '6px', borderRadius: '6px' }}><Trash2 size={14} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {stats.suppliers.length === 0 && (
                                                <div className="text-muted" style={{ padding: '3rem', textAlign: 'center' }}>Aucun fournisseur enregistré.</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* --- Traceability History View --- */}
                                {showHistory && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-card" style={{ background: 'white', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Historique des Mouvements</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', padding: '5px 15px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                                    <label className="text-muted" style={{ fontSize: '0.75rem' }}>Produit:</label>
                                                    <select
                                                        value={historyFilterProduct}
                                                        onChange={(e) => setHistoryFilterProduct(e.target.value)}
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', fontSize: '0.85rem', outline: 'none' }}
                                                    >
                                                        <option value="all" style={{ color: 'black' }}>Tous les produits</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id} style={{ color: 'black' }}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <button onClick={() => { setShowHistory(false); setHistoryFilterProduct('all'); }} title="Fermer" className="glass" style={{ padding: '5px', color: 'var(--primary-dark)' }}><X size={18} /></button>
                                        </div>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.5, textAlign: 'left' }}>
                                                        <th style={{ padding: '10px' }}>Date</th>
                                                        <th style={{ padding: '10px' }}>Produit</th>
                                                        <th style={{ padding: '10px' }}>Type</th>
                                                        <th style={{ padding: '10px' }}>Qté</th>
                                                        <th style={{ padding: '10px' }}>Fournisseur/Détail</th>
                                                        <th style={{ padding: '10px' }}>Niveau Final</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.movements
                                                        .filter(m => historyFilterProduct === 'all' || m.productId === historyFilterProduct)
                                                        .map(m => (
                                                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                                <td style={{ padding: '10px' }}>{new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                                <td style={{ padding: '10px', fontWeight: 700 }}>{m.product.name}</td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <span style={{
                                                                        background: m.type === 'IN' || m.type === 'TRANSFER_IN' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                        color: m.type === 'IN' || m.type === 'TRANSFER_IN' ? 'var(--success)' : 'var(--danger)',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 700
                                                                    }}>
                                                                        {m.type}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '10px', fontWeight: 900 }}>{m.type === 'OUT' || m.type === 'TRANSFER_OUT' ? '-' : '+'}{m.quantity}</td>
                                                                <td style={{ padding: '10px', opacity: 0.6 }}>{m.supplierName || m.supplier?.name || m.reason || '-'}</td>
                                                                <td style={{ padding: '10px' }}>{m.newStock} {m.product.unit}</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}
                                <div className="premium-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                                        <h3>Gestion de Stock</h3>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ position: 'relative' }}>
                                                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} size={16} />
                                                <input
                                                    value={inventorySearch}
                                                    onChange={(e) => setInventorySearch(e.target.value)}
                                                    placeholder="Chercher nom, SKU, code..."
                                                    style={{ padding: '8px 8px 8px 35px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '0.85rem', width: '200px' }}
                                                />
                                            </div>
                                            {selectedForPrint.length > 0 && (
                                                <button className="btn-primary" style={{ background: 'var(--accent)' }} onClick={handlePrintStock}>
                                                    <Printer size={18} /> Imprimer ({selectedForPrint.length})
                                                </button>
                                            )}
                                            <button className="glass" onClick={handlePrintBlankInventory} title="Imprimer fiche de comptage vierge"><FileText size={18} /> Fiche Inventaire</button>
                                            <button className={showFastReception ? 'btn-primary' : 'glass'} onClick={() => { setShowFastReception(!showFastReception); setShowHistory(false); setShowSuppliers(false); }}><Zap size={18} /> Mode Douchette</button>
                                            <button className={showHistory ? 'btn-primary' : 'glass'} onClick={() => { setShowHistory(!showHistory); setShowFastReception(false); setShowSuppliers(false); }}><HistoryIcon size={18} /> Historique</button>
                                            <button className={showSuppliers ? 'btn-primary' : 'glass'} onClick={() => { setShowSuppliers(!showSuppliers); setShowHistory(false); setShowFastReception(false); }}><Store size={18} /> Fournisseurs</button>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    id="csv-import"
                                                    onChange={handleImportCSV}
                                                    style={{ display: 'none' }}
                                                />
                                                <button
                                                    className="glass"
                                                    onClick={() => document.getElementById('csv-import')?.click()}
                                                    title="Format: Nom; SKU; CodeBarres; Categorie; PrixAchat; PrixVente; Stock; Unite; StockMin"
                                                >
                                                    <Download size={18} /> Importer CSV
                                                </button>
                                            </div>
                                            <button className="btn-primary" onClick={() => setShowProductModal(true)}><Plus size={18} /> Nouvel Article</button>
                                        </div>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--foreground)' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', opacity: 0.6, fontSize: '0.8rem' }}>
                                                    <th style={{ padding: '1rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    const displayedIds = products
                                                                        .filter((p: any) => p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || p.sku?.toLowerCase().includes(inventorySearch.toLowerCase()) || p.barcode?.includes(inventorySearch) || p.units?.some((u: any) => u.barcode?.includes(inventorySearch)))
                                                                        .filter((p: any) => {
                                                                            if (selectedWarehouse === 'all') return true;
                                                                            return p.warehouseId === selectedWarehouse || p.warehouseStock?.some((ws: any) => ws.warehouseId === selectedWarehouse);
                                                                        })
                                                                        .map((p: any) => p.id);
                                                                    setSelectedForPrint(displayedIds);
                                                                } else {
                                                                    setSelectedForPrint([]);
                                                                }
                                                            }}
                                                            checked={selectedForPrint.length > 0 && products.length > 0 && selectedForPrint.length >= products.filter((p: any) => p.name.toLowerCase().includes(inventorySearch.toLowerCase())).length}
                                                        />
                                                    </th>
                                                    <th style={{ padding: '1rem' }}>ARTICLE</th>
                                                    <th style={{ padding: '1rem' }}>CODE-BARRES</th>
                                                    <th style={{ padding: '1rem' }}>PRIX ACHAT (PMP/DPA)</th>
                                                    <th style={{ padding: '1rem' }}>PRIX VENTE</th>
                                                    <th style={{ padding: '1rem' }}>QUANTITÉ</th>
                                                    <th style={{ padding: '1rem' }}>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products
                                                    .filter(p => p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || p.sku?.toLowerCase().includes(inventorySearch.toLowerCase()) || p.barcode?.includes(inventorySearch) || p.units?.some((u: any) => u.barcode?.includes(inventorySearch)))
                                                    .filter(p => {
                                                        if (selectedWarehouse === 'all') return true;
                                                        return p.warehouseId === selectedWarehouse || p.warehouseStock?.some((ws: any) => ws.warehouseId === selectedWarehouse);
                                                    })
                                                    .map(p => {
                                                        const currentStock = selectedWarehouse === 'all'
                                                            ? p.stock
                                                            : (p.warehouseStock?.find((ws: any) => ws.warehouseId === selectedWarehouse)?.quantity || 0);

                                                        const location = p.warehouseStock?.find((ws: any) => ws.warehouseId === selectedWarehouse || (selectedWarehouse === 'all' && ws.quantity > 0));

                                                        return (
                                                            <tr key={p.id} className="hover-row" style={{ borderBottom: '1px solid var(--border)' }}>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedForPrint.includes(p.id)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedForPrint([...selectedForPrint, p.id]);
                                                                            } else {
                                                                                setSelectedForPrint(selectedForPrint.filter(id => id !== p.id));
                                                                            }
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                    <div style={{
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '8px',
                                                                        background: p.image ? `url(${p.image}) center/cover no-repeat` : 'var(--primary-light)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: '1px solid var(--border)',
                                                                        cursor: 'pointer'
                                                                    }} onClick={() => {
                                                                        showPrompt("Image Produit", "🖼️ URL Image ou SÉLECTIONNER UN FICHIER :", p.image || "", async (newImage) => {
                                                                            if (newImage !== null && newImage !== p.image) {
                                                                                setLoading(true);
                                                                                const res = await Repository.updateProduct(p.id, { image: newImage });
                                                                                setLoading(false);
                                                                                if (res.success) {
                                                                                    showMessage("Succès", "Image mise à jour", "success");
                                                                                    refreshData();
                                                                                } else {
                                                                                    showMessage("Erreur", (res as any).error || "Échec de la mise à jour", "error");
                                                                                }
                                                                            }
                                                                        }, 'text', true);
                                                                    }}>
                                                                        {!p.image && <Package size={20} className="text-primary" />}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                                                                        <div style={{ fontSize: '0.8rem', opacity: 0.6, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                            <span>{p.category?.name || 'Sans catégorie'}</span>
                                                                            {(p.color || p.size) && <span style={{ color: 'var(--primary)' }}>{p.color} {p.size}</span>}
                                                                            {p.units && p.units.length > 0 && (
                                                                                <span style={{ background: 'var(--primary)', color: 'white', padding: '0 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                                                                    +{p.units.length} Unités
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                        <div style={{
                                                                            height: '15px',
                                                                            background: 'repeating-linear-gradient(90deg, var(--foreground), var(--foreground) 1px, transparent 1px, transparent 3px)',
                                                                            width: '60px',
                                                                            opacity: 0.5
                                                                        }} />
                                                                        <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', opacity: 0.8, letterSpacing: '1px' }}>{p.barcode || p.sku || '---'}</div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{p.avgCost?.toLocaleString() || p.cost.toLocaleString()} DA <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>(PMP)</span></div>
                                                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                        Last: {p.lastCost?.toLocaleString() || p.cost.toLocaleString()} DA
                                                                        {p.lastCost > p.previousCost && <TrendingUp size={12} color="var(--danger)" />}
                                                                        {p.lastCost < p.previousCost && <TrendingUp size={12} color="var(--success)" style={{ transform: 'rotate(180deg)' }} />}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '1rem', fontWeight: 900 }}>{p.price.toLocaleString()} DA</td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span className={currentStock <= (p.minStock || 5) ? 'low-stock' : ''} style={{ fontSize: '1.1rem', fontWeight: 900, color: currentStock <= (p.minStock || 5) ? 'var(--danger)' : 'var(--success)' }}>{currentStock}</span>
                                                                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{p.unit}</span>
                                                                    </div>
                                                                    {location && (
                                                                        <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '4px' }}>
                                                                            <MapPin size={10} style={{ marginRight: '4px' }} />
                                                                            {location.warehouse.name}
                                                                            <div style={{ opacity: 0.8, fontSize: '0.6rem' }}>
                                                                                Rayon: {location.aisle || '---'} | Case: {location.shelf || '---'}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                        <button onClick={() => { setShowHistory(true); setHistoryFilterProduct(p.id); }} title="Voir Historique" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary-dark)', padding: '6px', borderRadius: '6px' }}><HistoryIcon size={14} /></button>
                                                                        <button onClick={() => setShowAdjustModal({ show: true, product: p })} title="Ajuster Stock" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary-dark)', padding: '6px', borderRadius: '6px' }}><Zap size={14} /></button>
                                                                        <button onClick={() => setShowUnitsModal({ show: true, product: p })} title="Gérer Unités" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary-dark)', padding: '6px', borderRadius: '6px' }}><Scale size={14} /></button>
                                                                        <button title="Imprimer Étiquette" onClick={() => { setBarcodePreview(p); setBarcodeUnit(null); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary-dark)', padding: '6px', borderRadius: '6px' }}><Printer size={14} /></button>
                                                                        <button onClick={() => handleDeleteProduct(p.id)} title="Supprimer" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '6px', borderRadius: '6px' }}><Trash2 size={14} /></button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                        {products.length === 0 && (
                                            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3 }}>Aucun article en stock.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Barcode Print Modal */}
                        <AnimatePresence>
                            {barcodePreview && (
                                <div className="modal-overlay">
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card printable-card" style={{ width: '400px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <h3>Étiquette Article</h3>
                                            <button onClick={() => setBarcodePreview(null)} className="glass" style={{ padding: '5px' }}><X size={18} /></button>
                                        </div>

                                        {/* Unit Selector */}
                                        {barcodePreview.units && barcodePreview.units.length > 0 && (
                                            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                                                <label style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px', display: 'block' }}>Sélectionner l'unité à imprimer :</label>
                                                <select
                                                    value={barcodeUnit ? barcodeUnit.id : ""}
                                                    onChange={(e) => {
                                                        const unitId = e.target.value;
                                                        if (!unitId) setBarcodeUnit(null);
                                                        else setBarcodeUnit(barcodePreview.units.find((u: any) => u.id === unitId));
                                                    }}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                                >
                                                    <option value="">{barcodePreview.name} ({barcodePreview.unit}) - Base</option>
                                                    {barcodePreview.units.map((u: any) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.unitName} (x{u.conversion} {barcodePreview.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div id="thermal-label" style={{ background: 'white', color: 'black', padding: '10px', borderRadius: '4px', margin: '20px auto', border: '1px solid #eee', width: 'fit-content' }}>
                                            <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', color: 'black', fontWeight: 700 }}>
                                                {barcodeUnit ? `${barcodePreview.name} (${barcodeUnit.unitName})` : barcodePreview.name}
                                            </h4>
                                            <div style={{ fontFamily: '"Libre Barcode 39 Text", cursive', fontSize: '2.5rem', margin: '5px 0', color: 'black', lineHeight: 1 }}>
                                                *{barcodeUnit ? (barcodeUnit.barcode || "NO-BARCODE") : (barcodePreview.barcode || barcodePreview.sku)}*
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'black', opacity: 0.8 }}>
                                                {barcodeUnit ? (barcodeUnit.barcode || "Pas de code-barres") : (barcodePreview.barcode || barcodePreview.sku)}
                                            </div>
                                        </div>

                                        <div className="no-print" style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={async () => {
                                                const printer = stats.organization?.printerLabel;
                                                if (printer) {
                                                    setLoading(true);
                                                    const labelName = barcodeUnit ? `${barcodePreview.name} (${barcodeUnit.unitName})` : barcodePreview.name;
                                                    const labelCode = barcodeUnit ? (barcodeUnit.barcode || "NO-BARCODE") : (barcodePreview.barcode || barcodePreview.sku);
                                                    const labelContent = `
       ${labelName}
       ${labelCode}
       --------------------------------
       ${stats.organization.name || 'SI GESTION'}
                                        `;
                                                    await Repository.printJob(labelContent, printer);
                                                    setLoading(false);
                                                    // setBarcodePreview(null); // Keep open for multiple prints
                                                } else {
                                                    // Iframe Printing (Robust V5.1)
                                                    const iframe = document.createElement('iframe');
                                                    iframe.style.position = 'fixed';
                                                    iframe.style.top = '-10000px'; // Move off-screen instead of hidden
                                                    iframe.style.left = '-10000px';
                                                    iframe.style.width = '100px';
                                                    iframe.style.height = '100px';
                                                    iframe.style.border = '0';
                                                    document.body.appendChild(iframe);

                                                    const labelName = barcodeUnit ? `${barcodePreview.name} (${barcodeUnit.unitName})` : barcodePreview.name;
                                                    const labelCode = barcodeUnit ? (barcodeUnit.barcode || "NO-BARCODE") : (barcodePreview.barcode || barcodePreview.sku);
                                                    const labelCodeText = barcodeUnit ? (barcodeUnit.barcode || "Pas de code-barres") : (barcodePreview.barcode || barcodePreview.sku);

                                                    // Determine width based on organization settings (default to auto/80mm if not 58mm)
                                                    const is58mm = stats.organization?.ticketWidth === '58mm';
                                                    const bodyWidth = is58mm ? '56mm' : '100%';
                                                    const barcodeSize = is58mm ? '2rem' : '2.5rem'; // Slightly smaller for 58mm
                                                    const nameSize = is58mm ? '0.8rem' : '0.9rem'; // Slightly smaller to avoid overflow

                                                    const content = `
                                                        <html>
                                                            <head>
                                                                <title>Impression Étiquette</title>
                                                                <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
                                                                <style>
                                                                    @page { margin: 0; }
                                                                    body { margin: 0; padding: 5px; font-family: sans-serif; width: ${bodyWidth}; }
                                                                    #label {
                                                                        text-align: center;
                                                                        width: 100%;
                                                                        margin: 0 auto;
                                                                        overflow: hidden;
                                                                    }
                                                                    h4 { margin: 0 0 2px 0; font-size: ${nameSize}; font-weight: 700; color: black; word-wrap: break-word; }
                                                                    .barcode { font-family: 'Libre Barcode 39 Text', cursive; font-size: ${barcodeSize}; margin: 5px 0; line-height: 1; color: black; white-space: nowrap; }
                                                                    .code-text { font-size: 0.7rem; color: black; opacity: 0.8; }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <div id="label">
                                                                    <h4>${labelName}</h4>
                                                                    <div class="barcode">*${labelCode}*</div>
                                                                    <div class="code-text">${labelCodeText}</div>
                                                                </div>
                                                            </body>
                                                        </html>
                                                    `;

                                                    const doc = iframe.contentWindow?.document;
                                                    if (doc) {
                                                        doc.open();
                                                        doc.write(content);
                                                        doc.close();

                                                        // Wait for content (esp. fonts)
                                                        setTimeout(() => {
                                                            if (iframe.contentWindow) {
                                                                iframe.contentWindow.focus();
                                                                iframe.contentWindow.print();
                                                            }
                                                            // Remove after print dialog closes (or timeout)
                                                            setTimeout(() => {
                                                                if (document.body.contains(iframe)) {
                                                                    document.body.removeChild(iframe);
                                                                }
                                                            }, 1000); // 1 second delay to allow print dialog to engage
                                                        }, 500); // 500ms for rendering/fonts
                                                    }
                                                }
                                            }} className="btn-primary" style={{ flex: 1 }}><Printer size={18} /> Imprimer</button>
                                            <button onClick={() => setBarcodePreview(null)} className="glass" style={{ flex: 1 }}>Fermer</button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Unit Management Modal */}
                        <AnimatePresence>
                            {
                                showUnitsModal.show && showUnitsModal.product && (
                                    <div style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', position: 'fixed', inset: 0, zIndex: 3200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                                <div>
                                                    <h2 style={{ margin: 0 }}>Gérer les Unités</h2>
                                                    <p style={{ opacity: 0.6, fontSize: '0.9rem', margin: 0 }}>{showUnitsModal.product.name} ({showUnitsModal.product.unit})</p>
                                                </div>
                                                <button onClick={() => setShowUnitsModal({ show: false })} className="glass"><X size={18} /></button>
                                            </div>

                                            {/* Existing Units List */}
                                            <div style={{ marginBottom: '2rem' }}>
                                                <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Unités Configurées</h4>
                                                {showUnitsModal.product.units && showUnitsModal.product.units.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {showUnitsModal.product.units.map((u: any) => (
                                                            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 700 }}>{u.unitName}</div>
                                                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>1 {u.unitName} = {u.conversion} {showUnitsModal.product.unit}</div>
                                                                    {u.barcode && <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--primary)' }}>Code: {u.barcode}</div>}
                                                                </div>
                                                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div>
                                                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{u.sellPrice ? u.sellPrice.toLocaleString() + ' DA' : '-'}</div>
                                                                        {u.buyPrice && <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Achat: {u.buyPrice.toLocaleString()}</div>}
                                                                    </div>
                                                                    <button onClick={() => {
                                                                        showConfirm("Confirmation", 'Supprimer cette unité ?', async () => {
                                                                            setLoading(true);
                                                                            await Repository.deleteProductUnit(u.id);
                                                                            setLoading(false);
                                                                            setShowUnitsModal({ show: false }); // Close to refresh
                                                                        });
                                                                    }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Aucune unité supplémentaire configurée.</p>
                                                )}
                                            </div>

                                            {/* Add New Unit Form */}
                                            <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                setLoading(true);
                                                const fd = new FormData(e.currentTarget);
                                                const res = await Repository.createProductUnit({
                                                    productId: showUnitsModal.product.id,
                                                    unitName: fd.get('unitName') as string,
                                                    conversion: Number(fd.get('conversion')),
                                                    barcode: fd.get('barcode') as string,
                                                    sellPrice: fd.get('sellPrice') ? Number(fd.get('sellPrice')) : undefined,
                                                    buyPrice: fd.get('buyPrice') ? Number(fd.get('buyPrice')) : undefined
                                                });
                                                setLoading(false);
                                                if (res.success) {
                                                    showMessage("Succès", 'Unité ajoutée !', "success");
                                                    setShowUnitsModal({ show: false });
                                                } else {
                                                    showMessage("Erreur", res.error || 'Erreur', "error");
                                                }
                                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                                                <h4 style={{ margin: 0 }}>Ajouter une Unité</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <input name="unitName" placeholder="Nom Unité (ex: Carton)" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                                    <input name="conversion" type="number" step="0.01" placeholder={`Qté en ${showUnitsModal.product.unit} (ex: 12)`} required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input name="barcode" placeholder="Code-barres Unité (Optionnel)" style={{ flex: 1, background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                                    <button type="button" onClick={(e) => {
                                                        const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                                        input.value = Math.floor(Math.random() * 9000000000000) + 1000000000000 + "";
                                                    }} className="glass" style={{ padding: '10px' }}><Zap size={16} /></button>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <input name="sellPrice" type="number" placeholder="Prix Vente Unité" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                                    <input name="buyPrice" type="number" placeholder="Prix Achat Unité" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                                </div>
                                                <button disabled={loading} className="btn-primary" style={{ padding: '12px' }}>AJOUTER UNITÉ</button>
                                            </form>
                                        </motion.div>
                                    </div>
                                )
                            }
                        </AnimatePresence >
                    </motion.div >
                )}

                {/* --- FINANCE MODULE --- */}
                {
                    activeTab === "finance" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
                            {/* Finance Sub-Tabs */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <button onClick={() => setFinanceSubTab('performance')} className={financeSubTab === 'performance' ? 'btn-primary' : 'glass'} style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18} /> Performance</button>
                                <button onClick={() => setFinanceSubTab('treasury')} className={financeSubTab === 'treasury' ? 'btn-primary' : 'glass'} style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Wallet size={18} /> Trésorerie</button>
                                <button onClick={() => setFinanceSubTab('debts')} className={financeSubTab === 'debts' ? 'btn-primary' : 'glass'} style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={18} /> Dettes</button>
                                <button onClick={() => setFinanceSubTab('recurring')} className={financeSubTab === 'recurring' ? 'btn-primary' : 'glass'} style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> Toutes les Charges</button>
                                <button onClick={() => setFinanceSubTab('tax')} className={financeSubTab === 'tax' ? 'btn-primary' : 'glass'} style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Scale size={18} /> Fiscalité & Zakat</button>
                            </div>

                            {financeSubTab === 'performance' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                        <div className="premium-card">
                                            <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>Chiffre d'Affaire (CA)</div>
                                            <h2 style={{ fontSize: '2rem', color: 'var(--success)' }}>{stats.todaySales.toLocaleString()} DA</h2>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Aujourd'hui</div>
                                        </div>
                                        <div className="premium-card">
                                            <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>Marge Brute</div>
                                            <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{(recentTransactions.filter((t: any) => t.type === 'SALE').reduce((acc: number, t: any) => acc + (t.totalAmount - (t.items ? JSON.parse(t.items).reduce((s: number, i: any) => s + (i.cost * i.quantity), 0) : 0)), 0)).toLocaleString()} DA</h2>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Total (Transactions Chargées)</div>
                                        </div>
                                        <div className="premium-card">
                                            <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>Charges (OPEX)</div>
                                            <h2 style={{ fontSize: '2rem', color: 'var(--danger)' }}>{stats.expenses.reduce((acc: number, e: any) => acc + e.amount, 0).toLocaleString()} DA</h2>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Total dépenses opérationnelles</div>
                                        </div>
                                        <div className="premium-card">
                                            <div style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.5rem' }}>Bénéfice Net (Est.)</div>
                                            <h2 style={{ fontSize: '2rem', color: 'var(--accent)' }}>{(recentTransactions.filter((t: any) => t.type === 'SALE').reduce((acc: number, t: any) => acc + (t.totalAmount - (t.items ? JSON.parse(t.items).reduce((s: number, i: any) => s + (i.cost * i.quantity), 0) : 0)), 0) - stats.expenses.reduce((acc: number, e: any) => acc + e.amount, 0)).toLocaleString()} DA</h2>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Marge - Charges</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div className="premium-card">
                                            <h3>Indicateur de Santé Financière</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.85rem' }}>📦 Valeur Marchandise</span>
                                                        <b style={{ color: 'var(--primary)' }}>{stats.stockValue.toLocaleString()} DA</b>
                                                    </div>
                                                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.85rem' }}>💵 Liquidités (Trésorerie)</span>
                                                        <b style={{ color: 'var(--success)' }}>{stats.accounts.reduce((acc: number, a: any) => acc + a.balance, 0).toLocaleString()} DA</b>
                                                    </div>
                                                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${Math.min(100, (stats.accounts.reduce((acc: number, a: any) => acc + a.balance, 0) / stats.stockValue) * 100)}%`, background: 'var(--success)' }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.85rem' }}>📝 Créances Clients</span>
                                                        <b style={{ color: 'var(--warning)' }}>{stats.totalReceivables.toLocaleString()} DA</b>
                                                    </div>
                                                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${Math.min(100, (stats.totalReceivables / stats.stockValue) * 100)}%`, background: 'var(--warning)' }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.85rem' }}>📉 Dettes Fournisseurs</span>
                                                        <b style={{ color: 'var(--danger)' }}>{(stats.totalPayables || 0).toLocaleString()} DA</b>
                                                    </div>
                                                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${Math.min(100, ((stats.totalPayables || 0) / stats.stockValue) * 100)}%`, background: 'var(--danger)' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="premium-card">
                                            <h3>Activités Récentes</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' }}>
                                                {stats.recentTransactions.slice(0, 8).map((t: any) => (
                                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--glass)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.type === 'SALE' ? 'Vente' : t.type === 'DEBT_PAYMENT' ? 'Versement Client' : 'Transaction'}</div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(t.createdAt).toLocaleString()}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 900, color: 'var(--success)' }}>+{t.paidAmount.toLocaleString()} DA</div>
                                                            {t.totalAmount > t.paidAmount && <div style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>Reste: {(t.totalAmount - t.paidAmount).toLocaleString()}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Placeholder for other sub-tabs - implementation follows */}
                            {financeSubTab === 'treasury' && (
                                <div className="premium-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h3>Gestion de la Trésorerie</h3>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => setShowTransferModal(true)} className="glass"><ArrowLeftRight size={18} /> Transfert Interne</button>
                                            <button onClick={() => setShowAccountModal(true)} className="btn-primary"><Plus size={18} /> Nouveau Compte</button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                        {accounts.map((acc: any) => (
                                            <div key={acc.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: acc.isDefault ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>{acc.type}</span>
                                                    {acc.isDefault && <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>DÉFAUT</span>}
                                                </div>
                                                <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{acc.name}</h4>
                                                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem', color: acc.balance < 0 ? 'var(--danger)' : 'var(--foreground)' }}>
                                                    {acc.balance.toLocaleString()} <span style={{ fontSize: '1rem' }}>DA</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '3rem' }}>
                                        <h3>Journal des Flux (Trésorerie)</h3>
                                        <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.5, textAlign: 'left' }}>
                                                        <th style={{ padding: '10px' }}>Date</th>
                                                        <th style={{ padding: '10px' }}>Compte</th>
                                                        <th style={{ padding: '10px' }}>Type</th>
                                                        <th style={{ padding: '10px' }}>Catégorie</th>
                                                        <th style={{ padding: '10px' }}>Montant</th>
                                                        <th style={{ padding: '10px' }}>Solde Après</th>
                                                        <th style={{ padding: '10px' }}>Motif</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.flows?.map((f: any) => (
                                                        <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                                                            <td style={{ padding: '10px' }}>{new Date(f.createdAt).toLocaleDateString()} {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                            <td style={{ padding: '10px', fontWeight: 600 }}>{f.account.name}</td>
                                                            <td style={{ padding: '10px' }}>
                                                                <span style={{ background: f.type === 'IN' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: f.type === 'IN' ? 'var(--success)' : 'var(--danger)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{f.type}</span>
                                                            </td>
                                                            <td style={{ padding: '10px' }}>{f.category}</td>
                                                            <td style={{ padding: '10px', fontWeight: 700 }}>{f.type === 'IN' ? '+' : '-'}{f.amount.toLocaleString()}</td>
                                                            <td style={{ padding: '10px', opacity: 0.6 }}>{f.balanceAfter.toLocaleString()}</td>
                                                            <td style={{ padding: '10px', opacity: 0.8 }}>{f.reason || '-'}</td>
                                                        </tr>
                                                    ))}
                                                    {(!stats.flows || stats.flows.length === 0) && (
                                                        <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>Aucun mouvement enregistré.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {financeSubTab === 'debts' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div className="premium-card">
                                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ArrowDownLeft color="var(--danger)" /> Créances Clients (Argent dû)</h3>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--danger)' }}>{stats.totalReceivables.toLocaleString()} DA</div>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.5, textAlign: 'left' }}>
                                                        <th style={{ padding: '10px' }}>Client</th>
                                                        <th style={{ padding: '10px' }}>Dette</th>
                                                        <th style={{ padding: '10px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.clients.filter(c => (c.totalDebt || 0) > 0).map(c => (
                                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '10px' }}><b>{c.name}</b></td>
                                                            <td style={{ padding: '10px', color: 'var(--danger)', fontWeight: 700 }}>{c.totalDebt.toLocaleString()} DA</td>
                                                            <td style={{ padding: '10px' }}>
                                                                <button onClick={() => setShowPaymentModal({ show: true, client: c })} className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Encaisser</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {stats.clients.filter(c => (c.totalDebt || 0) > 0).length === 0 && (
                                                        <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>Aucune créance en cours.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="premium-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ArrowUpRight color="var(--primary)" /> Dettes Fournisseurs</h3>
                                            <button onClick={() => setShowAdjustSupplierDebtModal({ show: true, supplier: stats.suppliers[0] })} className="btn-primary" style={{ fontSize: '0.7rem' }}>+ Dette Manuelle</button>
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--primary)' }}>{(stats.totalPayables || 0).toLocaleString()} DA</div>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.5, textAlign: 'left' }}>
                                                        <th style={{ padding: '10px' }}>Fournisseur</th>
                                                        <th style={{ padding: '10px' }}>Dette</th>
                                                        <th style={{ padding: '10px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.suppliers.filter(s => (s.totalDebt || 0) > 0).map(s => (
                                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '10px' }}><b>{s.name}</b></td>
                                                            <td style={{ padding: '10px', fontWeight: 700 }}>{s.totalDebt.toLocaleString()} DA</td>
                                                            <td style={{ padding: '10px' }}>
                                                                <button title="Payer" onClick={() => setShowPaySupplierModal({ show: true, supplier: s })} className="glass text-success" style={{ padding: '8px 15px', fontSize: '0.75rem' }}>Payer</button>
                                                                <button onClick={() => setShowAdjustSupplierDebtModal({ show: true, supplier: s })} className="glass" style={{ padding: '4px 8px', fontSize: '0.7rem', marginLeft: '5px' }}>± Ajuster</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {stats.suppliers.filter(s => (s.totalDebt || 0) > 0).length === 0 && (
                                                        <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>Aucune dette fournisseur.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {financeSubTab === 'recurring' && (
                                <div className="premium-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0 }}>Gestion Unifiée des Charges</h3>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => setShowRecurringExpenseModal(true)} className="glass text-secondary" style={{ fontSize: '0.8rem' }}><Plus size={16} /> Configurer Récurrence</button>
                                            <button onClick={() => setShowExpenseModal(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}><Plus size={16} /> Enregistrer une Charge</button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
                                        <div>
                                            <h4>Historique & Prévisions</h4>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: '1rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.5, textAlign: 'left' }}>
                                                        <th style={{ padding: '10px' }}>Date / Échéance</th>
                                                        <th style={{ padding: '10px' }}>Libellé</th>
                                                        <th style={{ padding: '10px' }}>Montant</th>
                                                        <th style={{ padding: '10px' }}>État</th>
                                                        <th style={{ padding: '10px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.expenses?.map((e: any) => {
                                                        const isOverdue = !e.isPaid && e.dueDate && new Date(e.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                                                        return (
                                                            <tr key={e.id} style={{ borderBottom: '1px solid var(--border)', background: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'none' }}>
                                                                <td style={{ padding: '10px' }}>{new Date(e.dueDate || e.createdAt).toLocaleDateString()}</td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <b>{e.label}</b>
                                                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{e.category}</div>
                                                                </td>
                                                                <td style={{ padding: '10px', fontWeight: 700 }}>{e.amount.toLocaleString()} DA</td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <span
                                                                        className={`badge badge-${e.isPaid ? 'success' : 'warning'}`}
                                                                        style={{
                                                                            background: e.isPaid ? 'rgba(34, 197, 94, 0.1)' : (isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.1)'),
                                                                            color: e.isPaid ? 'var(--success)' : (isOverdue ? 'var(--danger)' : 'var(--warning)'),
                                                                            border: isOverdue ? '1px solid var(--danger)' : 'none'
                                                                        }}
                                                                    >
                                                                        {e.isPaid ? 'PAYÉ' : (isOverdue ? 'EN RETARD' : 'PROGRAMMÉ')}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '10px' }}>
                                                                    {!e.isPaid && (
                                                                        <button
                                                                            onClick={() => setShowPayExpenseModal({ show: true, expense: e })}
                                                                            className="btn-primary"
                                                                            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                                                                        >
                                                                            Régler
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '15px', height: 'fit-content' }}>
                                            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}><Clock size={16} /> Automatisations</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {stats.recurringExpenses?.map((re: any) => (
                                                    <div key={re.id} className="glass" style={{ padding: '10px', borderRadius: '10px', fontSize: '0.8rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                            <b>{re.label}</b>
                                                            <span style={{ color: 'var(--accent)' }}>{re.amount.toLocaleString()} DA</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6, fontSize: '0.7rem' }}>
                                                            <span>{re.frequency}</span>
                                                            <button onClick={() => Repository.deleteRecurringExpense(re.id)} className="text-danger"><Trash2 size={12} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!stats.recurringExpenses || stats.recurringExpenses.length === 0) && (
                                                    <p className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'center' }}>Aucune automatisation configurée.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {financeSubTab === 'tax' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                    <div className="premium-card" style={{ height: 'fit-content' }}>
                                        <h3>Calculateur Zakat</h3>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '2rem' }}>La Zakat est de 2.5% sur vos actifs circulants (Liquidités + Stock + Créances) après déduction des dettes.</p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Actifs Circulants</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{(stats.accounts.reduce((acc: number, a: any) => acc + a.balance, 0) + stats.stockValue + stats.totalReceivables - (stats.totalPayables || 0)).toLocaleString()} DA</div>
                                            </div>
                                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--success)' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700 }}>MONTANT ZAKAT (2.5%)</div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>{((stats.accounts.reduce((acc: number, a: any) => acc + a.balance, 0) + stats.stockValue + stats.totalReceivables - (stats.totalPayables || 0)) * 0.025).toLocaleString()} <span style={{ fontSize: '1rem' }}>DA</span></div>
                                            </div>
                                        </div>
                                        <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '12px' }} onClick={handlePrintZakat}>Imprimer Rapport Zakat</button>
                                    </div>

                                    <div className="premium-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                            <h3>Aide au Rapport G50</h3>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Estimations basées sur transactions chargées</span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                            <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>TVA (19%) Est.</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{(stats.todaySales * 0.19).toLocaleString()} DA</div>
                                            </div>
                                            <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>TAP (1%) Est.</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{(stats.todaySales * 0.01).toLocaleString()} DA</div>
                                            </div>
                                            <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Timbre Est.</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{(recentTransactions.filter((t: any) => t.type === 'SALE' && t.mode === 'CASH').length * 10).toLocaleString()} DA</div>
                                            </div>
                                        </div>

                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.5, textAlign: 'left' }}>
                                                    <th style={{ padding: '12px' }}>Impôt / Taxe</th>
                                                    <th style={{ padding: '12px' }}>Base Imposable</th>
                                                    <th style={{ padding: '12px' }}>Taux</th>
                                                    <th style={{ padding: '12px' }}>Montant Est.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px' }}>TVA (Taxe Valeur Ajoutée)</td>
                                                    <td style={{ padding: '12px' }}>{stats.todaySales.toLocaleString()}</td>
                                                    <td style={{ padding: '12px' }}>19%</td>
                                                    <td style={{ padding: '12px', fontWeight: 700 }}>{(stats.todaySales * 0.19).toLocaleString()}</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px' }}>TAP (Taxe Activité Prof.)</td>
                                                    <td style={{ padding: '12px' }}>{stats.todaySales.toLocaleString()}</td>
                                                    <td style={{ padding: '12px' }}>1%</td>
                                                    <td style={{ padding: '12px', fontWeight: 700 }}>{(stats.todaySales * 0.01).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '12px' }}>Droit de Timbre (Espèces)</td>
                                                    <td style={{ padding: '12px' }}>{recentTransactions.filter((t: any) => t.type === 'SALE' && t.mode === 'CASH').reduce((acc: number, t: any) => acc + t.totalAmount, 0).toLocaleString()}</td>
                                                    <td style={{ padding: '12px' }}>1% (Max 2500)</td>
                                                    <td style={{ padding: '12px', fontWeight: 700 }}>{Math.min(2500, recentTransactions.filter((t: any) => t.type === 'SALE' && t.mode === 'CASH').reduce((acc: number, t: any) => acc + t.totalAmount, 0) * 0.01).toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
            </section>

            {/* --- MODALS --- */}

            {/* Expense Modal */}
            <AnimatePresence>
                {showExpenseModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Ajouter une Charge</h2>
                                <button title="Fermer" onClick={() => setShowExpenseModal(false)} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                            </div>
                            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input name="label" placeholder="Libellé (ex: Loyer, Electricité...)" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                <input name="amount" type="number" placeholder="Montant (DA)" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '1.2rem' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <select title="Compte de Paiement" name="accountId" required={modalExpenseIsPaid} style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', opacity: modalExpenseIsPaid ? 1 : 0.5 }}>
                                        <option value="">-- Compte --</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    <select title="Catégorie" name="category" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        <option value="OPERATIONAL">Opérationnel</option>
                                        <option value="PURCHASE">Achat Fournisseur</option>
                                        <option value="SALARY">Salaire</option>
                                        <option value="TAX">Impôt/Taxe</option>
                                        <option value="OTHER">Autre</option>
                                    </select>
                                </div>
                                {!modalExpenseIsPaid && (
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '5px' }}>Date d'échéance (Programmation)</label>
                                        <input name="dueDate" type="date" required style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} defaultValue={new Date().toISOString().split('T')[0]} title="Echéance" />
                                    </div>
                                )}
                                <select title="Fournisseur (Optionnel)" name="supplierId" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                    <option value="">-- Fournisseur --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--glass)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <input type="checkbox" name="isPaid" id="isPaidExp" checked={modalExpenseIsPaid} onChange={(e) => setModalExpenseIsPaid(e.target.checked)} style={{ transform: 'scale(1.5)', accentColor: 'var(--success)', width: '20px', height: '20px' }} />
                                    <label htmlFor="isPaidExp" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>Déjà payé (Sortie de caisse)</label>
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '15px' }} title="Enregistrer la charge">ENREGISTRER LA CHARGE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Recurring Expense Modal */}
            <AnimatePresence>
                {showRecurringExpenseModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Charge Récurrente</h2>
                                <button title="Fermer" onClick={() => setShowRecurringExpenseModal(false)} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                            </div>
                            <form onSubmit={handleCreateRecurringExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input name="label" placeholder="Libellé (ex: Loyer)" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                <input name="amount" type="number" placeholder="Montant (DA)" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '1.2rem' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <select title="Catégorie" name="category" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        <option value="OPERATIONAL">Opérationnel</option>
                                        <option value="SALARY">Salaire</option>
                                        <option value="TAX">Impôt</option>
                                        <option value="OTHER">Autre</option>
                                    </select>
                                    <select title="Fréquence" name="frequency" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        <option value="MONTHLY">Mensuel</option>
                                        <option value="YEARLY">Annuel</option>
                                        <option value="ONCE">Une fois (Programmé)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label className="text-muted" style={{ fontSize: '0.8rem' }}>Date de début / prochaine échéance</label>
                                    <input name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '15px' }}>PROGRAMMER LA CHARGE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal.show && (
                    <div className="modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Règlement Dette</h2>
                                <button title="Fermer" onClick={() => setShowPaymentModal({ show: false })} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                            </div>
                            <p style={{ textAlign: 'center', opacity: 0.6 }}>Client: {showPaymentModal.client?.name}</p>
                            <h2 style={{ textAlign: 'center', color: 'var(--danger)', fontSize: '2.5rem' }}>{showPaymentModal.client?.totalDebt.toLocaleString()} DA</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                try {
                                    setLoading(true);
                                    const amount = Number(fd.get("amount"));
                                    const accId = fd.get("accountId") as string;
                                    const res = await Repository.collectClientDebt(showPaymentModal.client.id, amount, stats.orgId, accId);
                                    if (res.success) {
                                        // Print Receipt Logic
                                        const client = showPaymentModal.client;
                                        const oldDebt = client.totalDebt || 0;
                                        const newDebt = oldDebt - amount;
                                        const printer = stats.organization?.printerTicket;

                                        if (printer) {
                                            const ticket = `
       RECU DE VERSEMENT
--------------------------------
CLT: ${client.name}
DATE: ${new Date().toLocaleString()}
--------------------------------
MONTANT VERSE:   ${amount.toLocaleString()} DA

ANCIEN SOLDE:    ${oldDebt.toLocaleString()} DA
NOUVEAU SOLDE:   ${newDebt.toLocaleString()} DA
--------------------------------
Merci de votre confiance.
`;
                                            await Repository.printJob(ticket, printer);
                                        } else {
                                            // Client-side HTML Receipt
                                            const win = window.open('', '_blank', 'width=400,height=600');
                                            if (win) {
                                                win.document.write(`
                                                    <html>
                                                    <head>
                                                        <title>REÇU DE VERSEMENT</title>
                                                        <style>
                                                            @page { size: 80mm auto; margin: 0; }
                                                            body { font-family: monospace; width: 80mm; margin: 0 auto; padding: 20px; font-size: 14px; }
                                                            .center { text-align: center; }
                                                            .bold { font-weight: bold; }
                                                            .flex { display: flex; justify-content: space-between; }
                                                            .hr { border-top: 1px dashed #000; margin: 10px 0; }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        <h2 class="center">REÇU DE VERSEMENT</h2>
                                                        <div class="hr"></div>
                                                        <p><b>Client:</b> ${client.name}</p>
                                                        <p><b>Date:</b> ${new Date().toLocaleString()}</p>
                                                        <div class="hr"></div>
                                                        <div class="flex bold"><span>MONTANT VERSÉ:</span> <span>${amount.toLocaleString()} DA</span></div>
                                                        <div style="margin-top: 15px;">
                                                            <div class="flex"><span>Ancien Solde:</span> <span>${oldDebt.toLocaleString()} DA</span></div>
                                                            <div class="flex bold"><span>Nouveau Solde:</span> <span>${newDebt.toLocaleString()} DA</span></div>
                                                        </div>
                                                        <div class="hr"></div>
                                                        <div class="center" style="margin-top:20px;">Merci de votre confiance.</div>
                                                        <script>window.onload = () => { window.print(); window.close(); };</script>
                                                    </body>
                                                    </html>
                                                `);
                                                win.document.close();
                                            }
                                        }
                                        setShowPaymentModal({ show: false });
                                        refreshData();
                                    } else {
                                        showMessage("Erreur", (res as any).error || "Échec du règlement", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau lors du paiement", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input name="amount" type="number" placeholder="Montant à verser" required max={showPaymentModal.client?.totalDebt} style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '1.2rem' }} />
                                    <select title="Compte d'Encaissement" name="accountId" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '15px' }}>VALIDER LE VERSEMENT</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pay Supplier Modal */}
            <AnimatePresence>
                {showPaySupplierModal.show && (
                    <div className="modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Paiement Fournisseur</h2>
                                <button title="Fermer" onClick={() => setShowPaySupplierModal({ show: false })} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                            </div>
                            <p style={{ textAlign: 'center', opacity: 0.6 }}>Fournisseur: {showPaySupplierModal.supplier?.name}</p>
                            <h2 style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '2.5rem' }}>{showPaySupplierModal.supplier?.totalDebt.toLocaleString()} DA</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                try {
                                    setLoading(true);
                                    const res = await Repository.paySupplierDebt(showPaySupplierModal.supplier.id, Number(fd.get("amount")), stats.orgId, fd.get("accountId") as string);
                                    if (res.success) {
                                        showMessage("Succès", "Réglement enregistré", "success");
                                        setShowPaySupplierModal({ show: false });
                                        refreshData();
                                    } else {
                                        showMessage("Erreur", (res as any).error || "Échec", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input name="amount" type="number" placeholder="Montant à régler" required max={showPaySupplierModal.supplier?.totalDebt} style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '1.2rem' }} />
                                    <select title="Compte de Paiement" name="accountId" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '15px' }}>VALIDER LE PAIEMENT</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Adjust Supplier Debt Modal */}
            <AnimatePresence>
                {showAdjustSupplierDebtModal.show && (
                    <div className="modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Ajustement Dette</h2>
                                <button title="Fermer" onClick={() => setShowAdjustSupplierDebtModal({ show: false })} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block', marginBottom: '0.5rem' }}>Fournisseur</label>
                                <select
                                    value={showAdjustSupplierDebtModal.supplier?.id || ''}
                                    onChange={(e) => {
                                        const selected = stats.suppliers.find(s => s.id === e.target.value);
                                        setShowAdjustSupplierDebtModal({ ...showAdjustSupplierDebtModal, supplier: selected });
                                    }}
                                    style={{ width: '100%', background: 'var(--bg-deep)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }}
                                >
                                    <option value="">-- Sélectionner un fournisseur --</option>
                                    {stats.suppliers.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.totalDebt.toLocaleString()} DA)</option>
                                    ))}
                                </select>
                            </div>

                            <h2 style={{ textAlign: 'center', opacity: 0.8, fontSize: '1rem' }}>Dette Actuelle: {showAdjustSupplierDebtModal.supplier?.totalDebt.toLocaleString() || 0} DA</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                try {
                                    setLoading(true);
                                    const res = await Repository.adjustSupplierDebt({
                                        supplierId: showAdjustSupplierDebtModal.supplier.id,
                                        amount: Number(fd.get("amount")),
                                        type: fd.get("type") as 'INCREMENT' | 'DECREMENT',
                                        orgId: stats.orgId,
                                        organizationId: stats.orgId
                                    });
                                    if (res.success) {
                                        showMessage("Succès", "Dette ajustée avec succès !", "success");
                                        setShowAdjustSupplierDebtModal({ show: false });
                                    } else {
                                        showMessage("Erreur", res.error || "Échec de l'ajustement", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select title="Type d'Ajustement" name="type" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        <option value="INCREMENT">Augmenter (+) </option>
                                        <option value="DECREMENT">Diminuer (-) </option>
                                    </select>
                                    <input name="amount" type="number" placeholder="Montant" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '15px' }}>VALIDER L'AJUSTEMENT</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Other modals (Product, Client) */}
            <AnimatePresence>
                {
                    showProductModal && (
                        <div className="modal-overlay">
                            <div className="premium-card" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                    <h2>Nouvel Article</h2>
                                    <button title="Fermer" onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                                </div>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);

                                    // Enforce product limit
                                    const productLimit = stats.organization?.productLimit || 100;
                                    if (products.length >= productLimit) {
                                        showMessage("Limite atteinte", `Vous avez atteint votre limite de produits (${productLimit}). Veuillez augmenter votre forfait pour ajouter plus d'articles.`, "error");
                                        return;
                                    }

                                    try {
                                        setLoading(true);
                                        const res = await Repository.createProduct({
                                            name: fd.get("name") as string,
                                            sku: fd.get("sku") as string,
                                            barcode: fd.get("barcode") as string,
                                            price: Number(fd.get("price")),
                                            cost: Number(fd.get("cost")),
                                            stock: Number(fd.get("stock")),
                                            unit: fd.get("unit") as string,
                                            color: fd.get("color") as string,
                                            size: fd.get("size") as string,
                                            image: fd.get("image") as string,
                                            organizationId: stats.orgId,
                                            orgId: stats.orgId,
                                            categoryId: fd.get("categoryId") as string,
                                            warehouseId: fd.get("warehouseId") as string,
                                            location: {
                                                aisle: fd.get("aisle") as string,
                                                shelf: fd.get("shelf") as string,
                                                bin: fd.get("bin") as string,
                                            }
                                        } as any);

                                        if (res && (res as any).success) {
                                            showMessage("Succès", "Article créé avec succès !", "success");
                                            if (creationContext === 'purchase') {
                                                const product = (res as any).product || { id: (res as any).id, name: fd.get("name"), lastCost: Number(fd.get("cost")), price: Number(fd.get("price")) };
                                                handleAddToPurchaseCart(product);
                                            }
                                            setShowProductModal(false);
                                            setCreationContext('standard');
                                            // Refresh products list
                                            const updatedProducts = await Repository.getProducts(stats.orgId);
                                            if (updatedProducts.success) setProducts(updatedProducts.data);
                                        } else {
                                            showMessage("Erreur", (res as any).error || "Échec de la création du produit", "error");
                                        }
                                    } catch (error: any) {
                                        console.error("Dashboard: Product creation error", error);
                                    } finally {
                                        setLoading(false);
                                    }
                                }} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input name="name" placeholder="Désignation" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                        <input name="sku" placeholder="SKU (REF-001)" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    </div>

                                    {/* Image Upload & Min Stock */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <input type="file" title="Image Produit" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 1024 * 1024) {
                                                        showMessage("Erreur", "L'image est trop grande (max 1Mo)", "error");
                                                        e.target.value = "";
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        // Hidden input will hold base64 string
                                                        const input = document.getElementById('image-base64') as HTMLInputElement;
                                                        if (input) input.value = reader.result as string;
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }} style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', width: '100%' }} />
                                            <input type="hidden" name="image" id="image-base64" />
                                        </div>
                                        <input name="minStock" type="number" placeholder="Seuil Alerte Stock" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input name="barcode" placeholder="Code-barres / EAN" style={{ flex: 1, background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                        <button type="button" onClick={(e) => {
                                            const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                            input.value = Math.floor(Math.random() * 9000000000000) + 1000000000000 + "";
                                        }} className="glass" style={{ padding: '10px' }}><Zap size={16} /></button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input name="price" type="number" placeholder="Prix Vente" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                        <input name="cost" type="number" placeholder="Prix Achat" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <select name="categoryId" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                            <option value="">-- Catégorie --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <select name="warehouseId" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                            <option value="">-- Dépôt (Obligatoire) --</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        <input name="color" placeholder="Couleur" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                        <input name="size" placeholder="Taille" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                        <select title="Unité" name="unit" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'white' }}>
                                            <option value="pcs">Pièce (pcs)</option>
                                            <option value="kg">Kilogramme (kg)</option>
                                            <option value="carton">Carton</option>
                                            <option value="m">Mètre (m)</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        <input name="aisle" placeholder="Allée" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                        <input name="shelf" placeholder="Étagère" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                        <input name="bin" placeholder="Casier" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                    </div>
                                    <input name="stock" type="number" placeholder="Stock Initial" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '15px', marginTop: '1rem' }}>
                                        {loading ? "Charegment..." : "ENREGISTRER LE PRODUIT"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }
            </AnimatePresence >

            <AnimatePresence>
                {showClientModal && (
                    <div className="modal-overlay">
                        <div className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Nouveau Client</h2>
                                <button title="Fermer" onClick={() => setShowClientModal(false)} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                showMessage("Info", "CLIENT SUBMIT - DÉBUT", "info");
                                const fd = new FormData(e.currentTarget);
                                try {
                                    setLoading(true);
                                    showMessage("Info", "CLIENT APPEL createClient (ORG: " + stats.orgId + ")", "info");
                                    const res = await Repository.createClient({
                                        name: fd.get("name") as string,
                                        type: fd.get("type") as string,
                                        phone: fd.get("phone") as string,
                                        address: fd.get("address") as string,
                                        district: fd.get("district") as string,
                                        nif: fd.get("nif") as string,
                                        nis: fd.get("nis") as string,
                                        rc: fd.get("rc") as string,
                                        creditLimit: fd.get("creditLimit") ? Number(fd.get("creditLimit")) : undefined,
                                        organizationId: stats.orgId,
                                        orgId: stats.orgId,
                                    });
                                    if (res.success) {
                                        showMessage("Succès", "Client créé avec succès !", "success");
                                        setShowClientModal(false);
                                        // Refresh clients list
                                        const updatedClients = await Repository.getClients(stats.orgId);
                                        if (updatedClients.success) setClients(updatedClients.data);
                                    } else {
                                        showMessage("Erreur", (res as any).error || "Échec de la création du client", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau lors de la création du client", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setClientFormType('PARTICULIER')} className={clientFormType === 'PARTICULIER' ? 'btn-primary' : 'glass'} style={{ flex: 1, padding: '10px' }}>Particulier</button>
                                    <button type="button" onClick={() => setClientFormType('PROFESSIONNEL')} className={clientFormType === 'PROFESSIONNEL' ? 'btn-primary' : 'glass'} style={{ flex: 1, padding: '10px' }}>Professionnel</button>
                                    <input type="hidden" name="type" value={clientFormType} />
                                </div>

                                <input name="name" placeholder="Nom Complet / Raison Sociale" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input name="phone" placeholder="Téléphone 05/06/07..." style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    <input name="district" placeholder="Quartier / Commune" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                </div>

                                {clientFormType === 'PROFESSIONNEL' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                        <input name="nif" placeholder="NIF" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                        <input name="nis" placeholder="NIS" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                        <input name="rc" placeholder="RC" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                    </div>
                                )}

                                <input name="address" placeholder="Adresse Complète" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                <input name="creditLimit" type="number" placeholder="Plafond Crédit (Optionnel)" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '15px' }}>CRÉER LE COMPTE CLIENT</button>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Adjust Stock Modal */}
            <AnimatePresence>
                {showAdjustModal.show && (
                    <div className="modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Ajustement Stock</h2>
                                <button title="Fermer" onClick={() => setShowAdjustModal({ show: false })} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                            </div>
                            <p style={{ textAlign: 'center', opacity: 0.6 }}>Produit: {showAdjustModal.product?.name}</p>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                try {
                                    setLoading(true);
                                    const res = await Repository.adjustStock({
                                        productId: showAdjustModal.product.id,
                                        warehouseId: fd.get("warehouseId") as string,
                                        type: fd.get("type") as any,
                                        quantity: Number(fd.get("quantity")),
                                        unitId: fd.get("unitId") as string,
                                        reason: fd.get("reason") as string,
                                        location: {
                                            aisle: fd.get("aisle") as string,
                                            shelf: fd.get("shelf") as string,
                                            bin: fd.get("bin") as string,
                                        },
                                        orgId: stats.orgId,
                                        organizationId: stats.orgId
                                    });
                                    if (res.success) {
                                        // Offer to print receipt if it's an IN or TRANSFER
                                        const type = fd.get("type") as string;
                                        if (type === 'IN' || type === 'TRANSFER') {
                                            showConfirm("Confirmation", "Action réussie. Voulez-vous imprimer le bon correspondant ?", () => {
                                                const win = window.open('', '_blank');
                                                if (win) {
                                                    const title = type === 'TRANSFER' ? 'BON DE TRANSFERT' : 'BON DE RÉCEPTION';
                                                    const movement = (res as any).movement;
                                                    win.document.write(`
        < html >
                                                        <head>
                                                            <title>${title}</title>
                                                            <style>
                                                                @page { size: A5 landscape; margin: 10mm; }
                                                                body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #333; }
                                                                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; }
                                                                .info { margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; font-size: 0.9rem; }
                                                                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                                                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                                                th { background: #f9f9f9; }
                                                                .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                                                                .sign { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; }
                                                            </style>
                                                        </head>
                                                        <body>
                                                            <div class="header">
                                                                <div>
                                                                    <h1 style="margin:0">${title}</h1>
                                                                    <div style="opacity:0.7">${stats.organization.name}</div>
                                                                </div>
                                                                <div style="text-align:right">
                                                                    <b>N°:</b> ${movement?.id?.slice(-8).toUpperCase() || 'TEMP'}<br>
                                                                    <b>Date:</b> ${new Date().toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <div class="info">
                                                                <div>
                                                                    <b>Article:</b> ${showAdjustModal.product.name}<br>
                                                                    <b>Dépôt:</b> ${fd.get("warehouseId")}
                                                                </div>
                                                                <div>
                                                                    <b>Type:</b> ${type}<br>
                                                                    <b>Motif:</b> ${fd.get("reason") || 'Ajustement manuel'}
                                                                </div>
                                                            </div>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Désignation</th>
                                                                        <th>Quantité</th>
                                                                        <th>Unité</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td>${showAdjustModal.product.name}</td>
                                                                        <td>${fd.get("quantity")}</td>
                                                                        <td>${showAdjustModal.product.unit}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <div class="footer">
                                                                <div class="sign">Le Magasinier</div>
                                                                <div class="sign">Visa Direction</div>
                                                            </div>
                                                            <script>window.onload = () => { window.print(); window.close(); };</script>
                                                        </body>
                                                        </html >
        `);
                                                    win.document.close();
                                                }
                                            });
                                        } else {
                                            showMessage("Succès", "Mouvement enregistré", "success");
                                        }
                                        setShowAdjustModal({ show: false });
                                        refreshData();
                                    } else {
                                        showMessage("Erreur", res.error || "Échec de l'ajustement", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau lors de l'ajustement", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <select title="Dépôt" name="warehouseId" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                                <select title="Mouvement" name="type" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                    <option value="IN">Entrée (+)</option>
                                    <option value="OUT">Sortie (-)</option>
                                    <option value="ADJUST">Correction (Total)</option>
                                </select>

                                {showAdjustModal.product.units && showAdjustModal.product.units.length > 0 && (
                                    <select title="Unité" name="unitId" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        <option value="">Unité de base ({showAdjustModal.product.unit})</option>
                                        {showAdjustModal.product.units.map((u: any) => (
                                            <option key={u.id} value={u.id}>{u.unitName} (x{u.conversion})</option>
                                        ))}
                                    </select>
                                )}

                                <input name="quantity" type="number" step="0.01" placeholder="Quantité" required style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '1.2rem' }} />
                                <input name="reason" placeholder="Motif (ex: Réception, Casse...)" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                    <input name="aisle" placeholder="Allée" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                    <input name="shelf" placeholder="Étagère" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                    <input name="bin" placeholder="Casier" style={{ background: 'var(--glass)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '15px', marginTop: '1rem' }}>VALIDER LE MOUVEMENT</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Warehouse Modal */}
            <AnimatePresence>
                {showWarehouseModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3100, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Nouveau Dépôt</h2>
                                <button title="Fermer" onClick={() => setShowWarehouseModal(false)} className="text-white hover:text-danger" style={{ background: 'none', border: 'none' }}><X /></button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                try {
                                    if (stats.orgId === "N/A") return showMessage("Erreur", "Erreur: ID Organisation invalide", "error");
                                    setLoading(true);
                                    const res = await Repository.createWarehouse({
                                        name: fd.get("name") as string,
                                        address: fd.get("address") as string,
                                        organizationId: stats.orgId
                                    });
                                    if (res.success) {
                                        showMessage("Succès", "Dépôt créé !", "success");
                                        setShowWarehouseModal(false);
                                        refreshData();
                                    } else {
                                        showMessage("Erreur", (res as any).error || "Erreur création", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau dépôt", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input name="name" placeholder="Nom du Dépôt (ex: Dépôt Central)" required className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                <input name="address" placeholder="Ville / Zone" className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                <button disabled={loading} className="btn-primary" style={{ padding: '15px' }}>CRÉER LE DÉPÔT</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Category Modal */}
            <AnimatePresence>
                {showCategoryModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3100, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>Hiérarchie Catégories</h2>
                                <button title="Fermer" onClick={() => setShowCategoryModal(false)} className="text-white hover:text-danger" style={{ background: 'none', border: 'none' }}><X /></button>
                            </div>

                            <div className="custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {stats.categories.filter((c: any) => !c.parentId).map((parent: any) => (
                                    <div key={parent.id} className="glass" style={{ borderRadius: '8px', padding: '10px' }}>
                                        <div style={{ fontWeight: 700 }}>{parent.name}</div>
                                        <div style={{ marginLeft: '1rem', marginTop: '0.5rem', borderLeft: '2px solid var(--primary)', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            {parent.children?.map((child: any) => (
                                                <div key={child.id} className="text-muted" style={{ fontSize: '0.85rem' }}>↳ {child.name}</div>
                                            ))}
                                            {parent.children?.length === 0 && <span className="text-muted" style={{ fontSize: '0.7rem' }}>Aucune sous-catégorie</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                try {
                                    if (stats.orgId === "N/A") return showMessage("Erreur", "Erreur: ID Organisation invalide", "error");
                                    setLoading(true);
                                    const res = await Repository.createCategory(fd.get("name") as string, stats.orgId, fd.get("parentId") as string);
                                    if (res.success) {
                                        showMessage("Succès", "Catégorie créée !", "success");
                                        setShowCategoryModal(false); // Changed from { show: false } to false
                                        // Refresh categories
                                        const updated = await Repository.getCategories(stats.orgId) as any;
                                        if (updated.success) setCategories(updated.data);
                                    } else {
                                        showMessage("Erreur", (res as any).error || "Erreur création", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau catégorie", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                <h4 style={{ margin: 0 }}>Nouvelle Catégorie</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input name="name" placeholder="Nom (ex: Boissons)" required className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    <select title="Parent" name="parentId" className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }}>
                                        <option value="" style={{ color: 'black' }}>-- Sans Parent --</option>
                                        {stats.categories.filter((c: any) => !c.parentId).map((c: any) => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px' }}>AJOUTER CATÉGORIE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Supplier Modal */}
            <AnimatePresence>
                {showSupplierModal.show && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2>{showSupplierModal.supplier ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}</h2>
                                <button title="Fermer" onClick={() => setShowSupplierModal({ show: false })} className="text-white hover:text-danger" style={{ background: 'none', border: 'none' }}><X /></button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                try {
                                    if (stats.orgId === "N/A") return showMessage("Erreur", "Erreur: ID Organisation invalide", "error");
                                    setLoading(true);

                                    const data = {
                                        name: fd.get("name") as string,
                                        contactName: fd.get("contactName") as string,
                                        phone: fd.get("phone") as string,
                                        email: fd.get("email") as string,
                                        address: fd.get("address") as string,
                                        nif: fd.get("nif") as string,
                                        nis: fd.get("nis") as string,
                                        rc: fd.get("rc") as string,
                                        ai: fd.get("ai") as string,
                                        orgId: stats.orgId,
                                        organizationId: stats.orgId
                                    };

                                    const res = showSupplierModal.supplier
                                        ? await Repository.updateSupplier(showSupplierModal.supplier.id, data)
                                        : await Repository.createSupplier(data);

                                    if (res.success) {
                                        showMessage("Succès", showSupplierModal.supplier ? "Fournisseur modifié avec succès !" : "Fournisseur créé avec succès !", "success");
                                        if (creationContext === 'purchase' && !showSupplierModal.supplier) {
                                            setPurchaseSupplier((res as any).supplier || { id: (res as any).id, name: fd.get("name") });
                                        }
                                        setShowSupplierModal({ show: false });
                                        setCreationContext('standard');
                                        const updatedSuppliers = await Repository.getSuppliers(stats.orgId) as any;
                                        if (updatedSuppliers.success) setSuppliers(updatedSuppliers.data);
                                    } else {
                                        showMessage("Erreur", (res as any).error || "Échec de l'opération", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau lors de l'opération", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                    <input name="name" defaultValue={showSupplierModal.supplier?.name} placeholder="Nom de l'entreprise *" required className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    <input name="contactName" defaultValue={showSupplierModal.supplier?.contactName} placeholder="Nom du contact" className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input name="phone" defaultValue={showSupplierModal.supplier?.phone} placeholder="Téléphone" className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                    <input name="email" type="email" defaultValue={showSupplierModal.supplier?.email} placeholder="Email" className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <textarea name="address" defaultValue={showSupplierModal.supplier?.address} placeholder="Adresse complète" rows={2} className="glass" style={{ width: '100%', padding: '12px', borderRadius: '8px', color: 'white', resize: 'vertical' }} />

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <h4 className="text-muted" style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Identifiants Fiscaux</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <input name="nif" defaultValue={showSupplierModal.supplier?.nif} placeholder="NIF" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                        <input name="nis" defaultValue={showSupplierModal.supplier?.nis} placeholder="NIS" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <input name="rc" defaultValue={showSupplierModal.supplier?.nif} placeholder="RC (Registre de Commerce)" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                        <input name="ai" defaultValue={showSupplierModal.supplier?.ai} placeholder="AI (Article d'Imposition)" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'white' }} />
                                    </div>
                                </div>

                                <button disabled={loading} className="btn-primary" style={{ padding: '15px', marginTop: '1rem' }}>
                                    {showSupplierModal.supplier ? 'MODIFIER FOURNISSEUR' : 'ENREGISTRER FOURNISSEUR'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Quick Expense Modal (Sortie Caisse) */}
            <AnimatePresence>
                {showQuickExpense && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3500, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)' }}>
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ width: '400px', border: '1px solid var(--warning)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h2 className="text-warning" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Minus size={24} /> Sortie de Caisse</h2>
                                <button onClick={() => setShowQuickExpense(false)} className="glass text-white hover:text-danger"><X size={18} /></button>
                            </div>
                            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Enregistrez une dépense rapide prise directement dans le tiroir-caisse.</p>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                setLoading(true);
                                const res = await Repository.createExpense({
                                    label: `Sortie POS: ${fd.get("reason")} `,
                                    amount: Number(fd.get("amount")),
                                    category: "OPERATIONAL",
                                    orgId: stats.orgId,
                                    organizationId: stats.orgId
                                });
                                setLoading(false);
                                if (res.success) {
                                    setShowQuickExpense(false);
                                    showMessage("Succès", "Dépense enregistrée !", "success");
                                    const updatedAccounts = await Repository.getAccounts(stats.orgId);
                                    if (updatedAccounts.success) setAccounts(updatedAccounts.data);
                                    refreshData();
                                } else {
                                    showMessage("Erreur", "Erreur lors de l'enregistrement", "error");
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '5px' }}>Montant Retiré (DA)</label>
                                    <input name="amount" type="number" placeholder="0.00" required autoFocus className="glass font-black" style={{ width: '100%', padding: '15px', borderRadius: '12px', color: 'white', fontSize: '1.5rem', textAlign: 'center' }} />
                                </div>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '5px' }}>Motif (Café, Transport, etc...)</label>
                                    <input name="reason" placeholder="Ex: Café bureau" required className="glass" style={{ width: '100%', padding: '12px', borderRadius: '12px', color: 'white' }} />
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '1.2rem', background: 'var(--warning)', color: 'black', fontWeight: 900 }}>VALIDER LA SORTIE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Client History Modal */}
            <AnimatePresence>
                {showClientHistoryModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3100, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>Historique Client</h2>
                                <button title="Fermer" onClick={() => setShowClientHistoryModal(false)} className="text-white hover:text-danger" style={{ background: 'none', border: 'none' }}><X /></button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr className="text-muted" style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '10px' }}>Date</th>
                                        <th style={{ padding: '10px' }}>Opération</th>
                                        <th style={{ padding: '10px' }}>Montant</th>
                                        <th style={{ padding: '10px' }}>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientHistory.map((t: any) => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '10px' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px' }}>
                                                {t.type === 'SALE' ? 'Achat' : 'Versement'}
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{t.paymentMode}</div>
                                            </td>
                                            <td style={{ padding: '10px', fontWeight: 700, color: t.type === 'DEBT_PAYMENT' ? 'var(--success)' : 'white' }}>
                                                {t.type === 'DEBT_PAYMENT' ? '-' : '+'}{t.totalAmount.toLocaleString()} DA
                                                {t.type === 'SALE' && t.paidAmount < t.totalAmount && (
                                                    <span className="text-danger" style={{ display: 'block', fontSize: '0.7rem' }}>Reste: {(t.totalAmount - t.paidAmount).toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <span className="badge badge-success">Validé</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {clientHistory.length === 0 && <tr><td colSpan={4} className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>Aucun historique.</td></tr>}
                                </tbody>
                            </table>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Z-Report Modal */}
            <AnimatePresence>
                {showZReportModal && zReportData && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 3500, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)' }}>
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={24} className="text-primary" /> Clôture de Caisse (Z)</h2>
                                <button onClick={() => setShowZReportModal(false)} className="glass text-white hover:text-danger"><X size={18} /></button>
                            </div>

                            <div className="glass" style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>Ventes Totales:</span>
                                    <b className="text-success">{zReportData.totalSales.toLocaleString()} DA</b>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>Charges (Sorties):</span>
                                    <b className="text-danger">-{zReportData.totalExpenses.toLocaleString()} DA</b>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }} />
                                <div className="font-black" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                                    <span>Théorique Caisse:</span>
                                    <span>{zReportData.netCashTheoretical.toLocaleString()} DA</span>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const counted = Number(fd.get("cashCounted"));
                                const variance = counted - zReportData.netCashTheoretical;

                                showConfirm("Confirmation", "Confirmer la clôture de caisse ? Cette action est irréversible.", async () => {
                                    setLoading(true);
                                    try {
                                        const res = await Repository.createZReport({
                                            orgId: stats.orgId,
                                            organizationId: stats.orgId,
                                            totalSales: zReportData.totalSales,
                                            totalExpenses: zReportData.totalExpenses,
                                            netTotal: zReportData.netCashTheoretical,
                                            cashCounted: counted,
                                            variance: variance,
                                            details: zReportData.paymentModes
                                        });

                                        if (res.success) {
                                            showMessage("Succès", "Clôture effectuée avec succès !", "success");
                                            setShowZReportModal(false);
                                            await handlePrintZReport({ ...zReportData, cashCounted: counted, variance });
                                            window.location.reload(); // Refresh to start new shift cleanly
                                        } else {
                                            showMessage("Erreur", res.error || "Erreur lors de la clôture", "error");
                                        }
                                    } catch (error) {
                                        showMessage("Erreur", "Erreur réseau lors de la clôture", "error");
                                    } finally {
                                        setLoading(false);
                                    }
                                });
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label className="text-muted" style={{ fontSize: '0.8rem' }}>Espèces Comptées (Réel)</label>
                                    <input
                                        name="cashCounted"
                                        type="number"
                                        autoFocus
                                        required
                                        placeholder="Combien avez-vous trouvé ?"
                                        className="glass font-black"
                                        style={{ width: '100%', padding: '15px', borderRadius: '12px', color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
                                    />
                                </div>

                                <div className="text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                                    Note: L'écart sera calculé et enregistré automatiquement.
                                </div>

                                <button disabled={loading} className="btn-primary" style={{ padding: '1.2rem', background: 'var(--primary)', color: 'white', fontWeight: 900 }}>VALIDER LA CLÔTURE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Attendance History Modal */}
            {
                showAttendanceHistory.show && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Présences: {showAttendanceHistory.employee?.name}</h2>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Historique mensuel</div>
                                </div>
                                <button onClick={() => setShowAttendanceHistory({ show: false })} className="text-white hover:text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                                <input
                                    type="month"
                                    value={attendanceMonth}
                                    onChange={(e) => {
                                        setAttendanceMonth(e.target.value);
                                        loadAttendance(showAttendanceHistory.employee?.id, e.target.value);
                                    }}
                                    className="glass"
                                    style={{ color: 'white', padding: '10px', borderRadius: '8px', flex: 1 }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                                <div className="glass" style={{ padding: '10px', textAlign: 'center', borderRadius: '10px' }}>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Présents</div>
                                    <div className="font-bold text-success" style={{ fontSize: '1.2rem' }}>
                                        {attendanceHistory.filter(r => r.status === 'PRESENT').length}
                                    </div>
                                </div>
                                <div className="glass" style={{ padding: '10px', textAlign: 'center', borderRadius: '10px' }}>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Retards</div>
                                    <div className="font-bold text-warning" style={{ fontSize: '1.2rem' }}>
                                        {attendanceHistory.filter(r => r.status === 'LATE').length}
                                    </div>
                                </div>
                                <div className="glass" style={{ padding: '10px', textAlign: 'center', borderRadius: '10px' }}>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Absents</div>
                                    <div className="font-bold text-danger" style={{ fontSize: '1.2rem' }}>
                                        {attendanceHistory.filter(r => r.status === 'ABSENT').length}
                                    </div>
                                </div>
                            </div>

                            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-deep)', zIndex: 1 }}>
                                        <tr className="text-muted" style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '10px', fontSize: '0.8rem' }}>Date</th>
                                            <th style={{ padding: '10px', fontSize: '0.8rem' }}>Entrée / Sortie</th>
                                            <th style={{ padding: '10px', fontSize: '0.8rem' }}>Status</th>
                                            <th style={{ padding: '10px', fontSize: '0.8rem' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Generate list of days for the selected month */}
                                        {(() => {
                                            const [year, month] = attendanceMonth.split('-').map(Number);
                                            const daysInMonth = new Date(year, month, 0).getDate();
                                            const rows = [];

                                            for (let d = daysInMonth; d >= 1; d--) {
                                                const dayDate = new Date(year, month - 1, d);
                                                const dateStr = dayDate.toLocaleDateString();
                                                const isoDateStr = dayDate.toISOString().slice(0, 10);

                                                // Find existing record
                                                const record = attendanceHistory.find(r => new Date(r.date).toISOString().slice(0, 10) === isoDateStr);

                                                rows.push(
                                                    <tr key={d} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                                                            {dayDate.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })}
                                                        </td>
                                                        <td className="text-muted" style={{ padding: '10px', fontSize: '0.75rem' }}>
                                                            {record?.clockIn ? new Date(record.clockIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                            {record?.clockOut ? ` - ${new Date(record.clockOut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ` : ''}
                                                        </td>
                                                        <td style={{ padding: '10px' }}>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                background: record?.status === 'PRESENT' ? 'rgba(34,197,94,0.1)' : record?.status === 'LATE' ? 'rgba(234,179,8,0.1)' : record?.status === 'ABSENT' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                                                color: record?.status === 'PRESENT' ? 'var(--success)' : record?.status === 'LATE' ? 'var(--warning)' : record?.status === 'ABSENT' ? 'var(--danger)' : 'inherit'
                                                            }}>
                                                                {record?.status || '---'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '10px' }}>
                                                            <select
                                                                value={record?.status || ""}
                                                                onChange={async (e) => {
                                                                    try {
                                                                        setLoading(true);
                                                                        const res = await Repository.setAttendanceManual({
                                                                            employeeId: showAttendanceHistory.employee?.id,
                                                                            organizationId: stats.orgId,
                                                                            date: isoDateStr,
                                                                            status: e.target.value
                                                                        });
                                                                        if (res.success) {
                                                                            loadAttendance(showAttendanceHistory.employee?.id, attendanceMonth);
                                                                            refreshData();
                                                                        }
                                                                        else showMessage("Erreur", (res as any).error || "Échec de l'opération", "error");
                                                                    } catch (error) {
                                                                        showMessage("Erreur", "Erreur réseau lors de la mise à jour de la présence", "error");
                                                                    } finally {
                                                                        setLoading(false);
                                                                    }
                                                                }}
                                                                className="glass"
                                                                style={{ border: 'none', color: 'white', fontSize: '0.7rem', borderRadius: '4px', padding: '2px 5px' }}
                                                            >
                                                                <option value="" disabled style={{ color: 'black' }}>Changer</option>
                                                                <option value="PRESENT" style={{ color: 'black' }}>Présent</option>
                                                                <option value="LATE" style={{ color: 'black' }}>Retard</option>
                                                                <option value="ABSENT" style={{ color: 'black' }}>Absent</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            return rows;
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            {/* Employee Modal */}
            <EmployeeModal
                show={showEmployeeModal}
                editingEmployee={editingEmployee}
                onClose={() => setShowEmployeeModal(false)}
                loading={loading}
                orgId={stats.orgId}
                employeeLimit={stats.organization?.employeeLimit}
                currentEmployeesCount={employees.length}
                onSubmit={async (data: any) => {
                    setLoading(true);
                    try {
                        let res;
                        if (editingEmployee) {
                            res = await Repository.updateEmployee(editingEmployee.id, data);
                        } else {
                            res = await Repository.createEmployee({ ...data, organizationId: stats.orgId });
                        }
                        if (res.success) {
                            showMessage("Succès", "Employé enregistré !", "success");
                            setShowEmployeeModal(false);
                            loadHR();
                            refreshData();
                        } else {
                            showMessage("Erreur", "Erreur : " + ((res as any).error || "Échec de l'enregistrement"), "error");
                        }
                    } catch (error) {
                        showMessage("Erreur", "Erreur réseau lors de l'enregistrement de l'employé", "error");
                    } finally {
                        setLoading(false);
                    }
                }}
            />
            {/* Payroll Modal */}
            {
                showPayrollModal.show && payrollData && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card printable-card" style={{ width: '100%', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Fiche de Paie</h2>
                                <button onClick={() => setShowPayrollModal({ show: false })} className="text-white hover:text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{payrollData.employeeName}</div>
                                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Période : {payrollData.month}</div>
                            </div>

                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span className="text-muted">Salaire de Base</span>
                                    <span>{payrollData.baseSalary.toLocaleString()} DA</span>
                                </div>
                                <div className="text-danger" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ opacity: 0.8 }}>Absences ({payrollData.absentDays}j)</span>
                                    <span>- {Math.round(payrollData.attendanceDed).toLocaleString()} DA</span>
                                </div>
                                <div className="text-danger" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ opacity: 0.8 }}>Avances ({payrollData.advanceCount})</span>
                                    <span>- {payrollData.advancesDed.toLocaleString()} DA</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span className="text-muted">Commissions</span>
                                    <span>+ {payrollData.commissions.toLocaleString()} DA</span>
                                </div>
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
                                    <span>Net à Payer</span>
                                    <span className="text-primary-glow" style={{ color: 'var(--primary)' }}>{Math.round(payrollData.netPayable).toLocaleString()} DA</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => window.print()}
                                    className="glass"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px' }}
                                >
                                    Imprimer
                                </button>
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const res = await Repository.savePayroll({
                                                ...payrollData,
                                                organizationId: stats.orgId
                                            });
                                            if (res.success) {
                                                showMessage("Succès", "Fiche de paie enregistrée !", "success");
                                                setShowPayrollModal({ show: false });
                                                loadHR();
                                                refreshData();
                                            } else {
                                                showMessage("Erreur", res.error || "Échec de l'enregistrement de la paie", "error");
                                            }
                                        } catch (error) {
                                            showMessage("Erreur", "Erreur réseau lors de l'enregistrement de la paie", "error");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="btn-primary"
                                    style={{ flex: 2, padding: '12px', fontWeight: 700 }}
                                >
                                    Valider et Clôturer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
            }
            {/* --- FINANCE MODALS --- */}
            {/* Pay Programmed Expense Modal */}
            <AnimatePresence>
                {showPayExpenseModal.show && (
                    <div className="modal-overlay">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ width: '400px', border: '1px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3>Régler la Charge</h3>
                                <button title="Fermer" onClick={() => setShowPayExpenseModal({ show: false, expense: null })} className="text-white hover:text-danger" style={{ background: 'none', border: 'none' }}><X /></button>
                            </div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Vous allez régler la charge : <b>{showPayExpenseModal.expense?.label}</b> d'un montant de <b>{showPayExpenseModal.expense?.amount.toLocaleString()} DA</b>.
                            </p>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                setLoading(true);
                                try {
                                    const res = await Repository.payExpense(showPayExpenseModal.expense.id, fd.get("acc") as string, stats.orgId);
                                    if (res.success) {
                                        setShowPayExpenseModal({ show: false, expense: null });
                                        showMessage("Succès", "Charge réglée !", "success");
                                        refreshData();
                                    } else {
                                        showMessage("Erreur", "Une erreur est survenue", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau lors du règlement de la charge", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Sélectionner le compte de paiement :</label>
                                <select title="Compte" name="acc" required style={{ width: '100%', background: 'var(--glass)', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px', color: 'white' }}>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()} DA)</option>)}
                                </select>
                                <button disabled={loading} className="btn-primary" style={{ padding: '1rem', background: 'var(--accent)', color: 'black' }}>VALIDER LE PAIEMENT</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Account Modal */}
            <AnimatePresence>
                {showAccountModal && (
                    <div className="modal-overlay" style={{ zIndex: 3200 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card" style={{ width: '450px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>Nouveau Compte</h2>
                                <button onClick={() => setShowAccountModal(false)} className="glass hover:text-danger"><X size={18} /></button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                setLoading(true);
                                try {
                                    const res = await Repository.createAccount({
                                        name: fd.get("name") as string,
                                        type: fd.get("type") as string,
                                        balance: Number(fd.get("balance")),
                                        orgId: stats.orgId,
                                        organizationId: stats.orgId
                                    });
                                    if (res.success) {
                                        setShowAccountModal(false);
                                        showMessage("Succès", "Compte créé avec succès !", "success");
                                    } else {
                                        showMessage("Erreur", res.error || "Erreur création compte", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau lors de la création du compte", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.8rem' }}>Nom du Compte</label>
                                    <input name="name" required placeholder="Ex: Caisse Principale, CPA..." className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px' }} />
                                </div>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.8rem' }}>Type</label>
                                    <select name="type" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)' }}>
                                        <option value="CASH">Espèces (Caisse)</option>
                                        <option value="BANK">Banque</option>
                                        <option value="MOBILE">Mobile (Baridi/Pajér)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.8rem' }}>Solde Initial</label>
                                    <input name="balance" type="number" defaultValue={0} className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px' }} />
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '12px', marginTop: '10px' }}>CRÉER LE COMPTE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Transfer Modal */}
            <AnimatePresence>
                {showTransferModal && (
                    <div className="modal-overlay" style={{ zIndex: 3200 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card" style={{ width: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>Virement Interne</h2>
                                <button onClick={() => setShowTransferModal(false)} className="glass hover:text-danger"><X size={18} /></button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const fromId = fd.get("fromId") as string;
                                const toId = fd.get("toId") as string;
                                const amount = Number(fd.get("amount"));

                                if (fromId === toId) return showMessage("Erreur", "Le compte source et destination doivent être différents", "error");

                                setLoading(true);
                                try {
                                    const res = await Repository.transferFunds({
                                        fromId,
                                        toId,
                                        amount,
                                        reason: fd.get("reason") as string,
                                        orgId: stats.orgId,
                                        organizationId: stats.orgId
                                    });

                                    if (res.success) {
                                        setShowTransferModal(false);
                                        showMessage("Succès", "Virement effectué !", "success");
                                    } else {
                                        showMessage("Erreur", res.error || "Erreur lors du virement", "error");
                                    }
                                } catch (error) {
                                    showMessage("Erreur", "Erreur réseau lors du virement", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '0.8rem' }}>De (Source)</label>
                                        <select name="fromId" required className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)' }}>
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-muted" style={{ fontSize: '0.8rem' }}>Vers (Destination)</label>
                                        <select name="toId" required className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)' }}>
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.8rem' }}>Montant (DA)</label>
                                    <input name="amount" type="number" required min={1} className="glass font-black" style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '1.2rem' }} />
                                </div>
                                <div>
                                    <label className="text-muted" style={{ fontSize: '0.8rem' }}>Motif</label>
                                    <input name="reason" required placeholder="Ex: Alimentation Caisse" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px' }} />
                                </div>
                                <button disabled={loading} className="btn-primary" style={{ padding: '12px', marginTop: '10px' }}>EFFECTUER VIREMENT</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- CUSTOM GLOBAL MODALS --- */}

            {/* Message Modal */}
            <AnimatePresence>
                {messageModal.show && (
                    <div className="modal-overlay" style={{ zIndex: 10000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="premium-card" style={{ width: '400px', maxWidth: '90vw' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', padding: '1rem' }}>
                                {messageModal.type === 'success' && <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={32} /></div>}
                                {messageModal.type === 'error' && <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={32} /></div>}
                                {messageModal.type === 'info' && <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={32} /></div>}

                                <h3 style={{ margin: 0 }}>{messageModal.title}</h3>
                                <p style={{ opacity: 0.8, margin: 0 }}>{messageModal.message}</p>

                                <button onClick={() => {
                                    setMessageModal(prev => ({ ...prev, show: false }));
                                    if (messageModal.onClose) messageModal.onClose();
                                }} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>OK</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="modal-overlay" style={{ zIndex: 10000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="premium-card" style={{ width: '400px', maxWidth: '90vw' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', padding: '1rem' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={32} /></div>

                                <h3 style={{ margin: 0 }}>{confirmModal.title}</h3>
                                <p style={{ opacity: 0.8, margin: 0 }}>{confirmModal.message}</p>

                                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                                    <button onClick={() => {
                                        setConfirmModal(prev => ({ ...prev, show: false }));
                                        if (confirmModal.onCancel) confirmModal.onCancel();
                                    }} className="glass" style={{ flex: 1 }}>Annuler</button>
                                    <button onClick={() => {
                                        setConfirmModal(prev => ({ ...prev, show: false }));
                                        confirmModal.onConfirm();
                                    }} className="btn-primary" style={{ flex: 1 }}>Confirmer</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Prompt Modal */}
            <AnimatePresence>
                {promptModal.show && (
                    <div className="modal-overlay" style={{ zIndex: 10000 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="premium-card" style={{ width: '400px', maxWidth: '90vw' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                                <h3 style={{ margin: 0, textAlign: 'center' }}>{promptModal.title}</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 700 }}>{promptModal.label}</label>
                                    <input
                                        autoFocus
                                        title={promptModal.label}
                                        type={promptModal.type || 'text'}
                                        defaultValue={promptModal.defaultValue}
                                        id="prompt-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setPromptModal(prev => ({ ...prev, show: false }));
                                                promptModal.onConfirm((e.currentTarget as HTMLInputElement).value);
                                            }
                                        }}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'black' }}
                                    />
                                    {promptModal.allowFileUpload && (
                                        <div style={{ marginTop: '1rem', border: '2px dashed var(--primary)', borderRadius: '12px', padding: '1rem', textAlign: 'center', background: 'rgba(var(--primary-rgb), 0.05)' }}>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--primary-dark)' }}>Ou sélectionnez un fichier :</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 1024 * 1024) {
                                                            showMessage("Erreur", "L'image est trop grande (max 1Mo)", "error");
                                                            e.target.value = "";
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const input = document.getElementById('prompt-input') as HTMLInputElement;
                                                            if (input) {
                                                                input.value = reader.result as string;
                                                                showMessage("Info", "Image chargée avec succès (cliquez sur Valider)", "info");
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                style={{ fontSize: '0.85rem', width: '100%' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                    <button onClick={() => {
                                        setPromptModal(prev => ({ ...prev, show: false }));
                                        if (promptModal.onCancel) promptModal.onCancel();
                                    }} className="glass" style={{ flex: 1 }}>Annuler</button>
                                    <button onClick={() => {
                                        const val = (document.getElementById('prompt-input') as HTMLInputElement).value;
                                        setPromptModal(prev => ({ ...prev, show: false }));
                                        promptModal.onConfirm(val);
                                    }} className="btn-primary" style={{ flex: 1 }}>Valider</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Admin Modals */}
            <UserModal
                show={showUserModal.show}
                user={showUserModal.user}
                roles={allRoles}
                employees={employees}
                organizationId={stats.orgId}
                onClose={() => setShowUserModal({ show: false })}
                onSave={handleSaveUser}
                userLimit={stats.organization?.userLimit}
                currentUsersCount={stats.allUsers?.length || 0}
            />

            <RoleModal
                show={showRoleModal.show}
                role={showRoleModal.role}
                organizationId={stats.orgId}
                onClose={() => setShowRoleModal({ show: false })}
                onSave={handleSaveRole}
            />

            <PermissionsModal
                show={showPermissionsModal.show}
                role={showPermissionsModal.role}
                allPermissions={allPermissions}
                onClose={() => setShowPermissionsModal({ show: false })}
                onSave={handleSavePermissions}
            />
        </div >
    );
}
