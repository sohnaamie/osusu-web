import { useEffect, useState } from 'react';
import { api } from './api';
import { card, input, label, btn, btnGhost, errorBox, row, badge, money } from './ui'

function message(err) {
  return [err.message, ...Object.values(err.errors ?? {}).flat()].filter(Boolean).join(' ');
}

export default function Group({ id, onBack }) {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [pay, setPay] = useState({ group_member_id: '', period_number: '', amount: '', payment_method: 'cash' });
 

  async function load() {
    try {
      const [g, m, b, u] = await Promise.all([
        api(`/groups/${id}`),
        api(`/groups/${id}/members`),
        api(`/groups/${id}/balances`),
        api('/user'),
      ]);
      setGroup(g);
      setMembers(m);
      setBalances(b);
      setMe(u);
    } catch (err) {
      setError(message(err));
    }
  }

  useEffect(() => { load(); }, [id]);

  const isAdmin = members.find((m) => m.user_id === me?.id)?.role === 'admin';

  async function run(path, body) {
    setError('');
    try {
      await api(path, { method: 'POST', body });
      await load();
    } catch (err) {
      setError(message(err));
    }
  }

  function addMember(e) {
    e.preventDefault();
    run(`/groups/${id}/members`, { email });
    setEmail('');
  }

  function recordPayment(e) {
    e.preventDefault();
    run(`/groups/${id}/contributions`, {
      group_member_id: Number(pay.group_member_id),
      period_number: Number(pay.period_number),
      amount: Number(pay.amount),
      payment_method: pay.payment_method,
    });
  }

  if (!group) return <p className="text-slate-500">{error || 'Loading...'}</p>;

return (
  <>
    <button className={`${btnGhost} w-fit text-brand-700`} onClick={onBack}>← Back</button>

    <section className={card}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{group.name}</h2>
        <span className={badge(group.status)}>{group.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['Type', group.payout_type],
          ['Frequency', group.frequency],
          ['Each payment', money(group.contribution_amount)],
          ['Starts', group.start_date?.slice(0, 10)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs text-slate-500">{k}</div>
            <div className="font-semibold">{v}</div>
          </div>
        ))}
      </div>
      {error && <p className={errorBox}>{error}</p>}
    </section>

    <section className={card}>
      <h3 className="text-lg font-bold">Members</h3>
      {members.map((m) => (
        <div className={row} key={m.id}>
          <span>{m.user.name} <span className="text-sm text-slate-500">· {m.number_of_shares} share{m.number_of_shares > 1 ? 's' : ''}</span></span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{m.role}</span>
        </div>
      ))}
    </section>

    <section className={card}>
      <h3 className="text-lg font-bold">Balances</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr><th className="p-2">Name</th><th className="p-2">Paid</th><th className="p-2">Reversed</th><th className="p-2">Balance</th><th className="p-2">Expected</th></tr>
          </thead>
          <tbody>
            {balances.map((b) => (
              <tr key={b.member_id} className="border-t border-slate-100">
                <td className="p-2">{b.name}</td>
                <td className="p-2">{money(b.paid)}</td>
                <td className="p-2">{money(b.reversed)}</td>
                <td className="p-2 font-semibold">{money(b.balance)}</td>
                <td className="p-2">{money(b.expected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {isAdmin && (
      <section className={card}>
        <h3 className="text-lg font-bold">Admin</h3>
        {group.status === 'forming' && (
          <button className={`${btn} w-fit`} onClick={() => run(`/groups/${id}/start`)}>Start group</button>
        )}

        <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-2">
          <label className={label}>Add a member by email
            <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className={`${btn} self-end`}>Add member</button>
        </form>

        <form onSubmit={recordPayment} className="grid gap-3 sm:grid-cols-2">
          <h4 className="font-semibold sm:col-span-2">Record a payment</h4>
          <label className={label}>Member
            <select className={input} value={pay.group_member_id} onChange={(e) => setPay({ ...pay, group_member_id: e.target.value })}>
              <option value="">Choose member</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.user.name}</option>)}
            </select>
          </label>
          <label className={label}>Period
            <input className={input} inputMode="numeric" value={pay.period_number} onChange={(e) => setPay({ ...pay, period_number: e.target.value })} />
          </label>
          <label className={label}>Amount (D)
            <input className={input} inputMode="numeric" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
          </label>
          <label className={label}>Method
            <select className={input} value={pay.payment_method} onChange={(e) => setPay({ ...pay, payment_method: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="wave">Wave</option>
              <option value="aps">APS</option>
            </select>
          </label>
          <button className={`${btn} sm:col-span-2`}>Record payment</button>
        </form>
      </section>
    )}
  </>
);
}