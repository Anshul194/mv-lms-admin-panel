import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
    fetchAdminPlans,
    seedDefaultPlans,
    createSaasPlan,
    updateSaasPlan,
    deleteSaasPlan,
    clearActionStatus,
    type SaasPlan,
} from "../../store/slices/superAdmin";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
    Layers,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    AlertTriangle,
    Sprout,
    RefreshCw,
    Star,
    CheckCircle2,
    XCircle,
    Infinity,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFormData {
    key: string;
    name: string;
    description: string;
    monthlyFee: number;
    commissionRate: number;
    trialDays: number;
    badge: string;
    highlightColor: string;
    sortOrder: number;
    isActive: boolean;
    features: {
        maxCourses: number;
        maxStudents: number;
        customDomain: boolean;
        whiteLabel: boolean;
        aiFeatures: boolean;
        advancedAnalytics: boolean;
        apiAccess: boolean;
        prioritySupport: boolean;
    };
}

const defaultFormData = (): PlanFormData => ({
    key: "",
    name: "",
    description: "",
    monthlyFee: 0,
    commissionRate: 0,
    trialDays: 14,
    badge: "",
    highlightColor: "#6366f1",
    sortOrder: 10,
    isActive: true,
    features: {
        maxCourses: 10,
        maxStudents: 500,
        customDomain: false,
        whiteLabel: false,
        aiFeatures: false,
        advancedAnalytics: false,
        apiAccess: false,
        prioritySupport: false,
    },
});

const planToFormData = (plan: SaasPlan): PlanFormData => ({
    key: plan.key,
    name: plan.name,
    description: plan.description || "",
    monthlyFee: plan.monthlyFee,
    commissionRate: plan.commissionRate,
    trialDays: plan.trialDays,
    badge: plan.badge || "",
    highlightColor: plan.highlightColor || "#6366f1",
    sortOrder: plan.sortOrder,
    isActive: plan.isActive,
    features: {
        maxCourses: plan.features.maxCourses,
        maxStudents: plan.features.maxStudents,
        customDomain: plan.features.customDomain,
        whiteLabel: plan.features.whiteLabel,
        aiFeatures: plan.features.aiFeatures,
        advancedAnalytics: plan.features.advancedAnalytics,
        apiAccess: plan.features.apiAccess,
        prioritySupport: plan.features.prioritySupport,
    },
});

// ─── Plan Card ────────────────────────────────────────────────────────────────

const FeatureBit: React.FC<{ label: string; value: boolean | number; isUnlimited?: boolean }> = ({ label, value, isUnlimited }) => {
    if (typeof value === "boolean") {
        return (
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                {value ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
            </div>
        );
    }
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <span className="font-medium text-gray-900 dark:text-white">
                {value === 0 ? <Infinity className="w-4 h-4 text-indigo-500" /> : value.toLocaleString()}
            </span>
        </div>
    );
};

