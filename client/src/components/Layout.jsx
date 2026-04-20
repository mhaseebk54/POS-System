import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, ShoppingCart, Users, Package,
    Tag, Receipt, Settings, LogOut, Sun, Moon,
    ChevronRight, BarChart3, UserCircle
} from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useTheme();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
        { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
        { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
        { name: 'Products', path: '/products', icon: <Tag size={20} /> },
        { name: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ name: 'Staff', path: '/managers', icon: <UserCircle size={20} /> });
        menuItems.push({ name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> });
    }

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    };

    return (
        <div className="flex h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-dark-surface border-r border-slate-100 dark:border-slate-800 flex flex-col z-20 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                            <Package size={24} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
                            LAUNDRY POS
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 mt-2">Main Menu</p>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive(item.path)
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-cyan-400'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-cyan-400'} transition-colors`}>
                                    {item.icon}
                                </span>
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </div>
                            {isActive(item.path) && <ChevronRight size={14} className="opacity-50" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 space-y-4 border-t border-slate-50 dark:border-slate-800">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-sm font-bold transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <div className="flex items-center gap-3">
                            {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-amber-400" />}
                            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'light' ? 'bg-slate-300' : 'bg-indigo-600'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === 'light' ? 'left-1' : 'left-6'}`}></div>
                        </div>
                    </button>

                    <button
                        onClick={() => dispatch(logout())}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>

                    <div className="flex items-center gap-3 px-4 pt-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {user?.name?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-black truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-light-surface dark:bg-dark-background/50 relative">
                <div className="max-w-7xl mx-auto p-8 lg:p-12 animate-fade-in">
                    {children}
                </div>

                {/* Decorative background elements */}
                <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="fixed bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            </main>
        </div>
    );
};

export default Layout;
