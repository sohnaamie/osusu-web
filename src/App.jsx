import Correction from "./pages/Correction.jsx";
import { useState } from 'react';
import { api } from './api';
import Groups from './Groups';
import Group from './Group';
import { card, input, label, btn, btnGhost, errorBox } from './ui';
import { Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register.jsx";
import { Navigate, useNavigate, useParams } from "react-router-dom";

function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const groupId = Number(id);
  return <Group id={groupId} onBack={() => navigate("/")} />;
}

export default function App() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));


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
    navigate("/");
  }

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-brand-700 px-4 py-3 text-white">
          <strong className="text-lg">Osusu</strong>
          <button className={btnGhost} onClick={logout}>Logout</button>
        </header>
        <main className="mx-auto grid max-w-3xl gap-4 p-4">
          <Routes>
            <Route path="/" element={<Groups onOpen={(id) => navigate(`/groups/${id}`)} />} />
            <Route path="/groups/:id" element={<GroupPage />} />
            <Route path="/groups/:id/contributions/:contributionId/correction" element={<Correction />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/register" element={<Register onLogin={() => setLoggedIn(true)} />} />
      <Route
        path="*"
        element={

          <main className="grid min-h-screen place-items-center bg-brand-50 p-4 text-brand-800">
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
              <Link className="text-center text-sm font-semibold text-brand-700 hover:text-brand-800" to="/register">
                Create account
              </Link>
            </form>
          </main>

        }
      />
    </Routes>
  );

}