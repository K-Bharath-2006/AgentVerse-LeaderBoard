import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Clock, Calendar, AlertCircle, Zap } from 'lucide-react';

interface EventConfig {
  startDate: string;
  endDate: string;
  isStarted: boolean;
  startedAt?: string;
}

export default function CountdownCard() {
  const [event, setEvent] = useState<EventConfig | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number; hours: number; minutes: number; seconds: number;
    isEnded: boolean; totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false, totalMs: 0 });

  const fetchEvent = async () => {
    try {
      const { data } = await api.get('/public/event');
      setEvent(data);
    } catch (err) {
      console.error('Failed to fetch event configuration:', err);
    }
  };

  useEffect(() => {
    fetchEvent();
    const interval = setInterval(fetchEvent, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!event || !event.isStarted) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(event.endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true, totalMs: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isEnded: false,
        totalMs: difference
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [event]);

  if (!event) {
    return (
      <div className="glass-card p-4 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Loading timeline...</span>
      </div>
    );
  }

  const startFmt = new Date(event.startDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  const endFmt = new Date(event.endDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  let progressPercent = 0;
  if (event.isStarted && event.startedAt) {
    const totalDuration = new Date(event.endDate).getTime() - new Date(event.startedAt).getTime();
    const elapsed = new Date().getTime() - new Date(event.startedAt).getTime();
    progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  const status = timeLeft.isEnded ? 'ended' : event.isStarted ? 'live' : 'scheduled';
  const statusConfig = {
    live: { label: '🔴 Live Now', color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
    scheduled: { label: '⏳ Scheduled', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    ended: { label: '✓ Ended', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
  };
  const sc = statusConfig[status];

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#6366f1' }} />
          <span className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Timeline</span>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          {sc.label}
        </span>
      </div>

      {/* Timer */}
      {!event.isStarted ? (
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Starts At</p>
          <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{startFmt}</p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs font-semibold" style={{ color: '#f59e0b' }}>
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Waiting for admin to start</span>
          </div>
        </div>
      ) : timeLeft.isEnded ? (
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Hackathon Ended</p>
          <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Submissions Closed</p>
          <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>Ended at {endFmt}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Time Grid */}
          <div className="grid grid-cols-4 gap-2">
            {timeUnits.map(unit => (
              <div
                key={unit.label}
                className="text-center p-2.5 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <span className="block text-xl font-black tabular-nums" style={{ color: '#818cf8' }}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>{unit.label}</span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>Elapsed</span>
              <span style={{ color: '#818cf8' }}>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="space-y-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {[['Start', startFmt], ['End', endFmt]].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" /> {label}
            </span>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
