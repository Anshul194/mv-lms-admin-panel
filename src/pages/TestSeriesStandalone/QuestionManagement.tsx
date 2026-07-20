import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { createQuestion } from "../../store/slices/testSeriesStandalone";
import {
    Plus, ChevronLeft, CheckCircle, Circle, Save, HelpCircle,
    FilePlus, Target, AlertCircle, Image as ImageIcon, Music, Video,
    Type, ListChecks, AlignLeft, Binary, FileUp, Link as LinkIcon, X
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";

const QuestionManagement: React.FC = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { tests } = useAppSelector((state) => state.testSeriesStandalone);

    const test = tests.find(t => t._id === testId);

    const [question, setQuestion] = useState({
        text: "",
        type: "mcq" as any,
        marks: 4,
        negativeMarks: 1,
        mediaUrl: "",
        mediaType: "none" as any,
        options: [
            { optionId: "1", text: "", isCorrect: false },
            { optionId: "2", text: "", isCorrect: false },
            { optionId: "3", text: "", isCorrect: false },
            { optionId: "4", text: "", isCorrect: false },
        ]
    });

    const handleOptionChange = (idx: number, text: string) => {
        const newOptions = [...question.options];
        newOptions[idx].text = text;
        setQuestion({ ...question, options: newOptions });
    };

    const handleCorrectOption = (idx: number) => {
        const newOptions = question.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === idx
        }));
        setQuestion({ ...question, options: newOptions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (question.type === "mcq" || question.type === "true_false") {
            if (!question.options.some(opt => opt.isCorrect)) {
                toast.error("Please mark a correct answer!");
                return;
            }
        }

        try {
            await dispatch(createQuestion({ ...question, testId })).unwrap();
            toast.success("Question added successfully!");
            // Reset but keep marks/neg-marks for convenience
            setQuestion({
                ...question,
                text: "",
                mediaUrl: "",
                mediaType: "none",
                options: question.type === "true_false" ? [
                    { optionId: "1", text: "True", isCorrect: false },
                    { optionId: "2", text: "False", isCorrect: false },
                ] : [
                    { optionId: "1", text: "", isCorrect: false },
                    { optionId: "2", text: "", isCorrect: false },
                    { optionId: "3", text: "", isCorrect: false },
                    { optionId: "4", text: "", isCorrect: false },
                ]
            });
        } catch (err) {
            toast.error("Failed to add question");
        }
    };

    const qTypes = [
        { id: "mcq", label: "Objective (MCQ)", icon: <ListChecks className="w-5 h-5" /> },
        { id: "subjective", label: "Subjective", icon: <AlignLeft className="w-5 h-5" /> },
        { id: "true_false", label: "True / False", icon: <Type className="w-5 h-5" /> },
        { id: "numerical", label: "Numerical", icon: <Binary className="w-5 h-5" /> },
        { id: "file_upload", label: "File Upload", icon: <FileUp className="w-5 h-5" /> },
    ];

    const mediaTypes = [
        { id: "none", label: "No Media", icon: <X className="w-4 h-4" /> },
        { id: "image", label: "Image", icon: <ImageIcon className="w-4 h-4" /> },
        { id: "audio", label: "Audio", icon: <Music className="w-4 h-4" /> },
        { id: "video", label: "Video", icon: <Video className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
            <PageMeta title="Advanced Question Builder | LMS" description="Add multi-type questions to your test paper" />
            <PageBreadcrumb pageTitle="Question Builder" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-indigo-600 font-bold mb-4 hover:gap-4 transition-all outline-none"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Exam Papers
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Next-Gen Question Builder
                    </h1>
                    <p className="mt-2 text-gray-400 font-medium">
                        Paper: <span className="text-gray-900 dark:text-gray-200 font-bold">{test?.title || "Standalone Test"}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel - Configurations */}
                    <div className="space-y-8">
                        {/* Question Type */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Question Type</label>
                            <div className="space-y-3">
                                {qTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            const opts = type.id === "true_false" ? [
                                                { optionId: "1", text: "True", isCorrect: false },
                                                { optionId: "2", text: "False", isCorrect: false },
                                            ] : [
                                                { optionId: "1", text: "", isCorrect: false },
                                                { optionId: "2", text: "", isCorrect: false },
                                                { optionId: "3", text: "", isCorrect: false },
                                                { optionId: "4", text: "", isCorrect: false },
                                            ];
                                            setQuestion({ ...question, type: type.id, options: opts });
                                        }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all font-bold ${question.type === type.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-gray-50 dark:bg-white/[0.02] border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${question.type === type.id ? 'bg-white/20' : 'bg-white dark:bg-gray-800'}`}>
                                            {type.icon}
                                        </div>
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Marks Config */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Scoring Policy</label>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <Target className="w-4 h-4 text-emerald-500" /> Correct
                                    </div>
                                    <input
                                        type="number"
                                        value={question.marks}
                                        onChange={e => setQuestion({ ...question, marks: parseInt(e.target.value) || 0 })}
                                        className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-black text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <AlertCircle className="w-4 h-4 text-red-500" /> Negative
                                    </div>
                                    <input
                                        type="number"
                                        value={question.negativeMarks}
                                        onChange={e => setQuestion({ ...question, negativeMarks: parseInt(e.target.value) || 0 })}
                                        className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-red-500 outline-none transition-all font-black text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Content Editor */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                            <div className="p-8 sm:p-12">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {/* Media Section */}
                                    <div className="space-y-6">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Media Attachment</label>
                                        <div className="flex flex-wrap gap-3">
                                            {mediaTypes.map(m => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => setQuestion({ ...question, mediaType: m.id })}
                                                    className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 font-black text-[10px] uppercase tracking-widest transition-all ${question.mediaType === m.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-gray-50 dark:bg-white/[0.02] border-transparent text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    {m.icon}
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>

                                        {question.mediaType !== "none" && (
                                            <div className="relative group animate-in slide-in-from-top duration-300">
                                                <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600" />
                                                <input
                                                    type="text"
                                                    placeholder={`Paste ${question.mediaType} URL here...`}
                                                    value={question.mediaUrl}
                                                    onChange={e => setQuestion({ ...question, mediaUrl: e.target.value })}
                                                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border-2 border-dashed border-gray-200 dark:border-gray-800 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-indigo-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Question Text */}
                                    <div className="space-y-4">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Question Content</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={question.text}
                                            onChange={e => setQuestion({ ...question, text: e.target.value })}
                                            placeholder="What would you like to ask?"
                                            className="w-full px-8 py-8 rounded-[2rem] bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all font-bold text-2xl text-gray-900 dark:text-white outline-none resize-none shadow-inner"
                                        />
                                    </div>

                                    {/* Options Section - Conditional */}
                                    {(question.type === "mcq" || question.type === "true_false") && (
                                        <div className="space-y-6 animate-in fade-in duration-500">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Answer Key</label>
                                                <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Circle className="w-2.5 h-2.5 fill-current" /> Auto-Graded
                                                </div>
                                            </div>

                                            {question.options.map((opt, idx) => (
                                                <div key={idx} className={`group flex items-center gap-6 p-5 rounded-[2.5rem] border-2 transition-all ${opt.isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-gray-50 dark:bg-white/[0.02] border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCorrectOption(idx)}
                                                        className={`w-14 h-14 flex-shrink-0 rounded-[1.25rem] flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-300 group-hover:text-gray-400'}`}
                                                    >
                                                        {opt.isCorrect ? <CheckCircle className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                                                    </button>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={opt.text}
                                                        disabled={question.type === "true_false"}
                                                        placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                                                        onChange={e => handleOptionChange(idx, e.target.value)}
                                                        className={`bg-transparent outline-none flex-grow font-black text-xl transition-colors ${opt.isCorrect ? 'text-emerald-900 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Subjective / File Preview */}
                                    {question.type === "subjective" && (
                                        <div className="p-10 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-center animate-in zoom-in duration-300">
                                            <AlignLeft className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tighter">Open-Ended Question</h4>
                                            <p className="text-sm text-indigo-600/70 dark:text-indigo-500/70 font-medium">Students will type their answer in a text box. This requires manual grading.</p>
                                        </div>
                                    )}

                                    {question.type === "file_upload" && (
                                        <div className="p-10 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5rem] border-2 border-dashed border-amber-200 dark:border-amber-800 text-center animate-in zoom-in duration-300">
                                            <FileUp className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-black text-amber-900 dark:text-amber-300 uppercase tracking-tighter">Submission Evidence</h4>
                                            <p className="text-sm text-amber-600/70 dark:text-amber-500/70 font-medium">Students must upload a document, image, or PDF as their response.</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-10 flex flex-col sm:flex-row gap-4">
                                        <button
                                            type="submit"
                                            className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 outline-none"
                                        >
                                            <Save className="w-7 h-7" />
                                            Save & Publish
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="px-10 py-6 bg-white dark:bg-gray-800 text-gray-500 rounded-[2rem] font-bold border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 outline-none"
                                        >
                                            <Plus className="w-6 h-6" />
                                            New
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <HelpCircle className="w-32 h-32 rotate-12" />
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 relative z-10">Pro Designer Tip</h4>
                            <p className="text-indigo-100 font-medium relative z-10 leading-relaxed">
                                Use **Media Attachments** to create more interactive exams. Reading passages as images or listening tests as audio files are highly effective for performance assessment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionManagement;
