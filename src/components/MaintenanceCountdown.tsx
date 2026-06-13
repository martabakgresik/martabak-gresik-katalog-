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
      <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl mb-3 md:mb-5 border border-yellow-300/20">
        <p className="text-[10px] md:text-xs uppercase font-bold text-white/60 mb-1">Pesan / Keterangan:</p>
        <p className="text-base md:text-lg font-black text-yellow-300">{targetDateStr}</p>
      </div>
    );
  }

  if (timeLeft === null) {
    return (
      <div className="bg-green-500/20 p-3 md:p-5 rounded-xl md:rounded-2xl mb-3 md:mb-5 text-green-400 border border-green-500">
        <p className="text-lg md:text-xl font-black uppercase tracking-wide mb-1">Segera Buka!</p>
        <p className="text-xs font-medium opacity-90">Memuat ulang sistem...</p>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-black/50 p-2 md:p-4 rounded-2xl md:rounded-[1.5rem] mb-2 md:mb-4 shadow-inner border border-yellow-300/50">
      <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
        <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
        <p className="text-[10px] md:text-xs tracking-wider font-bold uppercase text-white/90">Estimasi Buka Kembali</p>
      </div>
      
      <div className="flex justify-center gap-2 md:gap-3">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-yellow-300 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg text-zinc-900 border border-yellow-300">
              <span className="text-xl md:text-2xl font-black">{formatNumber(timeLeft.days)}</span>
            </div>
            <span className="text-[8px] md:text-[10px] font-bold tracking-wider uppercase mt-1.5 md:mt-2 text-yellow-300/90">Hari</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-yellow-300 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg text-zinc-900 border border-yellow-300">
            <span className="text-xl md:text-2xl font-black">{formatNumber(timeLeft.hours)}</span>
          </div>
          <span className="text-[8px] md:text-[10px] font-bold tracking-wider uppercase mt-1.5 md:mt-2 text-yellow-300/90">Jam</span>
        </div>
        <div className="flex flex-col items-center relative">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-yellow-300 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg text-zinc-900 border border-yellow-300">
            <span className="text-xl md:text-2xl font-black">{formatNumber(timeLeft.minutes)}</span>
          </div>
          <span className="text-[8px] md:text-[10px] font-bold tracking-wider uppercase mt-1.5 md:mt-2 text-yellow-300/90">Menit</span>
          <div className="absolute top-1/3 -right-1.5 md:-right-2 font-black animate-pulse text-white/40">:</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group text-zinc-900 border border-white">
            <span className="text-xl md:text-2xl font-black relative z-10">{formatNumber(timeLeft.seconds)}</span>
          </div>
          <span className="text-[8px] md:text-[10px] font-bold tracking-wider uppercase mt-1.5 md:mt-2 text-white/90">Detik</span>
        </div>
      </div>
      
      <p className="text-[10px] md:text-xs font-medium mt-2 md:mt-3 text-center leading-relaxed text-white/50">
        {new Date(targetDateStr).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
      </p>
    </div>
  );
}
