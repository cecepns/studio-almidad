import { useEffect, useState } from "react";
import AOS from "aos";
import SEO from "../components/Common/SEO";
import Loading from "../components/Common/Loading";
import {
  Users,
  Award,
  Target,
  Eye,
  CircleCheck as CheckCircle,
  Lightbulb,
} from "lucide-react";
import { settingsAPI, getImageUrl } from "../utils/api";
import AboutImage from "../assets/logo.png";

const About = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    company_about: '',
    company_history: '',
    company_vision: '',
    company_mission: '',
    about_page_image: '',
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
        company_about: settingsData.company_about || '',
        company_history: settingsData.company_history || '',
        company_vision: settingsData.company_vision || '',
        company_mission: settingsData.company_mission || '',
        about_page_image: settingsData.about_page_image || '',
        about_hero_title: settingsData.about_hero_title || '',
        about_hero_subtitle: settingsData.about_hero_subtitle || '',
        about_values_title: settingsData.about_values_title || '',
        about_values_subtitle: settingsData.about_values_subtitle || '',
        about_value1_title: settingsData.about_value1_title || '',
        about_value1_description: settingsData.about_value1_description || '',
        about_value2_title: settingsData.about_value2_title || '',
        about_value2_description: settingsData.about_value2_description || '',
        about_value3_title: settingsData.about_value3_title || '',
        about_value3_description: settingsData.about_value3_description || '',
        about_value4_title: settingsData.about_value4_title || '',
        about_value4_description: settingsData.about_value4_description || '',
        about_history_title: settingsData.about_history_title || '',
        about_history_card_title: settingsData.about_history_card_title || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCompanyAbout = (text) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    if (paragraphs.length === 0) return null;

    return paragraphs.map((paragraph, index) => {
      const isLast = index === paragraphs.length - 1;
      return (
        <p
          key={index}
          className={`text-lg text-gray-600 leading-relaxed ${isLast ? 'mb-8' : 'mb-6'}`}
        >
          {paragraph.trim().split('\n').map((line, lineIndex, lines) => (
            <span key={lineIndex}>
              {line.trim()}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  const defaultValues = [
    {
      icon: Award,
      title: "Kualitas Terjamin",
      description:
        "Setiap karya dibuat dengan detail dan kualitas terbaik, sesuai standar tinggi seni Islami.",
    },
    {
      icon: Users,
      title: "Custom Sesuai Kebutuhan",
      description:
        "Desain disesuaikan dengan kebutuhan dan momen istimewa Anda.",
    },
    {
      icon: Lightbulb,
      title: "Kreativitas & Makna",
      description:
        "Kombinasi kreativitas dengan nilai-nilai Islami yang bermakna dalam setiap karya.",
    },
    {
      icon: CheckCircle,
      title: "Integritas",
      description:
        "Menjalankan bisnis dengan integritas, transparansi, dan komitmen penuh pada kepuasan pelanggan.",
    },
  ];

  const values = [
    {
      icon: Award,
      title: settings.about_value1_title || defaultValues[0].title,
      description: settings.about_value1_description || defaultValues[0].description,
    },
    {
      icon: Users,
      title: settings.about_value2_title || defaultValues[1].title,
      description: settings.about_value2_description || defaultValues[1].description,
    },
    {
      icon: Lightbulb,
      title: settings.about_value3_title || defaultValues[2].title,
      description: settings.about_value3_description || defaultValues[2].description,
    },
    {
      icon: CheckCircle,
      title: settings.about_value4_title || defaultValues[3].title,
      description: settings.about_value4_description || defaultValues[3].description,
    },
  ];

  const defaultCompanyHistory =
    "Studio Al - Midad didirikan dengan semangat untuk menghadirkan Custom Islamic Art & Meaningful Gifts yang berkualitas.\n\n" +
    "Kami menyediakan Suvenir, Artwork, dan Apparel dengan desain Islami yang dapat disesuaikan dengan kebutuhan Anda. Setiap produk dibuat dengan penuh perhatian terhadap detail dan nilai estetika.\n\n" +
    "Studio Al - Midad berkomitmen untuk menjadi pilihan terpercaya dalam memenuhi kebutuhan hadiah bermakna dan karya seni Islami untuk berbagai momen istimewa.";

  const defaultVision =
    "Menjadi studio terkemuka dalam Custom Islamic Art & Meaningful Gifts di Indonesia.\n\n" +
    "Menyebarkan nilai-nilai Islami melalui karya seni yang bermakna dan berkualitas, serta menjadi bagian dari momen istimewa setiap pelanggan.";

  const defaultMission =
    "- Menyediakan produk Suvenir, Artwork, dan Apparel Islami berkualitas tinggi dengan desain custom.\n" +
    "- Mengutamakan kepuasan pelanggan melalui layanan yang ramah dan profesional.\n" +
    "- Menghadirkan karya seni yang bermakna untuk setiap momen istimewa.\n" +
    "- Mengembangkan kreativitas seni Islami yang relevan dengan kebutuhan masa kini.";

  return (
    <>
      <SEO
        title="Tentang Studio Al - Midad - Custom Islamic Art & Meaningful Gifts"
        description="Profil Studio Al - Midad, penyedia Custom Islamic Art & Meaningful Gifts. Suvenir • Artwork • Apparel. Jember, Jawa Timur."
        keywords="Studio Al - Midad, Islamic art, custom Islamic art, suvenir Islami, artwork Islami, apparel Islami, hadiah bermakna, Jember"
      />

      {/* Hero Section */}
      <section className="bg-secondary-900 text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1
              className="text-2xl lg:text-6xl font-bold mb-6"
              data-aos="fade-up"
            >
              {settings.about_hero_title || (
                <>Tentang <span className="text-primary-400">Studio Al - Midad</span></>
              )}
            </h1>
            <p
              className="text-xl lg:text-2xl text-gray-300 leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {settings.about_hero_subtitle || 'Custom Islamic Art & Meaningful Gifts. Suvenir • Artwork • Apparel dengan desain berkualitas dan penuh makna.'}
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-ivory">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-2xl lg:text-4xl font-bold text-secondary-900 mb-6">
                {settings.company_name || 'Studio Al - Midad'}
              </h2>
              {loading ? (
                <Loading />
              ) : (
                <>
                  {formatCompanyAbout(settings.company_about)}
                </>
              )}
              {!settings.company_about && formatCompanyAbout(
                "Studio Al - Midad bergerak di bidang Custom Islamic Art & Meaningful Gifts. Kami menyediakan Suvenir, Artwork, dan Apparel dengan desain Islami yang dapat disesuaikan dengan kebutuhan dan momen istimewa Anda."
              )}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    Custom
                  </div>
                  <div className="text-gray-600">Desain Sesuai Pesanan</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    3+
                  </div>
                  <div className="text-gray-600">Kategori Produk</div>
                </div>
              </div>
            </div>
            <div data-aos="fade-left">
              <div className="w-full h-64 md:h-96 shadow-sm rounded border border-slate-200 p-4">
                <img
                  src={settings.about_page_image ? getImageUrl(settings.about_page_image) : AboutImage}
                  alt={settings.company_name || 'Studio Al - Midad'}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="card p-8" data-aos="fade-up">
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 p-4 rounded-full mr-4">
                  <Eye className="text-primary-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900">Visi Kami</h3>
              </div>
              <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                {settings.company_vision || defaultVision}
              </div>
            </div>

            <div className="card p-8" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 p-4 rounded-full mr-4">
                  <Target className="text-primary-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900">Misi Kami</h3>
              </div>
              <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                {settings.company_mission || defaultMission}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-2xl lg:text-4xl font-bold text-secondary-900 mb-4"
              data-aos="fade-up"
            >
              {settings.about_values_title || (
                <>Nilai-Nilai <span className="text-primary-600">Kami</span></>
              )}
            </h2>
            <p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {settings.about_values_subtitle || 'Nilai-nilai fundamental yang menjadi fondasi dalam setiap karya dan layanan kami.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center card p-6 hover:shadow-xl transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="bg-primary-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <value.icon className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-2xl lg:text-4xl font-bold text-secondary-900 mb-4"
              data-aos="fade-up"
            >
              {settings.about_history_title || (
                <>Cerita <span className="text-primary-600">Kami</span></>
              )}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card p-8" data-aos="fade-up">
              <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                {settings.about_history_card_title || settings.company_name || 'Studio Al - Midad'}
              </h3>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
                {formatCompanyAbout(settings.company_history || defaultCompanyHistory)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
