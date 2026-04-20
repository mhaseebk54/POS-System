import { X, Printer, Download, ReceiptText } from 'lucide-react';

const ViewInvoiceModal = ({ isOpen, onClose, booking }) => {
    if (!isOpen || !booking) return null;

    const printInvoice = () => {
        window.print();
    };

    const printThermal = () => {
        const printWindow = window.open('', '_blank', 'width=300,height=600');
        const content = `
            <html>
                <head>
                    <style>
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            width: 280px; 
                            margin: 0 auto; 
                            padding: 10px; 
                            font-size: 12px;
                            color: #000;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .bold { font-weight: bold; }
                        .divider { border-top: 1px dashed #000; margin: 5px 0; }
                        .header { font-size: 16px; margin-bottom: 5px; }
                        .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                        .summary-row { display: flex; justify-content: space-between; margin-top: 2px; border-top: 1px solid #ddd; padding-top: 2px; }
                        @media print {
                            @page { margin: 0; }
                            body { margin: 0; padding: 5mm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <div class="header bold">LAUNDRY POS</div>
                        <div>Premium Cleaning Service</div>
                        <div>ID: ${booking.bookingId}</div>
                        <div>Status: <span class="bold">${booking.status}</span></div>
                        <div>Date: ${new Date(booking.createdAt).toLocaleDateString()}</div>
                        <div class="bold">Delivery: ${new Date(booking.deliveryDate).toLocaleDateString()}</div>
                        ${booking.deliveryTime ? `<div>Time: <span class="bold">${booking.deliveryTime}</span></div>` : ''}
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div>
                        <div class="bold">Customer:</div>
                        <div>${booking.customerName}</div>
                        <div>Ph: ${booking.customerPhone}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="bold">Services:</div>
                    ${booking.items.map(item => `
                        <div class="item-row">
                            <div style="flex: 1;">${item.product?.clothType || item.clothType} (${item.product?.serviceType || item.serviceType})</div>
                        </div>
                        <div class="item-row">
                            <div style="margin-left: 10px;">${item.quantity} x Rs. ${item.priceAtBooking}</div>
                            <div class="bold">Rs. ${item.total}</div>
                        </div>
                    `).join('')}
                    
                    <div class="divider"></div>
                    
                    <div class="item-row">
                        <span>Subtotal</span>
                        <span>Rs. ${booking.subtotal}</span>
                    </div>
                    <div class="item-row">
                        <span>Tax</span>
                        <span>+Rs. ${booking.totalTax}</span>
                    </div>
                    <div class="item-row">
                        <span>Disc</span>
                        <span>-Rs. ${booking.totalDiscount}</span>
                    </div>
                    <div class="item-row bold" style="font-size: 14px; margin-top: 4px;">
                        <span>TOTAL</span>
                        <span>Rs. ${booking.totalAmount}</span>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="item-row">
                        <span>Advance Paid</span>
                        <span>Rs. ${booking.paidAmount || 0}</span>
                    </div>
                    <div class="item-row bold">
                        <span>Balance</span>
                        <span>Rs. ${(booking.totalAmount - (booking.paidAmount || 0)).toFixed(2)}</span>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="text-center" style="margin-top: 20px;">
                        <div>THANK YOU!</div>
                        <div>Please keep this receipt for collection</div>
                    </div>
                    
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:p-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:rounded-none print:max-w-none print:h-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 print:hidden">
                    <h2 className="text-xl font-bold">Post-Wash Invoice</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={printThermal}
                            title="Thermal Print (POS)"
                            className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-2 font-bold text-xs"
                        >
                            <ReceiptText size={18} />
                            Thermal
                        </button>
                        <button
                            onClick={printInvoice}
                            title="Standard A4 Print"
                            className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 font-bold text-xs"
                        >
                            <Printer size={18} />
                            A4 Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800"><X size={20} /></button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 print:overflow-visible">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-indigo-600 mb-1">LAUNDRY POS</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Premium Laundry Services</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-lg">INVOICE</h3>
                            <p className="text-sm text-slate-500">Booking ID: <span className="text-indigo-600 font-bold">{booking.bookingId}</span></p>
                            <p className="text-sm text-slate-500">Status: <span className="text-indigo-600 font-bold uppercase">{booking.status}</span></p>
                            <p className="text-sm text-slate-500">Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-y border-slate-100 dark:border-slate-800 py-6">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Customer Info</p>
                            <p className="font-bold text-slate-900 dark:text-white uppercase">{booking.customerName}</p>
                            <p className="text-sm text-slate-500">{booking.customerPhone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Delivery Info</p>
                            <p className="font-bold text-slate-900 dark:text-white">Scheduled for</p>
                            <p className="text-sm text-slate-500">{new Date(booking.deliveryDate).toLocaleDateString()} {booking.deliveryTime && `at ${booking.deliveryTime}`}</p>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item & Service</th>
                                <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Price</th>
                                <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {booking.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-4">
                                        <p className="font-bold text-slate-800 dark:text-white">{item.product?.clothType || item.clothType}</p>
                                        <p className="text-xs text-slate-500">{item.product?.serviceType || item.serviceType}</p>
                                    </td>
                                    <td className="py-4 text-center text-sm font-medium">{item.quantity}</td>
                                    <td className="py-4 text-right text-sm">Rs. {item.priceAtBooking}</td>
                                    <td className="py-4 text-right font-bold">Rs. {item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="w-full max-w-xs ml-auto space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium">Rs. {booking.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total Tax</span>
                            <span className="text-amber-600 font-medium">+Rs. {booking.totalTax}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total Discount</span>
                            <span className="text-green-600 font-medium">-Rs. {booking.totalDiscount}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                            <span className="font-black text-slate-900 dark:text-white">Total Amount</span>
                            <span className="font-black text-xl text-indigo-600">Rs. {booking.totalAmount}</span>
                        </div>
                        <div className="pt-1 flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Payment Advance</span>
                            <span className="text-sm font-bold text-green-600">Rs. {booking.paidAmount || 0}</span>
                        </div>
                        <div className="pt-1 flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Balance</span>
                            <span className="text-sm font-bold text-red-600">Rs. {(booking.totalAmount - (booking.paidAmount || 0)).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="pt-10 text-center border-t border-slate-100 dark:border-slate-800 print:pt-20">
                        <p className="text-xs text-slate-400 font-medium">Thank you for choosing Laundry POS!</p>
                        <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">This is a system generated invoice</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoiceModal;
