"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Briefcase,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ServiceRecord {
  id: string;
  categoryId: string;
  category: Category;
  name: string;
  slug: string;
  shortDescription: string;
  startingPrice: number;
  durationMinutes: number;
  warrantyDays: number;
  isActive: boolean;
}

export function AdminServicesView({
  initialServices,
  categories,
}: {
  initialServices: ServiceRecord[];
  categories: Category[];
}) {
  const [services, setServices] = useState<ServiceRecord[]>(initialServices);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New service form state
  const [newForm, setNewForm] = useState({
    categoryId: categories[0]?.id || "",
    name: "",
    slug: "",
    shortDescription: "",
    startingPrice: "499",
    durationMinutes: "60",
    warrantyDays: "30",
  });

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" || s.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: editingService.id,
          startingPrice: editingService.startingPrice,
          durationMinutes: editingService.durationMinutes,
          warrantyDays: editingService.warrantyDays,
          isActive: editingService.isActive,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setServices((prev) =>
          prev.map((s) =>
            s.id === updated.id ? { ...s, ...updated } : s
          )
        );
        setEditingService(null);
      } else {
        alert("Failed to update service details");
      }
    } catch {
      alert("Error updating service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.slug || !newForm.categoryId) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (res.ok) {
        const created = await res.json();
        const cat = categories.find((c) => c.id === created.categoryId);
        setServices((prev) => [
          { ...created, category: cat || { id: created.categoryId, name: "General" } },
          ...prev,
        ]);
        setIsCreating(false);
        setNewForm({
          categoryId: categories[0]?.id || "",
          name: "",
          slug: "",
          shortDescription: "",
          startingPrice: "499",
          durationMinutes: "60",
          warrantyDays: "30",
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create service");
      }
    } catch {
      alert("Error creating service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Summary Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            Total Catalog Services: <span className="text-amber-600">{services.length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            Active: <span className="text-emerald-600">{services.filter((s) => s.isActive).length}</span>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search service title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-semibold">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Service Name & Slug</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Starting Price</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Warranty</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No services found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        /{s.slug}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {s.category.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900">
                        {formatCurrency(s.startingPrice)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.durationMinutes} min</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{s.warrantyDays} Days</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3" />
                          INACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingService({ ...s })}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Edit Service Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingService.name}
                </p>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Starting Price (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={editingService.startingPrice}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      startingPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={editingService.durationMinutes}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      durationMinutes: parseInt(e.target.value) || 60,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Worksy Warranty (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={editingService.warrantyDays}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      warrantyDays: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingService.isActive}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-slate-800 font-bold">
                  Catalog Active (Visible for customer bookings)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Service Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Add New Service to Catalog
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Expand the Worksy multi-service marketplace
                </p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Category *
                </label>
                <select
                  value={newForm.categoryId}
                  onChange={(e) =>
                    setNewForm({ ...newForm, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom Painting"
                  value={newForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setNewForm({ ...newForm, name, slug });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={newForm.slug}
                  onChange={(e) =>
                    setNewForm({ ...newForm, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="Brief customer-facing summary"
                  value={newForm.shortDescription}
                  onChange={(e) =>
                    setNewForm({ ...newForm, shortDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={newForm.startingPrice}
                    onChange={(e) =>
                      setNewForm({ ...newForm, startingPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={newForm.durationMinutes}
                    onChange={(e) =>
                      setNewForm({ ...newForm, durationMinutes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Warranty (days)
                  </label>
                  <input
                    type="number"
                    value={newForm.warrantyDays}
                    onChange={(e) =>
                      setNewForm({ ...newForm, warrantyDays: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
