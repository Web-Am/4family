'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/header';
import { Pencil, Plus, Eye, Trash2, CheckCircle2, Clock3 } from 'lucide-react';
import { WithId, DbCategory, HouseEvent } from '../firebase/type';
import { useLoadSessionByAuth } from '../hooks/auth/useLoadSessionByAuth';
import { useCategoryEvents } from '../hooks/events/useCategoryEvents';
import { useDeleteCategoryEvent } from '../hooks/events/useDeleteCategoryEvent';
import { useUpsertCategoryEvent } from '../hooks/events/useUpsertCategoryEvent';
import { useCategoriesStore } from '../hooks/categories/useCategories';

type UiEventStatus = 'pending' | 'complete';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const currency = (n: number) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number.isFinite(n) ? n : 0);

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  z?: number;
};

function Modal({ open, onClose, children, z = 100 }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-6"
      style={{ zIndex: z }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = (params?.categoryId as string | undefined)?.trim() ?? '';
  const navigate = useNavigate();

  const { state: session } = useLoadSessionByAuth();

  const houseId = session.status === 'ready' ? session.user.houseId : '';
  const userId = session.status === 'ready' ? session.userId : '';
  const year = new Date().getFullYear();

  const categories = useCategoriesStore((s) => s.items);
  const status = useCategoriesStore((s) => s.status);
  const upsertCategory = useCategoriesStore((s) => s.upsertCategory);
  const deleteCategory = useCategoriesStore(s => s.deleteCategory);

  const { state: evState, events } = useCategoryEvents({ houseId, categoryId, year });
  const { upsertEvent, loading: savingEvent } = useUpsertCategoryEvent();
  const { deleteEvent, loading: deletingEvent } = useDeleteCategoryEvent();

  useEffect(() => {
    if (session.status === 'anon') {
      window.location.href = '/auth';
    }
  }, [session.status]);

  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);
  const [deleteCategoryArmed, setDeleteCategoryArmed] = useState(false);

  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false);
  const [deleteEventArmed, setDeleteEventArmed] = useState(false);

  const isBusy = useMemo(
    () =>
      session.status === 'loading' ||
      status === 'loading' ||
      evState.status === 'loading' ||
      savingEvent ||
      deletingEvent,
    [session.status, status, evState.status, savingEvent, deletingEvent]
  );

  const category: WithId<DbCategory> | null = useMemo(() => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId) ?? null;
  }, [categories, categoryId]);

  const total = useMemo(() => {
    return (events ?? []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [events]);

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

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setConfirmDeleteEvent(false);
    setDeleteEventArmed(false);
  };

  const closeCategoryModal = () => {
    setShowEditCategory(false);
    setConfirmDeleteCategory(false);
    setDeleteCategoryArmed(false);
  };

  const openEditCategory = () => {
    if (!category) return;
    setEditCategory({
      name: category.name ?? '',
      type: category.type ?? 'public',
    });
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

  const handleDeleteCategory = async () => {

    if (!houseId || !userId || !categoryId) return;

    const res = await deleteCategory({
      houseId,
      categoryId,
    });

    if (!res.ok) return alert(res);
    setShowEditCategory(false);

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

  if (session.status === 'loading') return <div className="p-6">Caricamento sessione...</div>;
  if (!categoryId) return <div className="p-6">Categoria non valida.</div>;

  if (status !== 'loading' && !category) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-6">
        <Header title="Dettaglio Categoria" />
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow border border-gray-100 dark:bg-gray-800">
          <div className="text-lg font-semibold">Categoria non trovata</div>
          <div className="text-sm mt-1">L&apos;ID categoria non esiste o non hai accesso.</div>
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-700 p-6">
      <Header title="Dettaglio Categoria" />

      <div className="max-w-3xl mx-auto">
        <div className="mb-5 rounded-2xl bg-white p-5 dark:bg-gray-800 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-100">Categoria</div>
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
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nuovo</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow mb-4 border border-gray-100 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-100">Totale spesa (anno {year})</div>
          <div className="text-2xl font-bold">{currency(total)}</div>
        </div>

        <div className="grid gap-3">
          {(evState.status === 'loading' || isBusy) && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              Caricamento eventi...
            </div>
          )}

          {evState.status !== 'loading' && (events?.length ?? 0) === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border dark:text-gray-100 dark:bg-gray-800 dark:border-gray-900 border-gray-100 text-gray-600">
              Nessun evento per questa categoria.
            </div>
          )}

          {(events ?? []).map((e) => {
            const bg =
              e.status === 'complete'
                ? 'bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-800 hover:dark:bg-green-900'
                : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-800 hover:dark:bg-yellow-900';

            const Icon = e.status === 'complete' ? CheckCircle2 : Clock3;

            return (
              <div
                key={e.id}
                className={cx('p-4 rounded-2xl shadow-sm border flex justify-between items-center', bg)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-gray-700 dark:text-gray-100" />
                    <div className="font-semibold dark:text-gray-100 text-lg truncate">{e.title}</div>
                  </div>

                  {e.description && (
                    <div className="text-gray-600 dark:text-gray-100 text-sm mt-1 line-clamp-2">
                      {e.description}
                    </div>
                  )}

                  <div className="text-sm mt-2 font-semibold">
                    {currency(Number(e.amount) || 0)}
                  </div>
                </div>

                <button
                  onClick={() => openEventModal(e)}
                  className="bg-white/70 hover:bg-white p-2 rounded-xl transition dark:bg-gray-700 hover:dark:bg-gray-800"
                >
                  <Eye size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={showEventModal && !!selectedEvent}
        onClose={closeEventModal}
        z={120}
      >
        {selectedEvent && (
          <>
            {!confirmDeleteEvent ? (
              <>
                <h2 className="text-xl font-bold mb-4">Evento</h2>

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
                        {currency(Number(editEvent.amount) || 0)}
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
                    <input
                      placeholder="Titolo"
                      value={editEvent.title}
                      onChange={(e) => setEditEvent((s) => ({ ...s, title: e.target.value }))}
                      className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
                    />

                    <input
                      placeholder="Descrizione"
                      value={editEvent.description}
                      onChange={(e) =>
                        setEditEvent((s) => ({ ...s, description: e.target.value }))
                      }
                      className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
                    />

                    <input
                      type="number"
                      placeholder="Importo"
                      value={editEvent.amount}
                      onChange={(e) =>
                        setEditEvent((s) => ({ ...s, amount: Number(e.target.value) }))
                      }
                      className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
                    />

                    <select
                      value={editEvent.status}
                      onChange={(e) =>
                        setEditEvent((s) => ({
                          ...s,
                          status: e.target.value as UiEventStatus,
                        }))
                      }
                      className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="pending">PENDING</option>
                      <option value="complete">COMPLETED</option>
                    </select>
                  </>
                )}

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
                    <button onClick={closeEventModal} className="px-4 py-2">
                      Chiudi
                    </button>

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
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:bg-red-800">
                  <div className="font-semibold dark:text-gray-100">Attenzione</div>
                  <div className="text-sm mt-1 dark:text-gray-100">
                    Stai per eliminare definitivamente questo evento.
                  </div>
                </div>

                <label className="flex items-center justify-between gap-3 mb-4">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    Elimina
                  </span>
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
                      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white dark:text-gray-100',
                      isBusy || !deleteEventArmed
                        ? 'bg-gray-300 cursor-not-allowed dark:text-gray-800'
                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-800'
                    )}
                  >
                    <Trash2 size={18} />
                    Conferma eliminazione
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} z={100}>
        <>
          <h2 className="text-xl font-bold mb-4">Nuovo evento</h2>

          <input
            placeholder="Titolo"
            value={newEvent.title}
            onChange={(e) => setNewEvent((s) => ({ ...s, title: e.target.value }))}
            className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
          />

          <input
            placeholder="Descrizione"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent((s) => ({ ...s, description: e.target.value }))
            }
            className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
          />

          <input
            type="number"
            placeholder="Importo"
            value={newEvent.amount}
            onChange={(e) =>
              setNewEvent((s) => ({ ...s, amount: Number(e.target.value) }))
            }
            className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
          />

          <select
            value={newEvent.status}
            onChange={(e) =>
              setNewEvent((s) => ({ ...s, status: e.target.value as UiEventStatus }))
            }
            className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
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
              className={cx(
                'bg-blue-600 text-white px-4 py-2 rounded-xl',
                isBusy && 'opacity-60 cursor-not-allowed'
              )}
            >
              Crea evento
            </button>
          </div>
        </>
      </Modal>

      <Modal open={showEditCategory} onClose={closeCategoryModal} z={110}>
        <>
          {!confirmDeleteCategory ? (
            <>
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Modifica categoria
              </h2>

              <input
                placeholder="Nome categoria"
                value={editCategory.name}
                onChange={(e) =>
                  setEditCategory((s) => ({ ...s, name: e.target.value }))
                }
                className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
              />

              <select
                value={editCategory.type}
                onChange={(e) =>
                  setEditCategory((s) => ({ ...s, type: e.target.value as any }))
                }
                className="w-full border p-3 rounded-xl mb-3 dark:bg-gray-800 dark:text-gray-100"
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
                  <button onClick={closeCategoryModal} className="px-4 py-2">
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
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <div className="font-semibold">Attenzione</div>
                <div className="text-sm mt-1">
                  Stai per eliminare definitivamente questa categoria e i suoi dati associati.
                </div>
              </div>

              <label className="flex items-center justify-between gap-3 mb-4">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  Elimina
                </span>
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
        </>
      </Modal>
    </div>
  );
}
