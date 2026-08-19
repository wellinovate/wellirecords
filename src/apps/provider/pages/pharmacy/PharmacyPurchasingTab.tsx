import React, { useEffect, useState, useCallback } from "react";
import { ShoppingCart, Plus, X, Trash2, PackageCheck, Ban } from "lucide-react";
import {
  pharmacyInventoryApi,
  PharmacyPurchaseOrder,
  PharmacySupplier,
  PharmacyProduct,
} from "@/shared/api/pharmacyInventoryApi";

function supplierName(s: PharmacyPurchaseOrder["supplierId"]): string {
  if (typeof s === "string") return s;
  return s?.name || "Unknown supplier";
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-700/50 text-slate-300",
  pending_delivery: "bg-amber-500/20 text-amber-400",
  partially_received: "bg-sky-500/20 text-sky-400",
  received: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-rose-500/20 text-rose-400",
};

type LineItemDraft = { productId: string; quantityOrdered: number; unitCost: number };
type ReceiptLineDraft = {
  productId: string;
  productName: string;
  batchNumber: string;
  quantityReceived: number;
  expiryDate: string;
  costPrice: number;
  sellingPrice: number;
};

export function PharmacyPurchasingTab({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const [pos, setPos] = useState<PharmacyPurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<PharmacySupplier[]>([]);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([{ productId: "", quantityOrdered: 1, unitCost: 0 }]);
  const [saving, setSaving] = useState(false);

  const [receivingPO, setReceivingPO] = useState<PharmacyPurchaseOrder | null>(null);
  const [receiptLines, setReceiptLines] = useState<ReceiptLineDraft[]>([]);
  const [receiving, setReceiving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, supplierRes, productRes] = await Promise.all([
        pharmacyInventoryApi.listPurchaseOrders({ limit: 50 }),
        pharmacyInventoryApi.listSuppliers({ limit: 100, isActive: true }),
        pharmacyInventoryApi.listProducts({ limit: 200, isActive: true }),
      ]);
      setPos(poRes.items);
      setSuppliers(supplierRes.items);
      setProducts(productRes.items);
    } catch (err) {
      console.error("Failed to load purchasing data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const productById = (id: string) => products.find((p) => p.id === id);

  const openCreate = () => {
    setSupplierId(suppliers[0]?.id || "");
    setExpectedDeliveryDate("");
    setNotes("");
    setLineItems([{ productId: "", quantityOrdered: 1, unitCost: 0 }]);
    setShowCreate(true);
  };

  const updateLineItem = (index: number, patch: Partial<LineItemDraft>) => {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  };

  const addLineItem = () => setLineItems((prev) => [...prev, { productId: "", quantityOrdered: 1, unitCost: 0 }]);
  const removeLineItem = (index: number) => setLineItems((prev) => prev.filter((_, i) => i !== index));

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lineItems.filter((li) => li.productId && li.quantityOrdered > 0);
    if (!supplierId || validLines.length === 0) {
      triggerToast("Select a supplier and at least one product line.");
      return;
    }
    setSaving(true);
    try {
      await pharmacyInventoryApi.createPurchaseOrder({
        supplierId,
        lineItems: validLines,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes: notes || undefined,
      });
      triggerToast("Purchase order created as a draft.");
      setShowCreate(false);
      load();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || "Failed to create purchase order.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (po: PharmacyPurchaseOrder, status: "pending_delivery" | "cancelled") => {
    try {
      await pharmacyInventoryApi.updatePurchaseOrderStatus(po.id, status);
      triggerToast(`${po.poNumber} marked ${status.replace("_", " ")}.`);
      load();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || "Failed to update status.");
    }
  };

  const openReceive = (po: PharmacyPurchaseOrder) => {
    setReceivingPO(po);
    setReceiptLines(
      po.lineItems
        .filter((li) => li.quantityReceived < li.quantityOrdered)
        .map((li) => {
          const product = productById(li.productId);
          return {
            productId: li.productId,
            productName: product?.name || li.productId,
            batchNumber: "",
            quantityReceived: li.quantityOrdered - li.quantityReceived,
            expiryDate: "",
            costPrice: li.unitCost,
            sellingPrice: product?.defaultSellingPrice || 0,
          };
        }),
    );
  };

  const updateReceiptLine = (index: number, patch: Partial<ReceiptLineDraft>) => {
    setReceiptLines((prev) => prev.map((rl, i) => (i === index ? { ...rl, ...patch } : rl)));
  };

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPO) return;
    const invalid = receiptLines.some(
      (rl) => !rl.batchNumber.trim() || !rl.expiryDate || rl.quantityReceived <= 0,
    );
    if (invalid) {
      triggerToast("Every line needs a batch number, expiry date, and quantity greater than zero.");
      return;
    }
    setReceiving(true);
    try {
      await pharmacyInventoryApi.receiveGoods(
        receivingPO.id,
        receiptLines.map((rl) => ({
          productId: rl.productId,
          batchNumber: rl.batchNumber.trim(),
          quantityReceived: rl.quantityReceived,
          expiryDate: rl.expiryDate,
          costPrice: rl.costPrice,
          sellingPrice: rl.sellingPrice,
        })),
      );
      triggerToast(`Goods received against ${receivingPO.poNumber}. Batches and stock updated.`);
      setReceivingPO(null);
      load();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || "Failed to record goods receipt.");
    } finally {
      setReceiving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-sky-400" /> Purchase Orders
            </h3>
            <p className="text-xs text-slate-400">
              Creating an order doesn't change stock — only receiving goods against it does.
            </p>
          </div>
          <button
            onClick={openCreate}
            disabled={suppliers.length === 0}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            title={suppliers.length === 0 ? "Add a supplier first" : undefined}
          >
            <Plus size={15} /> New Purchase Order
          </button>
        </div>

        {loading && <p className="text-xs text-slate-500 text-center py-6">Loading purchase orders…</p>}
        {!loading && pos.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-6">No purchase orders yet.</p>
        )}

        {!loading && pos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Lines</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Expected Delivery</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-white">{po.poNumber}</td>
                    <td className="p-3">{supplierName(po.supplierId)}</td>
                    <td className="p-3">
                      {po.lineItems.length} line{po.lineItems.length === 1 ? "" : "s"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLES[po.status] || ""}`}
                      >
                        {po.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {(po.status === "draft" || po.status === "pending_delivery") && (
                          <>
                            <button
                              onClick={() => openReceive(po)}
                              className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400"
                              title="Receive goods"
                            >
                              <PackageCheck size={13} />
                            </button>
                            {po.status === "draft" && (
                              <button
                                onClick={() => handleStatusChange(po, "pending_delivery")}
                                className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-[10px] font-bold"
                              >
                                Mark Pending
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(po, "cancelled")}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400"
                              title="Cancel"
                            >
                              <Ban size={13} />
                            </button>
                          </>
                        )}
                        {po.status === "partially_received" && (
                          <button
                            onClick={() => openReceive(po)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400"
                            title="Receive remaining goods"
                          >
                            <PackageCheck size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl p-6 bg-slate-900 border border-sky-500/30 space-y-4 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShoppingCart size={18} className="text-sky-400" /> New Purchase Order
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Supplier</label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  >
                    <option value="">Select supplier…</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">Line Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Line
                  </button>
                </div>
                {lineItems.map((li, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        required
                        value={li.productId}
                        onChange={(e) => updateLineItem(i, { productId: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        <option value="">Select product…</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={li.quantityOrdered}
                        onChange={(e) => updateLineItem(i, { quantityOrdered: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min={0}
                        placeholder="Unit cost ₦"
                        value={li.unitCost}
                        onChange={(e) => updateLineItem(i, { unitCost: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(i)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Create Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {receivingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl p-6 bg-slate-900 border border-emerald-500/30 space-y-4 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <PackageCheck size={18} className="text-emerald-400" /> Receive Goods against {receivingPO.poNumber}
              </h3>
              <button onClick={() => setReceivingPO(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Every received unit must be given a batch number and expiry date. This updates stock and creates stock
              ledger entries.
            </p>
            <form onSubmit={handleReceiveGoods} className="space-y-4">
              <div className="space-y-3">
                {receiptLines.map((rl, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-xs text-white">{rl.productName}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Batch Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BATCH-2026-08"
                          value={rl.batchNumber}
                          onChange={(e) => updateReceiptLine(i, { batchNumber: e.target.value })}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Qty Received</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={rl.quantityReceived}
                          onChange={(e) => updateReceiptLine(i, { quantityReceived: Number(e.target.value) })}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Expiry Date</label>
                        <input
                          type="date"
                          required
                          value={rl.expiryDate}
                          onChange={(e) => updateReceiptLine(i, { expiryDate: e.target.value })}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Cost Price (₦)</label>
                        <input
                          type="number"
                          min={0}
                          value={rl.costPrice === 0 ? "" : rl.costPrice}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updateReceiptLine(i, { costPrice: raw === "" ? 0 : Number(raw) });
                          }}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Selling Price (₦)</label>
                        <input
                          type="number"
                          min={0}
                          value={rl.sellingPrice === 0 ? "" : rl.sellingPrice}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updateReceiptLine(i, { sellingPrice: raw === "" ? 0 : Number(raw) });
                          }}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReceivingPO(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={receiving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  {receiving ? "Recording…" : "Confirm Goods Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
