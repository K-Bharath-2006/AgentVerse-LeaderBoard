import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/axios';
import { Trophy, Filter, RefreshCw, Medal, Crown } from 'lucide-react';
import CountdownCard from '../../components/common/CountdownCard';
import CustomSelect from '../../components/ui/Select';

interface LeaderboardEntry {
  id: string;
  rank: number;
  teamName: string;
  department: string;
  section: string;
  approvedAgentCount: number;
}

export default function Leaderboard() {
  const { socket } = useSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [secFilter, setSecFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');

  const departments = ['CSE', 'AIDS', 'AIML', 'IT', 'CYBER', 'CCE', 'CSBS', 'ECE', 'EEE', 'MECH'];
  const sections = ['A', 'B', 'C', 'D'];
  const themes = [
    'Smart Campus',
    'CyberSecurity',
    'Data intelligence',
    'AI productivity',
    'Smart manufacturing',
    'Smart energy',
    'Smart mobility',
    'Digital health',
    'Social impact',
    'Digital governance'
  ];

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let url = '/public/leaderboard?top10=true';
      if (deptFilter) url += `&department=${deptFilter}`;
      if (secFilter) url += `&section=${secFilter}`;
      if (themeFilter) url += `&theme=${themeFilter}`;
      const { data } = await api.get(url);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, [deptFilter, secFilter, themeFilter]);
  useEffect(() => {
    if (socket) {
      socket.on('leaderboard:update', fetchLeaderboard);
      return () => { socket.off('leaderboard:update', fetchLeaderboard); };
    }
  }, [socket]);

  const rankConfig = (rank: number) => {
    if (rank === 1) return { icon: <Crown className="w-5 h-5" />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', ring: 'rank-1' };
    if (rank === 2) return { icon: <Medal className="w-5 h-5" />, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', ring: 'rank-2' };
    if (rank === 3) return { icon: <Trophy className="w-5 h-5" />, color: '#d97706', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.3)', ring: 'rank-3' };
    return { icon: null, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)', border: 'transparent', ring: 'rank-other' };
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav className="navbar px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-9 h-9 object-contain" alt="Sri Eshwar Logo" />
          <span className="text-xl font-black gradient-text">Sri Eshwar Market Place</span>
        </div>
        <div className="flex items-center gap-6">
          <RouterLink to="/" className="text-sm font-semibold hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>Home</RouterLink>
          <RouterLink to="/dashboard" className="text-sm font-semibold hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>Dashboard</RouterLink>
          <RouterLink to="/leaderboard" className="flex items-center gap-1.5 text-sm font-bold" style={{ color: '#f59e0b' }}>
            <Trophy className="w-4 h-4" /> Leaderboard
          </RouterLink>
          <RouterLink to="/login" className="btn-primary text-sm px-5 py-2" style={{ borderRadius: '999px' }}>Login</RouterLink>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

        {/* Main Table */}
        <div className="space-y-5">
          {/* Header + Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <Trophy className="w-7 h-7 text-amber-500" />
                Live Leaderboard
              </h1>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
                Real-time rankings · Sorted by score & approved agents
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <CustomSelect
                value={deptFilter}
                onChange={setDeptFilter}
                options={[{ value: '', label: 'All Depts' }, ...departments.map(d => ({ value: d, label: d }))]}
                className="w-32"
              />
              <CustomSelect
                value={secFilter}
                onChange={setSecFilter}
                options={[{ value: '', label: 'All Sections' }, ...sections.map(s => ({ value: s, label: `Sec ${s}` }))]}
                className="w-32"
              />
              <CustomSelect
                value={themeFilter}
                onChange={setThemeFilter}
                options={[{ value: '', label: 'All Themes' }, ...themes.map(t => ({ value: t, label: t }))]}
                className="w-40"
              />
              <button onClick={fetchLeaderboard} className="p-2.5 rounded-xl transition-all hover:bg-indigo-150/10 cursor-pointer" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Top 3 Podium */}
          {!loading && leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean).map((team, i) => {
                const cfg = rankConfig(team.rank);
                const isFirst = team.rank === 1;
                return (
                  <div
                    key={team.id}
                    className={`${isFirst ? 'order-2' : i === 0 ? 'order-1' : 'order-3'} flex flex-col items-center p-4 rounded-2xl text-center transition-all`}
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, transform: isFirst ? 'scale(1.05)' : 'scale(1)' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 font-black text-sm" style={{ background: cfg.bg, color: cfg.color, border: `2px solid ${cfg.border}` }}>
                      {cfg.icon || team.rank}
                    </div>
                    <p className="font-black text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{team.teamName}</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{team.department}</p>
                    <div className="mt-2 text-lg font-black" style={{ color: cfg.color }}>{team.approvedAgentCount}</div>
                    <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>agents</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 animate-spin mb-3" style={{ color: '#6366f1' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Updating standings...</span>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-primary)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>No teams match the current filter.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Rank', 'Team', 'Department', 'Section', 'Agents Built'].map((h, i) => (
                      <th key={h} className={`py-3 px-4 text-[10px] font-black uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((team) => {
                    const cfg = rankConfig(team.rank);
                    return (
                      <tr
                        key={team.id}
                        className="transition-all group"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="py-4 px-4">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                          >
                            {cfg.icon || team.rank}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{team.teamName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                            {team.department}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{team.section || '—'}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-lg font-black" style={{ color: cfg.color || '#818cf8' }}>
                            {team.approvedAgentCount}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <CountdownCard />
        </div>
      </main>
    </div>
  );
}
