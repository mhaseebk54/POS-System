
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import {
    TrendingUp, TrendingDown, Package, Users,
    ShoppingBag, AlertTriangle, ArrowUpRight, DollarSign,
    CheckCircle2, Clock, Landmark
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import { useTheme } from '../context/ThemeContext';
import DashboardHistoryModal from '../components/DashboardHistoryModal';

const Dashboard = () => {
    const { theme } = useTheme();
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [historyModal, setHistoryModal] = useState({ isOpen: false, title: '', items: [], type: '' });

    useEffect(() => {
        fetchDashboard();
    }, [user?.role]);

    const fetchDashboard = async () => {
        try {
            const role = user?.role === 'admin' ? 'admin' : 'manager';
            const response = await api.get(`/dashboard/${role}`);
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        try {
            const response = await api.get(`/reports/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Administrators only.');
        }
    };

    const handleExportPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Brand Header
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("LAUNDRY POS", 15, 25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("EXECUTIVE FINANCIAL SUMMARY", 15, 33);

        // Date & Meta
        doc.setTextColor(100);
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 25);
        doc.text(`Authorized by: ${user?.name}`, 140, 31);

        // Grid Start
        let startY = 55;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("Operational Performance Today", 15, startY);

        // Metrics Table
        const metrics = [
            ["Metric Name", "Value"],
            ["Total Revenue Today", `Rs. ${data?.metrics?.revenueToday}`],
            ["Total Expenses Today", `Rs. ${data?.metrics?.expensesToday}`],
            ["Net Profit Result", `Rs. ${data?.metrics?.netProfitToday}`],
            ["Total Daily Bookings", `${data?.metrics?.todayBookings}`],
            ["Total Daily Deliveries", `${data?.metrics?.todayDeliveries}`],
            ["Active Cycles", `${data?.metrics?.activeBookings}`],
            ["Outstanding Payments", `Rs. ${data?.metrics?.totalPendingPayments}`]
        ];

        window.jspdf.autoTable(doc, {
            startY: startY + 8,
            head: [metrics[0]],
            body: metrics.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], fontSize: 12 },
            styles: { fontSize: 11, cellPadding: 6 }
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Confidential Business Intelligence - Laundry POS System", 105, 280, { align: "center" });

        doc.save(`Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading metrics...</div>;

    const COLORS = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    const adminMetrics = [
        { label: 'Revenue Today', value: `Rs. ${data?.metrics?.revenueToday}`, icon: <TrendingUp />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', type: 'revenue' },
        { label: 'Expenses Today', value: `Rs. ${data?.metrics?.expensesToday}`, icon: <TrendingDown />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', type: 'expenses' },
        { label: 'Today Bookings', value: data?.metrics?.todayBookings, icon: <ShoppingBag />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', type: 'bookings' },
        { label: 'Today Deliveries', value: data?.metrics?.todayDeliveries, icon: <CheckCircle2 />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', type: 'deliveries' },
        { label: 'Pending Payments', value: `Rs. ${data?.metrics?.totalPendingPayments}`, icon: <Clock />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', type: 'pending' },
        { label: 'Net Profit Today', value: `Rs. ${data?.metrics?.netProfitToday}`, icon: <Landmark />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', type: 'profit' },
    ];

    const widgets = [
        { label: 'Total Customers', value: data?.metrics?.totalCustomers, icon: <Users /> },
        { label: 'Total Managers', value: data?.metrics?.totalManagers, icon: <Users /> },
        { label: 'Active Bookings', value: data?.metrics?.activeBookings, icon: <Package /> },
        { label: 'Low Stock Alerts', value: data?.metrics?.lowStockCount, icon: <AlertTriangle /> },
    ];

    const managerMetrics = [
        { label: "Today's Bookings", value: data?.todayBookings, icon: <ShoppingBag />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', type: 'bookings' },
        { label: "Today's Deliveries", value: data?.todayDeliveries, icon: <CheckCircle2 />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', type: 'deliveries' },
        { label: 'My Sales Today', value: `Rs. ${data?.myRevenue}`, icon: <DollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', type: 'revenue' },
        { label: 'Inventory Alerts', value: data?.inventoryAlerts, icon: <AlertTriangle />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', type: 'none' },
    ];

    const chartData = data?.charts?.monthlyStats?.map(item => {
        const monthNum = item._id.month;
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const expenseObj = data?.charts?.monthlyExpenses?.find(e => e._id.month === monthNum);
        return { name: monthNames[monthNum], revenue: item.revenue, expense: expenseObj ? expenseObj.expense : 0 };
    }) || [];

    const pieData = data?.charts?.popularServices?.map(item => ({ name: item._id, value: item.count })) || [];

    const growthData = data?.charts?.customerGrowth?.map(item => {
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return { name: monthNames[item._id.month], count: item.count };
    }) || [];

    const performanceData = data?.charts?.managerPerformance || [];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        {user?.role === 'admin' ? 'Admin Executive Dashboard' : 'Branch Manager Operations'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Performance monitoring for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <button
                    onClick={() => {
                        const allItems = [
                            ...(data?.history?.revenue || []).map(i => ({ ...i, type: 'revenue' })),
                            ...(data?.history?.expenses || []).map(i => ({ ...i, type: 'expenses' })),
                        ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

                        setHistoryModal({
                            isOpen: true,
                            title: "Today's Complete Activity",
                            type: 'all',
                            items: allItems
                        });
                    }}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Clock size={18} className="text-indigo-600" />
                    Today's Recap
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(user?.role === 'admin' ? adminMetrics : managerMetrics).map((item, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            if (item.type !== 'none') {
                                setHistoryModal({
                                    isOpen: true,
                                    title: item.label,
                                    type: item.type,
                                    items: data?.history?.[item.type] || []
                                });
                            }
                        }}
                        className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all ${item.type !== 'none' ? 'cursor-pointer active:scale-95' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>{item.icon}</div>
                            <span className="flex items-center text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full uppercase tracking-widest">History Log</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
                    </div>
                ))}
            </div>

            {user?.role === 'admin' && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {widgets.map((w, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                <div className="text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">{w.icon}</div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{w.label}</p>
                                    <p className="text-xl font-bold">{w.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 h-[400px]">
                            <h3 className="text-lg font-bold mb-6">Revenue vs Expenses (6M)</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'light' ? '#f1f5f9' : '#1e293b'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke={theme === 'light' ? '#64748b' : '#94a3b8'} fontSize={12} />
                                    <YAxis axisLine={false} tickLine={false} stroke={theme === 'light' ? '#64748b' : '#94a3b8'} fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                                            color: theme === 'light' ? '#1e293b' : '#f8fafc'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 h-[400px]">
                            <h3 className="text-lg font-bold mb-6">Popular Service Types</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 h-[350px]">
                            <h3 className="text-lg font-bold mb-6">Customer Growth (Monthly)</h3>
                            <ResponsiveContainer width="100%" height="80%">
                                <BarChart data={growthData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#10b981" radius={[10, 10, 10, 10]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 h-[350px]">
                            <h3 className="text-lg font-bold mb-6">Manager Sales Performance ($)</h3>
                            <ResponsiveContainer width="100%" height="80%">
                                <BarChart layout="vertical" data={performanceData}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="totalSales" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <AlertTriangle className="text-amber-500" />
                                <h2 className="text-xl font-bold">Priority Stock Alerts</h2>
                            </div>
                            <div className="space-y-4">
                                {data?.lowStockItems?.length === 0 ? <p className="text-slate-500 text-sm">Supplies are sufficient.</p> :
                                    data?.lowStockItems?.slice(0, 3).map(item => (
                                        <div key={item._id} className="flex justify-between items-center p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                                            <div>
                                                <p className="font-bold">{item.itemName}</p>
                                                <p className="text-xs text-red-500 font-bold uppercase tracking-widest">{item.quantity} {item.unit} LEFT</p>
                                            </div>
                                            <button className="text-xs font-black text-red-600 underline">Order Supplies</button>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-indigo-600 p-10 rounded-3xl shadow-xl shadow-indigo-600/30 text-white flex flex-col justify-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black mb-4">Financial Reports</h2>
                                <p className="text-indigo-100 mb-8 max-w-sm">Detailed export of operational performance.</p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => handleExport('sales')} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all">Sales CSV</button>
                                    <button onClick={() => handleExport('expenses')} className="bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all">Expenses CSV</button>
                                    <button onClick={handleExportPDF} className="bg-indigo-400 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all border border-white/20">Executive PDF</button>
                                </div>
                            </div>
                            <Landmark className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
                        </div>
                    </div>
                </>
            )}

            {user?.role === 'manager' && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="text-amber-500" />
                        <h2 className="text-xl font-bold">Urgent Inventory Alerts</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data?.lowStockItems?.map(item => (
                            <div key={item._id} className="flex justify-between items-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                                <p className="font-bold text-slate-800 dark:text-white">{item.itemName}</p>
                                <p className="text-amber-600 font-black">{item.quantity} {item.unit} left</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <DashboardHistoryModal
                {...historyModal}
                onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
            />
        </div>
    );
};

export default Dashboard;
