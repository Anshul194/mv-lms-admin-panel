import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Branding {
    tenantId?: string;
    appName?: string;
    displayName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logo?: string;
    logoUrl?: string;
    faviconUrl?: string;
    tagline?: string;
    fontFamily?: string;
    supportEmail?: string;
    plan?: string;
}

interface PaymentConfig {
    razorpayKeyId: string;
    razorpayKeySecret: string;
}

interface TenantTransaction {
    _id: string;
    orderId: string;
    grossAmount: number;
    commissionAmount: number;
    netAmount: number;
    createdAt: string;
    payoutStatus: string;
}

interface TenantPlan {
    plan: {
        type: string;
        status: string;
        commissionRate: number;
        monthlyFee: number;
        currentPeriodEnd: string | null;
        trialEndsAt: string | null;
    };
    features: {
        maxCourses: number;
        maxStudents: number;
        customDomain: boolean;
        whiteLabel: boolean;
        aiFeatures: boolean;
        advancedAnalytics: boolean;
        apiAccess: boolean;
        prioritySupport: boolean;
        [key: string]: any;
    };
    availablePlans: Array<{
        key: string;
        name: string;
        monthlyFee: number;
        commissionRate: number;
        description: string;
    }>;
}

interface TenantConfigState {
    branding: Branding | null;
    paymentConfig: PaymentConfig | null;
    transactions: TenantTransaction[];
    currentPlan: TenantPlan | null;
    loading: boolean;
    error: string | null;
    success: string | null;
}

const initialState: TenantConfigState = {
    branding: null,
    paymentConfig: null,
    transactions: [],
    currentPlan: null,
    loading: false,
    error: null,
    success: null,
};

// Redundant manual headers removed - handled by axios interceptor
const tenantHeaders = () => ({});

// Thunks
export const updateBranding = createAsyncThunk(
    "tenantConfig/updateBranding",
    async (data: FormData | Partial<Branding>, { rejectWithValue }) => {
        try {
            const isFormData = data instanceof FormData;
            const res = await axiosInstance.put("/tenant/branding", data, {
                headers: {
                    ...tenantHeaders(),
                    ...(isFormData ? { "Content-Type": "multipart/form-data" } : {})
                }
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchBranding = createAsyncThunk(
    "tenantConfig/fetchBranding",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/tenant/branding", {
                headers: tenantHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updatePaymentConfig = createAsyncThunk(
    "tenantConfig/updatePaymentConfig",
    async (data: PaymentConfig, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put("/tenant/payment-config", data, {
                headers: tenantHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchTenantTransactions = createAsyncThunk(
    "tenantConfig/fetchTransactions",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/payout/tenant/transactions", {
                headers: tenantHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchMyPlan = createAsyncThunk(
    "tenantConfig/fetchMyPlan",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/tenant/plan", {
                headers: tenantHeaders(),
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const initiateSubscription = createAsyncThunk(
    "tenantConfig/initiateSubscription",
    async (planType: string, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(
                "/tenant/initiate-subscription",
                { planType },
                { headers: tenantHeaders() }
            );
            return res.data; // rzp_order_id
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const tenantConfigSlice = createSlice({
    name: "tenantConfig",
    initialState,
    reducers: {
        clearStatus: (state) => {
            state.error = null;
            state.success = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateBranding.pending, (state) => { state.loading = true; })
            .addCase(updateBranding.fulfilled, (state, action) => {
                state.loading = false;
                state.success = "Branding updated successfully";
                state.branding = action.payload.data;
            })
            .addCase(updateBranding.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchBranding.pending, (state) => { state.loading = true; })
            .addCase(fetchBranding.fulfilled, (state, action) => {
                state.loading = false;
                state.branding = action.payload.data;
            })
            .addCase(fetchBranding.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(updatePaymentConfig.pending, (state) => { state.loading = true; })
            .addCase(updatePaymentConfig.fulfilled, (state) => {
                state.loading = false;
                state.success = "Payment settings updated";
            })
            .addCase(updatePaymentConfig.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchTenantTransactions.pending, (state) => { state.loading = true; })
            .addCase(fetchTenantTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.data || [];
            })
            .addCase(fetchTenantTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchMyPlan.pending, (state) => { state.loading = true; })
            .addCase(fetchMyPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPlan = action.payload.data;
            })
            .addCase(fetchMyPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearStatus } = tenantConfigSlice.actions;
export default tenantConfigSlice.reducer;
