'use client';

import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { Plus } from 'lucide-react';
import { WithId, DbCategory } from '../firebase/type';
import { useLoadSessionByAuth } from '../hooks/auth/useLoadSessionByAuth';
import { useCategoriesStore } from '../hooks/categories/useCategories';

function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(' ');
}

export default function DashboardPage() {

  const nav = useNavigate();

  const { state: session } = useLoadSessionByAuth();

  const houseId = session.status === 'ready' ? session.user.houseId : '';
  const userId = session.status === 'ready' ? session.userId : '';

  const connect = useCategoriesStore(s => s.connect);
  const categories = useCategoriesStore(s => s.items);
  const status = useCategoriesStore(s => s.status);
  const upsertCategory = useCategoriesStore(s => s.upsertCategory);

  useEffect(() => {
    if (session.status === 'anon') window.location.href = '/auth';
    connect(houseId, userId);
  }, [session.status]);

  const isBusy = session.status === 'loading' || status === "loading";

  const monthKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  const totalThisMonth = useMemo(() => {
    return (categories ?? []).reduce((sum, c) => {
      const v = Number(c.totalByMonth?.[monthKey] ?? 0);
      return sum + (Number.isFinite(v) ? v : 0);
    }, 0);
  }, [categories, monthKey]);

  const handleQuickCreateCategory = async () => {
    if (!houseId || !userId) return;

    const res = await upsertCategory({ houseId, name: 'Nuova categoria', type: 'public', creatorId: userId });

    if (!res.ok) {
      alert(res);
      return;
    }

    nav(`/category/${res.categoryId}`);
  };

  if (session.status === 'loading') return <div className="p-6">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-700 p-6">
      <Header title="Dashboard" />
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border dark:bg-gray-800 border-gray-100">
            <div className="text-gray-500 dark:text-gray-100 text-sm">Totale mese ({monthKey})</div>
            <div className="text-2xl font-bold dark:text-white">€ {totalThisMonth.toFixed(2)}</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border dark:bg-gray-800 border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm dark:text-gray-100">Categorie</div>
              <div className="text-2xl font-bold">{categories.length}</div>
            </div>

            <button onClick={handleQuickCreateCategory} disabled={isBusy} title="Crea categoria"
              className={cx('rounded-xl px-3 py-2 text-white flex items-center gap-2 shadow-sm',
                isBusy ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700')} >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuova</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border dark:bg-gray-800  border-gray-100">
          <div className="p-5 border-b border-gray-100  flex items-center justify-between">
            <div className="text-lg font-semibold">Categorie</div>
          </div>

          {status === "loading" && (
            <div className="p-5 text-gray-600">Caricamento categorie...</div>
          )}

          {status !== "loading" && categories.length === 0 && (
            <div className="p-5 text-gray-600">
              Nessuna categoria. Clicca “Nuova” per crearne una.
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {categories.map((c: WithId<DbCategory>) => {
              const monthTotal = Number(c.totalByMonth?.[monthKey] ?? 0) || 0;

              return (
                <Link key={c.id} to={`/category/${c.id}`} className="block p-5 hover:bg-gray-50 hover:dark:bg-gray-500 transition">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      {c.type === "private" && <div className="text-xs bg-red-200 rounded-lg px-4 py-1 text-gray-800">
                        Privata
                      </div>}
                    </div>
                    <div className="text-sm font-semibold">€ {monthTotal.toFixed(2)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}