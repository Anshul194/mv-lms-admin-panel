import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
    fetchPayoutSummary,
    fetchPayoutTransactions,
    settlePayouts,
    clearActionStatus,
    type PayoutSummaryItem,
    type PayoutTransaction,
} from "../../store/slices/superAdmin";
import { fetchAllWithdrawals, approveWithdrawal, rejectWithdrawal } from "../../store/slices/walletSlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
    IndianRupee,
    Receipt,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Filter,
    RefreshCw,
    TrendingUp,
    Package,
    X,
    Check,
    Building2,
    CreditCard,
    ArrowRightLeft,
    Clock,
    XCircle
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Summary Cards ────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{ item: PayoutSummaryItem; onViewTenant: (id: string) => void }> = ({ item, onViewTenant }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {item.tenantName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.tenantName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.tenantSlug}</p>
                </div>
            </div>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full px-2.5 py-0.5 font-medium">
                {item.planType}
            </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Commission</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">₹{item.totalCommission.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">Orders</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{item.totalOrders}</p>
            </div>
        </div>
        {item.oldestTransaction && (
            <p className="text-xs text-gray-400 mt-3">
                Oldest pending: {new Date(item.oldestTransaction).toLocaleDateString()}
            </p>
        )}
    </div>
);

// ─── Settle Modal ─────────────────────────────────────────────────────────────

const SettleModal: React.FC<{
    open: boolean;
    selectedIds: string[];
    onClose: () => void;
    onSubmit: (payoutId: string, note: string) => void;
    loading: boolean;
}> = ({ open, selectedIds, onClose, onSubmit, loading }) => {
    const [payoutId, setPayoutId] = useState("");
    const [note, setNote] = useState("");
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mark as Settled</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedIds.length} transaction{selectedIds.length !== 1 ? "s" : ""} selected</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payout ID / Bank Reference (optional)</label>
                        <input value={payoutId} onChange={(e) => setPayoutId(e.target.value)}
                            placeholder="rzp_payout_ABC123"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (optional)</label>
                        <input value={note} onChange={(e) => setNote(e.target.value)}
                            placeholder="February 2026 payout"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button disabled={loading} onClick={() => onSubmit(payoutId, note)}
                            className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                            Settle Transactions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Transactions Table ───────────────────────────────────────────────────────

