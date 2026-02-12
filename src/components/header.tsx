'use client';

import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { House, LogOut } from "lucide-react";
import { firebaseAuth } from "../firebase/firebase";
import { useLoadSessionByAuth } from "../hooks/auth/useLoadSessionByAuth";

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
        <header className="mb-6 rounded-lg w-full bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div>
                     <h1 className="text-xl font-bold">{title || "La tua Casa"} </h1>
                    <em className="text-xs">{(session as any)?.user?.email} [<b>{house?.shareCode}</b>]</em>
                </div>
            </div>

            <div className="flex gap-3">
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
