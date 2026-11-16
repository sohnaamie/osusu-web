import { useState } from 'react';
import { api } from './api';
import Groups from './Groups';
import Group from './Group';
import { card, input, label, btn, btnGhost, errorBox } from './ui';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const [selected, setSelected] = useState(null);

  async function login(e) {
    setError('');
    e.preventDefault();
    setValidationErrors([]);
    try {
      const data = await api('/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('token', data.token);
      setLoggedIn(true);
    } catch (err) {
      setError(err.message ?? 'Login failed');
      setValidationErrors(Object.values(err.errors ?? {}).flat());
    }
  }
  async function logout() {
    try { await api('/logout', { method: 'POST' }); } catch { }
    localStorage.removeItem('token');
    setLoggedIn(false);
  }

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-brand-700 px-4 py-3 text-white">
          <strong className="text-lg">Osusu</strong>
          <button className={btnGhost} onClick={logout}>Logout</button>
        </header>
        <main className="mx-auto grid max-w-3xl gap-4 p-4">
          {selected
            ? <Group id={selected} onBack={() => setSelected(null)} />
            : <Groups onOpen={setSelected} />}
        </main>
      </div>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4 text-slate-900">
      <form className={`${card} w-full max-w-sm`} onSubmit={login}>
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Osusu</h1>
          <p className="text-sm text-slate-500">Manage your savings group</p>
        </div>
        <label className={label}>Email
          <input className={input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className={label}>Password
          <input className={input} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className={errorBox}>{error}</p>}
        {validationErrors.map((m, i) => <p className={errorBox} key={i}>{m}</p>)}
        <button className={btn}>Login</button>
      </form>
    </main>
  );

}