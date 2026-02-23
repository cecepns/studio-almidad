import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AOS from 'aos';
import SEO from '../components/Common/SEO';
import Loading from '../components/Common/Loading';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { productsAPI, settingsAPI, getImageUrl } from '../utils/api';
import { stripHtml, formatDate, truncateText } from '../utils/seo';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ctaTexts, setCtaTexts] = useState({
    product_detail_cta_title: '',
    product_detail_cta_subtitle: '',
  });

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getBySlug(slug);
      const productData = response.data.data;
      setProduct(productData);
      
      // Fetch related products
      const relatedResponse = await productsAPI.getAll(1, 4);
      const relatedData = relatedResponse.data.data || [];
      setRelatedProducts(relatedData.filter(p => p.id !== productData.id).slice(0, 3));
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchPhoneNumber = useCallback(async () => {
    try {
      const response = await settingsAPI.get();
      const data = response.data.data || {};
      const phone = data.company_phone || '';
      setPhoneNumber(phone);
      setCtaTexts({
        product_detail_cta_title: data.product_detail_cta_title || '',
        product_detail_cta_subtitle: data.product_detail_cta_subtitle || '',
      });
    } catch (error) {
      console.error('Error fetching phone number:', error);
    }
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchProduct();
    fetchPhoneNumber();
  }, [fetchProduct, fetchPhoneNumber]);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: truncateText(stripHtml(product.description)),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  if (loading) {
    return <Loading size="large" />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-8">Maaf, produk yang Anda cari tidak ditemukan.</p>
        <Link to="/services" className="btn-primary">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const metaDescription = truncateText(stripHtml(product.description));

  return (
    <>
      <SEO 
        title={product.title}
        description={metaDescription}
        keywords={`${product.title}, Studio Al - Midad, ${product.category || 'Custom Islamic Art'}`}
        image={getImageUrl(product.image)}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-primary-600">Katalog</Link>
            <span>/</span>
            <span className="text-gray-900">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              to="/services" 
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Kembali ke Katalog</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div data-aos="fade-right">
              <div className="sticky top-24">
                <img 
                  src={getImageUrl(product.image) || 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg'} 
                  alt={product.title}
                  className="w-full h-96 lg:h-[500px] object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Product Info */}
            <div data-aos="fade-left">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.title}
                </h1>
                <button 
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Bagikan produk"
                >
                  <Share2 size={24} />
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Dipublikasikan: {formatDate(product.created_at)}</span>
                </div>
              </div>

              <div className="max-w-none mb-8">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              </div>

              {/* Call to Action */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {ctaTexts.product_detail_cta_title || 'Tertarik dengan produk ini?'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {ctaTexts.product_detail_cta_subtitle ||
                    'Hubungi tim Studio Al - Midad untuk informasi lebih lanjut atau pesanan custom sesuai kebutuhan Anda.'}
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link to="/contact" className="btn-primary flex-1 text-center">
                    Hubungi Kami
                  </Link>
                  {phoneNumber && (
                    <a 
                      href={`https://wa.me/${formatPhoneNumber(phoneNumber)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary flex-1 text-center"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 
              className="text-3xl font-bold text-gray-900 mb-8 text-center"
              data-aos="fade-up"
            >
              Produk <span className="text-primary-600">Terkait</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <div 
                  key={relatedProduct.id}
                  className="card hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={getImageUrl(relatedProduct.image) || 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg'} 
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {stripHtml(relatedProduct.description).slice(0, 100)}...
                    </p>
                    <Link 
                      to={`/services/${relatedProduct.slug}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/services" className="btn-outline">
                Lihat Semua Produk
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetail;