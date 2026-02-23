import { useState, useEffect } from 'react';
import AOS from 'aos';
import SEO from '../components/Common/SEO';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Instagram,
} from 'lucide-react';
import { settingsAPI } from '../utils/api';

const defaultAddress = `Jl. Wolter Monginsidi Gg. VII No. 17 Sumber Salak
Kranjingan, Sumbersari
Jember, Jawa Timur 68123`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_warehouse_address: '',
    company_phone: '',
    company_email: '',
    company_working_hours: '',
    google_maps_embed: '',
    contact_location_title: '',
    contact_location_description: '',
    contact_hero_title: '',
    contact_hero_subtitle: '',
    instagram_username: '',
    instagram_url: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      const settingsData = response.data.data || {};
      setSettings({
        company_name: settingsData.company_name || 'Studio Al - Midad',
        company_address: settingsData.company_address || defaultAddress,
        company_warehouse_address: settingsData.company_warehouse_address || '',
        company_phone: settingsData.company_phone || '',
        company_email: settingsData.company_email || 'info@studioAl - Midad.com',
        company_working_hours:
          settingsData.company_working_hours ||
          'Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 12:00\nMinggu: Tutup',
        google_maps_embed: settingsData.google_maps_embed || '',
        contact_location_title: settingsData.contact_location_title || '',
        contact_location_description:
          settingsData.contact_location_description || '',
        contact_hero_title: settingsData.contact_hero_title || '',
        contact_hero_subtitle: settingsData.contact_hero_subtitle || '',
        instagram_username: settingsData.instagram_username || '',
        instagram_url: settingsData.instagram_url || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatPhoneForLink = (phone) => {
    if (!phone) return '6281234567890';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('62') ? cleaned : `62${cleaned}`;
  };

  const handleSendViaWhatsApp = (e) => {
    e.preventDefault();

    const message = [
      `*Pesan dari Website Studio Al - Midad*`,
      '',
      `*Nama:* ${formData.name}`,
      `*Email:* ${formData.email}`,
      `*Subjek:* ${formData.subject || '-'}`,
      '',
      `*Pesan:*`,
      formData.message,
    ].join('\n');

    const phone = formatPhoneForLink(settings.company_phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const workingHoursLines = settings.company_working_hours
    ? settings.company_working_hours.split('\n').filter((line) => line.trim())
    : [
        'Senin - Jumat: 08:00 - 17:00',
        'Sabtu: 08:00 - 12:00',
        'Minggu: Tutup',
      ];

  const addressLines = settings.company_address
    ? settings.company_address.split('\n').filter((line) => line.trim())
    : defaultAddress.split('\n').filter((line) => line.trim());

  const warehouseLines = settings.company_warehouse_address
    ? settings.company_warehouse_address.split('\n').filter((line) => line.trim())
    : [];

  const instagramDisplay = settings.instagram_username
    ? settings.instagram_username.startsWith('@')
      ? settings.instagram_username
      : `@${settings.instagram_username}`
    : '';

  const instagramHref = settings.instagram_url
    ? settings.instagram_url
    : settings.instagram_username
      ? `https://instagram.com/${settings.instagram_username.replace('@', '')}`
      : '#';

  return (
    <>
      <SEO
        title="Hubungi Studio Al - Midad"
        description="Hubungi Studio Al - Midad untuk pesan custom Islamic Art & Meaningful Gifts. Suvenir, Artwork, Apparel. Jember, Jawa Timur."
        keywords="kontak Studio Al - Midad, alamat Jember, pesan custom Islamic art, hadiah bermakna"
      />

      {/* Hero Section */}
      <section className="bg-secondary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1
              className="text-2xl lg:text-6xl font-bold mb-6"
              data-aos="fade-up"
            >
              {settings.contact_hero_title || (
                <>
                  Hubungi <span className="text-primary-400">Kami</span>
                </>
              )}
            </h1>
            <p
              className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {settings.contact_hero_subtitle ||
                'Tim Studio Al - Midad siap membantu Anda memenuhi kebutuhan Custom Islamic Art & Meaningful Gifts.'}
            </p>
          </div>
        </div>
      </section>

      {/* Get In Touch + Send Message - Two Column Layout */}
      <section className="py-16 bg-ivory">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Kiri: Form Kirim Pesan */}
              <div data-aos="fade-right">
                <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-6">
                  Kirim Pesan ke Kami
                </h2>

                <form
                  onSubmit={handleSendViaWhatsApp}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Nama lengkap Anda"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="email@anda.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subjek *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Tentang apa?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Pesan *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="input-field resize-y"
                      placeholder="Ceritakan lebih detail tentang pertanyaan Anda..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 bg-secondary-800 hover:bg-secondary-900"
                  >
                    <Send size={18} />
                    <span>Kirim via WhatsApp</span>
                  </button>

                  <p className="text-sm text-gray-500">
                    Pesan Anda akan dikirim via WhatsApp ke tim customer service
                    kami.
                  </p>
                </form>
              </div>

              {/* Kanan: Hubungi Kami */}
              <div data-aos="fade-left" className="space-y-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900">
                  Hubungi Kami
                </h2>

                {/* Phone */}
                {settings.company_phone && (
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                      <Phone className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <a
                        href={`https://wa.me/${formatPhoneForLink(settings.company_phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      >
                        {settings.company_phone}
                      </a>
                      <p className="text-sm text-primary-600 mt-0.5">
                        Klik untuk chat di WhatsApp
                      </p>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                    <Mail className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <a
                      href={`mailto:${settings.company_email || ''}`}
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {settings.company_email || 'info@studioAl - Midad.com'}
                    </a>
                  </div>
                </div>

                {/* Alamat Workshop/Toko */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                    <MapPin className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </p>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {addressLines.length > 0
                        ? addressLines.join('\n')
                        : defaultAddress}
                    </p>
                  </div>
                </div>

                {/* Alamat Gudang */}
                {warehouseLines.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                      <MapPin className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Alamat
                      </p>
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {warehouseLines.join('\n')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Jam Kerja */}
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                    <Clock className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Jam Kerja
                    </p>
                    <ul className="text-gray-600 text-sm space-y-0.5">
                      {workingHoursLines.map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Instagram */}
                {(settings.instagram_username || settings.instagram_url) && (
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                      <Instagram className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <a
                        href={instagramHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-primary-600 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="font-medium">Ikuti Kami</span>
                        {instagramDisplay && (
                          <span className="text-primary-600">
                            {instagramDisplay}
                          </span>
                        )}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Find Us - Full Width Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2
            className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-6"
            data-aos="fade-up"
          >
            {settings.contact_location_title || (
              <>
                Temukan <span className="text-primary-600">Kami</span>
              </>
            )}
          </h2>

          <div
            className="rounded-lg overflow-hidden h-80 lg:h-[28rem] relative bg-gray-200"
            data-aos="fade-up"
          >
            {settings.google_maps_embed ? (
              <iframe
                src={settings.google_maps_embed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                title="Map Location"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 p-4">
                <p>Peta dapat diatur melalui halaman Admin Settings.</p>
              </div>
            )}
          </div>

          {settings.contact_location_description && (
            <p
              className="mt-6 text-gray-600"
              data-aos="fade-up"
            >
              {settings.contact_location_description}
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Contact;
