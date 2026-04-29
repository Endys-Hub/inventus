import { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext.jsx";
import PaymentModal from "../../components/PaymentModal";
import { useOfflineQueue } from "../../hooks/useOfflineQueue";
import { printReceipt } from "../../utils/printReceipt";

// Barcode scanners complete their entire input in < 40 ms/char on average.
// Human typing averages 200-400 ms/char. 40 ms is a safe threshold.
const SCANNER_MS_PER_CHAR = 40;

export default function POS() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [flash, setFlash] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const searchRef = useRef(null);
  const scanStartRef = useRef(0);
  const flashTimer = useRef(null);

  const { queuedCount, enqueue, sync } = useOfflineQueue();

  // Load all products for local barcode/search matching.
  // Request page_size=500 so pagination doesn't truncate the local catalogue.
  useEffect(() => {
    api
      .get("/inventory/products/", { params: { page_size: 500 } })
      .then((res) => {
        const data = res.data;
        setProducts(Array.isArray(data) ? data : (data.results ?? []));
      })
      .catch((err) => console.error("Failed to load products:", err));
    searchRef.current?.focus();
  }, []);

  // Debounce search input 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Filter products — runs only when debouncedSearch or products change
  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [products, debouncedSearch]);

  // Reset selection when list changes
  useEffect(() => {
    setSelectedIndex(filteredProducts.length > 0 ? 0 : -1);
  }, [filteredProducts]);

  // ── Flash notification ────────────────────────────────────────────────────
  const showFlash = useCallback((msg, type = "error") => {
    clearTimeout(flashTimer.current);
    setFlash({ msg, type });
    flashTimer.current = setTimeout(() => setFlash(null), 3000);
  }, []);

  // ── Add to cart with stock guard ──────────────────────────────────────────
  const handleAddToCart = useCallback(
    (product) => {
      if (!product.is_active) {
        showFlash(`"${product.name}" is not available`);
        return;
      }
      if (product.stock <= 0) {
        showFlash(`"${product.name}" is out of stock`);
        return;
      }
      const inCart = cart.find((item) => item.id === product.id);
      const cartQty = inCart?.quantity ?? 0;
      if (cartQty >= product.stock) {
        showFlash(`Only ${product.stock} in stock for "${product.name}"`);
        return;
      }
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        stock: product.stock,
      });
      // Clear search after adding
      setSearch("");
      setSelectedIndex(-1);
      scanStartRef.current = 0;
      searchRef.current?.focus();
    },
    [cart, addToCart, showFlash]
  );

  // ── Cart quantity +/- ─────────────────────────────────────────────────────
  const handleQtyChange = useCallback(
    (item, delta) => {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        removeFromCart(item.id);
      } else if (newQty > (item.stock ?? Infinity)) {
        showFlash(`Only ${item.stock} in stock for "${item.name}"`);
      } else {
        updateQuantity(item.id, newQty);
      }
    },
    [removeFromCart, updateQuantity, showFlash]
  );

  // ── Clear cart with confirmation ──────────────────────────────────────────
  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return;
    if (window.confirm("Clear all items from cart?")) clearCart();
  }, [cart.length, clearCart]);

  // ── Search input handlers ─────────────────────────────────────────────────
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length > 0 && !scanStartRef.current) scanStartRef.current = Date.now();
    if (val.length === 0) scanStartRef.current = 0;
    setSearch(val);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setSearch("");
        setSelectedIndex(-1);
        scanStartRef.current = 0;
        return;
      }

      if (e.key === "ArrowDown" && filteredProducts.length > 0) {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredProducts.length - 1));
        return;
      }

      if (e.key === "ArrowUp" && filteredProducts.length > 0) {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();

        // Empty input + items in cart → open checkout
        if (!search.trim()) {
          if (cart.length > 0 && !paymentOpen) setPaymentOpen(true);
          return;
        }

        // Detect barcode scanner by keystroke velocity
        const elapsed = scanStartRef.current ? Date.now() - scanStartRef.current : 9999;
        const avgPerChar = search.length > 0 ? elapsed / search.length : 9999;
        const isBarcode = avgPerChar < SCANNER_MS_PER_CHAR && search.length >= 3;

        if (isBarcode) {
          const match = products.find(
            (p) =>
              (p.sku && p.sku === search.trim()) ||
              p.name.toLowerCase() === search.trim().toLowerCase()
          );
          if (match) {
            handleAddToCart(match);
          } else {
            showFlash(`No product found: "${search.trim()}"`);
            setSearch("");
            scanStartRef.current = 0;
          }
          return;
        }

        // Manual input — add highlighted or first matching product
        const target =
          selectedIndex >= 0 ? filteredProducts[selectedIndex] : filteredProducts[0];
        if (target) handleAddToCart(target);
      }
    },
    [search, filteredProducts, selectedIndex, cart.length, paymentOpen, products, handleAddToCart, showFlash]
  );

  // ── Confirm payment & submit sale ─────────────────────────────────────────
  const handleConfirmPayment = useCallback(
    async (paymentData) => {
      if (processing) return;
      setProcessing(true);

      const saleCart = [...cart];
      const saleTotal = totalAmount;

      const payload = {
        items: saleCart.map((item) => ({ product: item.id, quantity: item.quantity, price: Number(item.price) })),
        total_amount: Number(saleTotal.toFixed(2)),
        payment_method: paymentData.method,
      };

      try {
        await api.post("/sales/", payload);
        clearCart();
        setPaymentOpen(false);
        setLastSale({ items: saleCart, total: saleTotal, paymentData });
        // Drain any previously queued offline sales now that we're back online
        sync();
      } catch (err) {
        const isNetworkError = err.code === "ERR_NETWORK" || !navigator.onLine;
        if (isNetworkError) {
          enqueue(payload);
          clearCart();
          setPaymentOpen(false);
          setLastSale({ items: saleCart, total: saleTotal, paymentData });
          showFlash("Offline — sale saved locally and will sync on reconnect", "warning");
        } else {
          const msg =
            err.response?.data?.detail ||
            err.response?.data?.stock ||
            "Failed to complete sale. Please try again.";
          showFlash(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
      } finally {
        setProcessing(false);
      }
    },
    [cart, totalAmount, processing, clearCart, enqueue, sync, showFlash]
  );

  const handleExitPOS = useCallback(() => {
    if (cart.length > 0) {
      if (!window.confirm("Cart is not empty. Exit POS anyway?")) return;
    }
    navigate("/dashboard");
  }, [cart.length, navigate]);

  const handlePrintReceipt = useCallback(() => {
    if (!lastSale) return;
    printReceipt({
      items: lastSale.items,
      total: lastSale.total,
      paymentData: lastSale.paymentData,
      cashier: user?.name || user?.email || "Cashier",
    });
  }, [lastSale, user]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitPOS}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Exit
          </button>
          <h1 className="text-lg font-bold text-gray-900">POS Terminal</h1>
          {queuedCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full">
              {queuedCount} sale{queuedCount !== 1 ? "s" : ""} queued offline
            </span>
          )}
        </div>
        <span className="hidden md:block text-xs text-gray-400 select-none">
          Enter: add / checkout &nbsp;·&nbsp; Esc: clear &nbsp;·&nbsp; ↑↓: navigate
        </span>
      </div>

      {/* ── Flash notification ── */}
      {flash && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none transition-opacity ${
            flash.type === "warning"
              ? "bg-amber-500 text-white"
              : flash.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {flash.msg}
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── Left panel ── */}
        <div className="w-full md:w-72 md:flex-shrink-0 md:border-r bg-white flex flex-col p-4 gap-3">

          {/* Search / barcode input */}
          <div className="relative">
            <input
              ref={searchRef}
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onBlur={() =>
                setTimeout(() => {
                  setSearch("");
                  setSelectedIndex(-1);
                  scanStartRef.current = 0;
                }, 150)
              }
              placeholder="Scan barcode or search…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoComplete="off"
              spellCheck={false}
            />

            {/* Product dropdown */}
            {filteredProducts.length > 0 && search && (
              <ul className="absolute top-full mt-1 left-0 right-0 z-20 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
                {filteredProducts.map((p, i) => (
                  <li key={p.id}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent input blur
                        handleAddToCart(p);
                      }}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-blue-50 transition-colors ${
                        i === selectedIndex ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        {p.sku && (
                          <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-800">
                          ₦{Number(p.price).toFixed(2)}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            p.stock === 0
                              ? "text-red-500"
                              : p.stock <= 5
                              ? "text-amber-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Total + action buttons */}
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </p>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                ₦{totalAmount.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => { if (cart.length > 0) setPaymentOpen(true); }}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                cart.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Complete Sale
            </button>

            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors ${
                cart.length === 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-red-200 text-red-500 hover:bg-red-50"
              }`}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* ── Right panel — Cart table ── */}
        <div className="flex-1 overflow-y-auto p-4 overflow-x-hidden">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Cart
          </h2>

          <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-600">Item</th>
                  <th className="p-3 text-center font-medium text-gray-600">Qty</th>
                  <th className="p-3 text-right font-medium text-gray-600">Unit</th>
                  <th className="p-3 text-right font-medium text-gray-600">Subtotal</th>
                  <th className="p-3 w-8" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 text-sm">
                      Cart is empty — scan a barcode or search for a product
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{item.name}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQtyChange(item, -1)}
                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center leading-none transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item, +1)}
                            disabled={item.quantity >= (item.stock ?? Infinity)}
                            className={`w-7 h-7 rounded-full font-bold flex items-center justify-center leading-none transition-colors ${
                              item.quantity >= (item.stock ?? Infinity)
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right text-gray-700 tabular-nums">
                        ₦{Number(item.price).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-800 tabular-nums">
                        ₦{(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors text-xl leading-none"
                          title="Remove"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {cart.length > 0 && (
                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-semibold text-gray-700">
                      Total
                    </td>
                    <td className="p-3 text-right text-xl font-bold text-gray-900 tabular-nums">
                      ₦{totalAmount.toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onConfirm={handleConfirmPayment}
        total={totalAmount}
        processing={processing}
      />

      {/* ── Receipt banner ── */}
      {lastSale && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-emerald-200 p-4 flex items-center gap-3 max-w-xs">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-700">Sale recorded</p>
            <p className="text-xs text-gray-500 truncate">
              ₦{lastSale.total.toFixed(2)} · {lastSale.paymentData.method}
            </p>
          </div>
          <button
            onClick={handlePrintReceipt}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap transition-colors"
          >
            Print receipt
          </button>
          <button
            onClick={() => setLastSale(null)}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
