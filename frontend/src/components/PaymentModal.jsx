import { useState, useEffect } from "react";

export default function PaymentModal({ open, total, onClose, onConfirm, processing = false }) {
  const [amountPaid, setAmountPaid] = useState("");
  const [method, setMethod] = useState("cash");
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (open) {
      setAmountPaid("");
      setMethod("cash");
      setChange(0);
    }
  }, [open]);

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0;
    setChange(paid - total);
  }, [amountPaid, total]);

  // Keyboard: Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(amountPaid) < total) {
      alert("Amount paid cannot be less than total.");
      return;
    }
    onConfirm({
      method,
      amount_paid: parseFloat(amountPaid),
      change: change < 0 ? 0 : change,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Complete Payment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={processing}
            >
              <option value="cash">Cash</option>
              <option value="pos">POS (Card)</option>
              <option value="transfer">Mobile Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₦)</label>
            <input
              type="number"
              min={total}
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder={`Min: ₦${Number(total).toFixed(2)}`}
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              required
              disabled={processing}
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total due</p>
            <p className="text-2xl font-bold text-gray-900">₦{Number(total).toFixed(2)}</p>
            {change > 0 && (
              <p className="text-sm font-semibold text-emerald-600 mt-1">
                Change: ₦{change.toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? "Processing…" : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
