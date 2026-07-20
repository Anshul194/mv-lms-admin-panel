import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchTestsBySeries, createTest } from "../../store/slices/testSeriesStandalone";
import { Plus, ChevronLeft, Timer, Trophy, FileText, LayoutList, Settings2, BrainCircuit, Search, MoreHorizontal } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";

const TestManagement: React.FC = () => {
    const { seriesId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { tests, loading, series } = useAppSelector((state) => state.testSeriesStandalone);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTest, setNewTest] = useState({
        title: "",
        description: "",
        durationMinutes: 60,
        totalMarks: 100,
    });

    const parentSeries = series.find(s => s._id === seriesId);

    useEffect(() => {
        if (seriesId) {
            dispatch(fetchTestsBySeries(seriesId));
        }
    }, [seriesId, dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(createTest({ ...newTest, seriesId })).unwrap();
            toast.success("Test paper created!");
            setIsModalOpen(false);
            setNewTest({ title: "", description: "", durationMinutes: 60, totalMarks: 100 });
            dispatch(fetchTestsBySeries(seriesId!));
        } catch (err) {
            toast.error("Failed to create test");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
            <PageMeta title="Exam Papers | LMS" description="Manage individual test papers" />
            <PageBreadcrumb pageTitle="Exam Papers" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-indigo-600 font-bold mb-4 hover:gap-4 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to Series
                        </button>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            {parentSeries?.title || "Exam Papers"}
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                            Create and manage individual mock exam papers.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] shadow-xl shadow-indigo-600/20 font-black transition-all hover:-translate-y-1"
                    >
                        <Plus className="w-6 h-6" />
                        Add Exam Paper
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : tests.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
                        <FileText className="mx-auto h-20 w-20 text-gray-200 dark:text-gray-800 mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Exam Papers</h3>
                        <p className="mt-2 text-gray-500 font-medium">Add your first test paper to this series.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {tests.map((test) => (
                            <div
                                key={test._id}
                                className="group bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-8"
                            >
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/[0.02] rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <BrainCircuit className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            {test.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-medium mt-1 line-clamp-1">{test.description || "Comprehensive test paper"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:flex items-center gap-8 w-full md:w-auto">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Time Limit</p>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold">
                                            <Timer className="w-4 h-4 text-indigo-400" />
                                            {test.durationMinutes}m
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Max Marks</p>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold">
                                            <Trophy className="w-4 h-4 text-amber-400" />
                                            {test.totalMarks}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <button
                                        onClick={() => navigate(`/test-series-standalone/questions/${test._id}`)}
                                        className="flex-grow md:flex-grow-0 px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 dark:hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <LayoutList className="w-4 h-4" />
                                        Manage Questions
                                    </button>
                                    <button className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all">
                                        <Settings2 className="w-5 h-5" />
                                    </button>
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
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8">Create Exam Paper</h2>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Paper Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={newTest.title}
                                        onChange={e => setNewTest({ ...newTest, title: e.target.value })}
                                        placeholder="e.g. Quantitative Aptitude Mock 1"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-bold text-gray-900 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Instructions</label>
                                    <textarea
                                        rows={2}
                                        value={newTest.description}
                                        onChange={e => setNewTest({ ...newTest, description: e.target.value })}
                                        placeholder="Key instructions for students..."
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-medium text-gray-900 dark:text-white outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Duration (Mins)</label>
                                        <input
                                            type="number"
                                            value={newTest.durationMinutes}
                                            onChange={e => setNewTest({ ...newTest, durationMinutes: parseInt(e.target.value) || 0 })}
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-black text-gray-900 dark:text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Total Marks</label>
                                        <input
                                            type="number"
                                            value={newTest.totalMarks}
                                            onChange={e => setNewTest({ ...newTest, totalMarks: parseInt(e.target.value) || 0 })}
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-black text-gray-900 dark:text-white outline-none"
                                        />
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
                                        Add Paper
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

export default TestManagement;
