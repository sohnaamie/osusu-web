import { useEffect, useState } from 'react';
import { api } from './api';

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
  const money = (n) => 'D' + Number(n ?? 0).toLocaleString();

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

  if (!group) return <p className="muted">{error || 'Loading...'}</p>;

  return (
    <>
      <button className="btn btn-ghost" style={{ color: 'var(--brand)' }} onClick={onBack}>← Back</button>

      <section className="card">
        <div className="row" style={{ border: 0, padding: 0 }}>
          <h2>{group.name}</h2>
          <span className={`badge ${group.status}`}>{group.status}</span>
        </div>
        <div className="stats">
          <div className="stat"><span className="muted">Type</span><b>{group.payout_type}</b></div>
          <div className="stat"><span className="muted">Frequency</span><b>{group.frequency}</b></div>
          <div className="stat"><span className="muted">Each payment</span><b>{money(group.contribution_amount)}</b></div>
          <div className="stat"><span className="muted">Starts</span><b>{group.start_date?.slice(0, 10)}</b></div>
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h3>Members</h3>
        {members.map((m) => (
          <div className="row" key={m.id}>
            <span>{m.user.name} <span className="muted">· {m.number_of_shares} share{m.number_of_shares > 1 ? 's' : ''}</span></span>
            <span className="badge">{m.role}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>Balances</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Paid</th><th>Reversed</th><th>Balance</th><th>Expected</th></tr></thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.member_id}>
                  <td>{b.name}</td><td>{money(b.paid)}</td><td>{money(b.reversed)}</td>
                  <td><b>{money(b.balance)}</b></td><td>{money(b.expected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin && (
        <section className="card">
          <h3>Admin</h3>
          {group.status === 'forming' && (
            <button className="btn" onClick={() => run(`/groups/${id}/start`)}>Start group</button>
          )}

          <form onSubmit={addMember} className="form-grid">
            <label className="field">Add a member by email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="btn" style={{ alignSelf: 'end' }}>Add member</button>
          </form>

          <form onSubmit={recordPayment} className="form-grid">
            <h4 style={{ gridColumn: '1 / -1' }}>Record a payment</h4>
            <label className="field">Member
              <select value={pay.group_member_id} onChange={(e) => setPay({ ...pay, group_member_id: e.target.value })}>
                <option value="">Choose member</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.user.name}</option>)}
              </select>
            </label>
            <label className="field">Period
              <input inputMode="numeric" value={pay.period_number} onChange={(e) => setPay({ ...pay, period_number: e.target.value })} />
            </label>
            <label className="field">Amount (D)
              <input inputMode="numeric" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
            </label>
            <label className="field">Method
              <select value={pay.payment_method} onChange={(e) => setPay({ ...pay, payment_method: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="wave">Wave</option>
                <option value="aps">APS</option>
              </select>
            </label>
            <button className="btn" style={{ gridColumn: '1 / -1' }}>Record payment</button>
          </form>
        </section>
      )}
    </>
  );
}