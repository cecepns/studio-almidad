import { useState, useEffect } from 'react';
import AOS from 'aos';
import { Save, Building, MapPin, Phone, Mail, Globe, Info, Clock, Target, Image as ImageIcon } from 'lucide-react';
import { settingsAPI, uploadAPI, getImageUrl } from '../../utils/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_about: '',
    company_working_hours: '',
    google_maps_embed: '',
    home_about_title: '',
    home_about_description: '',
    home_about_image: '',
    company_history: '',
    company_vision: '',
    company_mission: '',
    facebook_pixel_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.get();
      setSettings(response.data.data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleAboutImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAboutImage(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = response.data?.data?.url || response.data?.url;

      if (!imageUrl) {
        alert('Error: No image URL received from server');
        return;
      }

      setSettings(prev => ({
        ...prev,
        home_about_image: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading about image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingAboutImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.update(settings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-aos="fade-up">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Settings</h1>
        <p className="text-gray-600">Manage your company information and website settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
          <div className="flex items-center mb-6">
            <Building className="text-primary-600 mr-3" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                required
                value={settings.company_name || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Penyedia Jasa WiFi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  name="company_email"
                  required
                  value={settings.company_email || ''}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="info@penyediajasawifi.id"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="tel"
                  name="company_phone"
                  required
                  value={settings.company_phone || ''}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="081234567890"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea
                  name="company_address"
                  required
                  rows={3}
                  value={settings.company_address || ''}
                  onChange={handleInputChange}
                  className="input-field pl-10 resize-none"
                  placeholder="BSB City, Ruko Jade Square, Blk. A No.12B, Kota Semarang, 50212"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Gunakan baris baru untuk memisahkan setiap baris alamat.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Hours
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea
                  name="company_working_hours"
                  rows={3}
                  value={settings.company_working_hours || ''}
                  onChange={handleInputChange}
                  className="input-field pl-10 resize-none"
                  placeholder="Senin - Jumat: 08:00 - 17:00&#10;Sabtu: 08:00 - 12:00&#10;Minggu: Tutup"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Gunakan baris baru untuk memisahkan setiap baris jam kerja.
              </p>
            </div>
          </div>
        </div>

        {/* About Company */}
        <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
          <div className="flex items-center mb-6">
            <Info className="text-primary-600 mr-3" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">About Company</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description *
            </label>
            <textarea
              name="company_about"
              required
              rows={6}
              value={settings.company_about || ''}
              onChange={handleInputChange}
              className="input-field resize-none"
              placeholder="Write about your company, history, mission, and values..."
            />
            <p className="text-sm text-gray-500 mt-2">
              This will be displayed on the About page and other sections of your website.
            </p>
          </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company History (About Page)
          </label>
          <textarea
            name="company_history"
            rows={6}
            value={settings.company_history || ''}
            onChange={handleInputChange}
            className="input-field resize-none"
            placeholder={
              "Penyedia Jasa WiFi BSB City hadir untuk menjawab kebutuhan koneksi internet yang stabil, cepat, dan terjangkau di kawasan hunian dan komersial BSB City, Kota Semarang.\n\n" +
              "Berawal dari layanan jaringan di lingkungan sekitar, kami terus mengembangkan infrastruktur dan tim teknis agar setiap pelanggan mendapatkan pengalaman online yang nyaman dan andal.\n\n" +
              "Dengan lokasi operasional di BSB City, Ruko Jade Square, Blk. A No.12B, kami berkomitmen memberikan layanan yang dekat, responsif, dan mudah dijangkau."
            }
          />
          <p className="text-sm text-gray-500 mt-2">
            This text is shown in the Company History section on the About page. Use blank lines to separate paragraphs.
          </p>
        </div>
        </div>

      {/* Home About Section */}
      <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
        <div className="flex items-center mb-6">
          <ImageIcon className="text-primary-600 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Home About Section</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home About Title
              </label>
              <input
                type="text"
                name="home_about_title"
                value={settings.home_about_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Penyedia Jasa WiFi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home About Description
              </label>
              <textarea
                name="home_about_description"
                rows={6}
                value={settings.home_about_description || ''}
                onChange={handleInputChange}
                className="input-field resize-none"
                placeholder="Layanan pemasangan dan pengelolaan jaringan internet serta WiFi untuk rumah, kost, ruko, dan bisnis di Kawasan Anda. Mengutamakan koneksi stabil, support teknis responsif, dan paket yang fleksibel."
              />
              <p className="text-sm text-gray-500 mt-2">
                This text will replace the default description on the Home page About section.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home About Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAboutImageUpload}
              className="input-field"
              disabled={uploadingAboutImage}
            />
            {uploadingAboutImage && (
              <div className="flex items-center space-x-2 text-primary-600 text-sm">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading image...</span>
              </div>
            )}
            {settings.home_about_image && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={getImageUrl(settings.home_about_image)}
                  alt="Home About"
                  className="w-full h-48 object-cover rounded-lg border border-primary-100"
                />
              </div>
            )}
            <p className="text-sm text-gray-500">
              When you upload a new image, the previous one will be removed from the server automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
        <div className="flex items-center mb-6">
          <Target className="text-primary-600 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Vision & Mission</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Vision
            </label>
            <textarea
              name="company_vision"
              rows={5}
              value={settings.company_vision || ''}
              onChange={handleInputChange}
              className="input-field resize-none"
              placeholder={
                "Menjadi penyedia layanan internet terpercaya di BSB City dan Kota Semarang dengan jaringan yang stabil, cepat, dan mudah diakses.\n\n" +
                "Hadir sebagai mitra digital yang membantu aktivitas kerja, belajar, hiburan, dan operasional bisnis berjalan tanpa gangguan."
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Mission
            </label>
            <textarea
              name="company_mission"
              rows={5}
              value={settings.company_mission || ''}
              onChange={handleInputChange}
              className="input-field resize-none"
              placeholder={
                "- Menyediakan koneksi internet yang stabil dan berkualitas dengan berbagai pilihan paket sesuai kebutuhan pelanggan.\n" +
                "- Memberikan dukungan teknis yang responsif dan mudah dihubungi ketika terjadi kendala.\n" +
                "- Melakukan survei dan instalasi secara profesional dengan memperhatikan kerapian dan keamanan jaringan.\n" +
                "- Terus meningkatkan infrastruktur jaringan dan teknologi untuk menjaga performa koneksi di area layanan."
              }
            />
          </div>
        </div>
      </div>

      {/* Marketing & Tracking */}
      <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
        <div className="flex items-center mb-6">
          <Target className="text-primary-600 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Marketing & Tracking</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook Pixel ID
            </label>
            <input
              type="text"
              name="facebook_pixel_id"
              value={settings.facebook_pixel_id || ''}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Misal: 123456789012345"
            />
            <p className="text-sm text-gray-500 mt-2">
              Masukkan ID Pixel Facebook (bukan seluruh script). Pixel akan diinisialisasi otomatis di website publik.
            </p>
          </div>
        </div>
      </div>

        {/* Maps Integration */}
        <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
          <div className="flex items-center mb-6">
            <Globe className="text-primary-600 mr-3" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">Maps Integration</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps Embed URL
            </label>
            <input
              type="url"
              name="google_maps_embed"
              value={settings.google_maps_embed || ''}
              onChange={handleInputChange}
              className="input-field"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Get the embed URL from Google Maps by clicking "Share" → "Embed a map" → Copy the src URL from the iframe code.
            </p>
          </div>

          {settings.google_maps_embed && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="bg-gray-100 rounded-lg h-64 overflow-hidden">
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
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end" data-aos="fade-up">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center space-x-2 px-8 py-3"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;