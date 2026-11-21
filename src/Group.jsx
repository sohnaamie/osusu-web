import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";
import {
  card,
  input,
  label,
  btn,
  btnGhost,
  errorBox,
  row,
  badge,
  money,
} from "./ui";

function message(err) {
  return [err.message, ...Object.values(err.errors ?? {}).flat()]
    .filter(Boolean)
    .join(" ");
}

export default function Group({ id, onBack }) {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [pay, setPay] = useState({
    group_member_id: "",
    period_number: "",
    payment_method: "cash",
  });
  const [payouts, setPayouts] = useState([]);
  const [payoutPeriod, setPayoutPeriod] = useState("");

  async function load() {
    if (!Number.isFinite(id)) {
      setError("Group not found");
      return;
    }
    try {
      const [g, m, b, u] = await Promise.all([
        api(`/groups/${id}`),
        api(`/groups/${id}/members`),
        api(`/groups/${id}/balances`),
        api("/user"),
      ]);

      setGroup(g);
      setMembers(m);
      setBalances(b);
      setMe(u);
      try {
        setContributions(await api(`/groups/${id}/contributions`));
      } catch {
        setContributions([]);
      }
    } catch {
      setError("Group not found");
    }

    try {
      setPayouts(await api(`/groups/${id}/payouts`));
    } catch {
      setPayouts([]);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const isAdmin = members.find((m) => m.user_id === me?.id)?.role === "admin";

  async function run(path, body) {
    setError("");
    setErrors({});
    try {
      await api(path, { method: "POST", body });
      await load();
    } catch (err) {
      setError(message(err));
      setErrors(err.errors ?? {});
    }
  }

  function addMember(e) {
    e.preventDefault();
    run(`/groups/${id}/members`, { email });
    setEmail("");
  }

  function recordPayment(e) {
    e.preventDefault();
    run(`/groups/${id}/contributions`, {
      group_member_id: Number(pay.group_member_id),
      period_number: Number(pay.period_number),
      amount: Number(group.contribution_amount),
      payment_method: pay.payment_method,
    });
  }

  function recordPayout(e) {
    e.preventDefault();
    run(`/groups/${id}/payouts`, {
      period_number: Number(payoutPeriod),
    });
  }

  if (!group) return <p className="text-slate-500">{error || "Loading..."}</p>;

  return (
    <>
      <button className={`${btnGhost} w-fit text-brand-700`} onClick={onBack}>
        ← Back
      </button>

      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{group.name}</h2>
          <span className={badge(group.status)}>{group.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Type", group.payout_type],
            ["Frequency", group.frequency],
            ["Each payment", money(group.contribution_amount)],
            ["Starts", group.start_date?.slice(0, 10)],
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
        <h3 className="text-lg font-bold">Contributions</h3>
        {contributions.map((c) => (
          <div className={row} key={c.id}>
            <span>
              Period {c.period_number} · {money(c.amount)} · Paid by{" "}
              {c.member?.user?.name ?? "Unknown"}
              {c.corrections?.length > 0 && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  Corrected
                </span>
              )}
            </span>
            {isAdmin && (
              <Link
                className={`${btn} w-fit`}
                to={`/groups/${id}/contributions/${c.id}/correction`}
              >
                Correct
              </Link>
            )}
          </div>
        ))}
      </section>

      <section className={card}>
        <h3 className="text-lg font-bold">Members</h3>
        {members.map((m) => (
          <div className={row} key={m.id}>
            <span>
              {m.user.name}{" "}
              <span className="text-sm text-slate-500">
                · {m.number_of_shares} share{m.number_of_shares > 1 ? "s" : ""}
              </span>
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {m.role}
            </span>
          </div>
        ))}
      </section>

      <section className={card}>
        <h3 className="text-lg font-bold">Balances</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Paid</th>
                <th className="p-2">Reversed</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Expected</th>
              </tr>
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
      <section className={card}>
        <h3 className="text-lg font-bold">Payouts</h3>
        {payouts.length === 0 && (
          <p className="text-sm text-slate-500">No payouts yet.</p>
        )}
        {payouts.map((p) => (
          <div className={row} key={p.id}>
            <span>
              Period {p.period_number} · {p.member?.user?.name ?? "Unknown"}
            </span>
            <span className="font-semibold">{money(p.amount)}</span>
          </div>
        ))}
      </section>

      {isAdmin && (
        <section className={card}>
          <h3 className="text-lg font-bold">Admin</h3>
          {group.status === "forming" && (
            <button
              className={`${btn} w-fit`}
              onClick={() => run(`/groups/${id}/start`)}
            >
              Start group
            </button>
          )}

          <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Add a member by email
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button className={`${btn} self-end`}>Add member</button>
          </form>

          <form onSubmit={recordPayment} className="grid gap-3 sm:grid-cols-2">
            <h4 className="font-semibold sm:col-span-2">Record a payment</h4>
            <label className={label}>
              Member
              <select
                className={input}
                value={pay.group_member_id}
                onChange={(e) =>
                  setPay({ ...pay, group_member_id: e.target.value })
                }
              >
                <option value="">Choose member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Period
              <input
                className={input}
                inputMode="numeric"
                value={pay.period_number}
                onChange={(e) =>
                  setPay({ ...pay, period_number: e.target.value })
                }
              />
              {errors.period_number?.[0] && (
                <span className={errorBox}>{errors.period_number[0]}</span>
              )}
            </label>
            <div className={label}>
              Amount
              <div className="rounded-lg bg-slate-50 p-2 font-semibold">
                {money(group.contribution_amount)}
              </div>
            </div>
            <label className={label}>
              Method
              <select
                className={input}
                value={pay.payment_method}
                onChange={(e) =>
                  setPay({ ...pay, payment_method: e.target.value })
                }
              >
                <option value="cash">Cash</option>
                <option value="wave">Wave</option>
                <option value="aps">APS</option>
              </select>
            </label>
            <button className={`${btn} sm:col-span-2`}>Record payment</button>
          </form>

          <form onSubmit={recordPayout} className="grid gap-3 sm:grid-cols-2">
            <h4 className="font-semibold sm:col-span-2">Record a payout</h4>
            <label className={label}>
              Period
              <input
                className={input}
                inputMode="numeric"
                value={payoutPeriod}
                onChange={(e) => setPayoutPeriod(e.target.value)}
              />
              {errors.period_number?.[0] && (
                <span className={errorBox}>{errors.period_number[0]}</span>
              )}
            </label>
            <button className={`${btn} self-end`}>Record payout</button>
          </form>
        </section>
      )}
    </>
  );
}
