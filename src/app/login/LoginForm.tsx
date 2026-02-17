"use client";

import { useState } from "react";
import { login } from "../auth-actions";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                if (result.token) {
                    localStorage.setItem('ideal_gestion_sync_token', result.token);
                }
                router.push("/");
                router.refresh();
            }
        } catch (e) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginLeft: '4px' }}>Email ou Identifiant</label>
                <input
                    title="Email ou Nom d'utilisateur"
                    name="email"
                    type="text"
                    placeholder="Email ou Nom d'utilisateur"
                    required
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '14px', color: 'white', outline: 'none' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginLeft: '4px' }}>Mot de passe</label>
                <input
                    title="Mot de passe"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '14px', color: 'white', outline: 'none' }}
                />
            </div>

            <button
                disabled={loading}
                type="submit"
                style={{
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '10px',
                    opacity: loading ? 0.7 : 1,
                    transition: 'transform 0.2s ease'
                }}
            >
                {loading ? "CONNEXION EN COURS..." : "SE CONNECTER"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                Mot de passe oublié ? Contactez votre administrateur.
            </div>
        </form>
    );
}
