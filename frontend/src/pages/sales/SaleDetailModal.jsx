import React, { useRef } from "react";
import { createPortal } from "react-dom";

export default function SaleDetailModal({ sale, onClose }) {
  const receiptRef = useRef();

  if (!sale) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2, p { margin: 5px 0; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
        >
          &times;
        </button>

        <div ref={receiptRef}>
          <h2 className="text-2xl font-bold mb-2">Sale Receipt #{sale.id}</h2>
          <p><strong>Date:</strong> {new Date(sale.created_at).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> {sale.payment_method}</p>

          <table className="w-full border mt-2">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 border">{item.product_name}</td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">₦{item.price}</td>
                  <td className="p-2 border">
                    ₦{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-lg font-bold text-right mt-2">
            Total: ₦{sale.total_amount}
          </p>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}



