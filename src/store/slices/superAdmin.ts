import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";


// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaasPlan {
    _id: string;
    key: string;
    name: string;
    description?: string;
    monthlyFee: number;
    commissionRate: number;
    trialDays: number;
    badge?: string;
    highlightColor?: string;
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
    createdAt?: string;
}

export interface Tenant {
    _id: string;
    name: string;
    slug: string;
    subdomain?: string;
    domain?: string;
    plan: {
        type: string;
        commissionRate?: number;
        monthlyFee?: number;
        status: string;
        trialEndsAt?: string;
        currentPeriodEnd?: string;
    };
    isActive: boolean;
    createdAt?: string;
    ownerUserId?: string;
}

export interface PayoutSummaryItem {
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    planType: string;
    totalCommission: number;
    totalOrders: number;
    oldestTransaction?: string;
}

export interface PayoutTransaction {
    _id: string;
    tenantId: { name: string; slug: string } | string;
    orderId: string;
    grossAmount: number;
    commissionRate: number;
    commissionAmount: number;
    netAmount: number;
    planType: string;
    settlementPeriod?: string;
    payoutStatus: "pending" | "settled";
    createdAt: string;
}

interface SuperAdminState {
    // Tenants
    tenants: Tenant[];
    tenantsTotal: number;
    tenantsPage: number;
    tenantsLimit: number;
    tenantsLoading: boolean;
    tenantsError: string | null;

    // Plans
    plans: SaasPlan[];
    plansLoading: boolean;
    plansError: string | null;

    // Payouts
    payoutSummary: PayoutSummaryItem[];
    payoutTransactions: PayoutTransaction[];
    payoutTransactionsTotal: number;
    payoutTransactionsPage: number;
    payoutTransactionsTotalPages: number;
    payoutsLoading: boolean;
    payoutsError: string | null;

    // Action status
    actionLoading: boolean;
    actionError: string | null;
    actionSuccess: string | null;

    // Tenant Detail
    currentTenant: any | null;
    currentTenantLoading: boolean;
    currentTenantError: string | null;
}

