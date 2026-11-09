import { CheckCircle2, CircleDashed, Clock3, PhoneCall, XCircle } from "lucide-react";

const styles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  contacted: "border-sky-200 bg-sky-50 text-sky-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-violet-200 bg-violet-50 text-violet-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const icons = {
  pending: Clock3,
  contacted: PhoneCall,
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export function AdminStatusBadge({ status }: { status: string }) {
  const Icon = icons[status as keyof typeof icons] ?? CircleDashed;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${styles[status] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
