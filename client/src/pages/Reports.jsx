
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import {
    FileText, Download, PieChart, Users, Package,
    TrendingUp, Calendar, Filter, FileSpreadsheet, FileJson
} from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports = () => {
    const { user } = useSelector((state) => state.auth);
    const [reportType, setReportType] = useState('sales');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reportType === 'customer') {
            fetchCustomers();
        }
    }, [reportType]);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const generateExport = async (format) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange.start) params.append('startDate', dateRange.start);
            if (dateRange.end) params.append('endDate', dateRange.end);
            if (reportType === 'customer') params.append('customerId', selectedCustomer);

            const res = await api.get(`/reports/data/${reportType}?${params.toString()}`);
            const data = res.data;

            if (format === 'csv') {
                exportCSV(data);
            } else if (format === 'xlsx') {
                exportXLSX(data);
            } else if (format === 'pdf') {
                exportPDF(data);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Could not generate report. Ensure all filters are set.');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = (data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) return alert("No data to export");

        let headers = [];
        let rows = [];

        if (reportType === 'sales') {
            headers = ['BookingID', 'Customer', 'Amount', 'Status', 'Date'];
            rows = data.map(b => [b.bookingId, b.customer?.fullName, b.totalAmount, b.status, new Date(b.createdAt).toLocaleDateString()]);
        } else if (reportType === 'expenses') {
            headers = ['Category', 'Amount', 'Date', 'Description'];
            rows = data.map(e => [e.category, e.amount, new Date(e.date).toLocaleDateString(), e.description]);
        } else if (reportType === 'inventory') {
            headers = ['Item', 'Quantity', 'Unit'];
            rows = data.map(i => [i.itemName, i.quantity, i.unit]);
        } else if (reportType === 'manager') {
            headers = ['Manager Name', 'Total Sales', 'Order Count'];
            rows = data.map(m => [m.name, m.totalSales, m.count]);
        }

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${reportType}_report.csv`);
        link.click();
    };

    const exportXLSX = (data) => {
        if (!data) return;
        const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${reportType}_report.xlsx`);
    };

    const exportPDF = (data) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`LAUNDRY POS - ${reportType.toUpperCase()} REPORT`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        let tableHead = [];
        let tableBody = [];

        if (reportType === 'sales' || reportType === 'customer') {
            tableHead = [['Booking ID', 'Customer', 'Amount', 'Status', 'Date']];
            tableBody = data.map(b => [b.bookingId, b.customerName || b.customer?.fullName, b.totalAmount, b.status, new Date(b.createdAt || b.date).toLocaleDateString()]);
        } else if (reportType === 'expenses') {
            tableHead = [['Category', 'Amount', 'Date', 'Description']];
            tableBody = data.map(e => [e.category, e.amount, new Date(e.date).toLocaleDateString(), e.description || 'N/A']);
        } else if (reportType === 'inventory') {
            tableHead = [['Item Name', 'Current Stock', 'Unit']];
            tableBody = data.map(i => [i.itemName, i.quantity, i.unit]);
        } else if (reportType === 'profit-loss') {
            tableHead = [['Metric', 'Value']];
            tableBody = [
                ['Total Revenue', `Rs. ${data.totalRevenue}`],
                ['Total Expenses', `Rs. ${data.totalExpenses}`],
                ['Net Profit', `Rs. ${data.totalRevenue - data.totalExpenses}`],
                ['Orders Processed', data.salesCount],
                ['Expense Entries', data.expenseCount]
            ];
        } else if (reportType === 'manager') {
            tableHead = [['Manager Name', 'Sales Volume', 'Order Total']];
            tableBody = data.map(m => [m.name, `Rs. ${m.totalSales}`, m.count]);
        }

        window.jspdf.autoTable(doc, {
            startY: 40,
            head: tableHead,
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`${reportType}_report.pdf`);
    };

    if (user?.role !== 'admin') {
        return <div className="p-20 text-center text-red-500 font-bold">Access Denied. Admin only.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white">Reporting Engine</h1>
                    <p className="text-slate-500">Generate and export business intelligence reports.</p>
                </div>
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                    <FileText size={32} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Type</label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'sales', label: 'Sales Report', icon: <TrendingUp size={18} /> },
                                    { id: 'expenses', label: 'Expense Report', icon: <Download size={18} /> },
                                    { id: 'inventory', label: 'Inventory Consumption', icon: <Package size={18} /> },
                                    { id: 'profit-loss', label: 'Profit & Loss', icon: <PieChart size={18} /> },
                                    { id: 'customer', label: 'Customer History', icon: <Users size={18} /> },
                                    { id: 'manager', label: 'Manager Performance', icon: <Users size={18} /> },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setReportType(t.id)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold ${reportType === t.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 dark:border-slate-900 text-slate-500'}`}
                                    >
                                        {t.icon}
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Filter size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium">Date Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        className="p-2 text-xs bg-slate-50 dark:bg-slate-900 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        className="p-2 text-xs bg-slate-50 dark:bg-slate-900 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    />
                                </div>
                            </div>

                            {reportType === 'customer' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Select Customer</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-sm"
                                        value={selectedCustomer}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                    >
                                        <option value="">Choose...</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.fullName}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-3xl font-black mb-4">Export Summary</h2>
                            <p className="text-indigo-100 mb-10 max-w-md">
                                You are about to export the <span className="text-white font-bold underline capitalize">{reportType}</span> report
                                {dateRange.start ? ` from ${dateRange.start} to ${dateRange.end}` : ' for all time'}.
                                Download in your preferred format below.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => generateExport('pdf')}
                                disabled={loading}
                                className="flex flex-col items-center gap-3 p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-3xl transition-all group"
                            >
                                <div className="p-3 bg-white rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <span className="font-bold">Adobe PDF</span>
                            </button>
                            <button
                                onClick={() => generateExport('xlsx')}
                                disabled={loading}
                                className="flex flex-col items-center gap-3 p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-3xl transition-all group"
                            >
                                <div className="p-3 bg-white rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <span className="font-bold">MS Excel</span>
                            </button>
                            <button
                                onClick={() => generateExport('csv')}
                                disabled={loading}
                                className="flex flex-col items-center gap-3 p-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-3xl transition-all group"
                            >
                                <div className="p-3 bg-white rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <FileJson size={24} />
                                </div>
                                <span className="font-bold">Generic CSV</span>
                            </button>
                        </div>

                        {loading && (
                            <div className="mt-8 flex items-center gap-3 text-indigo-100 animate-pulse">
                                <div className="w-4 h-4 rounded-full bg-white"></div>
                                <p className="font-bold">Compiling Report Data...</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                        <TrendingUp className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Data Integrity Guaranteed</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">All reports are generated using live database records as of {new Date().toLocaleTimeString()}.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
