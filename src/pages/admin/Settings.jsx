import { useState, useEffect } from 'react';
import AOS from 'aos';
import { Save, Building, MapPin, Phone, Mail, Globe, Info, Clock, Target, Image as ImageIcon, Type, Instagram } from 'lucide-react';
import { settingsAPI, uploadAPI, getImageUrl } from '../../utils/api';

// List icon yang bisa dipilih untuk kategori di beranda.
// Nilai `value` harus sama dengan nama icon di lucide-react.
const HOME_CATEGORY_ICON_OPTIONS = [
  { value: 'Gift', label: 'Gift (ikon kado)' },
  { value: 'Palette', label: 'Palette (ikon palet warna)' },
  { value: 'Shirt', label: 'Shirt (ikon kaos)' },
  { value: 'Star', label: 'Star (ikon bintang)' },
  { value: 'Heart', label: 'Heart (ikon hati)' },
  { value: 'Camera', label: 'Camera (ikon kamera)' },
  { value: 'ShoppingBag', label: 'ShoppingBag (ikon tas belanja)' },
  { value: 'Box', label: 'Box (ikon box/kotak)' },
  { value: 'Coffee', label: 'Coffee (ikon cangkir kopi)' },
  { value: 'Frame', label: 'Frame (ikon frame / bingkai)' },
  { value: 'HardDrive', label: 'HardDrive (ikon media digital)' },
];

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
    about_page_image: '',
    facebook_pixel_id: '',
    home_categories_title: '',
    home_categories_subtitle: '',
    home_category1_label: '',
    home_category1_description: '',
    home_category1_icon: '',
    home_category2_label: '',
    home_category2_description: '',
    home_category2_icon: '',
    home_category3_label: '',
    home_category3_description: '',
    home_category3_icon: '',
    home_category4_label: '',
    home_category4_description: '',
    home_category4_icon: '',
    home_category5_label: '',
    home_category5_description: '',
    home_category5_icon: '',
    home_products_title: '',
    home_products_subtitle: '',
    home_cta_title: '',
    home_cta_subtitle: '',
    about_hero_title: '',
    about_hero_subtitle: '',
    about_values_title: '',
    about_values_subtitle: '',
    about_value1_title: '',
    about_value1_description: '',
    about_value2_title: '',
    about_value2_description: '',
    about_value3_title: '',
    about_value3_description: '',
    about_value4_title: '',
    about_value4_description: '',
    about_history_title: '',
    about_history_card_title: '',
    services_hero_title: '',
    services_hero_subtitle: '',
    product_detail_cta_title: '',
    product_detail_cta_subtitle: '',
    contact_location_title: '',
    contact_location_description: '',
    contact_hero_title: '',
    contact_hero_subtitle: '',
    company_warehouse_address: '',
    instagram_username: '',
    instagram_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const [uploadingAboutPageImage, setUploadingAboutPageImage] = useState(false);

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

  const handleAboutPageImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAboutPageImage(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = response.data?.data?.url || response.data?.url;

      if (!imageUrl) {
        alert('Error: No image URL received from server');
        return;
      }

      setSettings(prev => ({
        ...prev,
        about_page_image: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading about page image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingAboutPageImage(false);
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
        <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
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
                placeholder="Studio Al - Midad"
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
                  placeholder="info@studioAl - Midad.com"
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
                Company Address (Workshop/Store) *
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
                  placeholder="Jl. Contoh No. 123, Kota Anda, 12345"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Gunakan baris baru untuk memisahkan setiap baris alamat.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Address (optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea
                  name="company_warehouse_address"
                  rows={2}
                  value={settings.company_warehouse_address || ''}
                  onChange={handleInputChange}
                  className="input-field pl-10 resize-none"
                  placeholder="Jl. Gudang No. 1, Kecamatan X, Kota Y"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Alamat gudang akan ditampilkan di halaman Kontak jika diisi.
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
        <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
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
            About Page Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAboutPageImageUpload}
            className="input-field mb-2"
            disabled={uploadingAboutPageImage}
          />
          {uploadingAboutPageImage && (
            <div className="flex items-center space-x-2 text-primary-600 text-sm mb-2">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </div>
          )}
          {settings.about_page_image && (
            <div className="mt-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={getImageUrl(settings.about_page_image)}
                alt="About Page"
                className="w-full max-w-md h-48 object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Gambar ini ditampilkan di halaman Tentang Kami (Company Overview). Kosongkan dengan mengganti gambar atau simpan pengaturan lain tanpa mengubah ini.
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
              "Studio Al - Midad berdiri dengan visi menghadirkan Custom Islamic Art & Meaningful Gifts untuk setiap kebutuhan Anda.\n\n" +
              "Berawal dari kecintaan akan seni islami dan keinginan menghadirkan suvenir, artwork, serta apparel bermakna, kami terus mengembangkan kualitas produk dan layanan agar setiap pelanggan mendapatkan pengalaman berbelanja yang memuaskan.\n\n" +
              "Dengan fokus pada kualitas, ketelitian, dan makna di balik setiap produk, kami berkomitmen menjadi mitra terpercaya untuk Custom Islamic Art & Meaningful Gifts Anda."
            }
          />
          <p className="text-sm text-gray-500 mt-2">
            This text is shown in the Company History section on the About page. Use blank lines to separate paragraphs.
          </p>
        </div>
        </div>

      {/* Home About Section */}
      <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
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
                placeholder="Studio Al - Midad"
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
                placeholder="Custom Islamic Art & Meaningful Gifts. Suvenir, Artwork, dan Apparel bermakna untuk kebutuhan pribadi, acara, dan bisnis. Mengutamakan kualitas, ketelitian, dan layanan yang responsif."
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

      {/* Page Section Titles & Subtitles */}
      <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
        <div className="flex items-center mb-6">
          <Type className="text-primary-600 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Judul & Subjudul Halaman</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Edit judul dan subjudul section di setiap halaman. Kosongkan untuk menggunakan teks default.
        </p>

        {/* Home Page */}
        <div className="space-y-6 mb-8">
          <h3 className="text-base font-medium text-gray-800 border-b pb-2">Halaman Beranda</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Kategori (Apa yang Kami Tawarkan) - Judul</label>
              <input
                type="text"
                name="home_categories_title"
                value={settings.home_categories_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Apa yang Kami Tawarkan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Kategori - Subjudul</label>
              <input
                type="text"
                name="home_categories_subtitle"
                value={settings.home_categories_subtitle || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Custom Islamic Art & Meaningful Gifts untuk setiap kebutuhan Anda"
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <p className="text-sm text-gray-600 mb-2">
                Atur teks dan icon untuk hingga 5 kategori utama di section &quot;Apa yang Kami Tawarkan&quot; di halaman beranda.
                Kosongkan untuk menggunakan teks dan icon default (Apparel Collection, Drinkware Series, Wall Art & Frame, Souvenir & Merchandise, Digital Collection).
              </p>
            </div>

            {/* Kategori 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 1 - Nama</label>
              <input
                type="text"
                name="home_category1_label"
                value={settings.home_category1_label || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Suvenir"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 1 - Deskripsi</label>
              <input
                type="text"
                name="home_category1_description"
                value={settings.home_category1_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Hadiah bermakna untuk setiap momen istimewa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 1 - Icon</label>
              <select
                name="home_category1_icon"
                value={settings.home_category1_icon || ''}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Default (Gift)</option>
                {HOME_CATEGORY_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 2 - Nama</label>
              <input
                type="text"
                name="home_category2_label"
                value={settings.home_category2_label || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Artwork"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 2 - Deskripsi</label>
              <input
                type="text"
                name="home_category2_description"
                value={settings.home_category2_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Karya seni Islami dengan desain eksklusif"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 2 - Icon</label>
              <select
                name="home_category2_icon"
                value={settings.home_category2_icon || ''}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Default (Palette)</option>
                {HOME_CATEGORY_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 3 - Nama</label>
              <input
                type="text"
                name="home_category3_label"
                value={settings.home_category3_label || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Apparel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 3 - Deskripsi</label>
              <input
                type="text"
                name="home_category3_description"
                value={settings.home_category3_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Pakaian & aksesoris dengan nilai estetika"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 3 - Icon</label>
              <select
                name="home_category3_icon"
                value={settings.home_category3_icon || ''}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Default (Shirt)</option>
                {HOME_CATEGORY_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 4 - Nama</label>
              <input
                type="text"
                name="home_category4_label"
                value={settings.home_category4_label || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="🎁 Souvenir & Merchandise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 4 - Deskripsi</label>
              <input
                type="text"
                name="home_category4_description"
                value={settings.home_category4_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Souvenir dan merchandise untuk acara pribadi maupun korporat."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 4 - Icon</label>
              <select
                name="home_category4_icon"
                value={settings.home_category4_icon || ''}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Default (🎁 Souvenir & Merchandise)</option>
                {HOME_CATEGORY_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori 5 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 5 - Nama</label>
              <input
                type="text"
                name="home_category5_label"
                value={settings.home_category5_label || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="💾 Digital Collection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 5 - Deskripsi</label>
              <input
                type="text"
                name="home_category5_description"
                value={settings.home_category5_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Koleksi produk digital seperti file desain dan template."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori 5 - Icon</label>
              <select
                name="home_category5_icon"
                value={settings.home_category5_icon || ''}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Default (💾 Digital Collection)</option>
                {HOME_CATEGORY_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Produk & CTA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Produk Unggulan - Judul</label>
              <input
                type="text"
                name="home_products_title"
                value={settings.home_products_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Produk Unggulan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Produk Unggulan - Subjudul</label>
              <input
                type="text"
                name="home_products_subtitle"
                value={settings.home_products_subtitle || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Temukan berbagai produk Suvenir, Artwork, dan Apparel berkualitas..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section CTA (Ingin Pesan Custom) - Judul</label>
              <input
                type="text"
                name="home_cta_title"
                value={settings.home_cta_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ingin Pesan Custom?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section CTA - Subjudul</label>
              <input
                type="text"
                name="home_cta_subtitle"
                value={settings.home_cta_subtitle || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Konsultasikan kebutuhan Custom Islamic Art & Meaningful Gifts Anda dengan tim Studio Al - Midad."
              />
            </div>
          </div>
        </div>

        {/* About Page */}
        <div className="space-y-6 mb-8">
          <h3 className="text-base font-medium text-gray-800 border-b pb-2">Halaman Tentang Kami</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero - Judul</label>
              <input
                type="text"
                name="about_hero_title"
                value={settings.about_hero_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Tentang Studio Al - Midad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero - Subjudul</label>
              <input
                type="text"
                name="about_hero_subtitle"
                value={settings.about_hero_subtitle || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Custom Islamic Art & Meaningful Gifts. Suvenir • Artwork • Apparel..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Nilai-Nilai - Judul</label>
              <input
                type="text"
                name="about_values_title"
                value={settings.about_values_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Nilai-Nilai Kami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Nilai-Nilai - Subjudul</label>
              <input
                type="text"
                name="about_values_subtitle"
                value={settings.about_values_subtitle || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Nilai-nilai fundamental yang menjadi fondasi..."
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <p className="text-sm text-gray-600 mb-2">
                Atur judul dan deskripsi untuk 4 nilai utama (value cards) di halaman Tentang Kami.
                Kosongkan untuk menggunakan teks default.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 1 - Judul</label>
              <input
                type="text"
                name="about_value1_title"
                value={settings.about_value1_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Kualitas Terjamin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 1 - Deskripsi</label>
              <input
                type="text"
                name="about_value1_description"
                value={settings.about_value1_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Setiap karya dibuat dengan detail dan kualitas terbaik, sesuai standar tinggi seni Islami."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 2 - Judul</label>
              <input
                type="text"
                name="about_value2_title"
                value={settings.about_value2_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Custom Sesuai Kebutuhan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 2 - Deskripsi</label>
              <input
                type="text"
                name="about_value2_description"
                value={settings.about_value2_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Desain disesuaikan dengan kebutuhan dan momen istimewa Anda."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 3 - Judul</label>
              <input
                type="text"
                name="about_value3_title"
                value={settings.about_value3_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Kreativitas & Makna"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 3 - Deskripsi</label>
              <input
                type="text"
                name="about_value3_description"
                value={settings.about_value3_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Kombinasi kreativitas dengan nilai-nilai Islami yang bermakna dalam setiap karya."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 4 - Judul</label>
              <input
                type="text"
                name="about_value4_title"
                value={settings.about_value4_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Integritas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value 4 - Deskripsi</label>
              <input
                type="text"
                name="about_value4_description"
                value={settings.about_value4_description || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Menjalankan bisnis dengan integritas, transparansi, dan komitmen penuh pada kepuasan pelanggan."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Cerita Kami - Judul</label>
              <input
                type="text"
                name="about_history_title"
                value={settings.about_history_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Cerita Kami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Card Cerita Kami (di dalam card)</label>
              <input
                type="text"
                name="about_history_card_title"
                value={settings.about_history_card_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Studio Al - Midad"
              />
            </div>
          </div>
        </div>

        {/* Services Page */}
        <div className="space-y-6 mb-8">
          <h3 className="text-base font-medium text-gray-800 border-b pb-2">Halaman Katalog</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Halaman</label>
              <input
                type="text"
                name="services_hero_title"
                value={settings.services_hero_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Katalog Produk"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjudul Halaman</label>
              <input
                type="text"
                name="services_hero_subtitle"
                value={settings.services_hero_subtitle || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Suvenir • Artwork • Apparel. Temukan produk Custom Islamic Art & Meaningful Gifts berkualitas."
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <p className="text-sm text-gray-600 mb-2">
                Atur teks CTA di halaman detail produk (bagian &quot;Tertarik dengan produk ini?&quot;).
                Kosongkan untuk menggunakan teks default.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detail Produk - Judul CTA</label>
              <input
                type="text"
                name="product_detail_cta_title"
                value={settings.product_detail_cta_title || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Tertarik dengan produk ini?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detail Produk - Deskripsi CTA</label>
              <input
                type="text"
                name="product_detail_cta_subtitle"
                value={settings.product_detail_cta_subtitle || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Hubungi tim Studio Al - Midad untuk informasi lebih lanjut atau pesanan custom sesuai kebutuhan Anda."
              />
            </div>
          </div>
        </div>

        {/* Contact Page */}
        <div className="space-y-6">
          <h3 className="text-base font-medium text-gray-800 border-b pb-2">Halaman Kontak</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero - Judul (atas halaman)</label>
              <input type="text" name="contact_hero_title" value={settings.contact_hero_title || ''} onChange={handleInputChange} className="input-field" placeholder="Hubungi Kami (kosongkan = default: Hubungi Kami)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero - Subjudul (atas halaman)</label>
              <input type="text" name="contact_hero_subtitle" value={settings.contact_hero_subtitle || ''} onChange={handleInputChange} className="input-field" placeholder="Tim Studio Al - Midad siap membantu..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Lokasi (Temukan Kami) - Judul</label>
              <input type="text" name="contact_location_title" value={settings.contact_location_title || ''} onChange={handleInputChange} className="input-field" placeholder="Temukan Kami" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Lokasi - Deskripsi</label>
              <textarea name="contact_location_description" rows={3} value={settings.contact_location_description || ''} onChange={handleInputChange} className="input-field resize-none" placeholder="Kunjungi studio kami. Kami siap melayani pesanan custom Anda." />
            </div>
            <div className="md:col-span-2 border-t pt-6 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Instagram className="text-primary-600" size={20} />
                <h4 className="font-medium text-gray-800">Instagram</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username Instagram (editable)</label>
                  <input
                    type="text"
                    name="instagram_username"
                    value={settings.instagram_username || ''}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="@menggeris_official atau menggeris_official"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Ditampilkan sebagai &quot;Follow Us @username&quot; di halaman Kontak.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Instagram (optional)</label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={settings.instagram_url || ''}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://instagram.com/menggeris_official"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Kosongkan untuk auto-generate dari username (https://instagram.com/username).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
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
                "Menjadi studio Custom Islamic Art & Meaningful Gifts terpercaya yang menghadirkan suvenir, artwork, dan apparel bermakna untuk setiap kebutuhan pelanggan.\n\n" +
                "Hadir sebagai mitra yang membantu mewujudkan produk bermakna untuk acara, hadiah, dekorasi, dan kebutuhan sehari-hari dengan kualitas terbaik."
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
                "- Menyediakan produk Custom Islamic Art & Meaningful Gifts berkualitas dengan berbagai pilihan suvenir, artwork, dan apparel sesuai kebutuhan pelanggan.\n" +
                "- Memberikan layanan konsultasi dan pemesanan custom yang responsif dan mudah dihubungi.\n" +
                "- Memastikan proses produksi berkualitas dengan ketelitian dan bahan pilihan terbaik.\n" +
                "- Terus berinovasi dalam desain dan produk untuk memenuhi kebutuhan pelanggan akan produk bermakna."
              }
            />
          </div>
        </div>
      </div>

      {/* Marketing & Tracking */}
      <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
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
        <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
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
              Get the embed URL from Google Maps by clicking &quot;Share&quot; → &quot;Embed a map&quot; → Copy the src URL from the iframe code.
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