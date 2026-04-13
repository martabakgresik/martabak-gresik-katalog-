import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, MessageCircle, Copy, Check, Facebook, Twitter, ExternalLink, Instagram, Music2, Download, Maximize2, MapPin
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface ModalsContainerProps {
  cart: any[];
  totalPrice: number;
  sendWhatsAppOrder: () => void;
  formatPrice: (price: number) => string;
  storeAddress: string;
}

export const ModalsContainer: React.FC<ModalsContainerProps> = ({
  cart,
  totalPrice,
  sendWhatsAppOrder,
  formatPrice,
  storeAddress
}) => {
  const { uiState, setUiState, t } = useAppStore();
  const {
    shareItem,
    isGeneralShareOpen,
    isOrderConfirmationOpen,
    zoomedImage,
    isMapOpen,
    copied
  } = uiState;

  const APP_URL = window.location.origin;

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setUiState({ copied: true });
    setTimeout(() => setUiState({ copied: false }), 2000);
  };

  const shareToWhatsApp = (item: { name: string; price: number; category?: string }) => {
    const message = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${item.name}*\n${item.category ? `(${item.category})\n` : ""}Harga: *${formatPrice(item.price)}*\n\nCek katalog lengkapnya di sini: ${APP_URL}`;
    const encodedMessage = encodeURIComponent(message);
    const storePhone = "6281330763633"; // Better to pull from store if available
    window.open(`https://wa.me/${storePhone}?text=${encodedMessage}`, "_blank");
  };

  const shareGeneral = async (platform: string) => {
    const title = "Martabak Gresik";
    const text = `Cek Martabak Gresik - Terang Bulan dan Martabak Telor Terenak!`;
    const url = APP_URL;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {}
    }

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "threads":
        shareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}`;
        break;
      default:
        handleCopyLink(url);
        return;
    }
    window.open(shareUrl, "_blank");
  };

  return (
    <>
      {/* Item Share Modal */}
      <AnimatePresence>
        {shareItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUiState({ shareItem: null })}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[1010]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow z-[1020] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">{t.shareMenuTitle}</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider dark:text-white/40">{t.sendToWhatsApp}</p>
                </div>
                <button
                  onClick={() => setUiState({ shareItem: null })}
                  className="p-2 hover:bg-brand-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-brand-black/5 dark:bg-white/10 p-4 rounded-2xl mb-6">
                <p className="text-sm font-bold dark:text-white">{shareItem.name}</p>
                <p className="text-xs opacity-60 dark:text-brand-yellow/60">{shareItem.category}</p>
                <p className="text-lg font-black mt-2 dark:text-brand-yellow">{formatPrice(shareItem.price)}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => shareToWhatsApp(shareItem)}
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.sendToWhatsApp}
                </button>
                <button
                  onClick={() => {
                    const msg = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${shareItem.name}*\n${shareItem.category ? `(${shareItem.category})\n` : ""}Harga: *${formatPrice(shareItem.price)}*\n\nCek katalog lengkapnya di sini: ${APP_URL}`;
                    handleCopyLink(msg);
                  }}
                  className="w-full bg-brand-black text-white py-4 rounded-xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? t.copiedSuccess : t.copyMessage}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* General Share Modal */}
      <AnimatePresence>
        {isGeneralShareOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUiState({ isGeneralShareOpen: false })}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[1010]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-brand-yellow dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow z-[1020] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">{t.shareCatalogTitle}</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider dark:text-white/40">{t.inviteFriends}</p>
                </div>
                <button
                  onClick={() => setUiState({ isGeneralShareOpen: false })}
                  className="p-2 hover:bg-brand-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => shareGeneral("facebook")}
                  className="bg-[#1877F2] text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Facebook</span>
                </button>
                <button
                  onClick={() => shareGeneral("twitter")}
                  className="bg-black text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Twitter className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">X (Twitter)</span>
                </button>
                <button
                  onClick={() => shareGeneral("threads")}
                  className="bg-black text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Threads</span>
                </button>
                <button
                  onClick={() => handleCopyLink(APP_URL)}
                  className="bg-brand-orange text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  <span className="text-[10px] font-bold uppercase">{copied ? t.copiedShort : t.copyLink}</span>
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold uppercase opacity-40 dark:text-white/40">{t.orShareVia}</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => shareGeneral("instagram")} 
                    title={t.shareInstagram}
                    className="p-2 bg-white dark:bg-brand-black rounded-full border-2 border-brand-black dark:border-brand-yellow hover:bg-brand-orange hover:text-white transition-all dark:text-white"
                  >
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => shareGeneral("tiktok")} 
                    title={t.shareTikTok}
                    className="p-2 bg-white dark:bg-brand-black rounded-full border-2 border-brand-black dark:border-brand-yellow hover:bg-brand-orange hover:text-white transition-all dark:text-white"
                  >
                    <Music2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {isOrderConfirmationOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUiState({ isOrderConfirmationOpen: false })}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[1100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-white dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow z-[1110] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-brand-black dark:bg-black text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">{t.orderConfirmationTitle}</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider dark:text-white/40">{t.reviewOrder}</p>
                </div>
                <button
                  onClick={() => setUiState({ isOrderConfirmationOpen: false })}
                  className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Order Summary */}
                <div className="space-y-4">
                  <h4 className="font-black uppercase italic text-sm border-b-2 border-brand-black dark:border-brand-yellow pb-2 dark:text-brand-yellow">{t.menuSummary}</h4>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                          <p className="font-bold text-sm leading-tight dark:text-white">{item.name}</p>
                          {item.category && <p className="text-[10px] uppercase font-bold opacity-40 dark:text-brand-yellow/60">{item.category}</p>}
                          {item.note && <p className="text-[10px] italic opacity-60 dark:text-white/40">{t.noteLabel}: {item.note}</p>}
                          <p className="text-xs opacity-60 dark:text-white/40">{item.quantity}x {formatPrice(item.price)}</p>
                        </div>
                        <span className="font-black text-sm shrink-0 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-brand-black/20 dark:border-brand-yellow/20 flex justify-between items-center">
                    <span className="font-black uppercase dark:text-brand-yellow/60">{t.totalPayment}</span>
                    <span className="text-xl font-black text-brand-orange">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* QRIS Section */}
                <div className="bg-brand-yellow/20 p-6 rounded-3xl border-2 border-brand-black/10 flex flex-col items-center text-center">
                  <h4 className="font-black uppercase italic text-sm mb-4 dark:text-brand-yellow">{t.qrisPayment}</h4>
                  <div className="bg-white p-4 rounded-2xl border-2 border-brand-black shadow-inner mb-4">
                    <img
                      src="/qris.png"
                      alt="QRIS Pembayaran"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>

                  <a
                    href="/qris.png"
                    download="QRIS_Martabak_Gresik.png"
                    className="mb-4 bg-brand-black text-white px-6 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 hover:bg-brand-orange transition-colors active:scale-95 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadQris}
                  </a>

                  <p className="text-[10px] font-bold uppercase opacity-60 leading-tight">
                    {t.scanQrisHint}<br />
                    {t.saveProofHint}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white border-t-4 border-brand-black shrink-0">
                <button
                  onClick={() => {
                    sendWhatsAppOrder();
                    setUiState({ isOrderConfirmationOpen: false });
                  }}
                  className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-xl"
                >
                  <MessageCircle className="w-6 h-6" />
                  {t.confirmAndSendWhatsApp}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setUiState({ zoomedImage: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setUiState({ zoomedImage: null })}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-brand-orange text-white rounded-full backdrop-blur-md transition-colors z-10 shadow-xl"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={zoomedImage.src} 
                alt={zoomedImage.alt} 
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl shadow-2xl bg-black/50"
              />
              <div className="mt-4 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold text-center border border-white/10 shadow-lg max-w-full whitespace-normal">
                {zoomedImage.alt}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUiState({ isMapOpen: false })}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-md z-[1300]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl bg-white dark:bg-brand-black rounded-[2.5rem] border-4 border-brand-black dark:border-brand-yellow z-[1310] overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[70vh]"
            >
              <div className="p-6 bg-brand-black dark:bg-black text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-orange rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">Lokasi Toko</h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest dark:text-white/40">{storeAddress}</p>
                  </div>
                </div>
                <button
                  onClick={() => setUiState({ isMapOpen: false })}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow bg-zinc-100 dark:bg-zinc-900 relative">
                <iframe
                  title="Martabak Gresik Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(storeAddress + " Martabak Gresik")}&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>

              <div className="p-4 bg-white dark:bg-brand-black border-t-2 border-brand-black/10 dark:border-brand-yellow/10 flex justify-center shrink-0">
                <a
                  href="https://maps.app.goo.gl/hQUez8CW4wTCXYg3A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-8 py-3 rounded-2xl font-black uppercase italic text-sm flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.openInGoogleMaps}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
