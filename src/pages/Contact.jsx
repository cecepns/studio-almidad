import { useState, useEffect } from 'react';
import AOS from 'aos';
import SEO from '../components/Common/SEO';
import { MapPin, Phone, Mail, Clock, Send, CircleCheck as CheckCircle } from 'lucide-react';
import { settingsAPI } from '../utils/api';

const defaultAddress = `Jl. Wolter Monginsidi Gg. VII No. 17 Sumber Salak
Kranjingan, Sumbersari
Jember, Jawa Timur 68123`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_working_hours: '',
    google_maps_embed: ''
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
        company_name: settingsData.company_name || 'Studio Almidad',
        company_address: settingsData.company_address || defaultAddress,
        company_phone: settingsData.company_phone || '',
        company_email: settingsData.company_email || 'info@studioalmidad.com',
        company_working_hours: settingsData.company_working_hours || 'Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 12:00\nMinggu: Tutup',
        google_maps_embed: settingsData.google_maps_embed || ''
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
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 2000);
  };

  const addressLines = settings.company_address
    ? settings.company_address.split('\n').filter(line => line.trim())
    : defaultAddress.split('\n');

  const workingHoursLines = settings.company_working_hours
    ? settings.company_working_hours.split('\n').filter(line => line.trim())
    : [
        'Senin - Jumat: 08:00 - 17:00',
        'Sabtu: 08:00 - 12:00',
        'Minggu: Tutup'
      ];

  const formatPhoneForLink = (phone) => {
    if (!phone) return '6281234567890';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('62') ? cleaned : `62${cleaned}`;
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Alamat',
      details: addressLines.length > 0 ? addressLines : [defaultAddress]
    },
    {
      icon: Phone,
      title: 'Telepon',
      details: [settings.company_phone || 'Hubungi via WhatsApp'],
      link: settings.company_phone ? `tel:+${formatPhoneForLink(settings.company_phone)}` : null
    },
    {
      icon: Mail,
      title: 'Email',
      details: [settings.company_email || 'info@studioalmidad.com'],
      link: `mailto:${settings.company_email || 'info@studioalmidad.com'}`
    },
    {
      icon: Clock,
      title: 'Jam Kerja',
      details: workingHoursLines.length > 0 ? workingHoursLines : ['Jam kerja belum diatur']
    }
  ];

  return (
    <>
      <SEO
        title="Hubungi Studio Almidad"
        description="Hubungi Studio Almidad untuk pesan custom Islamic Art & Meaningful Gifts. Suvenir, Artwork, Apparel. Jember, Jawa Timur."
        keywords="kontak Studio Almidad, alamat Jember, pesan custom Islamic art, hadiah bermakna"
      />

      {/* Hero Section */}
      <section className="bg-secondary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1
              className="text-2xl lg:text-6xl font-bold mb-6"
              data-aos="fade-up"
            >
              Hubungi <span className="text-primary-400">Kami</span>
            </h1>
            <p
              className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Tim Studio Almidad siap membantu Anda memenuhi kebutuhan Custom Islamic Art & Meaningful Gifts.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="card p-6 text-center hover:shadow-xl transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="bg-primary-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <info.icon className="text-primary-600" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">{info.title}</h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    {info.details.map((detail, idx) => (
                      <div key={idx}>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="hover:text-primary-600 transition-colors"
                          >
                            {detail}
                          </a>
                        ) : (
                          <p>{detail}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div data-aos="fade-right">
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-6">
                Kirim <span className="text-primary-600">Pesan</span>
              </h2>
              <p className="text-gray-600 mb-8">
                Isi form di bawah ini untuk mengirim pesan atau pertanyaan Anda.
                Tim kami akan merespons dalam waktu 24 jam.
              </p>

              {isSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle size={20} />
                    <span className="font-medium">Pesan berhasil dikirim!</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Terima kasih atas pesan Anda. Tim kami akan segera menghubungi Anda.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="08xxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Kebutuhan (opsional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Suvenir / Artwork / Apparel"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="input-field resize-none"
                    placeholder="Tulis pesan atau pertanyaan Anda di sini..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full md:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Kirim Pesan</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Address */}
            <div data-aos="fade-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-6">
                Lokasi <span className="text-primary-600">Kami</span>
              </h2>
              <p className="text-gray-600 mb-6">
                {settings.company_address
                  ? `Kunjungi studio kami di Jl. Wolter Monginsidi Gg. VII No. 17, Kranjingan, Sumbersari, Jember. Kami siap melayani Anda.`
                  : 'Kunjungi studio kami. Kami siap melayani pesanan custom Anda.'}
              </p>

              <div className="bg-gray-200 rounded-lg h-80 lg:h-96 relative overflow-hidden">
                {settings.google_maps_embed ? (
                  <iframe
                    src={settings.google_maps_embed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 p-4">
                    <p>Peta dapat diatur melalui halaman Admin Settings.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100">
                  <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-secondary-900">Alamat Lengkap</p>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {settings.company_address || defaultAddress}
                    </p>
                  </div>
                </div>

                {settings.company_phone && (
                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={`https://wa.me/${formatPhoneForLink(settings.company_phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-center py-3"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:+${formatPhoneForLink(settings.company_phone)}`}
                      className="btn-outline text-center py-3"
                    >
                      Telepon
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
