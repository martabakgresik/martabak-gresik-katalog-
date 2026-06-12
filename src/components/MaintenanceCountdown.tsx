import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface MaintenanceCountdownProps {
  targetDateStr: string;
}

export function MaintenanceCountdown({ targetDateStr }: MaintenanceCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [isValidDate, setIsValidDate] = useState(true);

  useEffect(() => {
    const targetDate = new Date(targetDateStr);
    
    if (isNaN(targetDate.getTime())) {
      setIsValidDate(false);
      return;
    }

    setIsValidDate(true);

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  if (!isValidDate) {
    return (
      <div className="bg-white opacity-5 p-3 md:p-4 rounded-2xl mb-4 md:mb-8 border border-brand-yellow opacity-20">
        <p className="text-xs md:text-sm uppercase font-bold text-white opacity-60 mb-1">Pesan / Keterangan:</p>
        <p className="text-lg md:text-xl font-black text-brand-yellow">{targetDateStr}</p>
      </div>
    );
  }

  if (timeLeft === null) {
    return (
      <div className="bg-green-500 opacity-20 p-4 md:p-5 rounded-2xl mb-4 md:mb-8 border border-green-500 opacity-30 text-green-400">
        <p className="text-xl md:text-2xl font-black uppercase tracking-wide mb-1">Segera Buka!</p>
        <p className="text-xs md:text-sm font-medium opacity-90">Memuat ulang sistem...</p>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-black opacity-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] mb-4 md:mb-8 border border-brand-yellow opacity-20 shadow-inner">
      <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
        <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow" />
        <p className="text-xs md:text-sm tracking-wider font-bold text-white opacity-90 uppercase">Estimasi Buka Kembali</p>
      </div>
      
      <div className="flex justify-center gap-2 md:gap-4">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-yellow text-brand-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-brand-yellow opacity-50">
              <span className="text-2xl md:text-3xl font-black">{formatNumber(timeLeft.days)}</span>
            </div>
            <span className="text-[9px] md:text-[11px] font-bold tracking-wider text-brand-yellow opacity-80 uppercase mt-1.5 md:mt-2">Hari</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-yellow text-brand-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-brand-yellow opacity-50">
            <span className="text-2xl md:text-3xl font-black">{formatNumber(timeLeft.hours)}</span>
          </div>
          <span className="text-[9px] md:text-[11px] font-bold tracking-wider text-brand-yellow opacity-80 uppercase mt-1.5 md:mt-2">Jam</span>
        </div>
        <div className="flex flex-col items-center relative">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-yellow text-brand-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-brand-yellow opacity-50">
            <span className="text-2xl md:text-3xl font-black">{formatNumber(timeLeft.minutes)}</span>
          </div>
          <span className="text-[9px] md:text-[11px] font-bold tracking-wider text-brand-yellow opacity-80 uppercase mt-1.5 md:mt-2">Menit</span>
          <div className="absolute top-1/3 -right-1.5 md:-right-2.5 text-white opacity-30 font-black animate-pulse">:</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-brand-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-white opacity-50 relative overflow-hidden group">
            <span className="text-2xl md:text-3xl font-black relative z-10">{formatNumber(timeLeft.seconds)}</span>
          </div>
          <span className="text-[9px] md:text-[11px] font-bold tracking-wider text-white opacity-80 uppercase mt-1.5 md:mt-2">Detik</span>
        </div>
      </div>
      
      <p className="text-xs md:text-sm font-medium text-white opacity-50 mt-4 md:mt-6 text-center leading-relaxed">
        {new Date(targetDateStr).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
      </p>
    </div>
  );
}
