import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../../assets/logo.png';
import GoogleTranslate from '../Common/GoogleTranslate';
import { settingsAPI } from '../../utils/api';
import LogoWhite from '../../assets/logo-white.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setSettings] = useState({
    company_phone: '',
    company_email: '',
    company_address: '',
  });
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.get();
        const data = response.data.data || {};
        setSettings({
          company_phone: data.company_phone || '',
          company_email: data.company_email || '',
          company_address: data.company_address || '',
        });
      } catch (error) {
        console.error('Error fetching header settings:', error);
      }
    };

    window.addEventListener('scroll', handleScroll);
    fetchSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Katalog', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Bar - commented out */}

      {/* Main Header */}
      <header className={`sticky top-0 z-10 border-b-2 border-slate-200 transition-all duration-300 ${
        isScrolled ? 'bg-white' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 space-x-3">
              <img src={Logo}  className="w-14 h-auto" />
              <img src={LogoWhite}  className="w-full h-8 md:h-14" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 ${
                    isActive(item.href) ? 'text-primary-600' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <GoogleTranslate />
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block py-3 px-4 text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200 ${
                    isActive(item.href) ? 'text-primary-600 bg-primary-50' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-4 pt-3 border-t border-gray-200 mt-3">
                <GoogleTranslate />
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;