"use client";

import React, { useState, useEffect, use } from "react";
import { MoveLeft, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { clockIn, clockOut } from "@/lib/db-wrapper";

export default function ClockInPage({ searchParams }: { searchParams: Promise<{ orgId: string }> }) {
    const { orgId: initialOrgId } = use(searchParams);
    const [pin, setPin] = useState("");
    const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
    const [message, setMessage] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [orgId, setOrgId] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleInput = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleSubmit = async (action: "IN" | "OUT") => {
        if (pin.length !== 4) return;
        setLoading(true);
        setStatus("IDLE");
        setMessage("");

        const ip = "127.0.0.1";

        const urlParams = new URLSearchParams(window.location.search);
        const currentOrgId = urlParams.get('orgId');

        if (!currentOrgId) {
            setStatus("ERROR");
            setMessage("Erreur configuration: ID Organisation manquant dans l'URL.");
            setLoading(false);
            return;
        }

        let res;
        if (action === "IN") {
            res = await clockIn(pin, currentOrgId, ip);
        } else {
            res = await clockOut(pin, currentOrgId);
        }

        if (res.success) {
            setStatus("SUCCESS");
            setEmployeeName((res as any).employeeName || "");
            setMessage(action === "IN" ? "Bonjour, bon travail !" : "Au revoir, à demain !");
            setPin("");
            setTimeout(() => {
                setStatus("IDLE");
                setEmployeeName("");
            }, 3000);
        } else {
            setStatus("ERROR");
            setMessage((res as any).error || "Erreur inconnue");
            setPin("");
        }
        setLoading(false);
    };

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#1a1a1a', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>

            {/* Header */}
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
                <Clock size={24} />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>POINTAGE</span>
            </div>

            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '5rem', fontWeight: 900, margin: 0, textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
                    {currentTime || "--:--"}
                </h1>
                <p style={{ opacity: 0.6, fontSize: '1.2rem' }}>Entrez votre code PIN personnel</p>
            </div>

            {/* Status Message */}
            {status === "SUCCESS" && (
                <div style={{ marginBottom: '2rem', background: 'rgba(0,255,100,0.1)', color: '#4ade80', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid #4ade80', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle />
                    <div>
                        <strong>Succès !</strong> {employeeName}
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{message}</div>
                    </div>
                </div>
            )}
            {status === "ERROR" && (
                <div style={{ marginBottom: '2rem', background: 'rgba(255,50,50,0.1)', color: '#f87171', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid #f87171', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle />
                    <div>
                        <strong>Erreur</strong>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{message}</div>
                    </div>
                </div>
            )}

            {/* PIN Display */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '2rem' }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: i < pin.length ? 'white' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s' }}></div>
                ))}
            </div>

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '300px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => handleInput(num.toString())} style={{ height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '2rem', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-white/10">
                        {num}
                    </button>
                ))}
                <button onClick={() => setPin("")} style={{ height: '80px', borderRadius: '12px', background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', fontSize: '1rem', color: '#f87171', cursor: 'pointer' }}>EFFACER</button>
                <button onClick={() => handleInput("0")} style={{ height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '2rem', color: 'white', cursor: 'pointer' }}>0</button>
                <button onClick={() => setPin(prev => prev.slice(0, -1))} style={{ height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem', color: 'white', cursor: 'pointer' }}>corriger</button>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem', width: '300px' }}>
                <button
                    disabled={loading || pin.length !== 4}
                    onClick={() => handleSubmit("IN")}
                    style={{ padding: '15px', borderRadius: '12px', background: loading ? 'gray' : '#22c55e', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: loading ? 'wait' : 'pointer', opacity: pin.length === 4 ? 1 : 0.5 }}>
                    ARRIVÉE
                </button>
                <button
                    disabled={loading || pin.length !== 4}
                    onClick={() => handleSubmit("OUT")}
                    style={{ padding: '15px', borderRadius: '12px', background: loading ? 'gray' : '#ef4444', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: loading ? 'wait' : 'pointer', opacity: pin.length === 4 ? 1 : 0.5 }}>
                    DÉPART
                </button>
            </div>

            <div style={{ marginTop: '2rem', opacity: 0.3, fontSize: '0.8rem' }}>
                Système de Pointage Sécurisé v1.0
            </div>
        </div>
    );
}
