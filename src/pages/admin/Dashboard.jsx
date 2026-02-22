import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import { 
  Package, 
  Image as ImageIcon, 
  Users, 
  TrendingUp,
  Calendar,
  Eye
} from 'lucide-react';
import { productsAPI, bannersAPI, getImageUrl } from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBanners: 0,
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, bannersRes] = await Promise.all([
        productsAPI.getAll(1, 5),
        bannersAPI.getAll()
      ]);

      setStats({
        totalProducts: productsRes.data.pagination?.totalItems || 0,
        totalBanners: bannersRes.data.data?.length || 0,
        recentProducts: productsRes.data.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    {
      title: 'Total Banners',
      value: stats.totalBanners,
      icon: ImageIcon,
      color: 'bg-green-500',
      link: '/admin/banners'
    },
    {
      title: 'Website Views',
      value: '2,543',
      icon: Eye,
      color: 'bg-purple-500',
      link: '#'
    },
    {
      title: 'Growth Rate',
      value: '+12%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      link: '#'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white" data-aos="fade-up">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-primary-100">Manage your Studio Almidad website content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="bg-ivory rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            {stat.link !== '#' && (
              <Link 
                to={stat.link}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-4 inline-block"
              >
                View Details →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-ivory rounded-lg shadow-md" data-aos="fade-up">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link 
              to="/admin/products"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
              {stats.recentProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img 
                    src={getImageUrl(product.image) || 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg'} 
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{product.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {product.description?.replace(/<[^>]*>/g, '').slice(0, 100)}...
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {new Date(product.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No products found</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6" data-aos="fade-up">
        <Link 
          to="/admin/products"
          className="bg-ivory rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <Package className="mx-auto text-primary-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Products</h3>
          <p className="text-gray-600 text-sm">Add, edit, or delete products</p>
        </Link>

        <Link 
          to="/admin/banners"
          className="bg-ivory rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <ImageIcon className="mx-auto text-green-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Banners</h3>
          <p className="text-gray-600 text-sm">Update homepage banners</p>
        </Link>

        <Link 
          to="/admin/settings"
          className="bg-ivory rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <Users className="mx-auto text-purple-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-600 text-sm">Update company information</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;