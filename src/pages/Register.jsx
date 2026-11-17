import { useState } from "react";
import { api } from "../api";
import { btn, card, errorBox, input, label } from "../ui";
import { Link } from "react-router-dom";

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ["Passwords do not match"] });
      return;
    }
    setLoading(true);
    try {
      const data = await api("/register", { method: "POST", body: form });
      localStorage.setItem("token", data.token);
      onLogin();
    } catch (err) {
      setErrors(err.status === 422
        ? (err.errors ?? {})
        : { general: err.message ?? "Registration failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 p-4 text-brand-800">
      <form className={`${card} w-full max-w-sm`} onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-brand-800">Create an account</h1>
        {errors.general && <p className={errorBox}>{errors.general}</p>}
        <label className={label}>Name
          <input className={input} name="name" autoComplete="name" value={form.name} onChange={handleChange} />
          {errors.name?.[0] && <span className={errorBox}>{errors.name[0]}</span>}
        </label>
        <label className={label}>Email
          <input className={input} name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
          {errors.email?.[0] && <span className={errorBox}>{errors.email[0]}</span>}
        </label>
        <label className={label}>Password
          <input className={input} name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} />
          {errors.password?.[0] && <span className={errorBox}>{errors.password[0]}</span>}
        </label>
        <label className={label}>Confirm password
          <input className={input} name="password_confirmation" type="password" autoComplete="new-password" value={form.password_confirmation} onChange={handleChange} />
          {errors.password_confirmation?.[0] && <span className={errorBox}>{errors.password_confirmation[0]}</span>}
        </label>
        <button className={btn} disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
        <Link className="text-center text-sm font-semibold text-brand-700 hover:text-brand-800" to="/">
          Sign in
        </Link>
      </form>
    </main>
  );
}
