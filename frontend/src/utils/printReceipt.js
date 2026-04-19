export function printReceipt({ items, total, paymentData, cashier, storeName = "Inventus" }) {
  const date = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td align="center">${item.quantity}</td>
          <td align="right">&#8358;${Number(item.price).toFixed(2)}</td>
          <td align="right">&#8358;${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Courier New", monospace; font-size: 13px; width: 80mm; margin: 0 auto; padding: 16px; }
    h1 { text-align: center; font-size: 17px; margin-bottom: 4px; letter-spacing: 1px; }
    .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 2px; }
    .meta { font-size: 11px; margin: 2px 0; }
    hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    thead th { font-size: 11px; border-bottom: 1px solid #000; padding: 2px 0; text-align: left; }
    thead th:not(:first-child) { text-align: right; }
    tbody td { font-size: 12px; padding: 3px 0; vertical-align: top; }
    .total-line { font-size: 15px; font-weight: bold; text-align: right; margin: 4px 0; }
    .payment-line { font-size: 12px; margin: 2px 0; }
    .footer { text-align: center; font-size: 11px; margin-top: 10px; letter-spacing: 0.5px; }
    @media print { @page { margin: 0; size: 80mm auto; } body { padding: 8px; } }
  </style>
</head>
<body>
  <h1>${storeName}</h1>
  <p class="sub">${date}</p>
  <p class="meta">Cashier: ${cashier}</p>
  <hr/>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th align="center">Qty</th>
        <th align="right">Price</th>
        <th align="right">Sub</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <hr/>
  <p class="total-line">Total: &#8358;${Number(total).toFixed(2)}</p>
  <p class="payment-line">Method: ${paymentData.method}</p>
  <p class="payment-line">Paid: &#8358;${Number(paymentData.amount_paid || 0).toFixed(2)}</p>
  <p class="payment-line">Change: &#8358;${Number(paymentData.change || 0).toFixed(2)}</p>
  <hr/>
  <p class="footer">Thank you for your purchase!</p>
</body>
</html>`;

  const w = window.open("", "_blank", "width=420,height=600,scrollbars=yes");
  if (!w) {
    alert("Popup blocked — please allow popups to print receipts.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.onafterprint = () => w.close();
  }, 300);
}