const getTenantName = (tenantId: PayoutTransaction["tenantId"]) => {
    if (typeof tenantId === "object" && tenantId !== null) return (tenantId as any).name || "—";
    return String(tenantId);
};
const getTenantSlug = (tenantId: PayoutTransaction["tenantId"]) => {
    if (typeof tenantId === "object" && tenantId !== null) return (tenantId as any).slug || "";
    return "";
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PayoutsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        payoutSummary, payoutTransactions, payoutTransactionsTotal,
        payoutTransactionsPage, payoutTransactionsTotalPages,
        payoutsLoading, payoutsError,
        actionLoading, actionSuccess, actionError,
    } = useSelector((s: RootState) => s.superAdmin);

    const {
        withdrawals, loading: walletLoading, error: walletError
    } = useSelector((s: RootState) => s.wallet);

    const [activeTab, setActiveTab] = useState<"summary" | "transactions" | "withdrawals">("summary");
    const [txFilters, setTxFilters] = useState({ payoutStatus: "pending", tenantId: "" });
    const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
    const [settleOpen, setSettleOpen] = useState(false);

    useEffect(() => {
        if (activeTab === "summary") {
            dispatch(fetchPayoutSummary());
        } else if (activeTab === "withdrawals") {
            dispatch(fetchAllWithdrawals());
        } else {
            loadTransactions(1);
        }
    }, [activeTab, txFilters]);

    const loadTransactions = (page = 1) => {
        dispatch(fetchPayoutTransactions({
            payoutStatus: txFilters.payoutStatus || undefined,
            tenantId: txFilters.tenantId || undefined,
            page,
            limit: 20,
        }));
    };

    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
            dispatch(clearActionStatus());
            setSettleOpen(false);
            setSelectedTxIds([]);
            loadTransactions(payoutTransactionsPage);
            dispatch(fetchPayoutSummary());
        }
        if (actionError) {
            toast.error(actionError);
            dispatch(clearActionStatus());
        }
    }, [actionSuccess, actionError]);

    const toggleSelectAll = () => {
        if (selectedTxIds.length === payoutTransactions.length) {
            setSelectedTxIds([]);
        } else {
            setSelectedTxIds(payoutTransactions.map((t) => t._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedTxIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
    };

    const totalPendingCommission = payoutSummary.reduce((s, i) => s + i.totalCommission, 0);
    const totalPendingOrders = payoutSummary.reduce((s, i) => s + i.totalOrders, 0);

    return (
        <div>
            <PageMeta title="Payouts | Super Admin" description="Commission & payout management" />
            <PageBreadcrumb pageTitle="Commission & Payouts" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <IndianRupee className="w-6 h-6 text-green-600" /> Commission & Payouts
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Track pending commissions and mark them as settled after bank/Razorpay transfer
                    </p>
                </div>

                {/* Stats row (summary only) */}
                {activeTab === "summary" && payoutSummary.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">Total Pending</span>
                            </div>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                                ₹{totalPendingCommission.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Orders</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalPendingOrders}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Tenants Owing</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{payoutSummary.length}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
                    {(["summary", "transactions", "withdrawals"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                            {tab === "summary" ? "Commission Summary" : tab === "transactions" ? "Transactions" : "Withdrawal Requests"}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {(payoutsError) && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-red-700 dark:text-red-400 text-sm">{payoutsError}</p>
                    </div>
                )}

                {/* Loading */}
                {payoutsLoading && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* ── Summary Tab ──────────────────────────────────────────────────── */}
                {activeTab === "summary" && !payoutsLoading && (
                    <>
                        {payoutSummary.length === 0 ? (
                            <div className="text-center py-20">
                                <IndianRupee className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pending commissions</h3>
                                <p className="text-gray-500 dark:text-gray-400">All commissions have been settled</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {payoutSummary.map((item) => (
                                    <SummaryCard key={item.tenantId} item={item}
                                        onViewTenant={(id) => { setActiveTab("transactions"); setTxFilters((p) => ({ ...p, tenantId: id })); }} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Transactions Tab ─────────────────────────────────────────────── */}
                {activeTab === "transactions" && !payoutsLoading && (
                    <>
                        {/* Filter bar */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                    <select value={txFilters.payoutStatus} onChange={(e) => setTxFilters((p) => ({ ...p, payoutStatus: e.target.value }))}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="settled">Settled</option>
                                    </select>
                                </div>
                                <input value={txFilters.tenantId} onChange={(e) => setTxFilters((p) => ({ ...p, tenantId: e.target.value }))}
                                    placeholder="Filter by Tenant ID..."
                                    className="w-56 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                                <button onClick={() => setTxFilters({ payoutStatus: "pending", tenantId: "" })}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                                </button>
                            </div>
                            {selectedTxIds.length > 0 && (
                                <button onClick={() => setSettleOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
                                    <CheckSquare className="w-4 h-4" /> Settle {selectedTxIds.length} Transaction{selectedTxIds.length !== 1 ? "s" : ""}
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800">
                                            <th className="w-12 px-4 py-4">
                                                <input type="checkbox"
                                                    checked={selectedTxIds.length === payoutTransactions.length && payoutTransactions.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 text-indigo-600 rounded" />
                                            </th>
                                            {["Tenant", "Order ID", "Gross Amount", "Commission", "Net", "Plan", "Period", "Status", "Date"].map((h) => (
                                                <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {payoutTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="px-6 py-12 text-center">
                                                    <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                    <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                                                </td>
                                            </tr>
                                        ) : payoutTransactions.map((tx) => {
                                            const selected = selectedTxIds.includes(tx._id);
                                            return (
                                                <tr key={tx._id}
                                                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selected ? "bg-indigo-50 dark:bg-indigo-900/10" : ""}`}>
                                                    <td className="px-4 py-4">
                                                        {tx.payoutStatus === "pending" && (
                                                            <input type="checkbox" checked={selected} onChange={() => toggleSelect(tx._id)}
                                                                className="w-4 h-4 text-indigo-600 rounded" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{getTenantName(tx.tenantId)}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{getTenantSlug(tx.tenantId)}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-xs font-mono text-gray-500 dark:text-gray-400 max-w-[120px] truncate" title={tx.orderId}>
                                                        {tx.orderId}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                        ₹{tx.grossAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-orange-600 dark:text-orange-400 font-medium">
                                                        ₹{tx.commissionAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                                        <span className="text-xs text-gray-400 ml-1">({tx.commissionRate}%)</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-green-600 dark:text-green-400 font-medium">
                                                        ₹{tx.netAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full px-2.5 py-0.5 font-medium">
                                                            {tx.planType}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                        {tx.settlementPeriod || "—"}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.payoutStatus === "settled"
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${tx.payoutStatus === "settled" ? "bg-green-500" : "bg-yellow-500"}`} />
                                                            {tx.payoutStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {payoutTransactionsTotalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {payoutTransactionsPage} of {payoutTransactionsTotalPages} · {payoutTransactionsTotal} transactions
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => loadTransactions(payoutTransactionsPage - 1)} disabled={payoutTransactionsPage <= 1}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 px-2">{payoutTransactionsPage} / {payoutTransactionsTotalPages}</span>
                                        <button onClick={() => loadTransactions(payoutTransactionsPage + 1)} disabled={payoutTransactionsPage >= payoutTransactionsTotalPages}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ── Withdrawals Tab ──────────────────────────────────────────────── */}
                {activeTab === "withdrawals" && !walletLoading && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Request ID</th>
                                        <th className="px-6 py-4">Tenant</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                    {withdrawals?.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                No withdrawal requests found.
                                            </td>
                                        </tr>
                                    ) : withdrawals?.map((w) => (
                                        <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{w._id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-white">{w.tenantId?.name}</div>
                                                <div className="text-xs text-gray-500">{w.tenantId?.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{w.amount?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(w.requestedAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${w.status === "completed" ? "bg-green-100 text-green-700" : w.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {w.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await dispatch(approveWithdrawal({ id: w._id })).unwrap();
                                                                    toast.success("Approved withdrawal");
                                                                    dispatch(fetchAllWithdrawals());
                                                                } catch (err: any) { toast.error(err); }
                                                            }}
                                                            className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const note = prompt("Reason for rejection:");
                                                                if (note !== null) {
                                                                    try {
                                                                        await dispatch(rejectWithdrawal({ id: w._id, adminNote: note })).unwrap();
                                                                        toast.success("Rejected withdrawal");
                                                                        dispatch(fetchAllWithdrawals());
                                                                    } catch (err: any) { toast.error(err); }
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Settle Modal */}
            <SettleModal
                open={settleOpen}
                selectedIds={selectedTxIds}
                onClose={() => setSettleOpen(false)}
                onSubmit={(payoutId, note) => {
                    dispatch(settlePayouts({ transactionIds: selectedTxIds, payoutId: payoutId || undefined, note: note || undefined }));
                }}
                loading={actionLoading}
            />
        </div>
    );
};

export default PayoutsPage;
