
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { UserPlus, Search, Shield, Phone, Mail, X, Trash2, Key, Lock } from 'lucide-react';

const Managers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'manager'
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-manager', formData);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', phone: '', role: 'manager' });
            fetchUsers();
            alert('Staff member added successfully!');
        } catch (error) {
            console.error('Registration error details:', error);
            const errorMsg = error.response?.data?.message || 'Error adding staff member.';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await api.delete(`/auth/users/${id}`);
                fetchUsers();
                alert('Staff member deleted successfully!');
            } catch (error) {
                console.error('Delete error:', error);
                alert('Error deleting staff member.');
            }
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/auth/users/${selectedUser._id}/password`, { password: newPassword });
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setSelectedUser(null);
            alert('Password updated successfully!');
        } catch (error) {
            console.error('Password update error:', error);
            alert('Error updating password.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Staff Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage administrators and operational managers.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/30"
                >
                    <UserPlus size={20} />
                    Add New Staff
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center">
                <Search className="text-slate-400 ml-2" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full p-2 bg-transparent outline-none ml-2 text-slate-700 dark:text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-slate-500">Loading staff members...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-500 font-medium">No staff members found.</div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user._id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    <Shield size={24} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-50 text-purple-500 dark:bg-purple-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}>
                                    {user.role}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h3>
                            <div className="space-y-2 mb-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <Mail size={14} /> {user.email}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <Phone size={14} /> {user.phone || 'No phone'}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsPasswordModalOpen(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors text-sm font-semibold"
                                >
                                    <Key size={14} />
                                    Password
                                </button>
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in text-slate-900 dark:text-white">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add Staff Member</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-700"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Full Name</label>
                                <input
                                    name="name"
                                    required
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Phone Number</label>
                                <input
                                    name="phone"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Role</label>
                                <select
                                    name="role"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all">
                                Register Staff
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Update Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in text-slate-900 dark:text-white">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Update Password</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Updating password for {selectedUser?.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsPasswordModalOpen(false);
                                    setSelectedUser(null);
                                    setNewPassword('');
                                }}
                                className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all">
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Managers;
