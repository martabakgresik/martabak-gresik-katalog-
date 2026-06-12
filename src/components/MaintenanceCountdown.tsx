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
      <div className="bg-white/5 p-4 rounded-2xl mb-8 border border-white/10 backdrop-blur-md">
        <p className="text-sm uppercase font-bold text-white/60 mb-1">Pesan / Keterangan:</p>
        <p className="text-xl font-black text-brand-yellow">{targetDateStr}</p>
      </div>
    );
  }

  if (timeLeft === null) {
    return (
      <div className="bg-green-500/20 p-5 rounded-2xl mb-8 border border-green-500/30 text-green-300 backdrop-blur-md">
        <p className="text-2xl font-black uppercase tracking-wide mb-1">Segera Buka!</p>
        <p className="text-sm font-medium opacity-90">Memuat ulang sistem...</p>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-white/5 p-6 rounded-[2rem] mb-8 border border-white/10 backdrop-blur-md shadow-inner shadow-white/5">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-brand-yellow" />
        <p className="text-sm tracking-wider font-bold text-white/80 uppercase">Estimasi Buka Kembali</p>
      </div>
      
      <div className="flex justify-center gap-4">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
              <span className="text-3xl font-black text-white">{formatNumber(timeLeft.days)}</span>
            </div>
            <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase mt-2">Hari</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
            <span className="text-3xl font-black text-white">{formatNumber(timeLeft.hours)}</span>
          </div>
          <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase mt-2">Jam</span>
        </div>
        <div className="flex flex-col items-center relative">
          <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
            <span className="text-3xl font-black text-white">{formatNumber(timeLeft.minutes)}</span>
          </div>
          <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase mt-2">Menit</span>
          <div className="absolute top-1/3 -right-2.5 text-white/30 font-black animate-pulse">:</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-brand-yellow/20 rounded-2xl flex items-center justify-center shadow-inner border border-brand-yellow/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-yellow/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="text-3xl font-black text-brand-yellow relative z-10">{formatNumber(timeLeft.seconds)}</span>
          </div>
          <span className="text-[11px] font-bold tracking-wider text-brand-yellow/60 uppercase mt-2">Detik</span>
        </div>
      </div>
      
      <p className="text-sm font-medium text-white/50 mt-6 text-center">
        {new Date(targetDateStr).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
      </p>
    </div>
  );
}
