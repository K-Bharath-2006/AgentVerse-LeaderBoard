import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/axios';
import CountdownCard from '../../components/common/CountdownCard';
import { 
  Trophy, Users, BookOpen, Clock, 
  Award, RefreshCw, Layers, ShieldCheck, CheckCircle2
} from 'lucide-react';

interface DeptStat {
  department: string;
  approvedAgents: number;
  teamsCount: number;
}

interface ThemeStat {
  theme: string;
  approvedAgents: number;
  teamsCount: number;
}

interface Activity {
  id: string;
  department: string;
  teamName: string;
  agentName: string;
  type: string;
  timestamp: string;
}

export default function Dashboard() {
  const { isConnected, socket } = useSocket();
  const [stats, setStats] = useState({
    approvedAgents: 0,
    departments: 0,
    students: 0,
    teams: 0,
    juries: 0
  });
  const [targetAgents, setTargetAgents] = useState(2000);
  const [deptRanking, setDeptRanking] = useState<DeptStat[]>([]);
  const [themeRanking, setThemeRanking] = useState<ThemeStat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventRes, deptsRes, themesRes, activityRes] = await Promise.all([
        api.get('/public/dashboard/stats'),
        api.get('/public/event'),
        api.get('/public/dashboard/departments'),
        api.get('/public/dashboard/themes'),
        api.get('/public/dashboard/activity')
      ]);
      
      setStats(statsRes.data);
      if (eventRes.data) {
        setTargetAgents(eventRes.data.targetAgents || 2000);
      }
      setDeptRanking(deptsRes.data);
      setThemeRanking(themesRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('dashboard:update', fetchDashboardData);
      socket.on('activity:new', (newAct: Omit<Activity, 'id'>) => {
        setActivities(prev => [
          { ...newAct, id: Math.random().toString() } as Activity,
          ...prev.slice(0, 9)
        ]);
        fetchDashboardData();
      });

      return () => {
        socket.off('dashboard:update', fetchDashboardData);
        socket.off('activity:new');
      };
    }
  }, [socket]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const ratioPercent = Math.min(100, Math.round((stats.approvedAgents / targetAgents) * 100)) || 0;

  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (ratioPercent / 100) * circumference;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-bubble-1"></div>
        <div className="bg-bubble-2"></div>
        <div className="bg-bubble-3"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-9 h-9 object-contain" alt="Sri Eshwar Logo" />
          <span className="text-xl font-black gradient-text-blue" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sri Eshwar Market Place</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold transition-colors hover:text-[var(--primary)]" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <Link to="/dashboard" className="text-sm font-bold transition-colors" style={{ color: 'var(--primary)' }}>Dashboard</Link>
          <Link to="/leaderboard" className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[var(--primary)]" style={{ color: 'var(--text-secondary)' }}>
            <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
          </Link>
          <Link to="/login" className="btn-primary text-sm px-5 py-2.5 rounded-full" style={{ borderRadius: '999px' }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        
        {/* Title / Action Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>Live Hackathon Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Real-time completion metrics, rankings, and submission updates</p>
          </div>
          <button 
            onClick={handleManualRefresh} 
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-premium hover:shadow"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: refreshing ? 'var(--primary)' : 'var(--text-secondary)' }} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" style={{ color: 'var(--primary)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading active dashboards...</span>
          </div>
        ) : (
          <div className="space-y-8 animate-in">
            
            {/* Upper row: Statistics Cards & Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Overall Completion Circle */}
              <div className="glass-card p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Overall Completion</h2>
                  <div className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.approvedAgents}</div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Approved / {targetAgents} Target</div>
                  <div className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider mt-3" style={{ background: 'rgba(34, 197, 94, 0.08)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Goal</span>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <svg height={radius * 2} width={radius * 2}>
                    <circle
                      stroke="var(--border)"
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    <circle
                      stroke="url(#blueGradient)"
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + ' ' + circumference}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                      className="transform -rotate-90 origin-center transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--primary-hover)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-lg font-black" style={{ color: 'var(--text-primary)' }}>{ratioPercent}%</span>
                </div>
              </div>

              {/* General Counters */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="glass-card p-5 flex flex-col justify-between h-36 card-hover">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0, 87, 168, 0.05)', border: '1px solid rgba(0, 87, 168, 0.15)' }}>
                    <Users className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.students}</div>
                    <div className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5" style={{ color: 'var(--text-secondary)' }}>Students</div>
                  </div>
                </div>

                <div className="glass-card p-5 flex flex-col justify-between h-36 card-hover">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                    <Layers className="w-5 h-5" style={{ color: '#4F46E5' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.teams}</div>
                    <div className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5" style={{ color: 'var(--text-secondary)' }}>Teams</div>
                  </div>
                </div>

                <div className="glass-card p-5 flex flex-col justify-between h-36 card-hover">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                    <BookOpen className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.departments}</div>
                    <div className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5" style={{ color: 'var(--text-secondary)' }}>Departments</div>
                  </div>
                </div>

                <div className="glass-card p-5 flex flex-col justify-between h-36 card-hover">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: 'var(--success)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.juries}</div>
                    <div className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5" style={{ color: 'var(--text-secondary)' }}>Jury Panel</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Row: Rankings Grid (2 cols) & Timeline Banner / Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Department & Theme Rankings Container */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Department Rankings Card */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <Award className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    <span className="font-bold text-sm tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>Department Standings</span>
                  </div>

                  {deptRanking.length === 0 ? (
                    <p className="text-sm py-6 text-center italic" style={{ color: 'var(--text-secondary)' }}>No approved agents submitted yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            <th className="py-2 px-3">Rank</th>
                            <th className="py-2 px-3">Department</th>
                            <th className="py-2 px-3 text-right">Teams Active</th>
                            <th className="py-2 px-3 text-right">Agents Approved</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-sm font-semibold divide-slate-100" style={{ color: 'var(--text-primary)' }}>
                          {deptRanking.map((dept, index) => (
                            <tr key={dept.department} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  index === 0 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : index === 1 
                                      ? 'bg-slate-200 text-slate-700' 
                                      : index === 2 
                                        ? 'bg-amber-50 text-amber-800' 
                                        : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="py-3 px-3">{dept.department}</td>
                              <td className="py-3 px-3 text-right" style={{ color: 'var(--text-secondary)' }}>{dept.teamsCount}</td>
                              <td className="py-3 px-3 text-right font-extrabold" style={{ color: 'var(--primary)' }}>{dept.approvedAgents}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Theme Rankings Card */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <Award className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    <span className="font-bold text-sm tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>Theme Standings</span>
                  </div>

                  {themeRanking.length === 0 ? (
                    <p className="text-sm py-6 text-center italic" style={{ color: 'var(--text-secondary)' }}>No approved agents submitted yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            <th className="py-2 px-3">Rank</th>
                            <th className="py-2 px-3">Theme</th>
                            <th className="py-2 px-3 text-right">Teams Active</th>
                            <th className="py-2 px-3 text-right">Agents Approved</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-sm font-semibold divide-slate-100" style={{ color: 'var(--text-primary)' }}>
                          {themeRanking.map((item, index) => (
                            <tr key={item.theme} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  index === 0 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : index === 1 
                                      ? 'bg-slate-200 text-slate-700' 
                                      : index === 2 
                                        ? 'bg-amber-50 text-amber-800' 
                                        : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="py-3 px-3">{item.theme}</td>
                              <td className="py-3 px-3 text-right" style={{ color: 'var(--text-secondary)' }}>{item.teamsCount}</td>
                              <td className="py-3 px-3 text-right font-extrabold" style={{ color: 'var(--primary)' }}>{item.approvedAgents}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              {/* Sidebar: Countdown and Live Activity Stream */}
              <div className="space-y-6">
                <CountdownCard />

                {/* Live Activity Feed */}
                <div className="glass-card p-5 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" style={{ color: '#4F46E5' }} />
                      <span className="font-bold text-sm tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>Activity Feed</span>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full pulse-dot" style={{ background: 'var(--success)' }}></span>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {activities.length === 0 ? (
                      <p className="text-xs py-6 text-center italic" style={{ color: 'var(--text-muted)' }}>Waiting for submissions...</p>
                    ) : (
                      activities.map((act) => {
                        const dateStr = new Date(act.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        });
                        return (
                          <div key={act.id} className="text-xs p-3 rounded-xl border transition-all flex flex-col gap-1" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-[10px] px-2 py-0.5 rounded uppercase" style={{ background: 'rgba(79, 70, 229, 0.08)', color: '#4F46E5', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                                {act.department}
                              </span>
                              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
                            </div>
                            <p className="font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                              Team <span className="underline">{act.teamName}</span>
                            </p>
                            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {act.type === 'approved' ? 'Approved agent' : act.type === 'rejected' ? 'Rejected agent' : 'Submitted agent'}:{' '}
                              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{act.agentName}</span>
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      
      {/* Connection status */}
      <div className="fixed bottom-4 right-4 flex items-center space-x-2 text-xs bg-white/95 backdrop-blur px-3.5 py-2 rounded-full border border-slate-200 shadow-premium">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
        <span className="text-slate-600 font-semibold">{isConnected ? 'Live updates active' : 'Connecting to socket...'}</span>
      </div>
    </div>
  );
}
