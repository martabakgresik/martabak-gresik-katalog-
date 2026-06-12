import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CalendarHeart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose }) => {
  const { storeSettings } = useAppStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {storeSettings.eventModalImage && (
            <div className="w-full h-48 md:h-56 bg-brand-orange/10 relative">
              <img 
                src={storeSettings.eventModalImage} 
                alt="Event Banner" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}
          
          <div className="p-6 md:p-8">
            {!storeSettings.eventModalImage && (
              <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex justify-center items-center mb-6">
                <CalendarHeart className="w-8 h-8 text-brand-orange" />
              </div>
            )}
            
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 text-brand-black dark:text-brand-yellow">
              {storeSettings.eventModalTitle || "Pengumuman"}
            </h2>
            
            <div className="prose dark:prose-invert max-w-none mb-8 opacity-80 whitespace-pre-wrap">
              {storeSettings.eventModalContent}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-brand-orange text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Tutup & Lanjutkan
            </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex justify-center items-center hover:bg-black/70 transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
