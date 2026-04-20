
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, UserCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            dispatch(loginSuccess({ user: res.data, token: res.data.accessToken }));
            navigate('/');
        } catch (err) {
            dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-dark-background overflow-hidden relative selection:bg-indigo-100">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-3xl -mr-96 -mt-96 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50 dark:bg-sky-950/10 rounded-full blur-3xl -ml-64 -mb-64"></div>

            <div className="w-full max-w-lg p-4 relative z-10">
                <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-2xl p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800">
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 mb-6 rotate-3">
                            <Sparkles size={36} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-3">Enterprise POS</h1>
                        <p className="text-slate-400 font-medium">Laundry Business Intelligence Suite</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Corporate Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-dark-background border-2 border-transparent focus:border-indigo-600/20 focus:bg-white dark:focus:bg-dark-background rounded-[1.8rem] outline-none transition-all dark:text-white font-medium"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-dark-background border-2 border-transparent focus:border-indigo-600/20 focus:bg-white dark:focus:bg-dark-background rounded-[1.8rem] outline-none transition-all dark:text-white font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-500 font-bold">
                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-indigo-600 transition-all cursor-pointer" />
                                Remember login
                            </label>
                            <button type="button" className="text-indigo-600 font-bold hover:underline underline-offset-4">Forgot Access Key?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none mt-10"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Secure Access</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center pt-8 border-t border-slate-50 dark:border-slate-800">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <UserCircle size={16} /> Restricted Access Suite
                        </p>
                    </div>
                </div>

                <p className="text-center mt-10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                    &copy; 2026 Enterprise Professional Services
                </p>
            </div>

            {/* Decorative Side Blobs */}
            <div className="fixed top-1/4 -right-20 w-4 h-40 bg-indigo-600/20 rounded-full blur-2xl"></div>
            <div className="fixed bottom-1/4 -left-20 w-4 h-40 bg-indigo-600/20 rounded-full blur-2xl"></div>
        </div>
    );
};

export default Login;
