import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { changePassword } from "../../services/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    try {
      await changePassword(form);
      setSuccess("Password updated successfully.");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        // Map field-level errors from DRF
        const mapped = {};
        for (const [key, val] of Object.entries(data)) {
          mapped[key] = Array.isArray(val) ? val.join(" ") : String(val);
        }
        setErrors(mapped);
      } else {
        setErrors({ non_field_errors: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-96">
          <h1 className="text-xl font-bold mb-4">Change Password</h1>

          {success && (
            <p className="text-green-600 bg-green-50 border border-green-200 rounded p-2 mb-4 text-sm">
              {success}
            </p>
          )}

          {errors.non_field_errors && (
            <p className="text-red-600 mb-3 text-sm">{errors.non_field_errors}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              {errors.current_password && (
                <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              {errors.new_password && (
                <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
