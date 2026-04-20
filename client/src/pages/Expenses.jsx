import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Plus, DollarSign, Calendar, Tag, Trash2, Search, X, CheckSquare } from 'lucide-react';

const Expenses = () => {
    const { user } = useSelector((state) => state.auth);
    const [expenses, setExpenses] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [filters, setFilters] = useState({
        category: '',
        managerId: '',
        startDate: '',
        endDate: ''
    });

    const [formData, setFormData] = useState({
        category: 'Utilities',
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 10)
    });

    const categories = ['Utilities', 'Labor', 'Rent', 'Materials', 'Miscellaneous'];

    const fetchExpenses = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.managerId) params.append('managerId', filters.managerId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/expenses?${params.toString()}`);
            setExpenses(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await api.get('/auth/users'); // Assuming this endpoint exists to list staff
            setManagers(response.data.filter(u => u.role === 'manager'));
        } catch (error) {
            console.error('Error fetching managers:', error);
        }
    };

    useEffect(() => {
        fetchExpenses();
        if (user?.role === 'admin') fetchManagers();
    }, [filters]);

    const handleApprove = async (id) => {
        try {
            await api.patch(`/expenses/${id}/approve`);
            fetchExpenses();
        } catch (error) {
            console.error('Approval failed:', error);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            setIsModalOpen(false);
            setFormData({ category: 'Utilities', amount: '', description: '', date: new Date().toISOString().slice(0, 10) });
            fetchExpenses();
        } catch (error) {
            alert('Error adding expense');
        }
    };

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Expense Tracking
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor daily outgoings and operational costs.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/30"
                >
                    <Plus size={20} />
                    Add Expense
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Monthly Outflow</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rs. {totalExpenses.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters (Admin Only) */}
            {user?.role === 'admin' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Search size={18} className="text-slate-400" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Filter Expenses</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm outline-none"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            className="p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm outline-none"
                            value={filters.managerId}
                            onChange={(e) => setFilters({ ...filters, managerId: e.target.value })}
                        >
                            <option value="">All Managers</option>
                            {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                        </select>
                        <input
                            type="date"
                            className="p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm outline-none"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            className="p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm outline-none"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10">Loading...</td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-10 text-slate-400">No expenses recorded.</td></tr>
                        ) : (
                            expenses.map(exp => (
                                <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(exp.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-200">
                                        {exp.description || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {exp.isApproved ? (
                                            <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                                                <CheckSquare size={14} /> Approved
                                            </span>
                                        ) : (
                                            user?.role === 'admin' ? (
                                                <button
                                                    onClick={() => handleApprove(exp._id)}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-4"
                                                >
                                                    Approve
                                                </button>
                                            ) : (
                                                <span className="text-xs font-bold text-amber-500">Pending</span>
                                            )
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-red-600 dark:text-red-400">
                                        -Rs. {exp.amount}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Expense</h2>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Category</label>
                                <select
                                    name="category"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    value={formData.amount}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    name="description"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white p-3 rounded-xl font-bold">Save Expense</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
