import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, FileText, Trash2, ArrowLeft, Mail } from 'lucide-react';

interface LegalPagesProps {
  type: 'tos' | 'privacy' | 'deletion';
  onClose: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type, onClose }) => {
  const content = {
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
  };

  const activeContent = content[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-white dark:bg-brand-black rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-yellow dark:bg-brand-black/90 dark:backdrop-blur-md p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm">
              {activeContent.icon}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-brand-black dark:text-brand-yellow leading-tight">
                {activeContent.title}
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-brand-orange uppercase tracking-widest mt-0.5">Martabak Gresik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-brand-black/5 dark:bg-white/10 hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange transition-all rounded-full group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {activeContent.sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-lg md:text-xl font-black text-brand-black dark:text-brand-yellow flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-orange rounded-full" />
                {section.heading}
              </h3>
              <p className="text-sm md:text-base text-brand-black/70 dark:text-white/70 leading-relaxed font-medium">
                {section.body}
              </p>
            </motion.div>
          ))}

          {/* Footer of Content */}
          <div className="pt-8 border-t border-black/5 dark:border-white/10 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2 text-brand-orange font-bold uppercase text-[10px] tracking-widest bg-brand-orange/10 px-4 py-1.5 rounded-full">
                <Mail className="w-3.5 h-3.5" />
                Hubungi Kami: martabakgresik@gmail.com
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-8 py-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-full font-black uppercase tracking-wider text-sm hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