const PlanCard: React.FC<{
    plan: SaasPlan;
    onEdit: (p: SaasPlan) => void;
    onDelete: (p: SaasPlan) => void;
}> = ({ plan, onEdit, onDelete }) => {
    const borderColor = plan.highlightColor || "#6366f1";
    return (
        <div
            className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all overflow-hidden ${plan.isActive ? "" : "opacity-60"}`}
            style={{ borderColor }}
        >
            {plan.badge && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                    style={{ backgroundColor: borderColor }}>
                    <Star className="w-3 h-3" />{plan.badge}
                </div>
            )}
            <div className="p-5">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{plan.key}</span>
                        {!plan.isActive && <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded">Inactive</span>}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    {plan.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{plan.description}</p>}
                </div>

                <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {plan.monthlyFee === 0 ? "Free" : `₹${plan.monthlyFee.toLocaleString()}`}
                        </span>
                        {plan.monthlyFee > 0 && <span className="text-sm text-gray-500 dark:text-gray-400">/mo</span>}
                    </div>
                    {plan.commissionRate > 0 && (
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">+ {plan.commissionRate}% commission</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{plan.trialDays}-day trial · Sort #{plan.sortOrder}</p>
                </div>

                <div className="space-y-2 mb-5">
                    <FeatureBit label="Max Courses" value={plan.features.maxCourses} />
                    <FeatureBit label="Max Students" value={plan.features.maxStudents} />
                    <FeatureBit label="Custom Domain" value={plan.features.customDomain} />
                    <FeatureBit label="White Label" value={plan.features.whiteLabel} />
                    <FeatureBit label="AI Features" value={plan.features.aiFeatures} />
                    <FeatureBit label="Advanced Analytics" value={plan.features.advancedAnalytics} />
                    <FeatureBit label="API Access" value={plan.features.apiAccess} />
                    <FeatureBit label="Priority Support" value={plan.features.prioritySupport} />
                </div>

                <div className="flex gap-2">
                    <button onClick={() => onEdit(plan)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                        <Pencil className="w-4 h-4" /> Edit
                    </button>
                    {plan.key !== "commission" && (
                        <button onClick={() => onDelete(plan)}
                            className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Plan Form Modal ──────────────────────────────────────────────────────────

const PlanFormModal: React.FC<{
    open: boolean;
    editingPlan: SaasPlan | null;
    onClose: () => void;
    onSubmit: (d: PlanFormData) => void;
    loading: boolean;
}> = ({ open, editingPlan, onClose, onSubmit, loading }) => {
    const [form, setForm] = useState<PlanFormData>(defaultFormData());

    useEffect(() => {
        setForm(editingPlan ? planToFormData(editingPlan) : defaultFormData());
    }, [editingPlan, open]);

    if (!open) return null;

    const setField = (key: keyof PlanFormData, value: any) => setForm((p) => ({ ...p, [key]: value }));
    const setFeature = (key: keyof PlanFormData["features"], value: any) =>
        setForm((p) => ({ ...p, features: { ...p.features, [key]: value } }));

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {editingPlan ? "Edit Plan" : "Create Custom Plan"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Basic Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Key *</label>
                                <input value={form.key} onChange={(e) => setField("key", e.target.value)} disabled={!!editingPlan}
                                    placeholder="e.g. school"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name *</label>
                                <input value={form.name} onChange={(e) => setField("name", e.target.value)}
                                    placeholder="School Plan"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <input value={form.description} onChange={(e) => setField("description", e.target.value)}
                                    placeholder="Short description..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Pricing</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Fee (₹)</label>
                                <input type="number" min={0} value={form.monthlyFee} onChange={(e) => setField("monthlyFee", Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission %</label>
                                <input type="number" min={0} max={100} value={form.commissionRate} onChange={(e) => setField("commissionRate", Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trial Days</label>
                                <input type="number" min={0} value={form.trialDays} onChange={(e) => setField("trialDays", Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Appearance</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
                                <input value={form.badge} onChange={(e) => setField("badge", e.target.value)}
                                    placeholder="Most Popular"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Highlight Color</label>
                                <div className="flex gap-2 items-center">
                                    <input type="color" value={form.highlightColor} onChange={(e) => setField("highlightColor", e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer" />
                                    <input value={form.highlightColor} onChange={(e) => setField("highlightColor", e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                                <input type="number" min={1} value={form.sortOrder} onChange={(e) => setField("sortOrder", Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active (visible on pricing page)</span>
                            </label>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Features</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Courses (0 = unlimited)</label>
                                <input type="number" min={0} value={form.features.maxCourses} onChange={(e) => setFeature("maxCourses", Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Students (0 = unlimited)</label>
                                <input type="number" min={0} value={form.features.maxStudents} onChange={(e) => setFeature("maxStudents", Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                            {[
                                { key: "customDomain", label: "Custom Domain" },
                                { key: "whiteLabel", label: "White Label" },
                                { key: "aiFeatures", label: "AI Features" },
                                { key: "advancedAnalytics", label: "Advanced Analytics" },
                                { key: "apiAccess", label: "API Access" },
                                { key: "prioritySupport", label: "Priority Support" },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                                    <input type="checkbox"
                                        checked={form.features[key as keyof typeof form.features] as boolean}
                                        onChange={(e) => setFeature(key as keyof PlanFormData["features"], e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button disabled={loading} onClick={() => onSubmit(form)}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                        {editingPlan ? "Update Plan" : "Create Plan"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeletePlanModal: React.FC<{
    open: boolean;
    plan: SaasPlan | null;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
}> = ({ open, plan, onConfirm, onClose, loading }) => {
    if (!open || !plan) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Plan</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Delete <strong className="text-gray-900 dark:text-white">"{plan.name}"</strong>?
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                        ⚠️ Existing tenants on this plan are unaffected — they keep current features.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onConfirm} disabled={loading}
                            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PlansPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { plans, plansLoading, plansError, actionLoading, actionSuccess, actionError } =
        useSelector((s: RootState) => s.superAdmin);

    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SaasPlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<SaasPlan | null>(null);

    useEffect(() => { dispatch(fetchAdminPlans()); }, []);

    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
            dispatch(clearActionStatus());
            setShowForm(false);
            setEditingPlan(null);
            setDeletingPlan(null);
            dispatch(fetchAdminPlans());
        }
        if (actionError) {
            toast.error(actionError);
            dispatch(clearActionStatus());
        }
    }, [actionSuccess, actionError]);

    const handleSubmit = (form: PlanFormData) => {
        if (editingPlan) {
            dispatch(updateSaasPlan({ key: editingPlan.key, data: form }));
        } else {
            dispatch(createSaasPlan(form as any));
        }
    };

    const handleEdit = (plan: SaasPlan) => {
        setEditingPlan(plan);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingPlan(null);
    };

    return (
        <div>
            <PageMeta title="SaaS Plans | Super Admin" description="Manage platform subscription plans" />
            <PageBreadcrumb pageTitle="Plan Management" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layers className="w-6 h-6 text-indigo-600" /> SaaS Plan Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {plans.length} plan{plans.length !== 1 ? "s" : ""} configured · Changes take effect immediately
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => dispatch(seedDefaultPlans())}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50">
                            <Sprout className="w-4 h-4" /> Seed Default Plans
                        </button>
                        <button onClick={() => { setEditingPlan(null); setShowForm(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-none">
                            <Plus className="w-4 h-4" /> Create Plan
                        </button>
                    </div>
                </div>

                {/* Error */}
                {plansError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-red-700 dark:text-red-400 text-sm">{plansError}</p>
                    </div>
                )}

                {/* Loading */}
                {plansLoading && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* Plans Grid */}
                {!plansLoading && plans.length === 0 && (
                    <div className="text-center py-20">
                        <Layers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No plans yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Seed the default plans or create a custom one</p>
                        <button onClick={() => dispatch(seedDefaultPlans())} disabled={actionLoading}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                            <Sprout className="w-4 h-4" /> Seed Default Plans
                        </button>
                    </div>
                )}

                {!plansLoading && plans.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {[...plans]
                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                            .map((plan) => (
                                <PlanCard key={plan.key} plan={plan} onEdit={handleEdit} onDelete={setDeletingPlan} />
                            ))}
                    </div>
                )}
            </div>

            <PlanFormModal
                open={showForm}
                editingPlan={editingPlan}
                onClose={handleCloseForm}
                onSubmit={handleSubmit}
                loading={actionLoading}
            />

            <DeletePlanModal
                open={!!deletingPlan}
                plan={deletingPlan}
                onConfirm={() => deletingPlan && dispatch(deleteSaasPlan(deletingPlan.key))}
                onClose={() => setDeletingPlan(null)}
                loading={actionLoading}
            />
        </div>
    );
};

export default PlansPage;
