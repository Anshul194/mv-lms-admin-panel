import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DollarSign, ArrowUpRight, ShoppingBag, TrendingUp, Calendar, Download, Search } from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import { fetchTenantTransactions } from "../../store/slices/tenantConfig";

const EarningsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { transactions, loading } = useSelector((state: RootState) => state.tenantConfig);

    useEffect(() => {
        dispatch(fetchTenantTransactions());
    }, [dispatch]);

    // Calculate totals
    const totalEarnings = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + t.commissionAmount, 0);
    const totalOrders = transactions.length;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Earnings & Insights</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your school's revenue and platform commissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-all">
                        <Calendar className="w-4 h-4" /> Last 30 Days
                    </button>
                    <button className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                            <TrendingUp className="w-3 h-3" /> +12%
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Net Earnings</p>
                    <h2 className="text-4xl font-black mt-2 dark:text-white">₹{totalEarnings.toLocaleString()}</h2>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Successful Enrollments</p>
                    <h2 className="text-4xl font-black mt-2 dark:text-white">{totalOrders} <span className="text-sm font-medium text-gray-400 italic">orders</span></h2>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 font-black">
                            %
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest relative z-10">Platform Comm.</p>
                    <h2 className="text-4xl font-black mt-2 dark:text-white relative z-10">₹{totalCommission.toLocaleString()}</h2>
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
                                <th className="px-8 py-5">Order ID</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Gross Amt.</th>
                                <th className="px-8 py-5 text-right">Comm.</th>
                                <th className="px-8 py-5 text-right">Your Share</th>
                                <th className="px-8 py-5">Status</th>
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

                            {!loading && transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">No transactions recorded yet.</td>
                                </tr>
                            )}

                            {transactions.map((t) => (
                                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">#{t.orderId}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">₹{t.grossAmount}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-bold text-red-500">-₹{t.commissionAmount}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">₹{t.netAmount}</p>
                                    </td>
                                    <td className="px-8 py-6 uppercase">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${t.payoutStatus === 'settled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {t.payoutStatus}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EarningsPage;
