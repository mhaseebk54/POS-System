import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Plus, Search, Trash2, Edit2, Tag, Clock, DollarSign, X } from 'lucide-react';

const Products = () => {
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [inventoryItems, setInventoryItems] = useState([]);

    const [formData, setFormData] = useState({
        clothType: '',
        serviceType: 'Wash',
        pricePerUnit: '',
        deliveryTimeDays: 2,
        tax: 0,
        discount: 0,
        consumables: []
    });

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventoryItems(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (product) => {
        setFormData({
            clothType: product.clothType,
            serviceType: product.serviceType,
            pricePerUnit: product.pricePerUnit,
            deliveryTimeDays: product.deliveryTimeDays,
            tax: product.tax || 0,
            discount: product.discount || 0,
            consumables: product.consumables || []
        });
        setEditId(product._id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/products/${editId}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            setEditId(null);
            setFormData({ clothType: '', serviceType: 'Wash', pricePerUnit: '', deliveryTimeDays: 2, tax: 0, discount: 0, consumables: [] });
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product. Please make sure you are an Admin.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product. Admin access required.');
        }
    };

    const addConsumable = () => {
        setFormData({
            ...formData,
            consumables: [...formData.consumables, { inventoryItem: '', quantity: 0 }]
        });
    };

    const removeConsumable = (index) => {
        const updated = formData.consumables.filter((_, i) => i !== index);
        setFormData({ ...formData, consumables: updated });
    };

    const handleConsumableChange = (index, field, value) => {
        const updated = [...formData.consumables];
        updated[index][field] = value;
        setFormData({ ...formData, consumables: updated });
    };

    const filteredProducts = products.filter(product =>
        product.clothType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Products & Services
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your laundry price list and services.
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Grid for Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-slate-500 col-span-full text-center py-10">Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                    <p className="text-slate-500 col-span-full text-center py-10">No products found.</p>
                ) : (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <Tag size={24} />
                                </div>
                                {user?.role === 'admin' && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{product.clothType}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{product.serviceType}</p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                        <DollarSign size={16} className="text-slate-400" />
                                        <span className="font-semibold text-lg">Rs. {product.pricePerUnit}</span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] font-bold mt-1">
                                        {product.tax > 0 && <span className="text-amber-600 bg-amber-50 px-1.5 rounded">TAX: {product.tax}%</span>}
                                        {product.discount > 0 && <span className="text-green-600 bg-green-50 px-1.5 rounded">DISC: {product.discount}%</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                    <Clock size={14} />
                                    <span>{product.deliveryTimeDays} days</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editId ? 'Edit Service' : 'Add Service'}
                            </h3>
                            <button
                                onClick={() => { setIsModalOpen(false); setEditId(null); setFormData({ clothType: '', serviceType: 'Wash', pricePerUnit: '', deliveryTimeDays: 2, tax: 0, discount: 0 }); }}
                                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cloth Type</label>
                                <input
                                    type="text"
                                    name="clothType"
                                    placeholder="e.g. Shirt, Suit, Blanket"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.clothType}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                                <select
                                    name="serviceType"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.serviceType}
                                    onChange={handleInputChange}
                                >
                                    <option value="Wash">Wash</option>
                                    <option value="Dry Clean">Dry Clean</option>
                                    <option value="Iron">Iron</option>
                                    <option value="Stain Remove">Stain Remove</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price</label>
                                    <input
                                        type="number"
                                        name="pricePerUnit"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.pricePerUnit}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Days</label>
                                    <input
                                        type="number"
                                        name="deliveryTimeDays"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.deliveryTimeDays}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax (%)</label>
                                    <input
                                        type="number"
                                        name="tax"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.tax}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discount"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold">Consumables (Auto-deduct)</label>
                                    <button
                                        type="button"
                                        onClick={addConsumable}
                                        className="text-xs text-indigo-600 font-bold hover:underline"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                {formData.consumables.map((c, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <select
                                            className="flex-1 p-2 text-sm bg-slate-50 dark:bg-slate-900 border rounded-lg overflow-hidden"
                                            value={c.inventoryItem}
                                            onChange={(e) => handleConsumableChange(i, 'inventoryItem', e.target.value)}
                                        >
                                            <option value="">Select supply...</option>
                                            {inventoryItems.map(inv => (
                                                <option key={inv._id} value={inv._id}>{inv.itemName} ({inv.unit})</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="w-20 p-2 text-sm bg-slate-50 dark:bg-slate-900 border rounded-lg"
                                            value={c.quantity}
                                            onChange={(e) => handleConsumableChange(i, 'quantity', parseFloat(e.target.value))}
                                        />
                                        <button type="button" onClick={() => removeConsumable(i)} className="text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
