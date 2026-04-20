import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Plus, Search, Trash2, Edit2, Package, AlertCircle, X, ArrowUpCircle, ArrowDownCircle, History } from 'lucide-react';

const Inventory = () => {
    const { user } = useSelector((state) => state.auth);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [adjustData, setAdjustData] = useState({ amount: '', reason: '' });

    // Form State
    const [formData, setFormData] = useState({
        itemName: '',
        quantity: 0,
        unit: 'units',
        lowStockThreshold: 10
    });

    const fetchInventory = async () => {
        try {
            const response = await api.get('/inventory');
            setItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inventory', formData);
            setIsModalOpen(false);
            setFormData({ itemName: '', quantity: 0, unit: 'units', lowStockThreshold: 10 });
            fetchInventory();
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item. Please try again.');
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/inventory/adjust/${selectedItem._id}`, {
                amount: parseFloat(adjustData.amount),
                reason: adjustData.reason
            });
            setIsAdjustOpen(false);
            setAdjustData({ amount: '', reason: '' });
            fetchInventory();
        } catch (error) {
            alert('Adjustment failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/inventory/${id}`);
            fetchInventory();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const filteredItems = items.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Inventory Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track and manage your laundry supplies and stock.
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        <Plus size={20} />
                        Add Item
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Items</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{items.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Low Stock</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {items.filter(i => i.quantity <= i.lowStockThreshold).length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading inventory...</td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No items found</td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.itemName}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.quantity}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{item.unit}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.quantity <= item.lowStockThreshold
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {item.quantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => { setSelectedItem(item); setIsAdjustOpen(true); }}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                title="Adjust Stock"
                                            >
                                                <ArrowUpCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedItem(item); setIsHistoryOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Stock History"
                                            >
                                                <History size={18} />
                                            </button>
                                            {user?.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Item</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    name="itemName"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.itemName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                                    <select
                                        name="unit"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                    >
                                        <option value="units">Units</option>
                                        <option value="kg">Kg</option>
                                        <option value="liters">Liters</option>
                                        <option value="packs">Packs</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Low Stock Alert</label>
                                <input
                                    type="number"
                                    name="lowStockThreshold"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.lowStockThreshold}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Adjust Stock Modal */}
            {isAdjustOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Adjust Stock: {selectedItem.itemName}</h3>
                            <button onClick={() => setIsAdjustOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleAdjust} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Adjustment Amount (Negative to decrease)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    value={adjustData.amount}
                                    onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Reason</label>
                                <input
                                    type="text"
                                    placeholder="Purchase, Spillage, etc."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    value={adjustData.reason}
                                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">Confirm Adjustment</button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Stock History: {selectedItem.itemName}</h3>
                            <button onClick={() => setIsHistoryOpen(false)}><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {selectedItem.history?.length === 0 ? (
                                <p className="text-center text-slate-500">No history available.</p>
                            ) : (
                                selectedItem.history.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((log, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 border-b dark:border-slate-700 last:border-0">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{log.reason}</p>
                                            <p className="text-xs text-slate-500">{new Date(log.date).toLocaleString()}</p>
                                        </div>
                                        <p className={`font-black ${log.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {log.change > 0 ? '+' : ''}{log.change}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
