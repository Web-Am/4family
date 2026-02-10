'use client';

import { useEffect, useMemo, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { EventItem, EventStatus, Category } from '../services/firebase/type';
import { auth, db } from '../services/firebase/firebase';
import { createEvent } from '../services/firebase/api';
import Header from '../components/header';
import { Pencil, Plus, Eye } from 'lucide-react';

export default function CategoryPage() {

    const params = useParams();
    const categoryId = params?.categoryId as string;

    const navigate = useNavigate();

    const [houseId, setHouseId] = useState<string | null>(null);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);

    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

    const [category, setCategory] = useState<Category | null>(null);

    const [editCategory, setEditCategory] = useState({
        title: '',
        desc: ''
    });

    const [newEvent, setNewEvent] = useState({
        title: '',
        desc: '',
        amount: 0
    });

    const [editEvent, setEditEvent] = useState({
        title: '',
        desc: '',
        amount: 0,
        status: 'PENDING' as EventStatus
    });

    /* ========================= CATEGORY ========================= */

    const handleUpdateCategory = async () => {
        if (!houseId || !category) return;

        await update(ref(db, `categories/${houseId}/${category.id}`), {
            title: editCategory.title,
            desc: editCategory.desc
        });

        setCategory({ ...category, title: editCategory.title, desc: editCategory.desc });
        setShowEdit(false);
    };

    const handleDeleteCategory = async () => {
        if (!houseId || !categoryId) return;

        setLoading(true);

        const evSnap = await get(ref(db, `events/${houseId}`));
        const eventsData = evSnap.val() || {};

        const updates: any = {};
        updates[`categories/${houseId}/${categoryId}/status`] = "DELETED";

        Object.entries(eventsData).forEach(([eventId, event]: any) => {
            if (event.categoryId === categoryId) {
                updates[`events/${houseId}/${eventId}/status`] = "DELETED";
            }
        });

        await update(ref(db), updates);
        navigate("/dashboard");
    };

    /* ========================= AUTH ========================= */

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = '/auth';
                return;
            }

            const snap = await get(ref(db, `users/${user.uid}`));
            setHouseId(snap.val()?.houseId);
        });

        return () => unsub();
    }, []);

    /* ========================= LOAD CATEGORY ========================= */

    useEffect(() => {
        if (!houseId) return;

        const loadCategory = async () => {
            const catSnap = await get(ref(db, `categories/${houseId}/${categoryId}`));
            const catData = catSnap.val();

            if (catData) {
                setCategory(catData);
                setEditCategory({
                    title: catData.title || '',
                    desc: catData.desc || ''
                });
            }
        };

        loadCategory();
    }, [houseId, categoryId]);

    /* ========================= LOAD EVENTS ========================= */

    useEffect(() => {
        if (!houseId) return;

        const loadEvents = async () => {
            setLoading(true);

            const snap = await get(ref(db, `events/${houseId}`));
            const data = snap.val() || {};

            const list = Object.values(data).filter(
                (e: any) => e.categoryId === categoryId && e.status !== 'DELETED'
            ) as EventItem[];

            setEvents(list);
            setLoading(false);
        };

        loadEvents();
    }, [houseId, categoryId]);

    /* ========================= CREATE EVENT ========================= */

    const handleCreateEvent = async () => {
        if (!houseId) return;

        const newEvent0: EventItem = {
            id: '',
            houseId,
            categoryId,
            title: newEvent.title,
            desc: newEvent.desc,
            notes: '',
            amount: Number(newEvent.amount),
            status: 'PENDING',
            createdAt: Date.now(),
            createdBy: auth.currentUser!.uid,
            year: new Date().getFullYear(),
            eventDate: Date.now()
        };

        await createEvent(newEvent0);

        setShowCreate(false);
        setNewEvent({ title: '', desc: '', amount: 0 });

        const snap = await get(ref(db, `events/${houseId}`));
        const data = snap.val() || {};

        const list = Object.values(data).filter(
            (e: any) => e.categoryId === categoryId && e.status !== 'DELETED'
        ) as EventItem[];

        setEvents(list);
    };

    /* ========================= EVENT EDIT ========================= */

    const openEventModal = (event: EventItem) => {
        setSelectedEvent(event);
        setEditEvent({
            title: event.title,
            desc: event.desc,
            amount: event.amount,
            status: event.status
        });
        setShowEventModal(true);
    };

    const handleSaveEvent = async () => {
        if (!houseId || !selectedEvent) return;

        await update(ref(db, `events/${houseId}/${selectedEvent.id}`), editEvent);

        setEvents(prev =>
            prev.map(e =>
                e.id === selectedEvent.id
                    ? { ...e, ...editEvent }
                    : e
            ).filter(e => e.status !== 'DELETED')
        );

        setShowEventModal(false);
    };

    /* ========================= TOTAL ========================= */

    const total = useMemo(() => {
        return events.reduce((sum, e) => sum + (e.amount || 0), 0);
    }, [events]);

    if (loading) return <div className="p-6">Caricamento eventi...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <Header title="Dettaglio Categoria" />

            <div className="max-w-3xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Eventi</h1>

                    <div className='flex gap-4'>
                        <button onClick={() => setShowEdit(true)}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-xl">
                            <Pencil />
                        </button>

                        <button onClick={() => setShowCreate(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl">
                            <Plus />
                        </button>
                    </div>
                </div>

                {/* TOTAL */}
                <div className="bg-white p-4 rounded-2xl shadow mb-4">
                    <div className="text-gray-500">Totale spesa</div>
                    <div className="text-2xl font-bold">€ {total.toFixed(2)}</div>
                </div>

                {/* EVENT MAP */}
                <div className="grid gap-3">
                    <div className="grid gap-3">
                        {events
                            .filter(e => e.status !== 'DELETED')
                            .map((e) => {

                                const bgColor =
                                    e.status === "COMPLETED"
                                        ? "bg-green-50 border-green-200"
                                        : e.status === "PENDING"
                                            ? "bg-yellow-50 border-yellow-200"
                                            : "bg-red-50 border-red-200";

                                return (
                                    <div
                                        key={e.id}
                                        className={`p-4 rounded-2xl shadow-sm border flex justify-between items-center ${bgColor}`}
                                    >
                                        <div>
                                            <div className="font-semibold text-lg">{e.title}</div>
                                            <div className="text-gray-600 text-sm">{e.desc}</div>
                                            <div className="text-sm mt-1 font-medium">€ {e.amount}</div>
                                        </div>

                                        <button
                                            onClick={() => openEventModal(e)}
                                            className="bg-white/70 hover:bg-white p-2 rounded-xl transition"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                    </div>

                </div>
            </div>

            {/* MODALE EVENTO */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/40 z-[120] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

                        <h2 className="text-xl font-bold mb-4">Modifica evento</h2>

                        <input
                            placeholder="Titolo"
                            value={editEvent.title}
                            onChange={(e) =>
                                setEditEvent({ ...editEvent, title: e.target.value })
                            }
                            className="w-full border p-3 rounded-xl mb-3"
                        />

                        <input
                            placeholder="Descrizione"
                            value={editEvent.desc}
                            onChange={(e) =>
                                setEditEvent({ ...editEvent, desc: e.target.value })
                            }
                            className="w-full border p-3 rounded-xl mb-3"
                        />

                        <input
                            type="number"
                            placeholder="Importo"
                            value={editEvent.amount}
                            onChange={(e) =>
                                setEditEvent({ ...editEvent, amount: Number(e.target.value) })
                            }
                            className="w-full border p-3 rounded-xl mb-3"
                        />

                        <select
                            value={editEvent.status}
                            onChange={(e) =>
                                setEditEvent({ ...editEvent, status: e.target.value as EventStatus })
                            }
                            className="w-full border p-3 rounded-xl mb-4"
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="DELETED">DELETED</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowEventModal(false)}>Annulla</button>

                            <button
                                onClick={handleSaveEvent}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                            >
                                Salva
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE CREATE EVENT */}
            {showCreate && (
                <div className="fixed inset-0 p-10 bg-black/40 flex items-center justify-center z-[100]">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Nuovo evento</h2>

                        <input
                            placeholder="Titolo"
                            value={newEvent.title}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, title: e.target.value })
                            }
                            className="w-full border p-3 rounded-xl mb-3"
                        />

                        <input
                            placeholder="Descrizione"
                            value={newEvent.desc}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, desc: e.target.value })
                            }
                            className="w-full border p-3 rounded-xl mb-3"
                        />

                        <input
                            type="number"
                            placeholder="Importo"
                            value={newEvent.amount}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, amount: Number(e.target.value) })
                            }
                            className="w-full border p-3 rounded-xl mb-4"
                        />

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowCreate(false)}>Annulla</button>

                            <button
                                onClick={handleCreateEvent}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                            >
                                Crea evento
                            </button>
                        </div>
                    </div>
                </div>
            )}{/* MODALE EDIT CATEGORIA */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

                        <h2 className="text-xl font-bold mb-4">
                            {deleteMode ? "Elimina categoria" : "Modifica categoria"}
                        </h2>

                        {!deleteMode && (
                            <>
                                <input
                                    placeholder="Nome categoria"
                                    value={editCategory.title}
                                    onChange={(e) =>
                                        setEditCategory({
                                            ...editCategory,
                                            title: e.target.value
                                        })
                                    }
                                    className="w-full border p-3 rounded-xl mb-3"
                                />

                                <input
                                    placeholder="Descrizione"
                                    value={editCategory.desc}
                                    onChange={(e) =>
                                        setEditCategory({
                                            ...editCategory,
                                            desc: e.target.value
                                        })
                                    }
                                    className="w-full border p-3 rounded-xl mb-4"
                                />
                            </>
                        )}

                        {/* SWITCH ELIMINAZIONE */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600">
                                Modalità eliminazione
                            </span>

                            <button
                                onClick={() => setDeleteMode(!deleteMode)}
                                className={`w-12 h-6 flex items-center rounded-full transition ${deleteMode ? "bg-red-600" : "bg-gray-300"
                                    }`}
                            >
                                <div
                                    className={`bg-white w-5 h-5 rounded-full shadow transform transition ${deleteMode ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        {deleteMode && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">
                                Stai per eliminare questa categoria.
                                L’azione è irreversibile.
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowEdit(false);
                                    setDeleteMode(false);
                                }}
                                className="px-4 py-2"
                            >
                                Annulla
                            </button>

                            {!deleteMode ? (
                                <button
                                    onClick={handleUpdateCategory}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                                >
                                    Salva
                                </button>
                            ) : (
                                <button
                                    onClick={handleDeleteCategory}
                                    className="bg-red-600 text-white px-4 py-2 rounded-xl"
                                >
                                    Elimina
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}