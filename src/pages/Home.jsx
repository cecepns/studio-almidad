import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import SEO from "../components/Common/SEO";
import {
  ArrowRight,
  Gift,
  Palette,
  Shirt,
} from "lucide-react";
import { bannersAPI, productsAPI, settingsAPI, getImageUrl } from "../utils/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFlip } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import AboutImage from "../assets/logo.png";

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    AOS.init({ duration: 1000 });

    let isMounted = true;

    const fetchData = async () => {
      try {
        const [bannersRes, productsRes, settingsRes] = await Promise.all([
          bannersAPI.getAll(),
          productsAPI.getAll(1, 6),
          settingsAPI.get(),
        ]);

        if (isMounted) {
          setBanners(bannersRes.data.data || []);
          setFeaturedProducts(productsRes.data.data || []);
          setSettings(settingsRes.data.data || {});
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { icon: Gift, label: "Suvenir", description: "Hadiah bermakna untuk setiap momen istimewa" },
    { icon: Palette, label: "Artwork", description: "Karya seni Islami dengan desain eksklusif" },
    { icon: Shirt, label: "Apparel", description: "Pakaian & aksesoris dengan nilai estetika" },
  ];

  const homeAboutTitle = settings.home_about_title || "Studio Almidad";
  const homeAboutDescription =
    settings.home_about_description ||
    "Studio Almidad bergerak di bidang Custom Islamic Art & Meaningful Gifts. Kami menyediakan Suvenir, Artwork, dan Apparel dengan desain berkualitas dan penuh makna untuk setiap momen istimewa Anda.";
  const homeAboutImage = settings.home_about_image;

  return (
    <>
      <SEO
        title="Studio Almidad - Custom Islamic Art & Meaningful Gifts"
        description="Studio Almidad: Custom Islamic Art & Meaningful Gifts. Suvenir • Artwork • Apparel dengan desain berkualitas. Jember, Jawa Timur."
      />

      {/* Hero Banner Section */}
      <section className="relative px-4 py-4 lg:px-6 lg:py-6 bg-gray-50">
        <div className="container mx-auto h-44 lg:h-[500px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        {loading ? (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
            <div className="text-secondary-800 text-xl">Memuat banner...</div>
          </div>
        ) : banners && banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFlip]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            effect="fade"
            fadeEffect={{
              crossFade: true,
            }}
            className="h-full w-full"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative w-full h-full">
                  <img
                    src={
                      getImageUrl(banner.image) ||
                      "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg"
                    }
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4">
                      <div className="max-w-4xl">
                        {!!banner.title && (
                          <h1
                            className="text-2xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg"
                            data-aos="fade-up"
                          >
                            {banner.title}{" "}
                            <span className="text-primary-400">
                              {banner.subtitle || ""}
                            </span>
                          </h1>
                        )}
                        {banner.description && (
                          <p
                            className="text-xl lg:text-2xl mb-8 text-gray-200 leading-relaxed drop-shadow"
                            data-aos="fade-up"
                            data-aos-delay="200"
                          >
                            {banner.description}
                          </p>
                        )}
                        {banner.link && (
                          <div
                            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                            data-aos="fade-up"
                            data-aos-delay="400"
                          >
                            <Link
                              to={banner.link}
                              className="btn-primary inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg"
                            >
                              <span>{banner.buttonText || "Lihat Katalog"}</span>
                              <ArrowRight size={20} />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative bg-secondary-900 text-white overflow-hidden h-full rounded-2xl">
            <div className="absolute inset-0 opacity-90">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
            </div>
            <div className="relative container mx-auto px-4 h-full flex items-center">
              <div className="max-w-4xl">
                <h1
                  className="text-2xl lg:text-6xl font-bold mb-6 leading-tight"
                  data-aos="fade-up"
                >
                  Custom Islamic Art{" "}
                  <span className="text-primary-400">& Meaningful Gifts</span>
                </h1>
                <p
                  className="text-xl lg:text-2xl mb-4 text-gray-300 leading-relaxed"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Suvenir • Artwork • Apparel
                </p>
                <p
                  className="text-base lg:text-lg mb-8 text-gray-400"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  Studio Almidad menyediakan produk seni Islami berkualitas dengan desain custom untuk setiap momen istimewa Anda.
                </p>
                <div
                  className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  <Link
                    to="/services"
                    className="bg-primary-500 hover:bg-primary-600 text-secondary-900 inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg rounded-lg font-semibold transition-colors"
                  >
                    <span>Lihat Katalog</span>
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/contact"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-secondary-900 inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg font-semibold transition-colors"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-2xl lg:text-4xl font-bold text-secondary-900 mb-4"
              data-aos="fade-up"
            >
              {settings.home_categories_title || (
                <>Apa yang Kami <span className="text-primary-600">Tawarkan</span></>
              )}
            </h2>
            <p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {settings.home_categories_subtitle || 'Custom Islamic Art & Meaningful Gifts untuk setiap kebutuhan Anda'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((cat, index) => (
              <div
                key={index}
                className="card p-8 text-center hover:shadow-xl transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 text-primary-600 rounded-full mb-6 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <cat.icon size={40} />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  {cat.label}
                </h3>
                <p className="text-gray-600">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-2xl lg:text-4xl font-bold text-secondary-900 mb-4"
              data-aos="fade-up"
            >
              {settings.home_products_title || (
                <>Produk <span className="text-primary-600">Unggulan</span></>
              )}
            </h2>
            <p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {settings.home_products_subtitle || 'Temukan berbagai produk Suvenir, Artwork, dan Apparel berkualitas dengan desain Islami yang penuh makna.'}
            </p>
          </div>

          {!loading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="card hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        getImageUrl(product.image) ||
                        "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg"
                      }
                      alt={product.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="md:text-xl font-semibold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs md:text-base text-gray-600 mb-4 line-clamp-3">
                      {product.description
                        ?.replace(/<[^>]*>/g, "")
                        .slice(0, 120)}
                      ...
                    </p>
                    <Link
                      to={`/services/${product.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-2 group"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12" data-aos="fade-up">
            <Link
              to="/services"
              className="btn-primary inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg"
            >
              <span>Lihat Semua Produk</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-[#FFFFF0]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-2xl lg:text-4xl font-bold text-secondary-900 mb-6">
                {homeAboutTitle.split(" ").slice(0, -1).join(" ") || homeAboutTitle}{" "}
                <span className="text-primary-600">
                  {homeAboutTitle.split(" ").slice(-1)[0] || ""}
                </span>
              </h2>
              <div className="space-y-4 mb-6">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {homeAboutDescription}
                </p>
              </div>
              <Link
                to="/about"
                className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
              >
                <span>Selengkapnya</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div data-aos="fade-left">
              <div className="w-full h-64 md:h-96 shadow-sm rounded border border-slate-200 p-4">
                <img
                  src={getImageUrl(homeAboutImage) || AboutImage}
                  alt="Tentang Studio Almidad"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0d1b2a] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-2xl lg:text-4xl font-bold mb-6"
            data-aos="fade-up"
          >
            {settings.home_cta_title || 'Ingin Pesan Custom?'}
          </h2>
          <p
            className="text-xl mb-8 max-w-2xl mx-auto text-gray-300"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {settings.home_cta_subtitle || 'Konsultasikan kebutuhan Custom Islamic Art & Meaningful Gifts Anda dengan tim Studio Almidad.'}
          </p>
          <div
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <Link
              to="/contact"
              className="bg-[#D4AF37] hover:bg-[#C5A028] text-secondary-900 inline-flex items-center justify-center space-x-2 px-8 py-4 text-lg rounded-lg font-semibold transition-colors"
            >
              <span>Hubungi Kami</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/services"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-secondary-900 inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg font-semibold transition-colors"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
