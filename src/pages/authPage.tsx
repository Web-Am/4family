// pages/AuthPage.tsx
"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "../firebase/firebase";
import { useJoinHouseAuth } from "../hooks/auth/useJoinHouseAuth";
import { useLoadSessionByAuth } from "../hooks/auth/useLoadSessionByAuth";
import { useRegisterHouseAuth } from "../hooks/auth/useRegisterHouseAuth";

type Mode = "login" | "register" | "join";

type FormState = {
  email: string;
  password: string;
  houseCode: string;
  houseName: string;
};

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function redirectDashboard() {
  window.location.href = "/dashboard";
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    houseCode: "",
    houseName: "Casa",
  });

  // ✅ HOOKS: tutta la logica sta qui
  const { register, loading: registering } = useRegisterHouseAuth();
  const { join, loading: joining } = useJoinHouseAuth();
  const { state: session } = useLoadSessionByAuth();

  const loading = registering || joining;

  // ✅ se già loggato -> dashboard
  useEffect(() => {
    if (session.status === "ready") redirectDashboard();
  }, [session.status]);

  const title = useMemo(() => {
    if (mode === "login") return "Bentornato";
    if (mode === "register") return "Crea account e casa";
    return "Entra in una casa";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "login") return "Accedi per continuare.";
    if (mode === "register") return "Registrati: creeremo anche la tua casa.";
    return "Accedi e inserisci il codice della casa.";
  }, [mode]);

  const primaryCta = useMemo(() => {
    if (mode === "login") return "Accedi";
    if (mode === "register") return "Crea account";
    return "Entra nella casa";
  }, [mode]);

  const setField =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((s) => ({ ...s, [k]: e.target.value }));
    };

  const canSubmit = useMemo(() => {
    if (!isEmailValid(form.email.trim())) return false;
    if ((form.password ?? "").length < 6) return false;
    if (mode === "join" && form.houseCode.trim().length < 4) return false;
    if (mode === "register" && form.houseName.trim().length < 2) return false;
    return true;
  }, [form.email, form.password, form.houseCode, form.houseName, mode]);

  async function handleLogin() {
    // 🔹 LOGIN resta qui come “minimo”: è Firebase Auth puro
    // Se vuoi anche questo in un hook (useLoginAuth), lo faccio.
    await signInWithEmailAndPassword(firebaseAuth, form.email.trim(), form.password);
    redirectDashboard();
  }

  async function handleRegister() {
    const res = await register({
      email: form.email.trim(),
      password: form.password,
      houseName: form.houseName.trim() || "Casa",
      displayName: "",
    });

    console.log(res);
    if (!res.ok) throw new Error(res as any);
    redirectDashboard();
  }

  async function handleJoin() {
    const res = await join({
      email: form.email.trim(),
      password: form.password,
      shareCode: form.houseCode.trim().toUpperCase(),
      displayName: "",
    });

    console.log(res);
    if (!res.ok) throw new Error(res as any);
    redirectDashboard();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit || loading) return;

    try {
      if (mode === "login") await handleLogin();
      else if (mode === "register") await handleRegister();
      else await handleJoin();
    } catch (err: any) {
      setError(String(err?.message ?? err ?? "Errore"));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-center">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm shadow-sm ring-1 ring-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-700">Realtime • Condivisione • Totali</span>
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
                Casa condivisa,
                <span className="text-slate-500"> spese sotto controllo</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Crea una casa, invita con un codice, e gestisci categorie ed eventi in tempo reale.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Feature title="Codice casa" desc="Invita altre persone facilmente." />
                <Feature title="Totali mensili" desc="Riepiloghi per categoria." />
                <Feature title="Eventi" desc="Spese e note con stato." />
                <Feature title="Realtime" desc="Aggiornamenti istantanei." />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
              <div className="flex rounded-2xl bg-slate-100 p-1">
                <TabButton active={mode === "login"} onClick={() => setMode("login")} label="Login" />
                <TabButton active={mode === "register"} onClick={() => setMode("register")} label="Registrati" />
                <TabButton active={mode === "join"} onClick={() => setMode("join")} label="Join" />
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {mode === "register" && (
                  <Field
                    label="Nome casa"
                    placeholder="Es. Casa Rossi"
                    value={form.houseName}
                    onChange={setField("houseName")}
                    disabled={loading}
                  />
                )}

                <Field
                  label="Email"
                  placeholder="nome@esempio.com"
                  value={form.email}
                  onChange={setField("email")}
                  type="email"
                  disabled={loading}
                />

                <Field
                  label="Password"
                  placeholder="Minimo 6 caratteri"
                  value={form.password}
                  onChange={setField("password")}
                  type="password"
                  disabled={loading}
                  hint="Suggerimento: almeno 6 caratteri."
                />

                {mode === "join" && (
                  <Field
                    label="Codice casa"
                    placeholder="Es. A1B2C"
                    value={form.houseCode}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, houseCode: e.target.value.toUpperCase() }))
                    }
                    disabled={loading}
                  />
                )}

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className={cx(
                    "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    "shadow-sm ring-1 ring-inset",
                    loading || !canSubmit
                      ? "cursor-not-allowed bg-slate-200 text-slate-500 ring-slate-200"
                      : "bg-slate-900 text-white ring-slate-900 hover:bg-slate-800"
                  )}
                >
                  {loading ? "Caricamento..." : primaryCta}
                </button>

                <div className="pt-2 text-center text-sm text-slate-600">
                  {mode === "login" && (
                    <>
                      Non hai un account?{" "}
                      <button type="button" onClick={() => setMode("register")} className="font-semibold text-slate-900 hover:underline">
                        Registrati
                      </button>
                    </>
                  )}

                  {mode === "register" && (
                    <>
                      Hai già un account?{" "}
                      <button type="button" onClick={() => setMode("login")} className="font-semibold text-slate-900 hover:underline">
                        Accedi
                      </button>
                    </>
                  )}

                  {mode === "join" && (
                    <>
                      Vuoi creare una nuova casa?{" "}
                      <button type="button" onClick={() => setMode("register")} className="font-semibold text-slate-900 hover:underline">
                        Registrati
                      </button>
                    </>
                  )}
                </div>
              </form>

              <div className="mt-8 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-200">
                {mode === "join" ? (
                  <span>
                    Il join crea una richiesta <b>PENDING</b>. L’owner può approvarla nella gestione membri.
                  </span>
                ) : (
                  <span>Firebase Auth gestisce login/registrazione. Il DB salva casa/utente/membri.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ UI components ============ */

function TabButton(props: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cx(
        "w-full rounded-xl px-3 py-2 text-sm font-semibold transition",
        props.active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
      )}
      aria-pressed={props.active}
    >
      {props.label}
    </button>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800">{props.label}</label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        disabled={props.disabled}
        className={cx(
          "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
          "border-slate-200 bg-white text-slate-900",
          "focus:border-slate-400 focus:ring-4 focus:ring-slate-200/60",
          props.disabled && "bg-slate-50 text-slate-500"
        )}
      />
      {props.hint && <div className="mt-2 text-xs text-slate-500">{props.hint}</div>}
    </div>
  );
}

function Feature(props: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-900">{props.title}</div>
      <div className="mt-1 text-sm text-slate-600">{props.desc}</div>
    </div>
  );
}
