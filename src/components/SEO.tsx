import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  price?: number;
  category?: string;
  noindex?: boolean;
  phone?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Martabak Gresik - Terang Bulan & Martabak Telor Terenak",
  description = "Katalog resmi Martabak Gresik (Jl. Usman Sadar No 10). Pesan Terang Bulan Lumer dan Martabak Telor Gurih sekarang! Sejak 2020.",
  image = "https://martabakgresik.my.id/metaseo.webp",
  url = "https://martabakgresik.my.id",
  type = "website",
  price,
  category,
  noindex = false,
  phone = "+6281330763633"
}) => {
  const siteTitle = title.includes("Martabak Gresik") ? title : `${title} | Martabak Gresik`;
  const SITE_NAME = "Martabak Gresik";
  const BASE_URL = "https://martabakgresik.my.id";

  // Restaurant Schema — lengkap dengan semua field
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": SITE_NAME,
    "description": "Terang Bulan (Manis) dan Martabak Telor (Asin) Autentik dengan cita rasa premium. Buka setiap hari pukul 16.00–23.00 WIB.",
    "image": `${BASE_URL}/metaseo.webp`,
    "logo": `${BASE_URL}/logo.webp`,
    "url": BASE_URL,
    "telephone": phone,
    "priceRange": "Rp",
    "servesCuisine": ["Indonesian", "Martabak", "Terang Bulan", "Martabak Telor"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Usman Sadar No 10",
      "addressLocality": "Gresik",
      "addressRegion": "Jawa Timur",
      "postalCode": "61118",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -7.1535973,
      "longitude": 112.6504935
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "16:00",
        "closes": "23:00"
      }
    ],
    "hasMenu": `${BASE_URL}/`,
    "mainEntityOfPage": BASE_URL,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "87",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://www.instagram.com/martabakgresik",
      "https://www.facebook.com/martabakgresik",
      "https://maps.app.goo.gl/martabakgresik"
    ]
  };

  const productSchema = price ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "description": description,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "IDR",
      "availability": "https://schema.org/InStock",
      "url": url,
      "seller": {
        "@type": "Restaurant",
        "name": SITE_NAME
      }
    },
    "category": category
  } : null;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={SITE_NAME} />

      {/* Structured Data — Restaurant */}
      <script type="application/ld+json">
        {JSON.stringify(restaurantSchema)}
      </script>
      {/* Structured Data — Product (jika ada item) */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="id_ID" />
      <meta property="og:site_name" content={SITE_NAME} />
      {phone && <meta property="og:phone_number" content={phone} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Tags */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
