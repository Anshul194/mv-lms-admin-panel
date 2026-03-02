import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
    fetchTenants,
    createTenant,
    updateTenantPlan,
    suspendTenant,
    activateTenant,
    impersonateTenant,
    clearActionStatus,
    type Tenant,
} from "../../store/slices/superAdmin";
import { setCredentials } from "../../store/slices/authslice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link, useNavigate } from "react-router-dom";
import {
    Building2,
    Plus,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
    AlertTriangle,
    CheckCircle,
    Ban,
    TrendingUp,
    RefreshCw,
    Globe,
    Users,
    Calendar,
    Zap,
    Eye,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_OPTIONS = ["commission", "monthly", "hybrid", "whitelabel"];
const STATUS_OPTIONS = ["trial", "active", "suspended", "cancelled", "trial_expired"];

const PLAN_LABELS: Record<string, string> = {
    commission: "Starter",
    monthly: "Growth",
    hybrid: "Pro",
    whitelabel: "Enterprise",
};

const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    switch (status) {
        case "trial": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "active": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        case "suspended": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        case "cancelled": return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        default: return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }
};

const getPlanColor = (planType: string) => {
    switch (planType) {
        case "commission": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case "monthly": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        case "hybrid": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
        case "whitelabel": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        default: return "bg-gray-100 text-gray-700";
    }
};

// ─── Create Tenant Modal ───────────────────────────────────────────────────────