const initialState: SuperAdminState = {
    tenants: [],
    tenantsTotal: 0,
    tenantsPage: 1,
    tenantsLimit: 20,
    tenantsLoading: false,
    tenantsError: null,

    plans: [],
    plansLoading: false,
    plansError: null,

    payoutSummary: [],
    payoutTransactions: [],
    payoutTransactionsTotal: 0,
    payoutTransactionsPage: 1,
    payoutTransactionsTotalPages: 1,
    payoutsLoading: false,
    payoutsError: null,

    actionLoading: false,
    actionError: null,
    actionSuccess: null,

    currentTenant: null,
    currentTenantLoading: false,
    currentTenantError: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Redundant manual headers removed - handled by axios interceptor
const superAdminHeaders = () => ({});

// ─── Tenant Thunks ────────────────────────────────────────────────────────────

export const fetchTenants = createAsyncThunk(
    "superAdmin/fetchTenants",
    async (
        params: { page?: number; limit?: number; plan?: string; status?: string } = {},
        { rejectWithValue }
    ) => {
        try {
            const query = new URLSearchParams();
            if (params.page) query.set("page", String(params.page));
            if (params.limit) query.set("limit", String(params.limit));
            if (params.plan) query.set("plan", params.plan);
            if (params.status) query.set("status", params.status);
            const res = await axiosInstance.get(
                `/tenant/super-admin/tenants?${query.toString()}`,
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchTenantById = createAsyncThunk(
    "superAdmin/fetchTenantById",
    async (tenantId: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(
                `/tenant/super-admin/tenants/${tenantId}`,
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


export const createTenant = createAsyncThunk(
    "superAdmin/createTenant",
    async (
        data: {
            name: string;
            slug: string;
            subdomain?: string;
            domain?: string;
            planType: string;
            ownerUserId?: string;
            email?: string;
            password?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.post(
                `/tenant/super-admin/tenants`,
                data,
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateTenantPlan = createAsyncThunk(
    "superAdmin/updateTenantPlan",
    async (
        {
            tenantId,
            planType,
            status,
            currentPeriodEnd,
        }: {
            tenantId: string;
            planType: string;
            status?: string;
            currentPeriodEnd?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.patch(
                `/tenant/super-admin/tenants/${tenantId}/plan`,
                { planType, status, currentPeriodEnd },
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const suspendTenant = createAsyncThunk(
    "superAdmin/suspendTenant",
    async (tenantId: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(
                `/tenant/super-admin/tenants/${tenantId}/suspend`,
                {},
                { headers: superAdminHeaders() }
            );
            return { ...res.data, tenantId };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const activateTenant = createAsyncThunk(
    "superAdmin/activateTenant",
    async (tenantId: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(
                `/tenant/super-admin/tenants/${tenantId}/activate`,
                {},
                { headers: superAdminHeaders() }
            );
            return { ...res.data, tenantId };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const impersonateTenant = createAsyncThunk(
    "superAdmin/impersonateTenant",
    async (tenantId: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(
                `/tenant/super-admin/tenants/${tenantId}/impersonate`,
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─── Plans Thunks ─────────────────────────────────────────────────────────────

export const fetchAdminPlans = createAsyncThunk(
    "superAdmin/fetchAdminPlans",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/plans/admin`, {
                headers: superAdminHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const seedDefaultPlans = createAsyncThunk(
    "superAdmin/seedDefaultPlans",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(
                `/plans/seed`,
                {},
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const createSaasPlan = createAsyncThunk(
    "superAdmin/createSaasPlan",
    async (data: Partial<SaasPlan>, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(`/plans`, data, {
                headers: superAdminHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateSaasPlan = createAsyncThunk(
    "superAdmin/updateSaasPlan",
    async (
        { key, data }: { key: string; data: Partial<SaasPlan> },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.put(`/plans/${key}`, data, {
                headers: superAdminHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteSaasPlan = createAsyncThunk(
    "superAdmin/deleteSaasPlan",
    async (key: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.delete(`/plans/${key}`, {
                headers: superAdminHeaders(),
            });
            return { ...res.data, key };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─── Payout Thunks ────────────────────────────────────────────────────────────

export const fetchPayoutSummary = createAsyncThunk(
    "superAdmin/fetchPayoutSummary",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/payout/summary`, {
                headers: superAdminHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchPayoutTransactions = createAsyncThunk(
    "superAdmin/fetchPayoutTransactions",
    async (
        params: {
            payoutStatus?: string;
            tenantId?: string;
            page?: number;
            limit?: number;
        } = {},
        { rejectWithValue }
    ) => {
        try {
            const query = new URLSearchParams();
            if (params.payoutStatus) query.set("payoutStatus", params.payoutStatus);
            if (params.tenantId) query.set("tenantId", params.tenantId);
            if (params.page) query.set("page", String(params.page));
            if (params.limit) query.set("limit", String(params.limit));
            const res = await axiosInstance.get(
                `/payout/transactions?${query.toString()}`,
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const settlePayouts = createAsyncThunk(
    "superAdmin/settlePayouts",
    async (
        {
            transactionIds,
            payoutId,
            note,
        }: { transactionIds: string[]; payoutId?: string; note?: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await axiosInstance.post(
                `/payout/settle`,
                { transactionIds, payoutId, note },
                { headers: superAdminHeaders() }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const superAdminSlice = createSlice({
    name: "superAdmin",
    initialState,
    reducers: {
        clearActionStatus(state) {
            state.actionLoading = false;
            state.actionError = null;
            state.actionSuccess = null;
        },
    },
    extraReducers: (builder) => {
        // ── Tenants ──────────────────────────────────────────────────────────────
        builder
            .addCase(fetchTenants.pending, (s) => {
                s.tenantsLoading = true;
                s.tenantsError = null;
            })
            .addCase(fetchTenants.fulfilled, (s, a) => {
                s.tenantsLoading = false;
                s.tenants = a.payload.data || [];
                s.tenantsTotal = a.payload.total || 0;
                s.tenantsPage = a.payload.page || 1;
                s.tenantsLimit = a.payload.limit || 20;
            })
            .addCase(fetchTenants.rejected, (s, a) => {
                s.tenantsLoading = false;
                s.tenantsError = a.payload as string;
            })

            .addCase(fetchTenantById.pending, (s) => {
                s.currentTenantLoading = true;
                s.currentTenantError = null;
                s.currentTenant = null;
            })
            .addCase(fetchTenantById.fulfilled, (s, a) => {
                s.currentTenantLoading = false;
                s.currentTenant = a.payload.data;
            })
            .addCase(fetchTenantById.rejected, (s, a) => {
                s.currentTenantLoading = false;
                s.currentTenantError = a.payload as string;
            })

            .addCase(createTenant.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(createTenant.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = a.payload.message || "Tenant created";
            })
            .addCase(createTenant.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            .addCase(updateTenantPlan.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(updateTenantPlan.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = a.payload.message || "Plan updated";
                // Update tenant in list
                const idx = s.tenants.findIndex(
                    (t) => t._id === a.payload.data?._id
                );
                if (idx !== -1 && a.payload.data) {
                    s.tenants[idx] = { ...s.tenants[idx], ...a.payload.data };
                }
            })
            .addCase(updateTenantPlan.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            .addCase(suspendTenant.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(suspendTenant.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = "Tenant suspended";
                const idx = s.tenants.findIndex((t) => t._id === a.payload.tenantId);
                if (idx !== -1) {
                    s.tenants[idx].isActive = false;
                    s.tenants[idx].plan.status = "suspended";
                }
            })
            .addCase(suspendTenant.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            .addCase(activateTenant.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(activateTenant.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = "Tenant activated";
                const idx = s.tenants.findIndex((t) => t._id === a.payload.tenantId);
                if (idx !== -1) {
                    s.tenants[idx].isActive = true;
                    s.tenants[idx].plan.status = "active";
                }
            })
            .addCase(activateTenant.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            .addCase(impersonateTenant.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(impersonateTenant.fulfilled, (s, a) => {
                s.actionLoading = false;
            })
            .addCase(impersonateTenant.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            // ── Plans ────────────────────────────────────────────────────────────────
            .addCase(fetchAdminPlans.pending, (s) => {
                s.plansLoading = true;
                s.plansError = null;
            })
            .addCase(fetchAdminPlans.fulfilled, (s, a) => {
                s.plansLoading = false;
                s.plans = a.payload.data?.plans || [];
            })
            .addCase(fetchAdminPlans.rejected, (s, a) => {
                s.plansLoading = false;
                s.plansError = a.payload as string;
            })

            .addCase(seedDefaultPlans.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(seedDefaultPlans.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = a.payload.message || "Plans seeded";
            })
            .addCase(seedDefaultPlans.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            .addCase(createSaasPlan.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(createSaasPlan.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = a.payload.message || "Plan created";
                if (a.payload.data?.plan) s.plans.push(a.payload.data.plan);
            })
            .addCase(createSaasPlan.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            .addCase(updateSaasPlan.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(updateSaasPlan.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = a.payload.message || "Plan updated";
                const updPlan = a.payload.data?.plan;
                if (updPlan) {
                    const idx = s.plans.findIndex((p) => p.key === updPlan.key);
                    if (idx !== -1) s.plans[idx] = updPlan;
                }
            })
            .addCase(updateSaasPlan.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            .addCase(deleteSaasPlan.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(deleteSaasPlan.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = a.payload.message || "Plan deleted";
                s.plans = s.plans.filter((p) => p.key !== a.payload.key);
            })
            .addCase(deleteSaasPlan.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            })

            // ── Payouts ──────────────────────────────────────────────────────────────
            .addCase(fetchPayoutSummary.pending, (s) => {
                s.payoutsLoading = true;
                s.payoutsError = null;
            })
            .addCase(fetchPayoutSummary.fulfilled, (s, a) => {
                s.payoutsLoading = false;
                s.payoutSummary = a.payload.data?.summary || [];
            })
            .addCase(fetchPayoutSummary.rejected, (s, a) => {
                s.payoutsLoading = false;
                s.payoutsError = a.payload as string;
            })

            .addCase(fetchPayoutTransactions.pending, (s) => {
                s.payoutsLoading = true;
                s.payoutsError = null;
            })
            .addCase(fetchPayoutTransactions.fulfilled, (s, a) => {
                s.payoutsLoading = false;
                s.payoutTransactions = a.payload.data?.transactions || [];
                s.payoutTransactionsTotal = a.payload.data?.total || 0;
                s.payoutTransactionsPage = a.payload.data?.page || 1;
                s.payoutTransactionsTotalPages = a.payload.data?.totalPages || 1;
            })
            .addCase(fetchPayoutTransactions.rejected, (s, a) => {
                s.payoutsLoading = false;
                s.payoutsError = a.payload as string;
            })

            .addCase(settlePayouts.pending, (s) => {
                s.actionLoading = true;
                s.actionError = null;
                s.actionSuccess = null;
            })
            .addCase(settlePayouts.fulfilled, (s, a) => {
                s.actionLoading = false;
                s.actionSuccess = a.payload.message || "Transactions settled";
            })
            .addCase(settlePayouts.rejected, (s, a) => {
                s.actionLoading = false;
                s.actionError = a.payload as string;
            });
    },
});

export const { clearActionStatus } = superAdminSlice.actions;
export default superAdminSlice.reducer;
