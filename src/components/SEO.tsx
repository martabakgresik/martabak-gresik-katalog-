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
}

export const SEO: React.FC<SEOProps> = ({
  title = "Martabak Gresik - Terang Bulan & Martabak Telor Terenak",
  description = "Katalog resmi Martabak Gresik (Jl. Usman Sadar No 10). Pesan Terang Bulan Lumer dan Martabak Telor Gurih sekarang! Sejak 2020.",
  image = "https://martabakgresik.com/metaseo.webp",
  url = "https://martabakgresik.my.id",
  type = "website",
  price,
  category,
  noindex = false
}) => {
  const siteTitle = title.includes("Martabak Gresik") ? title : `${title} | Martabak Gresik`;

  // Default Restaurant Schema
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Martabak Gresik",
    "image": image,
    "url": url,
    "telephone": "+6281330763633",
    "priceRange": "Rp",
    "servesCuisine": "Indonesian, Martabak, Terang Bulan",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Usman Sadar No 10",
      "addressLocality": "Gresik",
      "addressRegion": "Jawa Timur",
      "postalCode": "61111",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -7.1593,
      "longitude": 112.6565
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "16:00",
      "closes": "23:00"
    }
  };

  const productSchema = price ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "description": description,
    "image": image,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "IDR",
      "availability": "https://schema.org/InStock",
      "url": url
    },
    "category": category
  } : null;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={description} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(restaurantSchema)}
      </script>
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

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Tags */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
