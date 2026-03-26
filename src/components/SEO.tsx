import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Martabak Gresik - Terang Bulan & Martabak Telor Terenak",
  description = "Katalog resmi Martabak Gresik (Jl. Usman Sadar No 10). Pesan Terang Bulan Lumer dan Martabak Telor Gurih sekarang! Sejak 2020.",
  image = "https://martabakgresik.com/logo.webp",
  url = "https://martabakgresik.com/",
  type = "website"
}) => {
  const siteTitle = title.includes("Martabak Gresik") ? title : `${title} | Martabak Gresik`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={description} />

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
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
