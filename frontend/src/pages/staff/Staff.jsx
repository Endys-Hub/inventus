import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const ROLE_LABELS = { MANAGER: "Manager", CASHIER: "Cashier" };

const EMPTY_FORM = { email: "", password: "", role: "CASHIER" };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get("/auth/staff/");
      setStaff(data);
    } catch (err) {
      setFetchError(err.response?.data?.detail || "Failed to load staff.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    try {
      await api.post("/auth/staff/", form);
      setForm(EMPTY_FORM);
      setSuccessMsg(`${ROLE_LABELS[form.role] ?? form.role} account created successfully.`);
      await fetchStaff();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const first = Object.values(data)[0];
        setFormError(Array.isArray(first) ? first[0] : first);
      } else {
        setFormError("Failed to create staff account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-6">Staff Management</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Add Staff Form ── */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded p-5">
              <h3 className="text-lg font-semibold mb-4">Add Staff</h3>

              {formError && (
                <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {formError}
                </p>
              )}
              {successMsg && (
                <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                  {successMsg}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="staff@example.com"
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="CASHIER">Cashier</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Creating…" : "Create Account"}
                </button>
              </form>
            </div>
          </div>

          {/* ── Staff Table ── */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-gray-400">
                        Loading…
                      </td>
                    </tr>
                  ) : fetchError ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-red-500">
                        {fetchError}
                        <button
                          onClick={fetchStaff}
                          className="ml-3 text-blue-600 hover:underline text-sm"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : staff.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-gray-400">
                        No staff accounts yet.
                      </td>
                    </tr>
                  ) : (
                    staff.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{member.email}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              member.role === "MANAGER"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {ROLE_LABELS[member.role] ?? member.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
