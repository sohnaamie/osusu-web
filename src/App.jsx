import { useState } from 'react';
import { api } from './api';
import Groups from './Groups';
import Group from './Group';

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
      <>
        <header className="app-header">
          <strong>Osusu</strong>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </header>
        <main className="container">
          {selected
            ? <Group id={selected} onBack={() => setSelected(null)} />
            : <Groups onOpen={setSelected} />}
        </main>
      </>
    );
  }

  return (
    <main className="auth">
      <form className="card" onSubmit={login}>
        <div>
          <h1>Osusu</h1>
          <p className="muted">Manage your savings group</p>
        </div>
        <label className="field">Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        {validationErrors.map((m, i) => <p className="error" key={i}>{m}</p>)}
        <button className="btn">Login</button>
      </form>
    </main>
  );
}