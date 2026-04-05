import { FileText, ShieldCheck, Trash2 } from "lucide-react";
import type { UiLang } from "../../hooks/useUiLanguage";

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
          heading: '1. Data Yang Kami Kumpulkan',
          body: 'Kami hanya mengumpulkan informasi dasar yang Anda berikan secara sukarela untuk memproses pesanan, seperti Nama, Nomor HP, dan Alamat pengiriman.'
        },
        {
          heading: '2. Penggunaan Data',
          body: 'Informasi Anda digunakan semata-mata untuk keperluan pengiriman pesanan dan komunikasi terkait pesanan tersebut. Kami tidak akan menjual atau menyebarkan data Anda ke pihak lain untuk tujuan komersial.'
        },
        {
          heading: '3. Keamanan Data',
          body: 'Kami menggunakan penyimpanan lokal (local storage) pada perangkat Anda untuk menyimpan keranjang belanja dan preferensi tema. Data pesanan yang dikirim melalui WhatsApp mengikuti protokol keamanan dari aplikasi tersebut.'
        },
        {
          heading: '4. Kontak Kami',
          body: 'Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami melalui email: martabakgresik@gmail.com.'
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
              heading: '1. Data We Collect',
              body: 'We only collect basic information you voluntarily provide to process orders, such as Name, Phone Number, and Delivery Address.'
            },
            {
              heading: '2. Data Usage',
              body: 'Your information is used solely for order delivery and communication related to the order. We do not sell or distribute your data for commercial purposes.'
            },
            {
              heading: '3. Data Security',
              body: 'We use local storage on your device to store cart and theme preferences. Order data sent via WhatsApp follows that application’s security protocols.'
            },
            {
              heading: '4. Contact Us',
              body: 'If you have questions about this privacy policy, please contact us via email: martabakgresik@gmail.com.'
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
