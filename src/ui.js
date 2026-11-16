export const card = 'grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm';
export const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600';
export const label = 'grid gap-1 text-sm text-slate-600';
export const btn = 'rounded-lg bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800';
export const btnGhost = 'rounded-lg border border-current px-4 py-2 font-semibold hover:bg-black/5';
export const errorBox = 'rounded-lg bg-red-50 px-3 py-2 text-red-700';
export const row = 'flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3';

const badges = {
  forming: 'bg-fuchsia-100 text-fuchsia-700',
  active: 'bg-brand-100 text-brand-700',
  finished: 'bg-slate-100 text-slate-600',
};
export const badge = (s) =>
  `rounded-full px-2 py-0.5 text-xs font-medium ${badges[s] ?? 'bg-slate-100 text-slate-700'}`;

export const money = (n) => 'D' + Number(n ?? 0).toLocaleString();