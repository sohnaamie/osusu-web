import { useEffect, useState } from 'react';
import { api } from './api';

function message(err) {
  return [err.message, ...Object.values(err.errors ?? {}).flat()].filter(Boolean).join(' ');
}

export default function Groups({ onOpen }) {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    contribution_amount: '',
    frequency: 'weekly',
    total_payments: '',
    start_date: '',
    payout_type: 'rotating',
    target_amount: '',
  });
  const isLump = form.payout_type === 'lump_sum';


  async function load() {
    try {
      setGroups(await api('/groups'));
    } catch (err) {
      setError(message(err));
    }
  }

  useEffect(() => { load(); }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function create(e) {
    e.preventDefault();
    setError('');
    const body = {
      ...form,
      contribution_amount: Number(form.contribution_amount),
      total_payments: isLump && form.total_payments ? Number(form.total_payments) : null,
      target_amount: isLump && form.target_amount ? Number(form.target_amount) : null,
    };
    try {
      await api('/groups', { method: 'POST', body });
      setForm({
        ...form,
        name: '',
        contribution_amount: '',
        total_payments: '',
        start_date: '',
        target_amount: '',
      });
      load();
    } catch (err) {
      setError(message(err));
    }
  }

  return (
    <>
      <section className="card">
        <h2>My groups</h2>
        {error && <p className="error">{error}</p>}
        {groups.length === 0 && <p className="muted">No groups yet. Create your first one below.</p>}
        {groups.map((g) => (
          <div className="row" key={g.id}>
            <div>
              <button className="name" onClick={() => onOpen(g.id)}>{g.name}</button>
              <div className="muted">{g.payout_type} · {g.frequency}</div>
            </div>
            <span className={`badge ${g.status}`}>{g.status}</span>
          </div>
        ))}
      </section>

      <form className="card" onSubmit={create}>
        <h3>Create a group</h3>
        <div className="form-grid">
          <label className="field">Name
            <input name="name" value={form.name} onChange={change} />
          </label>
          <label className="field">Amount per payment (D)
            <input name="contribution_amount" inputMode="numeric" value={form.contribution_amount} onChange={change} />
          </label>
          <label className="field">How often
            <select name="frequency" value={form.frequency} onChange={change}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="field">Start date
            <input name="start_date" type="date" value={form.start_date} onChange={change} />
          </label>
          <label className="field">Payout type
            <select name="payout_type" value={form.payout_type} onChange={change}>
              <option value="rotating">Rotating (one member per period)</option>
              <option value="lump_sum">Lump sum (everyone at the end)</option>
            </select>
          </label>
          {isLump && (
            <>
              <label className="field">Total payments
                <input name="total_payments" inputMode="numeric" value={form.total_payments} onChange={change} />
              </label>
              <label className="field">Target per member (D)
                <input name="target_amount" inputMode="numeric" value={form.target_amount} onChange={change} />
              </label>
            </>
          )}
        </div>
        <button className="btn">Create group</button>
      </form>
    </>
  );
}