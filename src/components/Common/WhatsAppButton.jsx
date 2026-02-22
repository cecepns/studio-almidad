import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { settingsAPI } from '../../utils/api';

const WhatsAppButton = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const response = await settingsAPI.get();
        const phone = response.data.data?.company_phone || '';
        setPhoneNumber(phone);
      } catch (error) {
        console.error('Error fetching phone number:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumber();
  }, []);

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    // If it doesn't start with country code, assume it's Indonesian (62)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const handleClick = () => {
    if (!phoneNumber) return;
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const whatsappUrl = `https://wa.me/${formattedPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading || !phoneNumber) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
        aria-label="Hubungi kami via WhatsApp"
        title="Hubungi kami via WhatsApp"
      >
        <div className="relative">
          <MessageCircle size={28} className="group-hover:scale-110 transition-transform relative z-10" />
        </div>
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
      </button>
    </div>
  );
};

export default WhatsAppButton;

