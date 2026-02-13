'use client';

import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { House, LogOut, Sun, Moon } from "lucide-react";
import { firebaseAuth } from "../firebase/firebase";
import { useLoadSessionByAuth } from "../hooks/auth/useLoadSessionByAuth";

function ThemeToggle(){
    const [isDark, setIsDark] = React.useState<boolean>(() => {
        try {
            const stored = typeof window !== 'undefined' && localStorage.getItem('theme');
            if (stored) return stored === 'dark';
            return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch(e){ return false; }
    });

    React.useEffect(() => {
        try{
            if(isDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }catch(e){}
    }, [isDark]);

    return (
        <button
            aria-label="Toggle theme"
            onClick={() => setIsDark(v => !v)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title={isDark ? 'Dark' : 'Light'}
        >
            {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-600" />}
        </button>
    );
}

interface HeaderProps {
    title?: string;
}

export default function Header({ title }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const { state: session } = useLoadSessionByAuth();
    const house = (session && (session as any).house) ? (session as any).house : null;

    const isDashboard = location.pathname === "/dashboard";

    const handleLogout = async () => {
        await signOut(firebaseAuth);
        navigate("/");
    };

    const handleHome = () => {
        navigate("/dashboard");
    };

    return (
        <header className="mb-6 rounded-lg w-full bg-white dark:bg-gray-800 dark:text-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div>
                     <h1 className="text-xl font-bold">{title || "La tua Casa"} </h1>
                    <em className="text-xs">{(session as any)?.user?.email} [<b>{house?.shareCode}</b>]</em>
                </div>
            </div>

            <div className="flex gap-3 items-center">
                {/* THEME TOGGLE */}
                <ThemeToggle />

                {/* HOME: visibile solo se NON sono in dashboard */}
                {!isDashboard && (
                    <button
                        onClick={handleHome}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                        <House />
                    </button>
                )}

                {/* LOGOUT: visibile solo se sono in dashboard */}
                {isDashboard && (
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                    >
                        <LogOut />
                    </button>
                )}
            </div>
        </header>
    );
}
