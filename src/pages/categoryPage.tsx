'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/header';
import { Pencil, Plus, Eye, Trash2, CheckCircle2, Clock3 } from 'lucide-react';
import { WithId, DbCategory, HouseEvent } from '../firebase/type';
import { useLoadSessionByAuth } from '../hooks/auth/useLoadSessionByAuth';
import { useCategories } from '../hooks/categories/useCategories';
import { useUpsertCategory } from '../hooks/categories/useUpsertCategory';
import { useCategoryEvents } from '../hooks/events/useCategoryEvents';
import { useDeleteCategoryEvent } from '../hooks/events/useDeleteCategoryEvent';
import { useUpsertCategoryEvent } from '../hooks/events/useUpsertCategoryEvent';


type UiEventStatus = 'pending' | 'complete';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function currency(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toFixed(2);
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = (params?.categoryId as string | undefined)?.trim() ?? '';
  const navigate = useNavigate();

  // ✅ 1) SEMPRE chiamare gli hook (ordine fisso)
  const { state: session } = useLoadSessionByAuth();

  // ✅ parametri safe (vuoti finché non pronti)
  const houseId = session.status === 'ready' ? session.user.houseId : '';
  const userId = session.status === 'ready' ? session.userId : '';
  const year = new Date().getFullYear();

  const { state: catState, categories } = useCategories(houseId);
  const { upsertCategory, loading: savingCategory } = useUpsertCategory();

  const { state: evState, events } = useCategoryEvents({
    houseId,
    categoryId,
    year,
  });
  const { upsertEvent, loading: savingEvent } = useUpsertCategoryEvent();
  const { deleteEvent, loading: deletingEvent } = useDeleteCategoryEvent();

  // ✅ 2) redirect SOLO in effect (mai nel render)
  useEffect(() => {
    if (session.status === 'anon') {
      window.location.href = '/auth';
    }
  }, [session.status]);

  // Delete confirms
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);
  const [deleteCategoryArmed, setDeleteCategoryArmed] = useState(false);

  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false);
  const [deleteEventArmed, setDeleteEventArmed] = useState(false);


  const isBusy =
    session.status === 'loading' ||
    catState.status === 'loading' ||
    evState.status === 'loading' ||
    savingCategory ||
    savingEvent ||
    deletingEvent;

  const category: WithId<DbCategory> | null = useMemo(() => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId) ?? null;
  }, [categories, categoryId]);

  const total = useMemo(() => {
    return (events ?? []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [events]);

  // Modals + forms
  const [showCreate, setShowCreate] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<WithId<HouseEvent> | null>(null);
  const isEventComplete = selectedEvent?.status === 'complete';

  const [editCategory, setEditCategory] = useState({
    name: '',
    type: 'public' as 'public' | 'private',
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    amount: 0,
    status: 'pending' as UiEventStatus,
    occurredAt: Date.now(),
  });

  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    amount: 0,
    status: 'pending' as UiEventStatus,
    occurredAt: Date.now(),
  });

  const openEditCategory = () => {
    if (!category) return;
    setEditCategory({
      name: category.name ?? '',
      type: category.type ?? 'public',
    });

    // reset conferma delete
    setConfirmDeleteCategory(false);
    setDeleteCategoryArmed(false);

    setShowEditCategory(true);
  };


  const handleSaveCategory = async () => {
    if (!houseId || !userId || !categoryId) return;

    const res = await upsertCategory({
      houseId,
      categoryId,
      name: editCategory.name.trim(),
      type: editCategory.type,
      creatorId: userId,
    });

    if (!res.ok) return alert(res);
    setShowEditCategory(false);
  };

  // ⚠️ Delete categoria: hook non presente nel set che abbiamo fatto.
  const handleDeleteCategory = async () => {
    alert('Delete categoria non implementato nei hook. Se vuoi lo aggiungo (useDeleteCategory).');
  };

  const handleCreateEvent = async () => {
    if (!houseId || !userId || !categoryId) return;

    const res = await upsertEvent({
      houseId,
      categoryId,
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      amount: Number(newEvent.amount) || 0,
      status: newEvent.status,
      creatorId: userId,
      occurredAt: newEvent.occurredAt ?? Date.now(),
    });

    if (!res.ok) return alert(res);

    setShowCreate(false);
    setNewEvent({
      title: '',
      description: '',
      amount: 0,
      status: 'pending',
      occurredAt: Date.now(),
    });
  };

  const openEventModal = (ev: WithId<HouseEvent>) => {
    setSelectedEvent(ev);

    // reset conferma delete
    setConfirmDeleteEvent(false);
    setDeleteEventArmed(false);

    setEditEvent({
      title: ev.title ?? '',
      description: ev.description ?? '',
      amount: Number(ev.amount) || 0,
      status: ev.status === 'complete' ? 'complete' : 'pending',
      occurredAt: ev.occurredAt ?? ev.createdAt ?? Date.now(),
    });

    setShowEventModal(true);
  };


  const handleSaveEvent = async () => {
    if (!houseId || !userId || !categoryId || !selectedEvent) return;

    const res = await upsertEvent({
      houseId,
      categoryId,
      eventId: selectedEvent.id,
      title: editEvent.title.trim(),
      description: editEvent.description.trim(),
      amount: Number(editEvent.amount) || 0,
      status: editEvent.status,
      creatorId: userId,
      occurredAt: editEvent.occurredAt ?? Date.now(),
    });

    if (!res.ok) return alert(res);

    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!houseId || !categoryId || !selectedEvent) return;

    const res = await deleteEvent({
      houseId,
      categoryId,
      year,
      eventId: selectedEvent.id,
    });

    if (!res.ok) return alert(res);

    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // ✅ 3) Da qui in poi render “safe”
  if (session.status === 'loading') return <div className="p-6">Caricamento sessione...</div>;
  if (!categoryId) return <div className="p-6">Categoria non valida.</div>;

  if (catState.status !== 'loading' && !category) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <Header title="Dettaglio Categoria" />
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow border border-gray-100">
          <div className="text-lg font-semibold">Categoria non trovata</div>
          <div className="text-sm text-gray-600 mt-1">
            L&apos;ID categoria non esiste o non hai accesso.
          </div>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl"
            onClick={() => navigate('/dashboard')}
          >
            Torna alla dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Header title="Dettaglio Categoria" />

      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">Categoria</div>
              <div className="text-xl font-bold">{category?.name ?? '—'}</div>
              <div className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {category?.type === 'private' ? 'Privata' : 'Pubblica'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={openEditCategory}
                disabled={isBusy}
                className={cx(
                  'rounded-xl px-3 py-2 text-white shadow-sm transition flex items-center gap-2',
                  isBusy ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
                )}
                title="Modifica categoria"
              >
                <Pencil size={18} />
                <span className="hidden sm:inline">Modifica</span>
              </button>

              <button
                onClick={() => setShowCreate(true)}
                disabled={isBusy}
                className={cx(
                  'rounded-xl px-3 py-2 text-white shadow-sm transition flex items-center gap-2',
                  isBusy ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                )}
                title="Nuovo evento"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nuovo</span>
              </button>
            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-white p-4 rounded-2xl shadow mb-4 border border-gray-100">
          <div className="text-gray-500">Totale spesa (anno {year})</div>
          <div className="text-2xl font-bold">€ {currency(total)}</div>
        </div>

        {/* EVENTS */}
        <div className="grid gap-3">
          {(evState.status === 'loading' || isBusy) && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              Caricamento eventi...
            </div>
          )}

          {evState.status !== 'loading' && (events?.length ?? 0) === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-600">
              Nessun evento per questa categoria.
            </div>
          )}

          {(events ?? []).map((e) => {
            const bg =
              e.status === 'complete'
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200';

            const Icon = e.status === 'complete' ? CheckCircle2 : Clock3;

            return (
              <div
                key={e.id}
                className={cx('p-4 rounded-2xl shadow-sm border flex justify-between items-center', bg)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-gray-700" />
                    <div className="font-semibold text-lg truncate">{e.title}</div>
                  </div>

                  {e.description && (
                    <div className="text-gray-600 text-sm mt-1 line-clamp-2">{e.description}</div>
                  )}

                  <div className="text-sm mt-2 font-semibold">€ {currency(Number(e.amount) || 0)}</div>
                </div>

                <button
                  onClick={() => openEventModal(e)}
                  className="bg-white/70 hover:bg-white p-2 rounded-xl transition"
                  title="Dettaglio / modifica"
                >
                  <Eye size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>


      {/* MODALE EVENTO */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 z-[120] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            {!confirmDeleteEvent ? (
              <>
                <h2 className="text-xl font-bold mb-4">Evento</h2>

                {/* ✅ VIEW MODE se complete: input readOnly + nessun onChange */}
                {isEventComplete ? (
                  <>
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Titolo</div>
                      <div className="w-full border p-3 rounded-xl bg-gray-50 text-gray-800">
                        {editEvent.title || '—'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Descrizione</div>
                      <div className="w-full border p-3 rounded-xl bg-gray-50 text-gray-800 whitespace-pre-wrap">
                        {editEvent.description || '—'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Importo</div>
                      <div className="w-full border p-3 rounded-xl bg-gray-50 text-gray-800">
                        € {currency(Number(editEvent.amount) || 0)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Stato</div>
                      <div className="w-full border p-3 rounded-xl bg-gray-50 text-gray-800">
                        COMPLETED
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ✅ EDIT MODE (pending) */}
                    <input
                      placeholder="Titolo"
                      value={editEvent.title}
                      onChange={(e) => setEditEvent((s) => ({ ...s, title: e.target.value }))}
                      className="w-full border p-3 rounded-xl mb-3"
                    />

                    <input
                      placeholder="Descrizione"
                      value={editEvent.description}
                      onChange={(e) => setEditEvent((s) => ({ ...s, description: e.target.value }))}
                      className="w-full border p-3 rounded-xl mb-3"
                    />

                    <input
                      type="number"
                      placeholder="Importo"
                      value={editEvent.amount}
                      onChange={(e) => setEditEvent((s) => ({ ...s, amount: Number(e.target.value) }))}
                      className="w-full border p-3 rounded-xl mb-3"
                    />

                    <select
                      value={editEvent.status}
                      onChange={(e) => setEditEvent((s) => ({ ...s, status: e.target.value as UiEventStatus }))}
                      className="w-full border p-3 rounded-xl mb-4"
                    >
                      <option value="pending">PENDING</option>
                      <option value="complete">COMPLETED</option>
                    </select>
                  </>
                )}

                {/* FOOTER */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setConfirmDeleteEvent(true);
                      setDeleteEventArmed(false);
                    }}
                    disabled={isBusy}
                    className={cx(
                      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white',
                      isBusy ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                    )}
                  >
                    <Trash2 size={18} />
                    Elimina
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowEventModal(false);
                        setSelectedEvent(null);
                        setConfirmDeleteEvent(false);
                        setDeleteEventArmed(false);
                      }}
                      className="px-4 py-2"
                    >
                      Chiudi
                    </button>

                    {/* ✅ Se complete: niente Salva */}
                    {!isEventComplete && (
                      <button
                        onClick={handleSaveEvent}
                        disabled={isBusy}
                        className={cx(
                          'bg-blue-600 text-white px-4 py-2 rounded-xl',
                          isBusy && 'opacity-60 cursor-not-allowed'
                        )}
                      >
                        Salva
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ✅ vista conferma delete */}
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <div className="font-semibold">Attenzione</div>
                  <div className="text-sm mt-1">Stai per eliminare definitivamente questo evento.</div>
                </div>

                <label className="flex items-center justify-between gap-3 mb-4">
                  <span className="font-semibold text-gray-800">Elimina</span>
                  <input
                    type="checkbox"
                    checked={deleteEventArmed}
                    onChange={(e) => setDeleteEventArmed(e.target.checked)}
                    className="h-5 w-5"
                  />
                </label>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setConfirmDeleteEvent(false);
                      setDeleteEventArmed(false);
                    }}
                    className="px-4 py-2"
                  >
                    Indietro
                  </button>

                  <button
                    onClick={handleDeleteEvent}
                    disabled={isBusy || !deleteEventArmed}
                    className={cx(
                      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white',
                      isBusy || !deleteEventArmed
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    )}
                  >
                    <Trash2 size={18} />
                    Conferma eliminazione
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}



      {/* MODALE CREATE EVENT */}
      {showCreate && (
        <div className="fixed inset-0 p-10 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Nuovo evento</h2>

            <input
              placeholder="Titolo"
              value={newEvent.title}
              onChange={(e) => setNewEvent((s) => ({ ...s, title: e.target.value }))}
              className="w-full border p-3 rounded-xl mb-3"
            />

            <input
              placeholder="Descrizione"
              value={newEvent.description}
              onChange={(e) => setNewEvent((s) => ({ ...s, description: e.target.value }))}
              className="w-full border p-3 rounded-xl mb-3"
            />

            <input
              type="number"
              placeholder="Importo"
              value={newEvent.amount}
              onChange={(e) => setNewEvent((s) => ({ ...s, amount: Number(e.target.value) }))}
              className="w-full border p-3 rounded-xl mb-4"
            />

            <select
              value={newEvent.status}
              onChange={(e) => setNewEvent((s) => ({ ...s, status: e.target.value as UiEventStatus }))}
              className="w-full border p-3 rounded-xl mb-4"
            >
              <option value="pending">PENDING</option>
              <option value="complete">COMPLETED</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2">
                Annulla
              </button>

              <button
                onClick={handleCreateEvent}
                disabled={isBusy}
                className={cx('bg-blue-600 text-white px-4 py-2 rounded-xl', isBusy && 'opacity-60 cursor-not-allowed')}
              >
                Crea evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE EDIT CATEGORY */}
      {showEditCategory && (
        <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            {!confirmDeleteCategory ? (
              <>
                <h2 className="text-xl font-bold mb-4">Modifica categoria</h2>

                <input
                  placeholder="Nome categoria"
                  value={editCategory.name}
                  onChange={(e) => setEditCategory((s) => ({ ...s, name: e.target.value }))}
                  className="w-full border p-3 rounded-xl mb-3"
                />

                <select
                  value={editCategory.type}
                  onChange={(e) => setEditCategory((s) => ({ ...s, type: e.target.value as any }))}
                  className="w-full border p-3 rounded-xl mb-4"
                >
                  <option value="public">Pubblica</option>
                  <option value="private">Privata</option>
                </select>

                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setConfirmDeleteCategory(true);
                      setDeleteCategoryArmed(false);
                    }}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
                  >
                    <Trash2 size={18} />
                    Elimina
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowEditCategory(false);
                        setConfirmDeleteCategory(false);
                        setDeleteCategoryArmed(false);
                      }}
                      className="px-4 py-2"
                    >
                      Annulla
                    </button>

                    <button
                      onClick={handleSaveCategory}
                      disabled={isBusy}
                      className={cx(
                        'bg-blue-600 text-white px-4 py-2 rounded-xl',
                        isBusy && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      Salva
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ✅ vista conferma delete: spariscono i campi */}
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <div className="font-semibold">Attenzione</div>
                  <div className="text-sm mt-1">
                    Stai per eliminare definitivamente questa categoria e i suoi dati associati.
                  </div>
                </div>

                <label className="flex items-center justify-between gap-3 mb-4">
                  <span className="font-semibold text-gray-800">Elimina</span>
                  <input
                    type="checkbox"
                    checked={deleteCategoryArmed}
                    onChange={(e) => setDeleteCategoryArmed(e.target.checked)}
                    className="h-5 w-5"
                  />
                </label>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setConfirmDeleteCategory(false);
                      setDeleteCategoryArmed(false);
                    }}
                    className="px-4 py-2"
                  >
                    Indietro
                  </button>

                  <button
                    onClick={handleDeleteCategory}
                    disabled={isBusy || !deleteCategoryArmed}
                    className={cx(
                      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white',
                      isBusy || !deleteCategoryArmed
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    )}
                  >
                    <Trash2 size={18} />
                    Conferma eliminazione
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
