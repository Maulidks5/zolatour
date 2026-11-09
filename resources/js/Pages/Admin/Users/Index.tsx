import { FormEvent, useState } from "react";
import { useForm } from "@inertiajs/react";
import { CheckCircle2, Clock3, KeyRound, Plus, Save, ShieldCheck, UserRound, UserX, X } from "lucide-react";
import { AdminLayout } from "@/Components/AdminLayout";
import { AdminPageHeader } from "@/Components/AdminUi";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  isCurrent: boolean;
};

type Role = { label: string; description: string };
type Props = { users: User[]; roles: Record<string, Role> };

export default function UsersIndex({ users, roles }: Props) {
  const [creating, setCreating] = useState(false);
  const activeCount = users.filter((user) => user.isActive).length;
  const ownerCount = users.filter((user) => user.role === "super_admin" && user.isActive).length;

  return (
    <AdminLayout title="User management">
      <AdminPageHeader eyebrow="System & security" title="Admin users" description="Create accounts, assign access levels and safely disable former team members." actions={
        <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add team member</button>
      } />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Team accounts" value={users.length} icon={UserRound} />
        <Stat label="Active users" value={activeCount} icon={CheckCircle2} tone="text-emerald-700 bg-emerald-50" />
        <Stat label="Active owners" value={ownerCount} icon={ShieldCheck} tone="text-violet-700 bg-violet-50" />
      </div>

      {creating && <div className="mt-6"><UserEditor roles={roles} onCancel={() => setCreating(false)} /></div>}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {users.map((user) => <UserEditor key={user.id} user={user} roles={roles} />)}
      </div>
    </AdminLayout>
  );
}

function Stat({ label, value, icon: Icon, tone = "text-sky-700 bg-sky-50" }: { label: string; value: number; icon: typeof UserRound; tone?: string }) {
  return <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-display text-3xl font-bold">{value}</p></div><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span></div>;
}

function UserEditor({ user, roles, onCancel }: { user?: User; roles: Record<string, Role>; onCancel?: () => void }) {
  const { data, setData, post, patch, processing, errors, reset } = useForm({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "editor",
    is_active: user?.isActive ?? true,
    password: "",
    password_confirmation: "",
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const options = { preserveScroll: true, onSuccess: () => { reset("password", "password_confirmation"); onCancel?.(); } };
    if (user) patch(`/admin/users/${user.id}`, options);
    else post("/admin/users", options);
  }

  const initials = (data.name || "New user").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 border-b border-slate-100 p-5 sm:p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--ocean)] font-display text-sm font-bold text-white">{initials}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-xl font-bold">{user ? user.name : "New team member"}</h2>
            {user?.isCurrent && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase text-violet-700">You</span>}
            {user && <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${data.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{data.is_active ? "Active" : "Inactive"}</span>}
          </div>
          {user && <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400"><span>Joined {user.createdAt}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{user.lastLoginAt ? `Last login ${user.lastLoginAt}` : "Never logged in"}</span></p>}
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}><input required value={data.name} onChange={(event) => setData("name", event.target.value)} className={input} /></Field>
          <Field label="Email address" error={errors.email}><input required type="email" value={data.email} onChange={(event) => setData("email", event.target.value)} className={input} /></Field>
        </div>
        <Field label="Access role" error={errors.role}>
          <select disabled={user?.isCurrent} value={data.role} onChange={(event) => setData("role", event.target.value)} className={input}>
            {Object.entries(roles).map(([value, role]) => <option key={value} value={value}>{role.label}</option>)}
          </select>
          <span className="text-xs leading-5 text-slate-400">{roles[data.role]?.description}</span>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={user ? "New password (optional)" : "Temporary password"} error={errors.password}><input required={!user} minLength={6} type="password" autoComplete="new-password" value={data.password} onChange={(event) => setData("password", event.target.value)} className={input} placeholder="At least 6 characters" /></Field>
          <Field label="Confirm password" error={errors.password_confirmation}><input required={!user || Boolean(data.password)} type="password" autoComplete="new-password" value={data.password_confirmation} onChange={(event) => setData("password_confirmation", event.target.value)} className={input} /></Field>
        </div>
        <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><KeyRound className="mt-0.5 h-4 w-4 shrink-0" /> Passwords require at least 6 characters, including letters and numbers.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
        <button type="button" disabled={user?.isCurrent} onClick={() => setData("is_active", !data.is_active)} className={`inline-flex items-center gap-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${data.is_active ? "text-emerald-700" : "text-rose-600"}`}>{data.is_active ? <CheckCircle2 className="h-4 w-4" /> : <UserX className="h-4 w-4" />}{data.is_active ? "Account active" : "Account disabled"}</button>
        <div className="flex gap-2">
          {onCancel && <button type="button" onClick={onCancel} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"><X className="h-4 w-4" /> Cancel</button>}
          <button disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ocean)] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />{processing ? "Saving…" : user ? "Save user" : "Create user"}</button>
        </div>
      </div>
    </form>
  );
}

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--turquoise)] disabled:bg-slate-100 disabled:text-slate-500";
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}{error && <span className="text-xs text-rose-600">{error}</span>}</label>;
}
