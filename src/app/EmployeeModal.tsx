import { motion } from "framer-motion";
import { X } from "lucide-react";

interface EmployeeModalProps {
    show: boolean;
    editingEmployee: any;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    loading: boolean;
    orgId: string;
    employeeLimit?: number;
    currentEmployeesCount?: number;
}

export default function EmployeeModal({
    show, editingEmployee, onClose, onSubmit, loading, orgId,
    employeeLimit = 1000,
    currentEmployeesCount = 0
}: EmployeeModalProps) {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>{editingEmployee ? 'Modifier Employé' : 'Nouvel Employé'}</h3>
                    <button title="Fermer" onClick={onClose} className="glass" style={{ padding: '8px', color: 'var(--danger)' }}><X size={18} /></button>
                </div>

                {!editingEmployee && currentEmployeesCount >= employeeLimit && (
                    <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <X size={16} />
                        <span><strong>Limite atteinte :</strong> Vous avez atteint votre quota de {employeeLimit} employés.</span>
                    </div>
                )}

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const data = {
                        organizationId: orgId,
                        name: fd.get("name"),
                        phone: fd.get("phone"),
                        role: fd.get("role"),
                        baseSalary: fd.get("baseSalary"),
                        commissionPct: fd.get("commissionPct"),
                        monthlyGoal: fd.get("monthlyGoal"),
                        contractType: fd.get("contractType"),
                        pinCode: fd.get("pinCode")
                    };
                    const isLimitReached = !editingEmployee && currentEmployeesCount >= employeeLimit;
                    if (isLimitReached) {
                        alert(`Limite d'employés atteinte (${employeeLimit}). Veuillez augmenter votre forfait.`);
                        return;
                    }
                    await onSubmit(data);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>Nom Complet</label>
                            <input name="name" defaultValue={editingEmployee?.name} required placeholder="Nom Prénom" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>Téléphone</label>
                            <input name="phone" defaultValue={editingEmployee?.phone} placeholder="0555..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>Rôle</label>
                            <select title="Rôle de l'employé" name="role" defaultValue={editingEmployee?.role || "EMPLOYEE"} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <option value="MANAGER">MANAGER (Gérant)</option>
                                <option value="SELLER">SELLER (Vendeur)</option>
                                <option value="DRIVER">DRIVER (Livreur)</option>
                                <option value="EMPLOYEE">EMPLOYEE (Autre)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>Contrat</label>
                            <select title="Type de contrat" name="contractType" defaultValue={editingEmployee?.contractType || "CDI"} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <option value="CDI">CDI</option>
                                <option value="CDD">CDD</option>
                                <option value="APPRENTI">Apprenti</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-deep)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>Finance & Salaire</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label className="text-muted" style={{ fontSize: '0.8rem' }}>Salaire de Base (DA)</label>
                            <input name="baseSalary" type="number" defaultValue={editingEmployee?.baseSalary || 0} required style={{ fontWeight: 'bold', color: 'var(--primary-dark)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label className="text-muted" style={{ fontSize: '0.8rem' }}>Objectif Mensuel (DA)</label>
                                <input name="monthlyGoal" type="number" defaultValue={editingEmployee?.monthlyGoal || 0} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label className="text-muted" style={{ fontSize: '0.8rem' }}>Commission (%)</label>
                                <input name="commissionPct" type="number" step="0.1" defaultValue={editingEmployee?.commissionPct || 0} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label className="text-muted" style={{ fontSize: '0.8rem' }}>Code PIN (Accès Borne)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input name="pinCode" defaultValue={editingEmployee?.pinCode} placeholder="4 chiffres" style={{ flex: 1, letterSpacing: '5px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            <button type="button" onClick={() => {
                                const pin = Math.floor(1000 + Math.random() * 9000);
                                const input = document.querySelector('input[name="pinCode"]') as HTMLInputElement;
                                if (input) input.value = pin.toString();
                            }} className="glass" style={{ padding: '0 15px', color: 'var(--primary)' }}>Générer</button>
                        </div>
                    </div>

                    <button disabled={loading} className="btn-primary" style={{ padding: '12px', marginTop: '1rem' }}>ENREGISTRER</button>
                </form>
            </motion.div>
        </div>
    );
}
