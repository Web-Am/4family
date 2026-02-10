'use client';

import { useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { auth, db } from '../services/firebase/firebase';
import { Category, EventItem } from '../services/firebase/type';
import { createCategory } from '../services/firebase/api';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../components/header';
import { Plus } from 'lucide-react';

interface CategoryWithTotal extends Category {
    total: number;
}

export default function DashboardPage() {
    const navigate = useNavigate();

    const [houseId, setHouseId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreate, setShowCreate] = useState(false);
    const [newCategory, setNewCategory] = useState({ title: '', desc: '' });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = '/auth';
                return;
            }

            const uid = user.uid;

            const snap = await get(ref(db, `users/${uid}`));
            const userData = snap.val();

            setHouseId(userData?.houseId);
        });

        return () => unsubscribe();
    }, []);


    // carico categorie + eventi
    useEffect(() => {
        if (!houseId) return;

        const load = async () => {
            setLoading(true);

            const catSnap = await get(ref(db, `categories/${houseId}`));
            const categoriesData = catSnap.val() || {};
            const categoriesReady = Object.values(categoriesData || {}) as any[];
            setCategories(categoriesReady.filter(c => c.status !== "DELETED"));

            const evSnap = await get(ref(db, `events/${houseId}`));
            const eventsData = evSnap.val() || {};
            const eventsReady = Object.values(eventsData || {}) as any[];
            setEvents(eventsReady.filter(c => c.status !== "DELETED"));

            setLoading(false);
        };

        load();
    }, [houseId]);

    const categoriesWithTotals: CategoryWithTotal[] = useMemo(() => {

        console.log("cat", categories);
        return categories.map((cat) => {
            const total = events
                .filter((e) => e.categoryId === cat.id && e.status !== 'DELETED')
                .reduce((sum, e) => sum + (e.amount || 0), 0);

            return { ...cat, total };
        });
    }, [categories, events]);

    const handleCreateCategory = async () => {
        if (!houseId) return;

        await createCategory({
            id: '',
            houseId,
            title: newCategory.title,
            desc: newCategory.desc,
            image: '',
            createdBy: (await import('firebase/auth')).getAuth().currentUser!.uid,
            createdAt: Date.now()
        });

        setShowCreate(false);
        setNewCategory({ title: '', desc: '' });

        // reload
        const catSnap = await get(ref(db, `categories/${houseId}`));
        setCategories(Object.values(catSnap.val() || {}));
    };

    if (loading) return <div className="p-6">Caricamento dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <Header title="Dashboard" />
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Categorie</h1>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl" >
                        <Plus />
                    </button>
                </div>

                <div className="grid gap-4">
                    {categoriesWithTotals.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => navigate(`/category/${cat.id}`)}
                            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg cursor-pointer flex justify-between"
                        >
                            <div>
                                <div className="font-semibold text-lg">{cat.title}</div>
                                <div className="text-gray-500 text-sm">{cat.desc}</div>
                            </div>

                            <div className="text-xl font-bold">
                                € {cat.total.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showCreate && (
                <div className="fixed inset-0 p-10 bg-black/40 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md ">
                        <h2 className="text-xl font-bold mb-4">Nuova categoria</h2>

                        <input
                            placeholder="Titolo"
                            value={newCategory.title}
                            onChange={(e) =>
                                setNewCategory({ ...newCategory, title: e.target.value })
                            }
                            className="w-full border p-3 rounded-xl mb-3"
                        />

                        <input
                            placeholder="Descrizione"
                            value={newCategory.desc}
                            onChange={(e) =>
                                setNewCategory({ ...newCategory, desc: e.target.value })
                            }
                            className="w-full border p-3 rounded-xl mb-4"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2"
                            >
                                Annulla
                            </button>

                            <button
                                disabled={newCategory.title.length === 0 || newCategory.desc.length === 0}
                                onClick={handleCreateCategory}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50">
                                Crea
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

