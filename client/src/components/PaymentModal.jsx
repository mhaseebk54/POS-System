
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CreditCard, DollarSign, Wallet, CheckCircle2, X, Clock } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const [method, setMethod] = useState('Cash');
    const [amountPaid, setAmountPaid] = useState(0);
    const [loading, setLoading] = useState(false);

    // Set initial amount to balance
    useEffect(() => {
        if (isOpen && booking) {
            setAmountPaid(booking.totalAmount - (booking.paidAmount || 0));
        }
    }, [booking, isOpen]);

    const handlePayment = async () => {
        if (amountPaid <= 0) return alert('Enter a valid amount');

        setLoading(true);
        try {
            await api.post('/invoices', {
                bookingId: booking._id,
                currentPaidAmount: parseFloat(amountPaid),
                payments: [{
                    method,
                    amount: parseFloat(amountPaid),
                    date: new Date()
                }]
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !booking) return null;

    const balance = booking.totalAmount - (booking.paidAmount || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold">Checkout & Payment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total</p>
                            <p className="text-xl font-bold">Rs. {booking.totalAmount}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Balance</p>
                            <p className="text-xl font-black text-indigo-600">Rs. {balance.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Pay Amount</label>
                            <input
                                type="number"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-2xl font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all"
                                value={amountPaid}
                                max={balance}
                                onChange={(e) => setAmountPaid(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Payment Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'Cash', icon: <Wallet size={16} /> },
                                    { id: 'POS Card', icon: <CreditCard size={16} /> },
                                    { id: 'Online Transfer', icon: <DollarSign size={16} /> },
                                    { id: 'Pending', icon: <Clock size={16} /> }
                                ].map(pm => (
                                    <button
                                        key={pm.id}
                                        onClick={() => setMethod(pm.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-xs ${method === pm.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-50 dark:border-slate-800 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {pm.icon}
                                        {pm.id}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePayment();
                        }}
                        disabled={loading || amountPaid <= 0 || parseFloat(amountPaid) > balance + 0.01}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-slate-300"
                    >
                        {loading ? 'Processing...' : <><CheckCircle2 size={24} /> Confirm Payment</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
