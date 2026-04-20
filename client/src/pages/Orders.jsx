
import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    ShoppingBag, Search, Filter, Clock, CheckCircle2,
    MoreVertical, Plus, CreditCard, Receipt, Hash,
    Calendar, User, AlertCircle
} from 'lucide-react';
import NewBooking from '../components/NewBooking';
import PaymentModal from '../components/PaymentModal';
import ViewInvoiceModal from '../components/ViewInvoiceModal';

const Orders = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await api.get(`/bookings${filterStatus ? `?status=${filterStatus}` : ''}`);
            const data = response.data;
            setBookings(data);

            // Sync selected booking if it exists
            if (selectedBooking) {
                const updated = data.find(b => b._id === selectedBooking._id);
                if (updated) setSelectedBooking(updated);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filterStatus]);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: newStatus });
            await fetchBookings();
            setOpenMenuId(null);
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Status update failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const updatePaymentStatus = async (id, newStatus) => {
        try {
            const response = await api.put(`/bookings/${id}/payment-status`, { paymentStatus: newStatus });
            if (response.status === 200) {
                await fetchBookings();
                setOpenMenuId(null);
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert(`Payment update failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleViewInvoice = (booking) => {
        setSelectedBooking(booking);
        setIsInvoiceOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Booked': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'In-Process': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
            case 'Ready': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
            case 'Delivered': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Booking Terminal</h1>
                    <p className="text-slate-500 font-medium">Control center for all active and completed cycles.</p>
                </div>
                <button
                    onClick={() => setIsNewBookingOpen(true)}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] font-black shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Initiate Booking
                </button>
            </div>

            {/* Filter Bar */}
            <div className="card p-3 flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterStatus('')}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${!filterStatus ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    Comprehensive
                </button>
                {['Booked', 'In-Process', 'Ready', 'Delivered'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders Feed */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Analyzing operational history...</div>
                ) : bookings.length === 0 ? (
                    <div className="card p-24 text-center border-dashed border-2 border-slate-100 dark:border-slate-800">
                        <ShoppingBag size={64} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-2xl font-black text-slate-700 dark:text-white">Zero Active Cycle</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mt-2">The booking registry is currently empty for the selected filters.</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="card p-8 flex flex-col xl:flex-row items-center gap-10 group">
                            <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-8">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-dark-background flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={32} />
                                </div>

                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400">
                                            <Hash size={12} /> {booking.bookingId}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{booking.customer?.fullName}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Calendar size={14} className="text-slate-300" />
                                            {new Date(booking.deliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {booking.deliveryTime && <span className="ml-1 text-indigo-500">at {booking.deliveryTime}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <User size={14} className="text-slate-300" />
                                            Managed by {booking.createdBy?.name || 'Automated'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                                {booking.items.map((item, i) => (
                                    <div key={i} className="px-3 py-2 bg-slate-50 dark:bg-dark-background border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                                        <AlertCircle size={10} className="text-indigo-400" />
                                        {item.quantity} {item.product?.clothType}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-8 border-t xl:border-t-0 xl:border-l border-slate-50 dark:border-slate-800 pt-8 xl:pt-0 xl:pl-10 w-full xl:w-auto justify-between">
                                <div className="text-center xl:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contract Total</p>
                                    <p className="text-3xl font-black text-indigo-600 dark:text-cyan-400 tracking-tighter">Rs. {booking.totalAmount}</p>
                                    <div className="mt-1 flex items-center justify-end gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${booking.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${booking.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{booking.paymentStatus}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {booking.paymentStatus !== 'Paid' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBooking(booking);
                                                setIsPaymentOpen(true);
                                            }}
                                            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                            title="Collect Revenue"
                                        >
                                            <CreditCard size={20} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleViewInvoice(booking)}
                                        className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
                                        title="Generate Documentation"
                                    >
                                        <Receipt size={20} />
                                    </button>

                                    <div className="relative z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === booking._id ? null : booking._id);
                                            }}
                                            className="p-5 bg-slate-50 dark:bg-dark-background border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                                            title="Actions"
                                        >
                                            <MoreVertical size={24} />
                                        </button>

                                        {openMenuId === booking._id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setOpenMenuId(null)}
                                                ></div>
                                                <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-dark-surface rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-20 animate-fade-in divide-y divide-slate-50 dark:divide-slate-800">
                                                    <div className="pb-2">
                                                        <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Workflow Control</p>
                                                        {['Booked', 'In-Process', 'Ready', 'Delivered'].map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={(e) => { e.stopPropagation(); updateStatus(booking._id, s); }}
                                                                className={`w-full px-4 py-3 text-left text-sm font-bold rounded-2xl transition-all ${booking.status === s ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="py-2">
                                                        <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Manual Payment Update</p>
                                                        {['Pending', 'Partial', 'Paid'].map(ps => (
                                                            <button
                                                                key={ps}
                                                                onClick={(e) => { e.stopPropagation(); updatePaymentStatus(booking._id, ps); }}
                                                                className={`w-full px-4 py-3 text-left text-sm font-bold rounded-2xl transition-all ${booking.paymentStatus === ps ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                            >
                                                                {ps}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="pt-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(booking._id, 'Cancelled'); }}
                                                            className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10"
                                                        >
                                                            Abort Cycle
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <NewBooking
                isOpen={isNewBookingOpen}
                onClose={() => setIsNewBookingOpen(false)}
                onSuccess={fetchBookings}
            />

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                booking={selectedBooking}
                onSuccess={fetchBookings}
            />

            <ViewInvoiceModal
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                booking={selectedBooking}
            />
        </div>
    );
};

export default Orders;
