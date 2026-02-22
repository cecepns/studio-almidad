import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { settingsAPI } from '../../utils/api';

const Footer = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_about: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      const settingsData = response.data.data || {};
      setSettings({
        company_name: settingsData.company_name || 'Studio Almidad',
        company_address: settingsData.company_address || 'Jl. Wolter Monginsidi Gg. VII No. 17 Sumber Salak, Kranjingan, Sumbersari, Jember, Jawa Timur 68123',
        company_phone: settingsData.company_phone || '',
        company_email: settingsData.company_email || '',
        company_about: settingsData.company_about || 'Studio Almidad bergerak di bidang Custom Islamic Art & Meaningful Gifts. Suvenir • Artwork • Apparel dengan desain berkualitas.'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div>
                <h3 className="text-lg font-bold">{settings.company_name}</h3>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              {settings.company_about}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">Tentang Kami</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-primary-400 transition-colors">Katalog</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              {settings.company_address && (
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-primary-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400 text-sm whitespace-pre-line">
                    {settings.company_address}
                  </span>
                </div>
              )}
              {settings.company_phone && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-primary-400" />
                  <span className="text-gray-400">{settings.company_phone}</span>
                </div>
              )}
              {settings.company_email && (
                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-primary-400" />
                  <span className="text-gray-400">{settings.company_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Flag Counter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Visitors</h4>
            <a href="https://info.flagcounter.com/1adR" target="_blank" rel="noopener noreferrer">
              <img src="https://s01.flagcounter.com/count2/1adR/bg_FFFFFF/txt_000000/border_CCCCCC/columns_2/maxflags_10/viewers_0/labels_0/pageviews_0/flags_0/percent_0/" alt="Flag Counter" className="border-0" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {settings.company_name}. All rights reserved.
            </p>
            {/* <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Terms of Service
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;