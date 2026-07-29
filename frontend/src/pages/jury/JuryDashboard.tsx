import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';
import { 
  Search, BookOpen, Lock, Star, LogOut, 
  ChevronLeft, Users, CheckCircle, XCircle, Clock, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JuryDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  
  // Filter States
  const [searchFilter, setSearchFilter] = useState('');

  // Scoring form state
  const [score, setScore] = useState(50);
  const [remarks, setRemarks] = useState('');
  const [scoring, setScoring] = useState(false);

  const fetchTeams = async () => {
    try {
      let url = '/jury/teams?';
      if (searchFilter) url += `search=${searchFilter}&`;

      const { data } = await api.get(url);
      setTeams(data);
      
      if (selectedTeam) {
        const updated = data.find((t: any) => t._id === selectedTeam._id);
        if (updated) setSelectedTeam(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [searchFilter]);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setScoring(true);
    try {
      await api.post('/jury/score', { teamId: selectedTeam._id, score, remarks });
      toast.success('Score locked in!');
      fetchTeams();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setScoring(false);
    }
  };

  const handleAgentStatusUpdate = async (agentId: string, newStatus: string) => {
    try {
      await api.put(`/jury/agents/${agentId}/status`, { status: newStatus });
      toast.success(`Agent ${newStatus}`);
      fetchTeams();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const scoredCount = teams.filter(t => t.hasScored).length;
  const pendingCount = teams.length - scoredCount;

  const scoreColor = score < 40 ? '#f87171' : score < 70 ? '#f59e0b' : '#34d399';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* ── Navbar ── */}
      <nav className="navbar px-6 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-9 h-9 object-contain" alt="Sri Eshwar Logo" />
          <div>
            <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Sri Eshwar Market Place</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Jury Evaluation Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Score Progress */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Award className="w-4 h-4" style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Evaluated</p>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                {scoredCount} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>/ {teams.length}</span>
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </nav>

      {/* ── Search Bar ── */}
      <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white border-b border-slate-150">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams by name, mentor, tech..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200/80 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white shadow-sm transition-all"
          />
        </div>

        {/* Stats pills */}
        <div className="flex gap-2">
          <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            ✓ {scoredCount} Done
          </span>
          <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            ⏳ {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex overflow-hidden" style={{ maxHeight: 'calc(100vh - 118px)' }}>

        {/* Left: Team List */}
        <div
          className={`flex flex-col border-r overflow-hidden ${mobileShowDetail ? 'hidden lg:flex' : 'flex'}`}
          style={{ width: '320px', minWidth: '320px', borderColor: 'rgba(255,255,255,0.05)', background: 'var(--bg-panel)' }}
        >
          <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>
              <Users className="w-4 h-4 inline mr-1.5" style={{ color: '#6366f1' }} />
              Teams ({teams.length})
            </h2>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Select a team to evaluate</p>
          </div>

          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No teams match your filters.</p>
              </div>
            ) : (
              teams.map(team => (
                <button
                  key={team._id}
                  onClick={() => {
                    setSelectedTeam(team);
                    setScore(team.hasScored ? team.scoreGiven : 50);
                    setRemarks('');
                    setMobileShowDetail(true);
                  }}
                  className="w-full text-left p-3.5 rounded-xl transition-all flex flex-col gap-2"
                  style={{
                    background: selectedTeam?._id === team._id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedTeam?._id === team._id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{team.name}</span>
                    {team.hasScored ? (
                      <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <Lock className="w-2.5 h-2.5" /> {team.scoreGiven}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                        Pending
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {team.department} · Sec {team.section} · Year {team.year}
                  </p>

                  <div className="flex gap-3 text-[10px] font-bold pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#34d399' }}>✓ {team.approvedCount}</span>
                    <span style={{ color: '#fbbf24' }}>⏳ {team.pendingCount}</span>
                    <span style={{ color: '#f87171' }}>✗ {team.rejectedCount}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className={`flex-1 overflow-y-auto p-6 ${mobileShowDetail ? 'flex flex-col' : 'hidden lg:block'}`}>
          {selectedTeam ? (
            <div className="max-w-3xl mx-auto space-y-6 animate-in">
              
              {/* Back (mobile) + Header */}
              <div>
                <button
                  onClick={() => setMobileShowDetail(false)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold mb-4"
                  style={{ color: '#818cf8' }}
                >
                  <ChevronLeft className="w-4 h-4" /> Back to list
                </button>
                
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{selectedTeam.name}</h2>
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {selectedTeam.department} &middot; Section {selectedTeam.section} &middot; Year {selectedTeam.year}
                    </p>
                  </div>
                  {selectedTeam.hasScored && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Lock className="w-4 h-4" style={{ color: '#34d399' }} />
                      <div>
                        <p className="text-[10px] font-bold uppercase" style={{ color: '#34d399' }}>Scored</p>
                        <p className="text-xl font-black" style={{ color: '#34d399' }}>{selectedTeam.scoreGiven}/100</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Members */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTeam.members?.map((m: any) => (
                    <div key={m._id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
                        {m.name?.[0]}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                      {m.rollNumber && <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{m.rollNumber}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Agents */}
              <div>
                <h3 className="text-sm font-black flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
                  <BookOpen className="w-4 h-4" style={{ color: '#6366f1' }} />
                  Submitted Agents ({selectedTeam.agents?.length || 0})
                </h3>
                
                {selectedTeam.agents && selectedTeam.agents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTeam.agents.map((agent: any) => (
                      <div key={agent._id} className="glass-card p-5">
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                          <div>
                            <h4 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>{agent.agentName}</h4>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase" style={{ background: 'rgba(99,102,241,0.12)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.2)' }}>
                              {agent.theme}
                            </span>
                          </div>
                          <span className={
                            agent.status === 'approved' ? 'badge-approved' :
                            agent.status === 'rejected' ? 'badge-rejected' : 'badge-submitted'
                          }>
                            {agent.status}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{agent.shortDescription}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {[
                            ['LLM', agent.llmUsed || 'None'],
                            ['Framework', agent.framework || 'None'],
                            ['Tech', agent.techStack?.join(', ') || 'N/A'],
                            ['Mentor', agent.facultyMentor || 'None'],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                              <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-3 mt-3">
                          <a href={agent.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold hover:underline" style={{ color: '#818cf8' }}>GitHub ↗</a>
                          {agent.liveDemoUrl && <a href={agent.liveDemoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold hover:underline" style={{ color: '#34d399' }}>Live Demo ↗</a>}
                          {agent.videoDemoUrl && <a href={agent.videoDemoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold hover:underline" style={{ color: '#f59e0b' }}>Video ↗</a>}
                          {agent.documentationUrl && <a href={agent.documentationUrl} target="_blank" rel="noreferrer" className="text-xs font-bold hover:underline" style={{ color: '#a78bfa' }}>Docs ↗</a>}
                        </div>

                        <div className="flex gap-2 mt-4 justify-end">
                          <button
                            onClick={() => handleAgentStatusUpdate(agent._id, 'approved')}
                            disabled={agent.status === 'approved'}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-30"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleAgentStatusUpdate(agent._id, 'rejected')}
                            disabled={agent.status === 'rejected'}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-30"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No agents submitted yet.</p>
                  </div>
                )}
              </div>

              {/* ── Score Section ── */}
              {selectedTeam.hasScored ? (
                <div className="glass-card p-5" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4" style={{ color: '#34d399' }} />
                    <h3 className="font-black text-sm" style={{ color: '#34d399' }}>Evaluation Locked</h3>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    You've already evaluated this team. Score: <span className="font-black" style={{ color: '#34d399' }}>{selectedTeam.scoreGiven}/100</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Each jury member can only score a team once.</p>
                </div>
              ) : (
                <form onSubmit={handleScoreSubmit} className="glass-card p-6 space-y-5" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>Score Evaluation</h3>
                  </div>

                  {/* Score Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Overall Score</label>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black" style={{ color: scoreColor }}>{score}</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>/100</span>
                      </div>
                    </div>
                    
                    <input
                      type="range" min="0" max="100"
                      value={score}
                      onChange={e => setScore(Number(e.target.value))}
                      className="w-full"
                      style={{ accentColor: scoreColor }}
                    />

                    <div className="flex justify-between text-[10px] font-bold mt-2" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: '#f87171' }}>Poor (0)</span>
                      <span style={{ color: '#f59e0b' }}>Average (50)</span>
                      <span style={{ color: '#34d399' }}>Excellent (100)</span>
                    </div>

                    {/* Score band indicator */}
                    <div className="mt-3 grid grid-cols-5 gap-1">
                      {[
                        { range: [0, 20], label: 'Poor', color: '#f87171' },
                        { range: [20, 40], label: 'Below Avg', color: '#fb923c' },
                        { range: [40, 60], label: 'Average', color: '#f59e0b' },
                        { range: [60, 80], label: 'Good', color: '#a3e635' },
                        { range: [80, 100], label: 'Excellent', color: '#34d399' },
                      ].map((band) => (
                        <div
                          key={band.label}
                          className="text-center py-1 rounded-lg text-[9px] font-black transition-all"
                          style={{
                            background: score >= band.range[0] && score <= band.range[1] ? `${band.color}22` : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${score >= band.range[0] && score <= band.range[1] ? band.color + '44' : 'transparent'}`,
                            color: score >= band.range[0] && score <= band.range[1] ? band.color : 'var(--text-muted)',
                          }}
                        >
                          {band.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Evaluation Remarks (Optional)</label>
                    <textarea
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      className="input-dark resize-none"
                      rows={3}
                      placeholder="Feedback on agent design, autonomy, tech quality, and innovation..."
                    />
                  </div>

                  <div className="p-3 rounded-xl text-xs font-semibold flex items-start gap-2" style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}>
                    ⚠️ Scoring is permanent. Review all agents and demos before submitting.
                  </div>

                  <button type="submit" disabled={scoring} className="btn-primary w-full">
                    {scoring ? '🔒 Locking Score...' : `🏆 Submit Score: ${score}/100`}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <Star className="w-10 h-10" style={{ color: 'rgba(99,102,241,0.3)' }} />
              </div>
              <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Select a Team</h3>
              <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Choose a team from the left panel to view their submitted agents and begin evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
