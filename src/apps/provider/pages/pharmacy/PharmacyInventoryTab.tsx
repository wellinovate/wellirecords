import React, { useEffect, useState, useCallback } from "react";
import { Box, Plus, X, AlertTriangle, PackageX, Package, Clock, DollarSign, Sliders } from "lucide-react";
import {
  pharmacyInventoryApi,
  PharmacyProduct,
  PharmacyBatch,
  PharmacyInventorySummary,
} from "@/shared/api/pharmacyInventoryApi";

const T = {
  bg: "#0A1624",
  surface: "#0F1C2E",
  border: "rgba(56,189,248,0.12)",
  accent: "#38bdf8",
  text: "#E6EDF3",
  muted: "#7BA3C8",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    val || 0,
  );
}

function productName(p: PharmacyBatch["productId"]): string {
  if (typeof p === "string") return p;
  return p?.name || "Unknown product";
}

type ExpiryFilter = "all" | "30" | "60" | "90" | "expired";

const EMPTY_PRODUCT_FORM = {
  name: "",
  genericName: "",
  brandName: "",
  category: "General",
  dispenseStatus: "otc" as "otc" | "prescription",
  strength: "",
  dosageForm: "",
  reorderLevel: 0,
  defaultSellingPrice: 0,
  nafdacNumber: "",
};

