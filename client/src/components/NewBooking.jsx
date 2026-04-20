
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Search, Plus, Trash2, Calendar, User, ShoppingBag, CheckCircle, X, UserPlus, Phone } from 'lucide-react';

const NewBooking = ({ isOpen, onClose, onSuccess }) => {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [bookingItems, setBookingItems] = useState([]);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [advancePaid, setAdvancePaid] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [deliveryTime, setDeliveryTime] = useState('18:00');
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
    const [isQuickAdd, setIsQuickAdd] = useState(false);
    const [quickCustomer, setQuickCustomer] = useState({ fullName: '', phone: '' });

    // Add Item Form
    const [currentItem, setCurrentItem] = useState({
        productId: '',
        quantity: 1,
    });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (bookingItems.length > 0) {
            const calculated = calculateDeliveryDate();
            setDeliveryDate(calculated.toISOString().slice(0, 10));
        }
    }, [bookingItems]);

    const fetchInitialData = async () => {
        try {
            const [custRes, prodRes] = await Promise.all([
                api.get('/customers'),
                api.get('/products')
            ]);
            setCustomers(custRes.data);
            setProducts(prodRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const addItem = () => {
        if (!currentItem.productId || !currentItem.quantity || currentItem.quantity < 1) {
            alert('Please select a service and enter a valid quantity.');
            return;
        }
        const product = products.find(p => p._id === currentItem.productId);

        const price = product.pricePerUnit;
        const qty = currentItem.quantity;
        const itemSubtotal = price * qty;
        const taxAmount = (itemSubtotal * (product.tax || 0)) / 100;
        const discountAmount = (itemSubtotal * (product.discount || 0)) / 100;
        const itemTotal = itemSubtotal + taxAmount - discountAmount;

        const newItem = {
            product: product._id,
            clothType: product.clothType,
            serviceType: product.serviceType,
            quantity: qty,
            priceAtBooking: price,
            tax: product.tax || 0,
            discount: product.discount || 0,
            total: itemTotal,
            deliveryDays: product.deliveryTimeDays
        };
        setBookingItems([...bookingItems, newItem]);
        setCurrentItem({ productId: '', quantity: 1 });
    };

    const removeItem = (index) => {
        setBookingItems(bookingItems.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => bookingItems.reduce((acc, item) => acc + (item.priceAtBooking * item.quantity), 0);
    const calculateTotalTax = () => bookingItems.reduce((acc, item) => acc + ((item.priceAtBooking * item.quantity * item.tax) / 100), 0);
    const calculateTotalDiscount = () => bookingItems.reduce((acc, item) => acc + ((item.priceAtBooking * item.quantity * item.discount) / 100), 0);
    const calculateTotal = () => calculateSubtotal() + calculateTotalTax() - calculateTotalDiscount();

    const calculateDeliveryDate = () => {
        if (bookingItems.length === 0) return new Date();
        const maxDays = Math.max(...bookingItems.map(i => i.deliveryDays || 2), 2);
        const date = new Date();
        if (isNaN(maxDays)) {
            date.setDate(date.getDate() + 2);
        } else {
            date.setDate(date.getDate() + maxDays);
        }
        return date;
    };

    const handleSubmit = async () => {
        if (!selectedCustomer && !isQuickAdd) {
            alert('Please select or register a customer.');
            return;
        }

        if (isQuickAdd && (!quickCustomer.fullName || !quickCustomer.phone)) {
            alert('Please enter both name and phone for new customer.');
            return;
        }

        if (bookingItems.length === 0) {
            alert('Please add at least one item.');
            return;
        }

        try {
            let customerId = selectedCustomer?._id;

            // Register customer on the fly if needed
            if (isQuickAdd) {
                const custRes = await api.post('/customers', quickCustomer);
                customerId = custRes.data._id;
            }

            const subtotal = calculateSubtotal();
            const totalTax = calculateTotalTax();
            const totalDiscount = calculateTotalDiscount();
            const totalAmount = calculateTotal();

            await api.post('/bookings', {
                customerId: customerId,
                items: bookingItems,
                subtotal: subtotal.toFixed(2),
                totalTax: totalTax.toFixed(2),
                totalDiscount: totalDiscount.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
                deliveryDate: deliveryDate,
                deliveryTime: deliveryTime,
                paidAmount: parseFloat(advancePaid || 0),
                paymentMethod: paymentMethod
            });

            onSuccess();
            onClose();
            // Reset
            setSelectedCustomer(null);
            setBookingItems([]);
            setAdvancePaid(0);
            setPaymentMethod('Cash');
            setDeliveryTime('18:00');
            setDeliveryDate(new Date().toISOString().slice(0, 10));
            setIsQuickAdd(false);
            setQuickCustomer({ fullName: '', phone: '' });
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Failed to create booking.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden transform transition-all">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Booking</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Step 1: Select customer & items</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Left: Selection */}
                    <div className="w-full lg:w-1/2 p-6 border-r border-slate-100 dark:border-slate-800 overflow-y-auto space-y-6">
                        {/* Customer Selection */}
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    1. Customer Info
                                </label>
                                <button
                                    onClick={() => { setIsQuickAdd(!isQuickAdd); setSelectedCustomer(null); }}
                                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${isQuickAdd ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {isQuickAdd ? <Search size={12} /> : <UserPlus size={12} />}
                                    {isQuickAdd ? 'Switch to Search' : 'Quick Register'}
                                </button>
                            </div>

                            {isQuickAdd ? (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold"
                                            value={quickCustomer.fullName}
                                            onChange={(e) => setQuickCustomer({ ...quickCustomer, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Cellphone Number"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold"
                                            value={quickCustomer.phone}
                                            onChange={(e) => setQuickCustomer({ ...quickCustomer, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : !selectedCustomer ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by name or phone..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            value={searchCustomer}
                                            onChange={(e) => setSearchCustomer(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800">
                                        {customers
                                            .filter(c => c.fullName.toLowerCase().includes(searchCustomer.toLowerCase()) || c.phone.includes(searchCustomer))
                                            .map(c => (
                                                <button
                                                    key={c._id}
                                                    onClick={() => setSelectedCustomer(c)}
                                                    className="w-full p-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        {c.fullName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-200">{c.fullName}</p>
                                                        <p className="text-xs text-slate-500">{c.phone}</p>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{selectedCustomer.fullName}</p>
                                            <p className="text-sm text-indigo-600 dark:text-indigo-400">{selectedCustomer.phone}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="text-xs text-red-500 hover:underline font-medium">Change</button>
                                </div>
                            )}
                        </section>

                        {/* Item Addition */}
                        <section className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                                2. Add Service
                            </label>
                            <div className="flex flex-col gap-4">
                                <select
                                    className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={currentItem.productId}
                                    onChange={(e) => setCurrentItem({ ...currentItem, productId: e.target.value })}
                                >
                                    <option value="">Select Service...</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.clothType} - {p.serviceType} (Rs. {p.pricePerUnit})</option>
                                    ))}
                                </select>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Qty"
                                            className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={currentItem.quantity}
                                            onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <button
                                        onClick={addItem}
                                        disabled={!currentItem.productId}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
                                    >
                                        <Plus size={20} />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Advance Payment */}
                        <section className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                            <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-4 uppercase tracking-wider">
                                3. Payment Advance (Optional)
                            </label>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            placeholder="Enter advance amount..."
                                            className="w-full p-2.5 bg-white dark:bg-slate-700 border border-emerald-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-600"
                                            value={advancePaid}
                                            onChange={(e) => setAdvancePaid(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <select
                                            className="w-full p-2.5 bg-white dark:bg-slate-700 border border-emerald-200 dark:border-emerald-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="POS Card">POS Card</option>
                                            <option value="Online Transfer">Online Transfer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Delivery Schedule */}
                        <section className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                            <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-4 uppercase tracking-wider">
                                4. Delivery Schedule
                            </label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-blue-400 block mb-1 ml-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 bg-white dark:bg-slate-700 border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-blue-400 block mb-1 ml-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-2.5 bg-white dark:bg-slate-700 border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                                        value={deliveryTime}
                                        onChange={(e) => setDeliveryTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Summary & Checkout */}
                    <div className="w-full lg:w-1/2 p-6 flex flex-col bg-slate-50/30 dark:bg-slate-900/20">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                            Order Summary
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                            {bookingItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-10 opacity-60">
                                    <ShoppingBag size={48} className="mb-4" />
                                    <p>No items added yet.</p>
                                </div>
                            ) : (
                                bookingItems.map((item, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-xs font-bold w-12 text-center">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{item.clothType}</p>
                                                <p className="text-xs text-slate-500">{item.serviceType}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-slate-900 dark:text-indigo-400">Rs. {item.total}</p>
                                            <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Totals */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium">Rs. {calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Tax</span>
                                    <span className="font-medium text-amber-600">+Rs. {calculateTotalTax().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Discount</span>
                                    <span className="font-medium text-green-600">-Rs. {calculateTotalDiscount().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-semibold text-indigo-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Est. Delivery</span>
                                    </div>
                                    <span>{calculateDeliveryDate().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Total Amount</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">Rs. {calculateTotal().toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={
                                        bookingItems.length === 0 ||
                                        (!isQuickAdd && !selectedCustomer) ||
                                        (isQuickAdd && (!quickCustomer.fullName || !quickCustomer.phone))
                                    }
                                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30"
                                >
                                    <CheckCircle size={20} />
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewBooking;
