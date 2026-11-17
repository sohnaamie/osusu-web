import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { btn, card, errorBox, input, label } from "../ui";

export default function Correction() {
  const { id, contributionId } = useParams();
  const groupId = Number(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ amount: "", reason: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
        await api(`/groups/${groupId}/contributions/${contributionId}/corrections`, {
          method: 'POST',
          body: { ...form, amount: Number(form.amount) },
        });
        navigate(`/groups/${groupId}`);
    } catch (err) {
        setErrors(err.status === 422 ? (err.errors ?? {}) : { general: err.message ?? "Correction failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={`${card} w-full max-w-sm`} onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-brand-800">Correct a contribution</h1>
      {errors.general && <p className={errorBox}>{errors.general}</p>}
      <label className={label}>Corrected amount
        <input
          className={input}
          name="amount"
          type="number"
          min="1"
          value={form.amount}
          onChange={handleChange}
        />
        {errors.amount?.[0] && <span className={errorBox}>{errors.amount[0]}</span>}
      </label>
      <label className={label}>Reason
        <textarea
          className={input}
          name="reason"
          value={form.reason}
          onChange={handleChange}
        />
        {errors.reason?.[0] && <span className={errorBox}>{errors.reason[0]}</span>}
      </label>
      {errors.contribution_id?.[0] && <span className={errorBox}>{errors.contribution_id[0]}</span>}
      {errors.group_id?.[0] && <span className={errorBox}>{errors.group_id[0]}</span>}
      <button className={btn} disabled={loading}>
        {loading ? "Saving..." : "Save correction"}
      </button>
      <Link className="text-center text-sm font-semibold text-brand-700 hover:text-brand-700" to={`/groups/${groupId}`}>
        cancel
      </Link>
    </form>
  );
}