export function PharmacyInventoryTab({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const [summary, setSummary] = useState<PharmacyInventorySummary | null>(null);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [batches, setBatches] = useState<PharmacyBatch[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [savingProduct, setSavingProduct] = useState(false);

  const [adjustingBatch, setAdjustingBatch] = useState<PharmacyBatch | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      setSummary(await pharmacyInventoryApi.getSummary());
    } catch (err) {
      console.error("Failed to load inventory summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res = await pharmacyInventoryApi.listProducts({ limit: 100, isActive: true });
      setProducts(res.items);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  }, []);

  const loadBatches = useCallback(async (filter: ExpiryFilter) => {
    setLoadingBatches(true);
    try {
      const params: Parameters<typeof pharmacyInventoryApi.listBatches>[0] = { limit: 100, status: "active" };
      if (filter === "expired") params.expiredOnly = true;
      else if (filter !== "all") params.expiringWithinDays = Number(filter);
      const res = await pharmacyInventoryApi.listBatches(params);
      setBatches(res.items);
    } catch (err) {
      console.error("Failed to load batches:", err);
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadProducts();
  }, [loadSummary, loadProducts]);

  useEffect(() => {
    loadBatches(expiryFilter);
  }, [expiryFilter, loadBatches]);

  const refreshAll = () => {
    loadSummary();
    loadProducts();
    loadBatches(expiryFilter);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;
    setSavingProduct(true);
    try {
      await pharmacyInventoryApi.createProduct(productForm);
      triggerToast(`${productForm.name} added to the catalog.`);
      setShowAddProduct(false);
      setProductForm(EMPTY_PRODUCT_FORM);
      loadProducts();
      loadSummary();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || "Failed to add product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingBatch || adjustDelta === 0 || !adjustReason.trim()) return;
    setSavingAdjustment(true);
    try {
      await pharmacyInventoryApi.createStockAdjustment({
        batchId: adjustingBatch.id,
        quantityDelta: adjustDelta,
        reason: adjustReason.trim(),
      });
      triggerToast(`Stock adjusted for ${productName(adjustingBatch.productId)}.`);
      setAdjustingBatch(null);
      setAdjustDelta(0);
      setAdjustReason("");
      refreshAll();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || "Failed to save adjustment.");
    } finally {
      setSavingAdjustment(false);
    }
  };

  const summaryCards = [
    { label: "Total Products", value: summary?.totalProducts ?? "—", icon: Package, color: T.accent },
    { label: "In Stock", value: summary?.inStock ?? "—", icon: Box, color: T.success },
    { label: "Low Stock", value: summary?.lowStock ?? "—", icon: AlertTriangle, color: T.warning },
    { label: "Out of Stock", value: summary?.outOfStock ?? "—", icon: PackageX, color: T.danger },
    { label: "Expiring ≤90d", value: summary?.expiringSoon ?? "—", icon: Clock, color: T.warning },
    { label: "Expired", value: summary?.expired ?? "—", icon: AlertTriangle, color: T.danger },
    {
      label: "Stock Value",
      value: summary ? formatCurrency(summary.stockValue) : "—",
      icon: DollarSign,
      color: T.success,
      wide: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Inventory snapshot — computed from real batch/product data, not a placeholder */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, color, wide }) => (
          <div
            key={label}
            className={`rounded-2xl p-3.5 bg-slate-900/80 border border-slate-800 ${wide ? "col-span-2" : ""}`}
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
              <span>{label}</span>
              <Icon size={14} style={{ color }} />
            </div>
            <div className="text-xl font-black mt-1" style={{ color: T.text }}>
              {loadingSummary ? "…" : value}
            </div>
          </div>
        ))}
      </div>

      {/* Product catalog */}
      <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Box size={20} className="text-sky-400" /> Product Catalog
            </h3>
            <p className="text-xs text-slate-400">
              Reorder levels and dispense status per product. Quantities live on batches below, since one product
              can have several batches at once.
            </p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={15} /> Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Dispense</th>
                <th className="p-3">Reorder Level</th>
                <th className="p-3">Default Price (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    No products yet. Add your first product to start receiving stock against it.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {p.genericName} {p.brandName ? `(${p.brandName})` : ""}
                    </div>
                  </td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.dispenseStatus === "prescription"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-slate-700/50 text-slate-300"
                      }`}
                    >
                      {p.dispenseStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">{p.reorderLevel}</td>
                  <td className="p-3 font-bold text-emerald-400">{formatCurrency(p.defaultSellingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batches / expiry */}
      <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Clock size={20} className="text-amber-400" /> Batches & Expiry
            </h3>
            <p className="text-xs text-slate-400">Every unit in stock belongs to a batch with its own expiry.</p>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {(
              [
                ["all", "All active"],
                ["30", "<30 days"],
                ["60", "<60 days"],
                ["90", "<90 days"],
                ["expired", "Expired"],
              ] as [ExpiryFilter, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setExpiryFilter(id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  expiryFilter === id
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Location</th>
                <th className="p-3">On Hand</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Cost / Selling</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loadingBatches && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500">
                    Loading batches…
                  </td>
                </tr>
              )}
              {!loadingBatches && batches.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500">
                    No batches match this filter. Receive goods against a purchase order to add stock.
                  </td>
                </tr>
              )}
              {!loadingBatches &&
                batches.map((b) => {
                  const isExpired = new Date(b.expiryDate).getTime() < Date.now();
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white">{productName(b.productId)}</td>
                      <td className="p-3 font-mono text-[11px]">{b.batchNumber}</td>
                      <td className="p-3">{b.location}</td>
                      <td className="p-3 font-bold">{b.quantityOnHand}</td>
                      <td className={`p-3 ${isExpired ? "text-rose-400 font-bold" : ""}`}>
                        {new Date(b.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {formatCurrency(b.costPrice)} / {formatCurrency(b.sellingPrice)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isExpired
                              ? "bg-rose-500/20 text-rose-400"
                              : b.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          {isExpired ? "EXPIRED" : b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setAdjustingBatch(b)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Adjust stock"
                        >
                          <Sliders size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add product modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-6 bg-slate-900 border border-sky-500/30 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Box size={18} className="text-sky-400" /> Add Product
              </h3>
              <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Augmentin 625mg"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Generic Name</label>
                  <input
                    type="text"
                    value={productForm.genericName}
                    onChange={(e) => setProductForm({ ...productForm, genericName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={productForm.brandName}
                    onChange={(e) => setProductForm({ ...productForm, brandName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dispense Status</label>
                  <select
                    value={productForm.dispenseStatus}
                    onChange={(e) =>
                      setProductForm({ ...productForm, dispenseStatus: e.target.value as "otc" | "prescription" })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  >
                    <option value="otc">Over the counter</option>
                    <option value="prescription">Prescription</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.reorderLevel}
                    onChange={(e) => setProductForm({ ...productForm, reorderLevel: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Default Selling Price (₦)</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.defaultSellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, defaultSellingPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">NAFDAC Number (optional)</label>
                <input
                  type="text"
                  value={productForm.nafdacNumber}
                  onChange={(e) => setProductForm({ ...productForm, nafdacNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  {savingProduct ? "Saving…" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust stock modal */}
      {adjustingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 bg-slate-900 border border-amber-500/30 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sliders size={18} className="text-amber-400" /> Adjust Stock
              </h3>
              <button
                onClick={() => setAdjustingBatch(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <div className="font-bold text-white">{productName(adjustingBatch.productId)}</div>
              <div className="text-slate-400 mt-1">
                Batch {adjustingBatch.batchNumber} · Currently {adjustingBatch.quantityOnHand} on hand
              </div>
            </div>
            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Quantity change (positive to add, negative to remove)
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Reason (required)</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  placeholder="e.g. Damaged in storage, physical count correction"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingBatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdjustment || adjustDelta === 0}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  {savingAdjustment ? "Saving…" : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
