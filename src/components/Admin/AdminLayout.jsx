import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  FolderTree
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage or API
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-ivory shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-6 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-primary-100 p-2 rounded-full">
                <User size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.email || 'admin@denko.co.id'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1 px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="absolute bottom-4 left-3 right-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="bg-ivory shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Admin Panel'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View Website
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;