interface CreateTenantModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (d: any) => void;
    loading: boolean;
}

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ open, onClose, onSubmit, loading }) => {
    const [form, setForm] = useState({
        name: "",
        slug: "",
        email: "",
        password: "",
        subdomain: "",
        domain: "",
        planType: "commission",
        ownerUserId: "",
    });
    if (!open) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            name: form.name,
            slug: form.slug,
            planType: form.planType,
            email: form.email,
            password: form.password
        };
        if (form.subdomain) payload.subdomain = form.subdomain;
        if (form.domain) payload.domain = form.domain;
        if (form.ownerUserId) payload.ownerUserId = form.ownerUserId;
        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center shadow-sm">
                            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Tenant</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Onboard a new organization to the platform</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* section: Organization Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Organization Info</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Organization Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} required
                                    placeholder="e.g. MyCoach Academy"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Unique Slug *</label>
                                <input name="slug" value={form.slug} onChange={handleChange} required
                                    placeholder="e.g. mycoach"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Subdomain</label>
                                <div className="relative">
                                    <input name="subdomain" value={form.subdomain} onChange={handleChange}
                                        placeholder="mycoach"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-24" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">.edrilla.com</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Custom Domain (Optional)</label>
                                <input name="domain" value={form.domain} onChange={handleChange}
                                    placeholder="e.g. academy.com"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* section: Admin Account */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-1 bg-purple-500 rounded-full" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Admin Credentials</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Admin Email *</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} required
                                    placeholder="admin@example.com"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Admin Password *</label>
                                <input name="password" type="password" value={form.password} onChange={handleChange} required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* section: Subscription */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Subscription Plan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Initial Plan *</label>
                                <select name="planType" value={form.planType} onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer appearance-none">
                                    {PLAN_OPTIONS.map((p) => (
                                        <option key={p} value={p}>{PLAN_LABELS[p]} ({p})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Owner User ID (Advanced)</label>
                                <input name="ownerUserId" value={form.ownerUserId} onChange={handleChange}
                                    placeholder="Leave blank for auto-assign"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center gap-2">
                            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</> : <><Plus className="w-5 h-5" />Complete Setup</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Change Plan Modal ────────────────────────────────────────────────────────

interface ChangePlanModalProps {
    open: boolean;
    tenant: Tenant | null;
    onClose: () => void;
    onSubmit: (d: any) => void;
    loading: boolean;
}

const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ open, tenant, onClose, onSubmit, loading }) => {
    const [form, setForm] = useState({ planType: "monthly", status: "active", currentPeriodEnd: "" });
    useEffect(() => { if (tenant) setForm({ planType: tenant.plan.type, status: "active", currentPeriodEnd: "" }); }, [tenant]);
    if (!open || !tenant) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Plan</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tenant.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Plan</label>
                        <select value={form.planType} onChange={(e) => setForm((p) => ({ ...p, planType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm">
                            {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{PLAN_LABELS[p]} ({p})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm">
                            <option value="active">Active</option>
                            <option value="suspend">Suspend</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period End (optional)</label>
                        <input type="date" value={form.currentPeriodEnd} onChange={(e) => setForm((p) => ({ ...p, currentPeriodEnd: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button disabled={loading} onClick={() => {
                            const payload: any = { tenantId: tenant._id, planType: form.planType, status: form.status };
                            if (form.currentPeriodEnd) payload.currentPeriodEnd = new Date(form.currentPeriodEnd).toISOString();
                            onSubmit(payload);
                        }}
                            className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
                            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</> : <><TrendingUp className="w-4 h-4" />Update Plan</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
    confirmText: string;
    confirmClass: string;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, title, description, icon, confirmText, confirmClass, onConfirm, onClose, loading }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        {icon}
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{description}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onConfirm} disabled={loading} className={`px-5 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors ${confirmClass}`}>
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TenantsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { tenants, tenantsTotal, tenantsPage, tenantsLimit, tenantsLoading, tenantsError, actionLoading, actionSuccess, actionError } =
        useSelector((s: RootState) => s.superAdmin);

    const [filters, setFilters] = useState({ plan: "", status: "" });
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [changePlanTenant, setChangePlanTenant] = useState<Tenant | null>(null);
    const [suspendTenantTarget, setSuspendTenantTarget] = useState<Tenant | null>(null);
    const [activateTenantTarget, setActivateTenantTarget] = useState<Tenant | null>(null);
    const [impersonateTarget, setImpersonateTarget] = useState<Tenant | null>(null);

    const handleImpersonate = async (tenant: Tenant) => {
        try {
            const resAction = await dispatch(impersonateTenant(tenant._id));
            if (impersonateTenant.fulfilled.match(resAction)) {

                const resBody = resAction.payload;
                console.log("IMPERSONATION_BODY_RECEIVED:", resBody);

                // EXHAUSTIVE EXTRACTION
                const finalToken = resBody.token || resBody.accessToken ||
                    resBody.data?.token || resBody.data?.accessToken ||
                    (resBody.data && typeof resBody.data === 'string' ? resBody.data : null);

                const finalUser = resBody.user || resBody.data?.user ||
                    (resBody.data?.email ? resBody.data : null);

                const finalRefreshToken = resBody.refreshToken || resBody.data?.refreshToken;

                if (!finalToken || !finalUser) {
                    console.error("FAILED TO EXTRACT AUTH DATA. Structure:", {
                        hasToken: !!finalToken,
                        hasUser: !!finalUser,
                        bodyKeys: Object.keys(resBody),
                        dataKeys: resBody.data ? Object.keys(resBody.data) : 'N/A'
                    });
                    toast.error("Impersonation failed: Could not find token or user in response");
                    return;
                }

                console.log("EXTRACTED NEW TOKEN (first 10 chars):", finalToken.substring(0, 10));

                const impersonatedUser = {
                    ...finalUser,
                    subdomain: tenant.subdomain,
                    tenantSlug: tenant.slug,
                    role: finalUser.role || "admin",
                    tenantRole: finalUser.tenantRole || "tenant_owner"
                };

                const payload = {
                    token: finalToken,
                    refreshToken: finalRefreshToken || null,
                    user: impersonatedUser
                };

                // 1. Capture data to preserve before clearing
                const theme = localStorage.getItem("theme") || "light";
                const oldToken = localStorage.getItem("accessToken");

                // 2. Nuclear clear for clean impersonation state
                localStorage.clear();

                // 3. Restore and set new data
                localStorage.setItem("theme", theme);

                // SAVE NEW DATA
                localStorage.setItem("token", finalToken);
                localStorage.setItem("accessToken", finalToken);
                localStorage.setItem("user", JSON.stringify(impersonatedUser));
                localStorage.setItem("role", impersonatedUser.role);
                localStorage.setItem("tenantRole", impersonatedUser.tenantRole);
                localStorage.setItem("tenantSlug", tenant.slug);
                localStorage.setItem("x-tenant-slug", tenant.slug);
                localStorage.setItem("currentTenantSlug", tenant.slug); // Add this too for broad compatibility
                localStorage.setItem("subdomain", tenant.subdomain || "");

                const verifyToken = localStorage.getItem("accessToken");
                console.log("VERIFICATION: Token in storage now is:", verifyToken?.substring(0, 10));

                if (verifyToken === oldToken && finalToken !== oldToken) {
                    console.error("FATAL: LocalStorage failed to update!");
                }

                dispatch(setCredentials(payload));

                console.log("FINAL check before redirect:", {
                    token: localStorage.getItem("token")?.substring(0, 10) + "...",
                    user: localStorage.getItem("user") ? "FOUND" : "NULL"
                });

                toast.success("Impersonation successful! Redirecting...");

                // FORCE REDIRECT - MANDATORY to avoid 401 on current page
                setTimeout(() => {
                    const checkAgain = localStorage.getItem("token");
                    console.log("LAST check before window.location.href:", !!checkAgain);
                    window.location.href = "/";
                }, 1000);
            }
        } catch (err) {
            console.error("Impersonation catch block:", err);
            toast.error("An unexpected error occurred during impersonation");
        }
    };

    const loadTenants = (page = 1) => {
        dispatch(fetchTenants({ page, limit: tenantsLimit, plan: filters.plan || undefined, status: filters.status || undefined }));
    };

    useEffect(() => { loadTenants(); }, [filters]);

    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
            dispatch(clearActionStatus());
            setShowCreate(false);
            setChangePlanTenant(null);
            setSuspendTenantTarget(null);
            setActivateTenantTarget(null);
            setImpersonateTarget(null);
            loadTenants(tenantsPage);
        }
        if (actionError) {
            toast.error(actionError);
            dispatch(clearActionStatus());
        }
    }, [actionSuccess, actionError]);

    const totalPages = Math.ceil(tenantsTotal / tenantsLimit);

    const filteredTenants = search
        ? tenants.filter((t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.slug.toLowerCase().includes(search.toLowerCase())
        )
        : tenants;

    return (
        <div>
            <PageMeta title="Tenants | Super Admin" description="Manage all platform tenants" />
            <PageBreadcrumb pageTitle="Tenant Management" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-indigo-600" /> Tenant Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {tenantsTotal} tenant{tenantsTotal !== 1 ? "s" : ""} registered on the platform
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-none">
                        <Plus className="w-4 h-4" /> New Tenant
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or slug..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                        <select value={filters.plan} onChange={(e) => setFilters((p) => ({ ...p, plan: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Plans</option>
                            {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                        </select>
                        <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>)}
                        </select>
                    </div>
                    <button onClick={() => { setFilters({ plan: "", status: "" }); setSearch(""); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                </div>

                {/* Error */}
                {tenantsError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-red-700 dark:text-red-400 text-sm">{tenantsError}</p>
                    </div>
                )}

                {/* Loading */}
                {tenantsLoading && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* Table */}
                {!tenantsLoading && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        {["Tenant", "Plan", "Status", "Trial / Period End", "Active", "Actions"].map((h) => (
                                            <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredTenants.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400">No tenants found</p>
                                            </td>
                                        </tr>
                                    ) : filteredTenants.map((t) => (
                                        <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {t.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Link to={`/super-admin/tenants/${t._id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 transition-colors">
                                                            {t.name}
                                                        </Link>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <Globe className="w-3 h-3" />{t.slug}
                                                            {t.subdomain && <span className="ml-1 text-gray-400">· {t.subdomain}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(t.plan.type)}`}>
                                                    {PLAN_LABELS[t.plan.type] || t.plan.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.plan.status, t.isActive)}`}>
                                                    {t.isActive ? t.plan.status : "inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {t.plan.trialEndsAt ? (
                                                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(t.plan.trialEndsAt).toLocaleDateString()}</div>
                                                ) : t.plan.currentPeriodEnd ? (
                                                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(t.plan.currentPeriodEnd).toLocaleDateString()}</div>
                                                ) : <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${t.isActive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                                                    <span className={`w-2 h-2 rounded-full ${t.isActive ? "bg-green-500" : "bg-red-500"}`} />
                                                    {t.isActive ? "Yes" : "No"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/super-admin/tenants/${t._id}`} title="View Details"
                                                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => setChangePlanTenant(t)} title="Change Plan"
                                                        className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                                                        <TrendingUp className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setImpersonateTarget(t)} title="Impersonate"
                                                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                        <Zap className="w-4 h-4" />
                                                    </button>
                                                    {t.isActive ? (
                                                        <button onClick={() => setSuspendTenantTarget(t)} title="Suspend"
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => setActivateTenantTarget(t)} title="Activate"
                                                            className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {(tenantsPage - 1) * tenantsLimit + 1} – {Math.min(tenantsPage * tenantsLimit, tenantsTotal)} of {tenantsTotal}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => loadTenants(tenantsPage - 1)} disabled={tenantsPage <= 1}
                                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 px-2">{tenantsPage} / {totalPages}</span>
                                    <button onClick={() => loadTenants(tenantsPage + 1)} disabled={tenantsPage >= totalPages}
                                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateTenantModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={(d) => dispatch(createTenant(d))}
                loading={actionLoading}
            />

            <ChangePlanModal
                open={!!changePlanTenant}
                tenant={changePlanTenant}
                onClose={() => setChangePlanTenant(null)}
                onSubmit={(d) => dispatch(updateTenantPlan(d))}
                loading={actionLoading}
            />

            <ConfirmModal
                open={!!suspendTenantTarget}
                title="Suspend Tenant"
                description={`Are you sure you want to suspend "${suspendTenantTarget?.name}"? Their users will get 403 Forbidden until reactivated.`}
                icon={<div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center"><Ban className="w-5 h-5 text-red-600" /></div>}
                confirmText="Suspend"
                confirmClass="bg-red-600 hover:bg-red-700"
                onConfirm={() => suspendTenantTarget && dispatch(suspendTenant(suspendTenantTarget._id))}
                onClose={() => setSuspendTenantTarget(null)}
                loading={actionLoading}
            />

            <ConfirmModal
                open={!!activateTenantTarget}
                title="Activate Tenant"
                description={`Reactivate "${activateTenantTarget?.name}"? Their users will regain access immediately.`}
                icon={<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>}
                confirmText="Activate"
                confirmClass="bg-green-600 hover:bg-green-700"
                onConfirm={() => activateTenantTarget && dispatch(activateTenant(activateTenantTarget._id))}
                onClose={() => setActivateTenantTarget(null)}
                loading={actionLoading}
            />

            <ConfirmModal
                open={!!impersonateTarget}
                title="Impersonate Tenant"
                description={`You will be logged in as an admin for "${impersonateTarget?.name}". You can switch back by logging out and signing in again.`}
                icon={<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-blue-600" /></div>}
                confirmText="Impersonate"
                confirmClass="bg-blue-600 hover:bg-blue-700"
                onConfirm={() => impersonateTarget && handleImpersonate(impersonateTarget)}
                onClose={() => setImpersonateTarget(null)}
                loading={actionLoading}
            />
        </div>
    );
};

export default TenantsPage;
