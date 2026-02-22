import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Studio Almidad - Custom Islamic Art & Meaningful Gifts", 
  description = "Studio Almidad menyediakan Custom Islamic Art & Meaningful Gifts. Suvenir • Artwork • Apparel. Jember, Jawa Timur.",
  keywords = "Studio Almidad, Islamic art, custom Islamic art, suvenir Islami, artwork Islami, apparel Islami, hadiah bermakna, Jember",
  image = "/logo.png",
  url = window.location.href
}) => {
  const siteTitle = "Studio Almidad";
  const fullTitle = title === siteTitle ? title : `${title} - ${siteTitle}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Indonesian" />
      <meta name="author" content="Studio Almidad" />
    </Helmet>
  );
};

export default SEO;