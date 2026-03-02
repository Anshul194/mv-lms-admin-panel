import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import { RootState } from "../index";

export interface Transaction {
    _id: string;
    tenantId: string;
    type: "credit" | "debit" | "withdrawal";
    amount: number;
    description: string;
    referenceId?: string;
    balanceAfter: number;
    createdAt: string;
}

export interface WithdrawalDetails {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
}

export interface WithdrawalRequest {
    _id: string;
    tenantId: {
        _id: string;
        name: string;
        slug: string;
    };
    amount: number;
    status: "pending" | "completed" | "rejected";
    requestedAt: string;
    processedAt?: string;
    adminNote?: string;
    paymentDetails?: any;
    withdrawalDetails?: WithdrawalDetails;
}

interface WalletState {
    balance: number;
    pendingWithdrawal: number;
    transactions: Transaction[];
    withdrawals: WithdrawalRequest[]; // For superadmin view
    loading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    balance: 0,
    pendingWithdrawal: 0,
    transactions: [],
    withdrawals: [],
    loading: false,
    error: null,
};

// 1. Tenant Admin: Get Wallet Balance & Transaction History
export const fetchWalletStats = createAsyncThunk(
    "wallet/fetchWalletStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/wallet");
            // API returns { success: true, data: { wallet: {...}, transactions: [...] } }
            // Normalize to return the inner `data` when present so reducers receive
            // { balance, pendingWithdrawal, transactions }
            return response.data?.data ?? response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch wallet stats"
            );
        }
    }
);

// 2. Tenant Admin: Request a Withdrawal
export const requestWithdrawal = createAsyncThunk(
    "wallet/requestWithdrawal",
    async (
        payload: { amount: number; withdrawalDetails?: WithdrawalDetails },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.post("/wallet/withdraw", payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to request withdrawal"
            );
        }
    }
);

// 3. Superadmin: Get All Pending Withdrawal Requests
export const fetchAllWithdrawals = createAsyncThunk(
    "wallet/fetchAllWithdrawals",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/wallet/superadmin/withdrawals");
            return response.data.data; // Assuming it returns { success: true, data: [...] }
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch withdrawals"
            );
        }
    }
);

// 4. Superadmin: Approve a Withdrawal
export const approveWithdrawal = createAsyncThunk(
    "wallet/approveWithdrawal",
    async (
        {
            id,
            adminNote,
            paymentDetails,
        }: {
            id: string;
            adminNote?: string;
            paymentDetails?: any;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.post(
                `/wallet/superadmin/withdrawals/${id}/approve`,
                { adminNote, paymentDetails }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to approve withdrawal"
            );
        }
    }
);

// 5. Superadmin: Reject a Withdrawal
export const rejectWithdrawal = createAsyncThunk(
    "wallet/rejectWithdrawal",
    async (
        { id, adminNote }: { id: string; adminNote?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.post(
                `/wallet/superadmin/withdrawals/${id}/reject`,
                { adminNote }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to reject withdrawal"
            );
        }
    }
);

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        clearWalletError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchWalletStats
            .addCase(fetchWalletStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWalletStats.fulfilled, (state, action) => {
                state.loading = false;
                // API may return either:
                // - { balance, pendingWithdrawal, transactions }
                // or wrapped as { wallet: { balance, pendingWithdrawal }, transactions }
                const payload = action.payload ?? {};
                const wallet = payload.wallet ?? payload;
                state.balance = (wallet.balance ?? 0) as number;
                state.pendingWithdrawal = (wallet.pendingWithdrawal ?? payload.pendingWithdrawal ?? 0) as number;
                state.transactions = (payload.transactions ?? wallet.transactions ?? []) as Transaction[];
            })
            .addCase(fetchWalletStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // requestWithdrawal
            .addCase(requestWithdrawal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestWithdrawal.fulfilled, (state, action) => {
                state.loading = false;
                // If the backend returns updated balance or we can manually subtract:
                // Let's rely on re-fetching the stats or assume the API returns the updated info
            })
            .addCase(requestWithdrawal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // fetchAllWithdrawals
            .addCase(fetchAllWithdrawals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllWithdrawals.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawals = action.payload;
            })
            .addCase(fetchAllWithdrawals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // approveWithdrawal
            .addCase(approveWithdrawal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveWithdrawal.fulfilled, (state, action) => {
                state.loading = false;
                // Update local list (set status to completed)
                const withdrawal = state.withdrawals.find(
                    (w) => w._id === action.meta.arg.id
                );
                if (withdrawal) {
                    withdrawal.status = "completed";
                }
            })
            .addCase(approveWithdrawal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // rejectWithdrawal
            .addCase(rejectWithdrawal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectWithdrawal.fulfilled, (state, action) => {
                state.loading = false;
                // Update local list (set status to rejected)
                const withdrawal = state.withdrawals.find(
                    (w) => w._id === action.meta.arg.id
                );
                if (withdrawal) {
                    withdrawal.status = "rejected";
                }
            })
            .addCase(rejectWithdrawal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearWalletError } = walletSlice.actions;

export default walletSlice.reducer;
