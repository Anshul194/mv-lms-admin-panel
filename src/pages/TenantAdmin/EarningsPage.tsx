import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DollarSign, ArrowUpRight, ShoppingBag, TrendingUp, Calendar, Download, Search, CreditCard, Clock, Activity, AlertTriangle } from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import { fetchWalletStats, requestWithdrawal } from "../../store/slices/walletSlice";
import toast from "react-hot-toast";

const EarningsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { balance = 0, pendingWithdrawal = 0, transactions = [], loading, error } = useSelector((state: RootState) => state.wallet);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchWalletStats());
    }, [dispatch]);

    // Calculate totals
    const totalEarnings = transactions.reduce((sum, t) => sum + (t.type === 'credit' ? (t.amount ?? 0) : 0), 0);
    const totalCommission = 0; // if needed
    const totalOrders = transactions.filter(t => t.type === 'credit').length;

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(withdrawAmount);
        if (amt <= 0 || amt > balance) {
            toast.error("Invalid withdrawal amount");
            return;
        }
        setIsSubmitting(true);
        const resultAction = await dispatch(requestWithdrawal({ amount: amt }));
        if (requestWithdrawal.fulfilled.match(resultAction)) {
            toast.success("Withdrawal requested successfully");
            setWithdrawOpen(false);
            setWithdrawAmount("");
            dispatch(fetchWalletStats());
        } else {
            toast.error(resultAction.payload as string || "Failed to request withdrawal");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Earnings & Insights</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your school's revenue and platform commissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setWithdrawOpen(true)}
                        className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 dark:shadow-none"
                        disabled={balance <= 0}
                    >
                        <CreditCard className="w-4 h-4" /> Request Payout
                    </button>
                    <button className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all hidden md:flex">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest relative z-10">Available Balance</p>
                    <h2 className="text-4xl font-black mt-2 text-emerald-600 dark:text-emerald-400 relative z-10">₹{balance.toLocaleString()}</h2>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest relative z-10">Pending Withdrawal</p>
                    <h2 className="text-4xl font-black mt-2 text-amber-600 dark:text-amber-400 relative z-10">₹{pendingWithdrawal.toLocaleString()}</h2>
                </div>

                <div className="bg-indigo-600 dark:bg-indigo-700 p-8 rounded-3xl shadow-lg overflow-hidden relative text-white group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white font-black">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest relative z-10">Total Inflow</p>
                    <h2 className="text-4xl font-black mt-2 relative z-10">₹{totalEarnings.toLocaleString()}</h2>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold dark:text-white">Recent Transactions</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            placeholder="Search by Order ID..."
                            className="pl-11 pr-5 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm outline-none w-full md:w-64 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                                <th className="px-8 py-5">Ref / ID</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5">Description</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                                <th className="px-8 py-5 text-right">Balance After</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                            <p className="font-bold text-sm tracking-widest uppercase">Fetching ledger data...</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && transactions?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">No transactions recorded yet.</td>
                                </tr>
                            )}

                            {transactions?.map((t) => (
                                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 inline-block px-2 py-1 rounded truncate max-w-[120px]" title={t.referenceId || t._id}>
                                            {t.referenceId || t._id}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-gray-500 font-medium">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${t.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : t.type === 'withdrawal' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                            {t.type}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t.description}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className={`text-sm font-black ${t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                            {t.type === 'credit' ? '+' : '-'}₹{(t.amount ?? 0).toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">₹{(t.balanceAfter ?? 0).toLocaleString()}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw Modal */}
            {withdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleWithdraw}>
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50 flex justify-between items-center dark:bg-gray-800/50">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Request Payout</h3>
                                    <p className="text-xs text-gray-500 mt-1">Available balance: <span className="font-bold text-emerald-600">₹{balance.toLocaleString()}</span></p>
                                </div>
                                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
                                    <DollarSign className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Withdrawal Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                                        <input
                                            type="number"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            max={balance}
                                            required
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-bold text-lg outline-none dark:text-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 px-1">
                                        <span className="text-xs text-gray-500">Min: ₹500</span>
                                        <button
                                            type="button"
                                            onClick={() => setWithdrawAmount(balance.toString())}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                                        >
                                            Max
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex gap-4 items-start">
                                    <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                                        Withdrawal requests take 2-3 business days to process. The amount will be transferred to your registered bank account via NEFT/IMPS.
                                    </p>
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t border-gray-50 dark:border-gray-800 flex gap-3 justify-end items-center bg-gray-50 dark:bg-gray-800/50">
                                <button
                                    type="button"
                                    onClick={() => setWithdrawOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        "Confirm Request"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EarningsPage;
