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
      <div className="bg-brand-yellow/30 dark:bg-brand-yellow/10 p-4 rounded-xl mb-8 border border-brand-orange/20">
        <p className="text-sm uppercase font-bold opacity-70 mb-1">Pesan / Keterangan:</p>
        <p className="text-xl font-black text-brand-orange">{targetDateStr}</p>
      </div>
    );
  }

  if (timeLeft === null) {
    return (
      <div className="bg-green-500/10 p-4 rounded-xl mb-8 border border-green-500/20 text-green-600 dark:text-green-400">
        <p className="text-xl font-black uppercase">Segera Buka!</p>
        <p className="text-sm font-bold opacity-80">Waktu maintenance telah selesai, mohon refresh halaman.</p>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-brand-yellow/30 dark:bg-brand-yellow/10 p-5 rounded-xl mb-8 border border-brand-orange/20">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-brand-orange" />
        <p className="text-sm uppercase font-bold opacity-70">Estimasi Buka Kembali</p>
      </div>
      
      <div className="flex justify-center gap-3">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-white dark:bg-black rounded-xl flex items-center justify-center shadow-inner border border-black/5 dark:border-white/5">
              <span className="text-2xl font-black text-brand-orange">{formatNumber(timeLeft.days)}</span>
            </div>
            <span className="text-[10px] font-bold uppercase mt-1 opacity-60">Hari</span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-white dark:bg-black rounded-xl flex items-center justify-center shadow-inner border border-black/5 dark:border-white/5">
            <span className="text-2xl font-black text-brand-orange">{formatNumber(timeLeft.hours)}</span>
          </div>
          <span className="text-[10px] font-bold uppercase mt-1 opacity-60">Jam</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-white dark:bg-black rounded-xl flex items-center justify-center shadow-inner border border-black/5 dark:border-white/5">
            <span className="text-2xl font-black text-brand-orange">{formatNumber(timeLeft.minutes)}</span>
          </div>
          <span className="text-[10px] font-bold uppercase mt-1 opacity-60">Menit</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-white dark:bg-black rounded-xl flex items-center justify-center shadow-inner border border-black/5 dark:border-white/5">
            <span className="text-2xl font-black text-brand-orange">{formatNumber(timeLeft.seconds)}</span>
          </div>
          <span className="text-[10px] font-bold uppercase mt-1 opacity-60">Detik</span>
        </div>
      </div>
      
      <p className="text-xs font-medium opacity-60 mt-4 text-center">
        {new Date(targetDateStr).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
      </p>
    </div>
  );
}
