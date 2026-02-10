// ===============================
// pages/AuthPage.tsx
// Auth completa:
// - Login
// - Registrazione + creazione automatica casa
// - Accesso a casa tramite codice
// ===============================

'use client';

import { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../services/firebase/firebase';
import { addMemberToHouse, createHouse, createUser } from '../services/firebase/api';

const generateHouseCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register' | 'join'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        email: '',
        password: '',
        houseCode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const redirectDashboard = () => {
        window.location.href = '/dashboard';
    };

    const handleRegister = async () => {
        const cred = await createUserWithEmailAndPassword(
            auth,
            form.email,
            form.password
        );

        const houseId = crypto.randomUUID();
        const code = generateHouseCode();

        // crea casa
        await createHouse({
            id: houseId,
            code,
            name: 'Casa',
            ownerId: cred.user.uid,
            createdAt: Date.now()
        });

        // crea utente
        await createUser({
            id: cred.user.uid,
            email: form.email,
            name: '',
            avatar: '',
            createdAt: Date.now(),
            houseId
        });

        // membro OWNER
        await addMemberToHouse(houseId, cred.user.uid, {
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: Date.now()
        });

        redirectDashboard();
    };

    const handleLogin = async () => {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        redirectDashboard();
    };

    const handleJoinHouse = async () => {
        const cred = await signInWithEmailAndPassword(
            auth,
            form.email,
            form.password
        );

        // trova casa da codice
        const housesRef = ref(db, 'houses');
        const snapshot = await (await import('firebase/database')).get(housesRef);
        const houses = snapshot.val();

        const houseEntry = Object.values(houses || {}).find(
            (h: any) => h.code === form.houseCode
        ) as any;

        if (!houseEntry) throw new Error('Codice casa non valido');

        const houseId = houseEntry.id;

        // aggiorna utente
        await set(ref(db, `users/${cred.user.uid}/houseId`), houseId);

        // aggiungi membro pending
        await addMemberToHouse(houseId, cred.user.uid, {
            role: 'PARTICIPANT',
            status: 'PENDING',
            joinedAt: Date.now()
        });

        redirectDashboard();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'register') await handleRegister();
            if (mode === 'login') await handleLogin();
            if (mode === 'join') await handleJoinHouse();
        } catch (err: any) {
            setError(err.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    {mode === 'login' && 'Accedi'}
                    {mode === 'register' && 'Registrati'}
                    {mode === 'join' && 'Accedi ad una casa'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-xl"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-xl"
                        required
                    />

                    {mode === 'join' && (
                        <input
                            type="text"
                            name="houseCode"
                            placeholder="Codice casa"
                            value={form.houseCode}
                            onChange={handleChange}
                            className="w-full border p-3 rounded-xl"
                            required
                        />
                    )}

                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        {loading
                            ? 'Caricamento...'
                            : mode === 'login'
                                ? 'Accedi'
                                : mode === 'register'
                                    ? 'Crea account e casa'
                                    : 'Entra nella casa'}
                    </button>
                </form>

                <div className="text-center mt-6 space-y-2">
                    <button
                        onClick={() => setMode('login')}
                        className="text-blue-600 font-medium block w-full"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => setMode('register')}
                        className="text-blue-600 font-medium block w-full"
                    >
                        Registrati e crea casa
                    </button>

                    <button
                        onClick={() => setMode('join')}
                        className="text-blue-600 font-medium block w-full"
                    >
                        Accedi ad una casa con codice
                    </button>
                </div>
            </div>
        </div>
    );
}