import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchSeriesByCategory, createSeries } from "../../store/slices/testSeriesStandalone";
import { Plus, ChevronLeft, Layers, IndianRupee, Tag, ShieldCheck, Search, Database, LayoutGrid } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";

const SeriesManagement: React.FC = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { series, loading, categories } = useAppSelector((state) => state.testSeriesStandalone);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSeries, setNewSeries] = useState({
        title: "",
        description: "",
        price: 0,
        isPaid: false,
    });

    const category = categories.find(c => c._id === categoryId);

    useEffect(() => {
        if (categoryId) {
            dispatch(fetchSeriesByCategory(categoryId));
        }
    }, [categoryId, dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(createSeries({ ...newSeries, categoryId })).unwrap();
            toast.success("Series created successfully!");
            setIsModalOpen(false);
            setNewSeries({ title: "", description: "", price: 0, isPaid: false });
            dispatch(fetchSeriesByCategory(categoryId!));
        } catch (err) {
            toast.error("Failed to create series");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
            <PageMeta title="Test Series Packages | LMS" description="Manage test series packages" />
            <PageBreadcrumb pageTitle="Series Packages" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-indigo-600 font-bold mb-6 hover:gap-4 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Categories
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                {category?.name || "Test Series Packages"}
                            </h1>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                                Create and manage specific mock test packs (e.g., CAT Gold Pack).
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] shadow-xl shadow-indigo-600/20 font-black transition-all hover:-translate-y-1"
                        >
                            <Plus className="w-6 h-6" />
                            New Series Pack
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : series.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
                        <Database className="mx-auto h-20 w-20 text-gray-200 dark:text-gray-800 mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Series Found</h3>
                        <p className="mt-2 text-gray-500 font-medium">Add a series pack to this category to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {series.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => navigate(`/test-series-standalone/tests/${item._id}`)}
                                className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden p-8 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    {item.isPaid ? (
                                        <span className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-xs font-black uppercase tracking-widest rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-2">
                                            <Tag className="w-3 h-3" />
                                            Premium
                                        </span>
                                    ) : (
                                        <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3" />
                                            Free Pack
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium flex-grow mb-8 line-clamp-3">
                                    {item.description || "A comprehensive test series package designed to help students master their exams."}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <IndianRupee className="w-5 h-5 text-gray-400" />
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                                            {item.price || "0"}
                                        </span>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <LayoutGrid className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="p-10">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8">New Series Pack</h2>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Series Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={newSeries.title}
                                        onChange={e => setNewSeries({ ...newSeries, title: e.target.value })}
                                        placeholder="e.g. CAT 2025 Mock Pack"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-bold text-gray-900 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={newSeries.description}
                                        onChange={e => setNewSeries({ ...newSeries, description: e.target.value })}
                                        placeholder="Describe what's in this pack..."
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-medium text-gray-900 dark:text-white outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Price (INR)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={newSeries.price}
                                                onChange={e => setNewSeries({ ...newSeries, price: parseInt(e.target.value) || 0 })}
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-black text-gray-900 dark:text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Payment Type</label>
                                        <div className="flex bg-gray-50 dark:bg-white/[0.03] p-1.5 rounded-2xl">
                                            <button
                                                type="button"
                                                onClick={() => setNewSeries({ ...newSeries, isPaid: false })}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!newSeries.isPaid ? 'bg-white dark:bg-gray-800 shadow-md text-emerald-600' : 'text-gray-400'}`}
                                            >
                                                Free
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewSeries({ ...newSeries, isPaid: true })}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${newSeries.isPaid ? 'bg-white dark:bg-gray-800 shadow-md text-amber-600' : 'text-gray-400'}`}
                                            >
                                                Paid
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 text-gray-500 font-bold hover:bg-gray-50 transition-all outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all outline-none"
                                    >
                                        Create Series
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeriesManagement;
