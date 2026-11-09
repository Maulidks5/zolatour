import { FormEvent, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { flash } = usePage<{ flash: { error: string | null } }>().props;
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    post("/admin/login");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--sand)]/50 px-4 py-12">
      <Head title="Admin login" />
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)] sm:p-9">
        <a href="/" className="mx-auto block w-fit">
          <img src="/brand/zola-tours-logo.jpeg" alt="Zola Tours & Safaris" className="h-24 max-w-full object-contain" />
        </a>
        <div className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--ocean)] text-white shadow-sm" aria-hidden="true">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="mt-3 text-center font-display text-3xl font-bold">Admin login</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Manage tours, prices, media and bookings.</p>

        {flash.error && (
          <div role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {flash.error}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-5">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Email</span>
            <input
              type="email"
              value={data.email}
              onChange={(event) => setData("email", event.target.value)}
              autoComplete="email"
              required
              className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-[var(--turquoise)]"
            />
            {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Password</span>
            <span className="relative">
              <LockKeyhole className="pointer-events-none absolute inset-y-0 left-4 my-auto h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(event) => setData("password", event.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-12 outline-none focus:border-[var(--turquoise)]"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground transition hover:text-[var(--ocean)]">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
            {errors.password && <span className="text-xs text-red-600">{errors.password}</span>}
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={data.remember} onChange={(event) => setData("remember", event.target.checked)} />
            Keep me signed in
          </label>
          <button disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ocean)] px-5 py-3 font-bold text-white disabled:opacity-60">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" /> {processing ? "Signing in…" : "Secure sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
