
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Search, Trash2, Edit2, Users, Phone, X, Mail, MapPin, Hash, FileText } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        cnic: '',
        notes: ''
    });

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers', formData);
            setIsModalOpen(false);
            setFormData({ fullName: '', phone: '', email: '', address: '', cnic: '', notes: '' });
            fetchCustomers();
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Error adding customer. Phone number might be duplicate.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Client Directory</h1>
                    <p className="text-slate-500 font-medium">Relationships and service history database.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] font-black shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Register Client
                </button>
            </div>

            {/* Search & Stats Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 card p-2 flex items-center gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-dark-background rounded-2xl text-slate-400">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by name or primary phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-slate-700 dark:text-white placeholder:text-slate-300"
                    />
                </div>
                <div className="card p-4 flex flex-col justify-center items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Database</p>
                    <p className="text-2xl font-black">{customers.length}</p>
                </div>
            </div>

            {/* Grid for Customers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-bold animate-pulse">Synchronizing database...</div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="col-span-full card p-20 text-center border-dashed">
                        <Users size={48} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-xl font-black text-slate-700 dark:text-slate-300">No matches found</h3>
                        <p className="text-slate-400 max-w-xs mx-auto">Try a different search term or add a new client to the registry.</p>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div key={customer._id} className="card p-8 group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner">
                                    {customer.fullName[0]}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                    <button className="p-2.5 bg-slate-50 dark:bg-dark-background rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer._id)}
                                        className="p-2.5 bg-slate-50 dark:bg-dark-background rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate">{customer.fullName}</h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500/60 mt-1">Professional Client</p>
                                </div>

                                <div className="pt-4 space-y-3 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <div className="p-1.5 bg-slate-50 dark:bg-dark-background rounded-lg text-slate-400"><Phone size={14} /></div>
                                        <span className="text-sm font-bold tracking-tight">{customer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <div className="p-1.5 bg-slate-50 dark:bg-dark-background rounded-lg text-slate-400"><Mail size={14} /></div>
                                        <span className="text-sm font-bold tracking-tight truncate">{customer.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <div className="p-1.5 bg-slate-50 dark:bg-dark-background rounded-lg text-slate-400"><MapPin size={14} /></div>
                                        <span className="text-sm font-bold tracking-tight truncate">{customer.address || 'Standard HQ'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Accent Decoration */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-600/10 transition-colors"></div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-dark-surface rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in border border-white/20">
                        <div className="flex justify-between items-center p-10 border-b border-slate-50 dark:border-slate-800">
                            <div>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-white">New Client Registry</h3>
                                <p className="text-slate-500 font-medium mt-1">Enter complete details for audit-grade recording.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl transition-all"
                            >
                                <X size={28} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Full Identity Name</label>
                                <div className="relative group">
                                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" name="fullName" required className="input-field pl-12" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Direct Contact</label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" name="phone" required className="input-field pl-12" value={formData.phone} onChange={handleInputChange} placeholder="+1 234 567 890" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Digital Correspondence</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="email" name="email" className="input-field pl-12" value={formData.email} onChange={handleInputChange} placeholder="hello@client.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">National ID / CNIC</label>
                                <div className="relative group">
                                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" name="cnic" className="input-field pl-12" value={formData.cnic} onChange={handleInputChange} placeholder="42101-XXXX-X" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Physical Residency</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" name="address" className="input-field pl-12" value={formData.address} onChange={handleInputChange} placeholder="123 Corporate Blvd, Suite 456" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Internal Operational Notes</label>
                                <div className="relative group">
                                    <FileText className="absolute left-5 top-[18px] text-slate-400" size={18} />
                                    <textarea name="notes" rows="2" className="input-field pl-12 pt-3.5 resize-none" value={formData.notes} onChange={handleInputChange} placeholder="Specify any preferences or account history..." />
                                </div>
                            </div>
                            <div className="md:col-span-2 pt-6">
                                <button type="submit" className="btn-primary w-full p-6 text-lg uppercase tracking-[0.2em]">Confirm & Registry Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
