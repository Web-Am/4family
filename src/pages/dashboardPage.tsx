'use client';

import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { Plus } from 'lucide-react';
import { WithId, DbCategory } from '../firebase/type';
import { useLoadSessionByAuth } from '../hooks/auth/useLoadSessionByAuth';
import { useCategories } from '../hooks/categories/useCategories';
import { useUpsertCategory } from '../hooks/categories/useUpsertCategory';


function cx(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(' ');
}

export default function DashboardPage() {
  const nav = useNavigate();

  // ✅ 1) SEMPRE hooks in cima (ordine fisso)
  const { state: session } = useLoadSessionByAuth();

  // ✅ safe params
  const houseId = session.status === 'ready' ? session.user.houseId : '';
  const userId = session.status === 'ready' ? session.userId : '';

  const { state: catState, categories } = useCategories(houseId);
  const { upsertCategory, loading: savingCategory } = useUpsertCategory();

  // ✅ 2) redirect in effect
  useEffect(() => {
    if (session.status === 'anon') window.location.href = '/auth';
  }, [session.status]);

  const isBusy =
    session.status === 'loading' || catState.status === 'loading' || savingCategory;

  // esempio: totale mese corrente (se usi totalByMonth)
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

    const res = await upsertCategory({
      houseId,
      name: 'Nuova categoria',
      type: 'public',
      creatorId: userId,
    });

    if (!res.ok) {
      alert(res);
      return;
    }

    nav(`/category/${res.categoryId}`);
  };

  // ✅ 3) dopo gli hook puoi fare return condizionali
  if (session.status === 'loading') return <div className="p-6">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Header title="Dashboard" />

      <div className="max-w-4xl mx-auto space-y-5">
        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm">Totale mese ({monthKey})</div>
            <div className="text-2xl font-bold">€ {totalThisMonth.toFixed(2)}</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">Categorie</div>
              <div className="text-2xl font-bold">{categories.length}</div>
            </div>

            <button
              onClick={handleQuickCreateCategory}
              disabled={isBusy}
              className={cx(
                'rounded-xl px-3 py-2 text-white flex items-center gap-2 shadow-sm',
                isBusy ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              )}
              title="Crea categoria"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuova</span>
            </button>
          </div>
        </div>

        {/* LISTA CATEGORIE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="text-lg font-semibold">Categorie</div>
          </div>

          {catState.status === 'loading' && (
            <div className="p-5 text-gray-600">Caricamento categorie...</div>
          )}

          {catState.status !== 'loading' && categories.length === 0 && (
            <div className="p-5 text-gray-600">
              Nessuna categoria. Clicca “Nuova” per crearne una.
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {categories.map((c: WithId<DbCategory>) => {
              const monthTotal = Number(c.totalByMonth?.[monthKey] ?? 0) || 0;

              return (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="block p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-sm text-gray-600">
                        {c.type === 'private' ? 'Privata' : 'Pubblica'}
                      </div>
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