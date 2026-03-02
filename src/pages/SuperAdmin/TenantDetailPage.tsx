import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchTenantById } from "../../store/slices/superAdmin";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
    Building2,
    Globe,
    Users,
    BookOpen,
    DollarSign,
    Calendar,
    ChevronLeft,
    Shield,
    Mail,
    Zap,
    Layout,
    Activity,
    CreditCard,
    Palette,
    CheckCircle,
    Layers,
    UserSquare2,
    ShoppingCart,
    Ticket,
    GraduationCap,
    Tag,
    MessageSquare,
    CalendarRange,
    History,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

const TenantDetailPage: React.FC = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentTenant, currentTenantLoading, currentTenantError } = useSelector((s: RootState) => s.superAdmin);

    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantById(tenantId));
        }
    }, [dispatch, tenantId]);

    const getStatusColor = (status: string, isActive: boolean) => {
        if (!isActive) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        switch (status) {
            case "trial": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "active": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };

    if (currentTenantLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-500 animate-pulse">Loading detailed information...</p>
            </div>
        );
    }

    if (currentTenantError) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Tenant</h2>
                <p className="text-gray-500 mb-6">{currentTenantError}</p>
                <button
                    onClick={() => navigate("/super-admin/tenants")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Tenants
                </button>
            </div>
        );
    }

    if (!currentTenant) return null;

    const tabs = [
        { id: "overview", label: "Overview", icon: Activity },
        { id: "academic", label: "Academic", icon: BookOpen },
        { id: "students", label: "Students", icon: GraduationCap },
        { id: "staff", label: "Staff", icon: UserSquare2 },
        { id: "orders", label: "Orders", icon: ShoppingCart },
        { id: "subscription", label: "Subscription", icon: CreditCard },
        { id: "financial", label: "Financials", icon: DollarSign },
        { id: "branding", label: "Branding", icon: Palette },
        { id: "coupons", label: "Coupons", icon: Tag },
        { id: "support", label: "Support", icon: MessageSquare },
        { id: "events", label: "Events", icon: CalendarRange },
    ];

    const baseUrl = import.meta.env.VITE_BASE_URL || 'https://api.edrilla.com/';

    return (
        <div className="space-y-6 pb-20">
            <PageMeta title={`${currentTenant.name} | Tenant Detail`} description="View detailed tenant information" />

            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate("/super-admin/tenants")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <PageBreadcrumb pageTitle="Tenant Details" />
            </div>

            {/* Premium Header Profile */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm relative">
                <div className="h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700" />
                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-gray-900 p-2 shadow-2xl">
                            {currentTenant.branding?.logo ? (
                                <img
                                    src={`${baseUrl}${currentTenant.branding.logo}`}
                                    className="w-full h-full rounded-[2rem] object-contain bg-gray-50 dark:bg-gray-800"
                                    alt="Logo"
                                />
                            ) : (
                                <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {currentTenant.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1 pb-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{currentTenant.name}</h1>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(currentTenant.plan.status, currentTenant.isActive)}`}>
                                    {currentTenant.isActive ? currentTenant.plan.status : "Inactive"}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-5 text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm font-bold tracking-tight">{currentTenant.subdomain || currentTenant.slug}.edrilla.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm">Since {new Date(currentTenant.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm font-mono text-xs opacity-60">ID: {currentTenant._id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="px-8 flex items-center gap-8 border-t border-gray-50 dark:border-gray-800 mt-4 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 py-5 border-b-2 transition-all duration-300 relative whitespace-nowrap ${activeTab === tab.id
                                ? "border-indigo-600 text-indigo-600 font-bold"
                                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                            <span className="text-sm tracking-tight">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Contents */}
            <div className="transition-all duration-500 ease-in-out">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Students</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{currentTenant.stats?.studentCount || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Courses</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{currentTenant.stats?.courseCount || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Revenue</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">₹{(currentTenant.stats?.totalRevenue || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                                        <UserSquare2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Staff Members</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{currentTenant.stats?.staffCount || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-2xl flex items-center justify-center mb-4">
                                        <ShoppingCart className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{currentTenant.stats?.orderCount || 0}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                                        <Ticket className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Tickets</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{currentTenant.stats?.ticketCount || 0}</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity Snapshots</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Tenant Profile Updated</p>
                                            <p className="text-xs text-gray-500 mt-1">Changes to branding and primary colors were applied on {new Date(currentTenant.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Platform Onboarding</p>
                                            <p className="text-xs text-gray-500 mt-1">Tenant account was successfully initialized and activated</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                                <div className="flex items-center gap-4 mb-6">
                                    <Activity className="w-8 h-8" />
                                    <h3 className="text-xl font-bold">Health Score</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-indigo-100 text-sm">System Uptime</p>
                                        <p className="text-2xl font-black">99.9%</p>
                                    </div>
                                    <div className="w-full bg-indigo-500/50 h-3 rounded-full overflow-hidden">
                                        <div className="bg-white h-full w-[99.9%]" />
                                    </div>
                                </div>
                                <p className="text-indigo-50 text-xs mt-6 leading-relaxed opacity-80">
                                    Performance baseline is optimal. No latency reported in course delivery modules.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Person</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Account Owner</p>
                                        <p className="text-xs text-gray-500">{currentTenant.email || "No email available"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "academic" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Courses Inventory</h3>
                                <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-xs font-bold">
                                    {currentTenant.courses?.length || 0} Total Courses
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Course Name</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Students</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Price</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {currentTenant.courses?.length > 0 ? currentTenant.courses.map((course: any) => (
                                            <tr key={course._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{course.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{course._id}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{course.enrolledStudentsCount || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-emerald-600">₹{course.salePrice?.$numberDecimal || 0}</span>
                                                        <span className="text-[10px] text-gray-400 line-through">₹{course.price?.$numberDecimal || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${course.isPublished ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                                                        {course.isPublished ? "Published" : "Draft"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                    {new Date(course.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
                                                            <BookOpen className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <p className="text-gray-400 italic">No courses found for this tenant</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "students" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Enrolled Students</h3>
                                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-xs font-bold">
                                    {currentTenant.students?.length || 0} Total
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Student Info</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Enrollments</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {currentTenant.students?.length > 0 ? currentTenant.students.map((student: any) => (
                                            <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{student.fullName}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono">ID: {student._id}</p>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                                                <td className="px-8 py-5 text-sm font-bold text-gray-700 dark:text-gray-300">{student.coursesCount || 0} Courses</td>
                                                <td className="px-8 py-5">
                                                    <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase">Active</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <GraduationCap className="w-12 h-12 mb-4 opacity-20" />
                                                        <p className="italic">No students enrolled yet</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Transaction History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order ID</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Student</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Amount</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {currentTenant.orders?.length > 0 ? currentTenant.orders.map((order: any) => (
                                            <tr key={order._id}>
                                                {/* Mapping order details here */}
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                                                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                    <p className="italic">No transaction records found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "staff" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Staff Members</h3>
                                <span className="px-4 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full text-xs font-bold">
                                    {currentTenant.staff?.length || 0} Members
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Full Name</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tenant Role</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {currentTenant.staff?.length > 0 ? currentTenant.staff.map((member: any) => (
                                            <tr key={member._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            {member.fullName?.charAt(0) || 'U'}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{member.fullName}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-400">
                                                    {member.email}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                        {member.tenantRole?.replace('_', ' ') || member.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${member.status === 'active' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                    {new Date(member.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
                                                            <UserSquare2 className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <p className="text-gray-400 italic">No staff found for this tenant</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "subscription" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                <Zap className="w-48 h-48 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Active Subscription</h3>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 leading-none">Subscription Type</p>
                                        <div className="inline-flex px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none">
                                            {currentTenant.plan.type}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Monthly Retainer</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white">₹{currentTenant.plan.monthlyFee || 0}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Commission Rate</p>
                                        <p className="text-3xl font-black text-indigo-600">{currentTenant.plan.commissionRate || 0}%</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1 italic">Per course transaction</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Trial Period End</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {currentTenant.plan.trialEndsAt ? new Date(currentTenant.plan.trialEndsAt).toLocaleDateString() : "No Trial"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                                <Layers className="w-6 h-6 text-indigo-600" /> Quota & Features
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: "Max courses", value: currentTenant.features?.maxCourses, status: true },
                                    { label: "Max students", value: currentTenant.features?.maxStudents, status: true },
                                    { label: "Custom domain", status: currentTenant.features?.customDomain },
                                    { label: "White label", status: currentTenant.features?.whiteLabel },
                                    { label: "AI tools", status: currentTenant.features?.aiFeatures },
                                    { label: "Advanced Analytics", status: currentTenant.features?.advancedAnalytics },
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-50 dark:border-gray-800">
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{feature.label}</p>
                                            {feature.value !== undefined && <p className="text-lg font-black text-gray-900 dark:text-white mt-1">{feature.value.toLocaleString()}</p>}
                                        </div>
                                        <div className={`p-2 rounded-xl ${feature.status ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                                            {feature.status ? <CheckCircle className="w-5 h-5" /> : <Shield className="w-5 h-5 opacity-40" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "financial" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Wallet Status</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Available Balance</p>
                                    <p className="text-5xl font-black text-indigo-600">₹{(currentTenant.wallet?.balance || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                    <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-[0.2em] mb-1">Pending Withdrawals</p>
                                    <p className="text-2xl font-black text-amber-800 dark:text-amber-400">₹{(currentTenant.wallet?.pendingWithdrawal || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Payment Configuration</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">Razorpay Gateway</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Key ID</p>
                                                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                                    {currentTenant.paymentConfig?.razorpayKeyId || "NULL_NOT_CONFIGURED"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Secret Key</p>
                                                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 select-none">••••••••••••••••</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">Currency Config</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white">{currentTenant.paymentConfig?.currency || "INR"}</span>
                                            <span className="px-3 py-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500">
                                                Settlement: T+2 Days
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "branding" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Identity & Design</h3>
                            <div className="space-y-8">
                                <div className="flex items-center gap-10">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Application Name</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white uppercase">{currentTenant.branding?.appName || "LMS"}</p>
                                    </div>
                                    <div className="w-px h-12 bg-gray-100 dark:bg-gray-800" />
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary Font</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{currentTenant.branding?.fontFamily || "Inter"}</p>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Master Logo Asset</p>
                                    {currentTenant.branding?.logo ? (
                                        <img
                                            src={`${baseUrl}${currentTenant.branding.logo}`}
                                            className="h-24 object-contain"
                                            alt="Logo Preview"
                                        />
                                    ) : (
                                        <div className="h-20 flex items-center text-gray-300 italic">No logo uploaded</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                                <Palette className="w-6 h-6 text-indigo-600" /> Color Systems
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: "Primary Color", color: currentTenant.branding?.primaryColor || "#3d40ff" },
                                    { label: "Secondary Color", color: currentTenant.branding?.secondaryColor || "#79db29" },
                                    { label: "Accent Color", color: currentTenant.branding?.accentColor || "#f59e0b" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-5 p-5 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-50 dark:border-gray-800 relative group overflow-hidden">
                                        <div
                                            className="w-14 h-14 rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                                            <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{item.color.toUpperCase()}</p>
                                        </div>
                                        <div
                                            className="absolute -right-2 -bottom-2 w-12 h-12 opacity-[0.05] filter blur-xl rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    </div>
                                ))}
                                <div className="p-5 rounded-3xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-50 dark:border-gray-800 flex flex-col justify-center">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Color Palette Integrity</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(x => (
                                            <div key={x} className={`h-2 flex-1 rounded-full bg-indigo-600 opacity-${x * 2}0`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "coupons" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Active Coupons</h3>
                                <span className="px-4 py-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-full text-xs font-bold">
                                    {currentTenant.coupons?.length || 0} Active
                                </span>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentTenant.coupons?.length > 0 ? currentTenant.coupons.map((coupon: any) => (
                                    <div key={coupon._id} className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 relative overflow-hidden group">
                                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-pink-500/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                                        <p className="text-lg font-black text-gray-900 dark:text-white mb-2">{coupon.code}</p>
                                        <p className="text-sm text-gray-500 font-bold mb-4">{coupon.discount}% Discount</p>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase text-pink-600 tracking-widest">Expires {new Date(coupon.expiry).toLocaleDateString()}</span>
                                            <span className="text-xs font-mono text-gray-400">{coupon.usedCount} Uses</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-16 text-center text-gray-400">
                                        <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="italic">No promotional coupons available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "support" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Helpdesk Tickets</h3>
                                <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full text-xs font-bold">
                                    {currentTenant.tickets?.length || 0} Open
                                </span>
                            </div>
                            <div className="p-4 space-y-4">
                                {currentTenant.tickets?.length > 0 ? currentTenant.tickets.map((ticket: any) => (
                                    <div key={ticket._id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 transition-colors">
                                        <div className="flex gap-4 items-start">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{ticket.subject}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.lastMessage}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800">{ticket.status}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-gray-400 italic">No support tickets found</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">User Queries</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {currentTenant.queries?.length > 0 ? currentTenant.queries.map((query: any) => (
                                    <div key={query._id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{query.query}</p>
                                        <p className="text-[10px] text-gray-400 mt-2">Source: {query.source} • {new Date(query.createdAt).toLocaleDateString()}</p>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-gray-400 italic">No inbound queries</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "events" && (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Platform Events</h3>
                        </div>
                        <div className="p-8">
                            {currentTenant.events?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {currentTenant.events.map((event: any) => (
                                        <div key={event._id} className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-50 dark:border-gray-800">
                                            <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl flex flex-col items-center justify-center border border-gray-100 dark:border-gray-800">
                                                <span className="text-[10px] font-black uppercase text-indigo-600">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-black leading-none">{new Date(event.startDate).getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{event.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{event.type} • {event.location || 'Online'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-gray-400">
                                    <CalendarRange className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                    <p className="italic">No upcoming events scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default TenantDetailPage;
