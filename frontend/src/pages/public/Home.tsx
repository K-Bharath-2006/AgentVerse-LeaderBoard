import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/axios';
import CountdownCard from '../../components/common/CountdownCard';
import Footer from '../../components/common/Footer';
import { Sparkles, Trophy, ArrowRight, Flame, Users, Bot, Activity } from 'lucide-react';

export default function Home() {
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    approvedAgents: 0,
    departments: 10,
    students: 0,
    teams: 0,
  });
  const [targetAgents, setTargetAgents] = useState(3000);

  const fetchStats = async () => {
    try {
      const [statsRes, eventRes] = await Promise.all([
        api.get('/public/dashboard/stats'),
        api.get('/public/event')
      ]);
      setStats(statsRes.data);
      if (eventRes.data) setTargetAgents(eventRes.data.targetAgents || 3000);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (socket) {
      socket.on('dashboard:update', fetchStats);
      return () => { socket.off('dashboard:update', fetchStats); };
    }
  }, [socket]);

  const ratioPercent = Math.min(100, Math.round((stats.approvedAgents / targetAgents) * 100)) || 0;

  const statItems = [
    { icon: Bot, value: stats.approvedAgents, label: 'Agents Built', color: 'var(--primary)', bg: 'rgba(0, 87, 168, 0.05)', border: 'rgba(0, 87, 168, 0.15)' },
    { icon: Users, value: stats.teams, label: 'Teams Active', color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.05)', border: 'rgba(79, 70, 229, 0.15)' },
    { icon: Flame, value: stats.students, label: 'Developers', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.15)' },
    { icon: Activity, value: stats.departments, label: 'Departments', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.15)' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-bubble-1"></div>
        <div className="bg-bubble-2"></div>
        <div className="bg-bubble-3"></div>
      </div>

      {/* ── Navbar ── */}
      <nav className="navbar px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-9 h-9 object-contain" alt="Sri Eshwar Logo" />
          <span className="text-xl font-black gradient-text-blue" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sri Eshwar AI Agent Store</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold transition-colors hover:text-[var(--primary)]" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <Link to="/dashboard" className="text-sm font-semibold transition-colors hover:text-[var(--primary)]" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
          <Link to="/leaderboard" className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[var(--primary)]" style={{ color: 'var(--text-secondary)' }}>
            <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
          </Link>
          <Link to="/login" className="btn-primary text-sm px-5 py-2.5 rounded-full" style={{ borderRadius: '999px' }}>
            Login
          </Link>
        </div>
      </nav>

      {/* ── Hero Container ── */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          
          <div className="space-y-8 animate-in">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-premium" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }}></div>
              <div className="absolute -bottom-24 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(0, 87, 168, 0.08)', border: '1px solid rgba(0, 87, 168, 0.15)', color: 'var(--primary)' }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  Sri Eshwar · 36-Hour AI Hackathon · 2026
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Sri Eshwar<br />
                  <span className="gradient-text-blue">AI Agent Store</span>
                </h1>

                <p className="mt-6 text-base md:text-lg leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  The ultimate hackathon where college students team up to design, build, and benchmark <span className="font-semibold" style={{ color: 'var(--primary)' }}>autonomous AI agents</span>.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/register"
                    className="btn-primary inline-flex items-center gap-2"
                    style={{ borderRadius: '12px' }}
                  >
                    Register Student Account <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="btn-secondary inline-flex items-center gap-2"
                    style={{ borderRadius: '12px' }}
                  >
                    <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statItems.map(({ icon: Icon, value, label, color, bg, border }) => (
                <div
                  key={label}
                  className="p-5 rounded-2xl flex flex-col justify-between h-32 card-hover"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFFFFF', border: `1px solid ${border}` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value.toLocaleString()}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Progress card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Agent Build Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{stats.approvedAgents}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>/ {targetAgents.toLocaleString()}</span>
                </div>
              </div>

              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${ratioPercent}%`, background: 'linear-gradient(90deg, var(--primary), var(--primary-hover), var(--accent))' }}
                ></div>
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Campus-wide agent target completion</span>
                <span className="text-[11px] font-black" style={{ color: 'var(--primary)' }}>{ratioPercent}%</span>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6 animate-in" style={{ animationDelay: '0.1s' }}>
            <CountdownCard />



            {/* Quick Links */}
            <div className="glass-card p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Quick Access</p>
              {[
                { label: 'Student Portal', to: '/login', emoji: '🎓' },
                { label: 'Live Leaderboard', to: '/leaderboard', emoji: '🏆' },
                { label: 'Analytics Dashboard', to: '/dashboard', emoji: '📊' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
                >
                  <span className="text-sm font-semibold group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {link.emoji} {link.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--text-muted)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
