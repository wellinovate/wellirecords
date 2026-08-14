import React, { useEffect, useState, useCallback } from "react";
import { Truck, Plus, X, Edit2 } from "lucide-react";
import { pharmacyInventoryApi, PharmacySupplier } from "@/shared/api/pharmacyInventoryApi";

const EMPTY_FORM = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  paymentTerms: "",
  creditLimit: 0,
  notes: "",
};

export function PharmacySuppliersTab({ triggerToast }: { triggerToast: (msg: string) => void }) {
  const [suppliers, setSuppliers] = useState<PharmacySupplier[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<PharmacySupplier | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pharmacyInventoryApi.listSuppliers({ limit: 100 });
      setSuppliers(res.items);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const openCreate = () => {
    setEditingSupplier(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (supplier: PharmacySupplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contactName: supplier.contactName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      paymentTerms: supplier.paymentTerms || "",
      creditLimit: supplier.creditLimit || 0,
      notes: supplier.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingSupplier) {
        await pharmacyInventoryApi.updateSupplier(editingSupplier.id, form);
        triggerToast(`${form.name} updated.`);
      } else {
        await pharmacyInventoryApi.createSupplier(form);
        triggerToast(`${form.name} added to suppliers.`);
      }
      setShowModal(false);
      loadSuppliers();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || "Failed to save supplier.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Truck size={20} className="text-sky-400" /> Supplier Directory
            </h3>
            <p className="text-xs text-slate-400">
              Manage vendors and pharmaceutical distributors for purchase order tracking.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={15} /> Add Supplier
          </button>
        </div>

        {loading && <p className="text-xs text-slate-500 text-center py-6">Loading suppliers…</p>}
        {!loading && suppliers.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-6">No suppliers added yet.</p>
        )}

        {!loading && suppliers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Phone & Email</th>
                  <th className="p-3">Payment Terms</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{s.name}</td>
                    <td className="p-3">{s.contactName || "—"}</td>
                    <td className="p-3 text-[11px]">
                      <div>{s.phone || "—"}</div>
                      <div className="text-slate-400">{s.email}</div>
                    </td>
                    <td className="p-3">{s.paymentTerms || "—"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Edit supplier"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-6 bg-slate-900 border border-sky-500/30 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Truck size={18} className="text-sky-400" />
                {editingSupplier ? "Edit Supplier" : "Add Supplier"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fidson Healthcare Plc"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. Net 30"
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Credit Limit (₦)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.creditLimit}
                    onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingSupplier ? "Update Supplier" : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
