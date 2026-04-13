import { FileText, ShieldCheck, Trash2 } from "lucide-react";
import type { UiLang } from "../../store/useAppStore";

export const LEGAL_CONTENT: Record<UiLang, any> = {
    id: {
      contactUs: 'Hubungi Kami',
      backToCatalog: 'Kembali ke Katalog',
      content: {
    tos: {
      title: 'Ketentuan Layanan',
      icon: <FileText className="w-8 h-8 text-brand-orange" />,
      sections: [
        {
          heading: '1. Penggunaan Katalog',
          body: 'Katalog online Martabak Gresik disediakan sebagai sarana informasi menu dan kemudahan pemesanan bagi pelanggan. Dengan mengakses katalog ini, Anda setuju untuk menggunakan layanan kami dengan cara yang sah.'
        },
        {
          heading: '2. Akurasi Informasi & Harga',
          body: 'Kami berupaya keras untuk menjaga akurasi harga dan deskripsi menu. Namun, harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya menyesuaikan dengan harga bahan baku.'
        },
        {
          heading: '3. Proses Pemesanan',
          body: 'Pemesanan melalui katalog ini akan diteruskan langsung ke sistem WhatsApp kami atau platform pihak ketiga (GrabFood/GoFood/ShopeeFood). Transaksi dianggap sah setelah ada konfirmasi dari pihak kami atau admin.'
        },
        {
          heading: '4. Pengiriman',
          body: 'Layanan pengiriman dilakukan oleh kurir internal kami atau mitra pihak ketiga. Estimasi waktu pengiriman bersifat perkiraan dan dapat dipengaruhi oleh kondisi cuaca atau kepadatan pesanan.'
        }
      ]
    },
    privacy: {
      title: 'Kebijakan Privasi',
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
      sections: [
        {
          heading: '1. Sifat Aplikasi',
          body: 'Aplikasi Martabak Gresik adalah aplikasi resmi Martabak Gresik. Aplikasi ini berfungsi sebagai WebView yang mempermudah akses ke katalog online kami tanpa mengumpulkan data perangkat secara tersembunyi.'
        },
        {
          heading: '2. Data Yang Kami Kumpulkan',
          body: 'Kami hanya mengumpulkan informasi yang Anda berikan secara sukarela untuk memproses pesanan saat bertransaksi di dalam katalog, seperti Nama, Nomor HP, dan Alamat pengiriman.'
        },
        {
          heading: '3. Penggunaan & Keamanan Data',
          body: 'Data Anda digunakan semata-mata untuk keperluan pengiriman pesanan dan komunikasi terkait pesanan melalui WhatsApp. Kami tidak membagikan, menjual, atau menyalahgunakan data pribadi Anda kepada pihak ketiga.'
        },
        {
          heading: '4. Tautan Pihak Ketiga',
          body: 'Aplikasi ini menggunakan tautan eksternal untuk pemesanan (WhatsApp) dan penunjuk lokasi (Google Maps). Keamanan data pada tautan tersebut mengikuti kebijakan privasi masing-masing platform.'
        }
      ]
    },
    deletion: {
      title: 'Penghapusan Data',
      icon: <Trash2 className="w-8 h-8 text-red-500" />,
      sections: [
        {
          heading: 'Hak Anda Atas Data',
          body: 'Meskipun kami tidak memiliki sistem akun permanen (kami menggunakan sistem katalog langsung), data pesanan Anda mungkin tercatat dalam log komunikasi kami (seperti di WhatsApp).'
        },
        {
          heading: 'Prosedur Penghapusan',
          body: 'Jika Anda ingin agar riwayat data pesanan Anda (Nama/Alamat/No HP) dihapus dari catatan internal kami, Anda dapat melakukannya dengan sangat mudah.'
        },
        {
          heading: 'Langkah-langkah Pengajuan',
          body: 'Kirimkan email ke martabakgresik@gmail.com dengan subjek "Permohonan Penghapusan Data". Cantumkan Nama atau Nomor HP yang ingin dihapus. Kami akan memproses permintaan Anda dalam waktu maksimal 3x24 jam.'
        }
      ]
    },
      },
    },
    en: {
      contactUs: 'Contact Us',
      backToCatalog: 'Back to Catalog',
      content: {
        tos: {
          title: 'Terms of Service',
          icon: <FileText className="w-8 h-8 text-brand-orange" />,
          sections: [
            {
              heading: '1. Catalog Usage',
              body: 'Martabak Gresik online catalog is provided to share menu information and simplify ordering. By accessing this catalog, you agree to use our service lawfully.'
            },
            {
              heading: '2. Information & Price Accuracy',
              body: 'We strive to keep menu prices and descriptions accurate. However, prices may change at any time without prior notice following raw material costs.'
            },
            {
              heading: '3. Ordering Process',
              body: 'Orders from this catalog are forwarded directly to our WhatsApp system or third-party platforms (GrabFood/GoFood/ShopeeFood). Transactions are considered valid after confirmation from our team/admin.'
            },
            {
              heading: '4. Delivery',
              body: 'Delivery is handled by our internal couriers or third-party partners. Delivery estimates are approximate and may be affected by weather or order volume.'
            }
          ]
        },
        privacy: {
          title: 'Privacy Policy',
          icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
          sections: [
            {
              heading: '1. App Nature',
              body: 'The Martabak Gresik App is the official app for Martabak Gresik. This app functions as a WebView to simplify access to our online catalog without secretly collecting device data.'
            },
            {
              heading: '2. Data We Collect',
              body: 'We only collect information you voluntarily provide to process orders when transacting within the catalog, such as Name, Phone Number, and Delivery Address.'
            },
            {
              heading: '3. Data Usage & Security',
              body: 'Your information is used solely for order delivery and communication related to the order via WhatsApp. We do not share, sell, or abuse your personal data with third parties.'
            },
            {
              heading: '4. Third-Party Links',
              body: 'This app uses external links for ordering (WhatsApp) and location guidance (Google Maps). Data security on these links follows the privacy policies of the respective platforms.'
            }
          ]
        },
        deletion: {
          title: 'Data Deletion',
          icon: <Trash2 className="w-8 h-8 text-red-500" />,
          sections: [
            {
              heading: 'Your Data Rights',
              body: 'Although we do not use a permanent account system (direct catalog system), your order data may appear in communication logs (such as WhatsApp).'
            },
            {
              heading: 'Deletion Procedure',
              body: 'If you want your order data history (Name/Address/Phone Number) removed from our internal records, you can request it easily.'
            },
            {
              heading: 'Submission Steps',
              body: 'Send an email to martabakgresik@gmail.com with subject \"Data Deletion Request\". Include the Name or Phone Number to be deleted. We will process the request within a maximum of 3x24 hours.'
            }
          ]
        },
      },
    },
  } as const;
