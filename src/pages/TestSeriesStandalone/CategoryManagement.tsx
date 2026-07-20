import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCategories, createCategory } from "../../store/slices/testSeriesStandalone";
import { FolderPlus, BookOpen, Layers, ChevronRight, Plus, Search, Brain, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";

const CategoryManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { categories, loading } = useAppSelector((state) => state.testSeriesStandalone);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(createCategory(newCategory)).unwrap();
            toast.success("Category created successfully!");
            setIsModalOpen(false);
            setNewCategory({ name: "", description: "" });
            dispatch(fetchCategories());
        } catch (err) {
            toast.error("Failed to create category");
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
            <PageMeta title="Test Categories | Standalone Test Series" description="Manage standalone test categories" />
            <PageBreadcrumb pageTitle="Test Categories" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            Test Categories
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                            Organize your tests into high-level buckets like Competitive Exams, MBA, etc.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] shadow-xl shadow-indigo-600/20 font-black transition-all hover:-translate-y-1"
                    >
                        <FolderPlus className="w-6 h-6" />
                        Create Category
                    </button>
                </div>

                <div className="relative max-w-xl mb-12 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 animate-pulse" />
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
                        <Archive className="mx-auto h-20 w-20 text-gray-200 dark:text-gray-800 mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Categories Found</h3>
                        <p className="mt-2 text-gray-500 font-medium">Start by creating your first exam category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCategories.map((cat) => (
                            <div
                                key={cat._id}
                                onClick={() => navigate(`/test-series-standalone/series/${cat._id}`)}
                                className="group relative bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Layers className="w-24 h-24 rotate-12" />
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <BookOpen className="w-7 h-7" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 line-clamp-2">
                                    {cat.description || "No description provided for this test category."}
                                </p>

                                <div className="flex items-center text-indigo-600 font-black uppercase tracking-widest text-xs group-hover:gap-2 transition-all">
                                    View Series
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in duration-300">
                        <div className="p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                                    <FolderPlus className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">New Category</h2>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Category Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCategory.name}
                                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="e.g. Management Entrance"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Description</label>
                                    <textarea
                                        rows={4}
                                        value={newCategory.description}
                                        onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                        placeholder="Briefly describe the purpose of this category..."
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-gray-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 text-gray-500 font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                                    >
                                        Create
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

export default CategoryManagement;
