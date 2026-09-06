import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { apiErrorMessage } from "../../utils/apiError.js";

const roles = ["ADMIN", "INSTITUTE", "INDUSTRY"];

export default function AdminSettings() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.users();
      setUsers(res.items || []);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const edit = (user) => {
    setSelected(user);
    setMessage("");
    setError("");
    setForm({ name: user.name || "", email: user.email || "", password: "", role: user.role || "INSTITUTE", is_active: user.is_active !== false });
  };

  const reset = () => {
    setSelected(null);
    setForm(emptyForm());
    setMessage("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const payload = { ...form, role: form.role.toUpperCase() };
      if (!payload.password) delete payload.password;
      if (selected) await adminService.updateUser(selected.id, payload);
      else await adminService.createUser(payload);
      setMessage(selected ? "User updated." : "User created.");
      reset();
      await loadUsers();
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to save user."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-navy md:text-4xl">Admin Settings</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Create accounts, update roles, deactivate users and reset passwords without exposing stored credentials.</p>
      </div>
      {message && <p className="rounded-2xl bg-green/10 p-4 font-semibold text-green">{message}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr>{["Name", "Email", "Role", "Status", "Action"].map((item) => <th key={item} className="px-5 py-4">{item}</th>)}</tr></thead>
            <tbody>
              {users.map((user) => <tr key={user.id} className="border-t">
                <td className="px-5 py-4 font-semibold text-navy">{user.name}</td>
                <td className="px-5 py-4 text-slate-600">{user.email}</td>
                <td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue">{user.role}</span></td>
                <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_active === false ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{user.is_active === false ? "Inactive" : "Active"}</span></td>
                <td className="px-5 py-4"><button onClick={() => edit(user)} className="rounded-xl border px-4 py-2 text-sm font-semibold text-blue">Edit</button></td>
              </tr>)}
              {loading && <tr><td colSpan="5" className="px-5 py-10 text-center font-semibold text-slate-500">Loading users...</td></tr>}
              {!loading && !users.length && <tr><td colSpan="5" className="px-5 py-10 text-center font-semibold text-slate-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
        <form onSubmit={submit} className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-navy">{selected ? "Edit User" : "Create User"}</h2>
          <div className="mt-6 space-y-5">
            <Field label="Name"><input required value={form.name} onChange={(event) => set("name", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></Field>
            <Field label="Email"><input required type="email" value={form.email} onChange={(event) => set("email", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" /></Field>
            <Field label={selected ? "New Password" : "Password"}><input required={!selected} type="password" value={form.password} onChange={(event) => set("password", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3" placeholder={selected ? "Leave blank to keep current password" : ""} /></Field>
            <Field label="Role"><select value={form.role} onChange={(event) => set("role", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border px-4 py-3">{roles.map((role) => <option key={role}>{role}</option>)}</select></Field>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-600"><input type="checkbox" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} className="h-4 w-4" /> Active account</label>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button disabled={busy} className="rounded-xl bg-blue px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Saving..." : selected ? "Update user" : "Create user"}</button>
            {selected && <button type="button" onClick={reset} className="rounded-xl border px-5 py-3 font-semibold text-slate-700">Cancel</button>}
          </div>
        </form>
      </section>
    </div>
  );
}

function emptyForm() {
  return { name: "", email: "", password: "", role: "INSTITUTE", is_active: true };
}

function Field({ label, children }) {
  return <label className="block text-sm font-semibold text-slate-600">{label}{children}</label>;
}
