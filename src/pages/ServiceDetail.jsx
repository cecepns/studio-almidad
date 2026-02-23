import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AOS from 'aos';
import SEO from '../components/Common/SEO';
import Loading from '../components/Common/Loading';
import { ArrowLeft, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import { productsAPI, getImageUrl } from "../utils/api";

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedServices, setRelatedServices] = useState([]);

  const fetchServiceDetail = useCallback(async () => {
    try {
      const response = await productsAPI.getBySlug(slug);
      setService(response.data.data);
      
      // Fetch related services
      if (response.data.data?.category_id) {
        const relatedResponse = await productsAPI.getAll(1, 3, '', response.data.data.category_id);
        setRelatedServices(relatedResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching service detail:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchServiceDetail();
  }, [slug, fetchServiceDetail]);

  if (loading) {
    return <Loading />;
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Layanan tidak ditemukan</h2>
          <Link
            to="/services"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Layanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={service.name}
        description={service.description}
        image={service.image ? getImageUrl(service.image) : null}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8" data-aos="fade-up">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Beranda
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link to="/services" className="text-gray-500 hover:text-gray-700">
                  Layanan
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{service.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Service Image */}
              <div className="bg-ivory rounded-lg shadow-md overflow-hidden mb-8" data-aos="fade-up">
                <div className="relative h-96 bg-gray-200">
                  {service.image ? (
                    <img
                      src={getImageUrl(service.image)}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                          <span className="text-4xl">🚧</span>
                        </div>
                        <p className="text-gray-500">Gambar tidak tersedia</p>
                      </div>
                    </div>
                  )}
                  {service.featured && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Layanan Unggulan
                    </div>
                  )}
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-ivory rounded-lg shadow-md p-6 mb-8" data-aos="fade-up">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.name}</h1>
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-primary-600">
                    {service.price ? `Rp ${service.price.toLocaleString('id-ID')}` : 'Hubungi Kami'}
                  </span>
                  {service.duration && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                </div>

                <div className="prose max-w-none">
                  <div
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                  />
                </div>

                {/* Service Features */}
                {service.features && service.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Keunggulan Layanan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Process */}
                {service.process && service.process.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Proses Pengerjaan</h3>
                    <div className="space-y-4">
                      {service.process.map((step, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{step.title}</h4>
                            <p className="text-gray-600">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Contact Form */}
              <div className="bg-ivory rounded-lg shadow-md p-6 mb-8" data-aos="fade-up">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hubungi Kami</h3>
                <p className="text-gray-600 mb-6">
                  Konsultasikan kebutuhan proyek Anda dengan tim profesional kami.
                </p>
                
                <div className="space-y-4">
                  <a
                    href="tel:+628123456789"
                    className="flex items-center justify-center w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Hubungi Sekarang
                  </a>
                  
                  <a
                    href="mailto:info@studioAl - Midad.com"
                    className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Kirim Email
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-primary-600" />
                      <span>+62 812-3456-789</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3 text-primary-600" />
                      <span>info@studioAl - Midad.com</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-primary-600" />
                      <span>Jember, Jawa Timur</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Categories */}
              {service.category && (
                <div className="bg-ivory rounded-lg shadow-md p-6 mb-8" data-aos="fade-up">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Kategori Layanan</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {service.category.name}
                    </span>
                    {service.subcategory && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {service.subcategory.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Related Services */}
              {relatedServices.length > 0 && (
                <div className="bg-ivory rounded-lg shadow-md p-6" data-aos="fade-up">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Layanan Terkait</h3>
                  <div className="space-y-4">
                    {relatedServices.map((relatedService) => (
                      <Link
                        key={relatedService.id}
                        to={`/services/${relatedService.slug}`}
                        className="block group"
                      >
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {relatedService.image ? (
                              <img
                                src={getImageUrl(relatedService.image)}
                                alt={relatedService.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-xl">🚧</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                              {relatedService.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {relatedService.price ? `Rp ${relatedService.price.toLocaleString('id-ID')}` : 'Hubungi Kami'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetail;
