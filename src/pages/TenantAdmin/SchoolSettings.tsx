import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Palette, CreditCard, Zap, CheckCircle2, Globe, Building2, Save, ExternalLink, Users, UploadCloud } from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import { updateBranding, updatePaymentConfig, clearStatus, fetchMyPlan, fetchBranding } from "../../store/slices/tenantConfig";

const SchoolSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, success, currentPlan, branding } = useSelector((state: RootState) => state.tenantConfig);
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab") as "branding" | "payment" | "subscription" | null;
    const [activeTab, setActiveTab] = useState<"branding" | "payment" | "subscription">(tabFromUrl || "branding");

    // Sync state with URL
    useEffect(() => {
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl, activeTab]);

    const handleTabChange = (tab: "branding" | "payment" | "subscription") => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const [brandingForm, setBrandingForm] = useState({
        appName: "",
        primaryColor: "#4f46e5",
        secondaryColor: "#10b981",
        logoUrl: "",
        faviconUrl: "",
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    const previewLogo = logoFile ? URL.createObjectURL(logoFile) : brandingForm.logoUrl;

    const [paymentForm, setPaymentForm] = useState({
        razorpayKeyId: "",
        razorpayKeySecret: "",
    });

    useEffect(() => {
        dispatch(fetchMyPlan());
        dispatch(fetchBranding());
    }, [dispatch]);

    useEffect(() => {
        if (branding) {
            setBrandingForm({
                appName: branding.appName || branding.displayName || "",
                primaryColor: branding.primaryColor || "#4f46e5",
                secondaryColor: branding.secondaryColor || "#10b981",
                logoUrl: branding.logo || branding.logoUrl || "",
                faviconUrl: branding.faviconUrl || "",
            });
        }
    }, [branding]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => dispatch(clearStatus()), 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error, dispatch]);

    const handleBrandingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("appName", brandingForm.appName);
        formData.append("primaryColor", brandingForm.primaryColor);
        if (brandingForm.secondaryColor) formData.append("secondaryColor", brandingForm.secondaryColor);
        if (logoFile) formData.append("logo", logoFile);
        if (faviconFile) formData.append("favicon", faviconFile);

        dispatch(updateBranding(formData));
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(updatePaymentConfig(paymentForm));
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">School Control</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your school's identity, payments, and platform subscription.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                    <button
                        onClick={() => handleTabChange("branding")}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "branding" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"}`}
                    >
                        <Palette className="w-4 h-4" /> Branding
                    </button>
                    <button
                        onClick={() => handleTabChange("payment")}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "payment" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"}`}
                    >
                        <CreditCard className="w-4 h-4" /> Payments
                    </button>
                    <button
                        onClick={() => handleTabChange("subscription")}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "subscription" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"}`}
                    >
                        <Zap className="w-4 h-4" /> Subscription
                    </button>
                </div>
            </div>

            {success && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">{success}</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {activeTab === "branding" && (
                        <form onSubmit={handleBrandingSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Public School Name</label>
                                        <input
                                            value={brandingForm.appName}
                                            onChange={(e) => setBrandingForm({ ...brandingForm, appName: e.target.value })}
                                            placeholder="e.g. Maths Guru Premium"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Brand Logo</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                                {previewLogo ? (
                                                    <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <Building2 className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="logoUpload"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                                />
                                                <label
                                                    htmlFor="logoUpload"
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all shadow-sm"
                                                >
                                                    <UploadCloud className="w-4 h-4" />
                                                    {logoFile ? logoFile.name : "Upload Logo"}
                                                </label>
                                                <p className="text-xs text-gray-500 mt-2">Recommended: 512x512px transparent PNG</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Primary Branding Color</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={brandingForm.primaryColor}
                                                onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                                                className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden"
                                            />
                                            <input
                                                value={brandingForm.primaryColor}
                                                onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white uppercase font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Secondary Accent Color</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                value={brandingForm.secondaryColor}
                                                onChange={(e) => setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })}
                                                className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden"
                                            />
                                            <input
                                                value={brandingForm.secondaryColor}
                                                onChange={(e) => setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })}
                                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white uppercase font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Favicon</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                                {faviconFile || brandingForm.faviconUrl ? (
                                                    <img src={faviconFile ? URL.createObjectURL(faviconFile) : brandingForm.faviconUrl} alt="Favicon Preview" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <Globe className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="faviconUpload"
                                                    accept=".ico,image/png,image/svg+xml"
                                                    className="hidden"
                                                    onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                                                />
                                                <label
                                                    htmlFor="faviconUpload"
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all shadow-sm"
                                                >
                                                    <UploadCloud className="w-4 h-4" />
                                                    {faviconFile ? faviconFile.name : "Upload Favicon"}
                                                </label>
                                                <p className="text-xs text-gray-500 mt-2">32x32px .ico or .png file</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                    Apply Custom Branding
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === "payment" && (
                        <form onSubmit={handlePaymentSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                            <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                                <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-amber-900 dark:text-amber-200 font-bold">Self-Collection (Direct Payment)</p>
                                    <p className="text-sm text-amber-700/80 dark:text-amber-400/80 leading-relaxed">By setting your own Razorpay keys, payments from your students will go directly to your bank account. The platform will bill you separately for commissions or usage.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Razorpay Key ID</label>
                                    <input
                                        type="password"
                                        value={paymentForm.razorpayKeyId}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, razorpayKeyId: e.target.value })}
                                        placeholder="rzp_live_..."
                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Razorpay Key Secret</label>
                                    <input
                                        type="password"
                                        value={paymentForm.razorpayKeySecret}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, razorpayKeySecret: e.target.value })}
                                        placeholder="••••••••••••••••"
                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Payment Config
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4">Keys are encrypted at rest and never shared with anyone.</p>
                            </div>
                        </form>
                    )}

                    {activeTab === "subscription" && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {!currentPlan && loading && (
                                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                    <Zap className="w-12 h-12 animate-pulse mb-4 text-gray-400" />
                                    <p className="font-bold tracking-widest uppercase text-xs">Syncing platform status...</p>
                                </div>
                            )}

                            {currentPlan && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {/* Premium Status Header */}
                                    <div className="relative overflow-hidden bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -mr-64 -mt-64" />
                                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -ml-48 -mb-48" />

                                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                            <div className="space-y-6 max-w-2xl">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                                                        Active {currentPlan.plan.status}
                                                    </span>
                                                    {currentPlan.plan.status === 'trial' && (
                                                        <span className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-400">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                            </span>
                                                            Trial Period
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                                        {currentPlan.plan.type} <span className="text-gray-500">Edition</span>
                                                    </h2>
                                                    <p className="text-gray-400 text-lg leading-relaxed">
                                                        {currentPlan.plan.status === 'trial'
                                                            ? `Your unrestricted access continues until ${new Date(currentPlan.plan.trialEndsAt!).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}. Scale your school to the moon.`
                                                            : `Manage your academy with peace of mind. Next billing sequence on ${new Date(currentPlan.plan.currentPeriodEnd!).toLocaleDateString()}.`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2rem] text-center lg:min-w-[320px] shadow-inner">
                                                <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Investment Balance</p>
                                                <div className="text-5xl font-black text-white mb-6">
                                                    {currentPlan.plan.monthlyFee > 0 ? `₹${currentPlan.plan.monthlyFee.toLocaleString()}` : `${currentPlan.plan.commissionRate}%`}
                                                    <span className="text-sm font-medium text-gray-500 ml-1">
                                                        {currentPlan.plan.monthlyFee > 0 ? "/ month" : "/ sale"}
                                                    </span>
                                                </div>
                                                <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-xl shadow-white/5">
                                                    View Invoices
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Capability Matrix */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: "Course Quota", value: `${currentPlan.features.maxCourses} Units`, icon: Building2, color: "indigo" },
                                            { label: "Student Reach", value: currentPlan.features.maxStudents?.toLocaleString(), icon: Users, color: "purple" },
                                            { label: "Intelligence", value: currentPlan.features.aiFeatures ? "AI-Core Enabled" : "Standard", icon: Zap, color: "amber" }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-3xl flex items-center gap-6 group hover:border-indigo-500/40 transition-all shadow-sm">
                                                <div className={`w-16 h-16 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-950/30 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                                    <stat.icon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                                    <p className="text-2xl font-black dark:text-white tracking-tight">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Deployment Options */}
                                    <div className="space-y-10 pt-10">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black dark:text-white tracking-tight text-center lg:text-left">Elevate Your Academy</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-center lg:text-left">Seamlessly transition to higher performance tiers as you scale.</p>
                                            </div>
                                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl self-center lg:self-auto">
                                                <button className="px-6 py-2.5 bg-white dark:bg-gray-700 rounded-xl text-xs font-black shadow-sm dark:text-white uppercase tracking-widest">Monthly</button>
                                                <button className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase tracking-widest">Yearly (Save 20%)</button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {currentPlan.availablePlans.map((plan) => {
                                                const isCurrent = plan.key === currentPlan.plan.type;
                                                return (
                                                    <div
                                                        key={plan.key}
                                                        className={`group relative p-[2px] rounded-[3rem] transition-all duration-700 overflow-hidden ${isCurrent
                                                            ? "bg-gray-200 dark:bg-gray-800 cursor-default"
                                                            : "bg-gradient-to-b from-gray-100 to-transparent dark:from-gray-800 hover:from-indigo-500 hover:to-purple-600 hover:shadow-3xl hover:-translate-y-3"
                                                            }`}
                                                    >
                                                        <div className="h-full bg-white dark:bg-gray-900 rounded-[2.9rem] p-10 flex flex-col relative z-10">
                                                            <div className="mb-10">
                                                                <h4 className="text-2xl font-black dark:text-white capitalize mb-3 tracking-tight">{plan.name}</h4>
                                                                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                                                    {plan.description}
                                                                </p>
                                                            </div>

                                                            <div className="mb-10">
                                                                <div className="text-5xl font-black dark:text-white tracking-tighter flex items-baseline">
                                                                    {plan.monthlyFee > 0 ? `₹${plan.monthlyFee.toLocaleString()}` : `${plan.commissionRate}%`}
                                                                    <span className="text-base font-medium text-gray-500 ml-1">
                                                                        {plan.monthlyFee > 0 ? "/mo" : "/sale"}
                                                                    </span>
                                                                </div>
                                                                {plan.monthlyFee > 0 && plan.commissionRate > 0 && (
                                                                    <p className="text-xs text-indigo-500 font-bold mt-3 uppercase tracking-widest">+ {plan.commissionRate}% Commission</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-5 mb-12 flex-1">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Package Inclusions</p>
                                                                {[
                                                                    `Limit: ${plan.key === 'whitelabel' ? 'Unlimited' : '50+'} Active Courses`,
                                                                    plan.monthlyFee > 2000 ? "Custom DNS & Domain" : "Standard edrilla Subdomain",
                                                                    plan.monthlyFee > 5000 ? "White-label Mobile Apps" : "Native Mobile Ecosystem",
                                                                    "Advanced Creator Analytics"
                                                                ].map((feat, idx) => (
                                                                    <div key={idx} className="flex items-start gap-4 group/item">
                                                                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 group-hover/item:scale-125 transition-transform">
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                                        </div>
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400 font-bold leading-tight group-hover/item:text-indigo-500 transition-colors">{feat}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <button
                                                                disabled={isCurrent}
                                                                className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 ${isCurrent
                                                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700"
                                                                    : "bg-gray-900 text-white hover:bg-indigo-600 shadow-2xl shadow-indigo-500/20 group-hover:bg-indigo-600"
                                                                    }`}
                                                            >
                                                                {isCurrent ? "Active Deployment" : "Ignite This Plan"}
                                                                {!isCurrent && <Zap className="w-4 h-4 fill-white animate-pulse" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6">Preview & Live</h4>
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                                    {previewLogo ? (
                                        <img src={previewLogo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold dark:text-white">{brandingForm.appName || "LMS Academy"}</p>
                                    <p className="text-xs text-gray-400">{brandingForm.appName.toLowerCase().replace(/ /g, '-')}.edrilla.com</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Live Theme</p>
                                <div className="flex gap-2">
                                    <div className="h-8 flex-1 rounded-full" style={{ background: brandingForm.primaryColor }} />
                                    <div className="h-8 flex-1 rounded-full" style={{ background: brandingForm.secondaryColor }} />
                                </div>
                            </div>

                            <button className="w-full py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all dark:text-white">
                                View Landing Page <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-400 mb-2">Need Help?</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed mb-4">Want to connect a custom domain like <b>courses.mathsguru.in</b>? Contact our platform specialists.</p>
                        <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Read Domain Setup Guide →</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolSettings;
