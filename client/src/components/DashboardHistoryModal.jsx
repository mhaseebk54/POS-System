
import { X, ShoppingBag, TrendingUp, TrendingDown, CheckCircle2, Clock, Landmark } from 'lucide-react';

const DashboardHistoryModal = ({ isOpen, onClose, title, items, type }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'revenue': return <TrendingUp className="text-indigo-600" />;
            case 'expenses': return <TrendingDown className="text-red-600" />;
            case 'bookings': return <ShoppingBag className="text-blue-600" />;
            case 'deliveries': return <CheckCircle2 className="text-emerald-600" />;
            case 'pending': return <Clock className="text-amber-600" />;
            case 'profit': return <Landmark className="text-indigo-600" />;
            default: return <ShoppingBag />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                            {getIcon()}
                        </div>
                        <h2 className="text-xl font-bold">{title} History</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items && items.length > 0 ? (
                        items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500/30 transition-all">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {item.customerName || item.customer?.fullName || item.itemName || item.description || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() :
                                            item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                        {item.bookingId && ` • ID: ${item.bookingId}`}
                                    </p>
                                    {item.description && (
                                        <p className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-tighter">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className={`font-black ${(type === 'expenses' || item.type === 'expenses') ? 'text-red-600' : 'text-indigo-600'}`}>
                                        {(item.amount || item.totalAmount) ?
                                            `${(type === 'expenses' || item.type === 'expenses') ? '-' : '+'} Rs. ${Math.abs(item.amount || item.totalAmount)}` :
                                            ''}
                                        {item.pendingAmount ? `Rs. ${item.pendingAmount}` : ''}
                                    </p>
                                    <div className="flex items-center justify-end gap-2">
                                        {item.type && (
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${item.type === 'revenue' ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                                                {item.type}
                                            </span>
                                        )}
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            {item.status || item.paymentStatus || item.category || 'Logged'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                            <ShoppingBag size={48} className="opacity-20" />
                            <p className="font-medium">No records found for today.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHistoryModal;
