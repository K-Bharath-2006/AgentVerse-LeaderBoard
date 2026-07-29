import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';
import { Team, Agent } from '../../types';
import CountdownCard from '../../components/common/CountdownCard';
import Footer from '../../components/common/Footer';
import { 
  Users, Plus, Trash2, Edit2, Code,
  ExternalLink, FileText, Video, Award, LogOut,
  Copy, Check, ChevronRight, Bot, Sparkles, Hash, Github, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import CustomSelect from '../../components/ui/Select';
import ConfirmationModal from '../../components/ui/Modal';

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventEnded, setEventEnded] = useState(false);
  const [eventStarted, setEventStarted] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Modal State for Agent Submission
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // Editing Mode State
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  // Team panel mode
  const [teamMode, setTeamMode] = useState<'join' | 'create'>('join');

  // Join Team State
  const [joinCode, setJoinCode] = useState('');
  
  // Create Team State
  const [newTeamName, setNewTeamName] = useState('');
  
  // Delete Agent Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  
  // Submit Agent State
  const [agentForm, setAgentForm] = useState({
    agentName: '',
    theme: 'Smart Campus',
    shortDescription: '',
    githubUrl: '',
    techStack: '',
    liveDemoUrl: '',
    videoDemoUrl: '',
    documentationUrl: '',
    llmUsed: '',
    framework: '',
    facultyMentor: '',
  });

  const checkEventStatus = async () => {
    try {
      const { data } = await api.get('/public/event');
      if (data) {
        setEventStarted(data.isStarted);
        const now = new Date().getTime();
        const end = new Date(data.endDate).getTime();
        setEventEnded(now > end);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      await checkEventStatus();
      try {
        const teamRes = await api.get('/teams/my');
        setTeam(teamRes.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setTeam(null);
        } else {
          console.error(err);
        }
      }
      const agentRes = await api.get('/agents/my');
      setAgents(agentRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/teams', { name: newTeamName });
      setTeam(data); // Set local state immediately to avoid reload delay!
      await useAuthStore.getState().checkAuth();
      toast.success('Team created! Share your join code with teammates.');
      setNewTeamName('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/teams/join', { joinCode });
      setTeam(data); // Set local state immediately to avoid reload delay!
      await useAuthStore.getState().checkAuth();
      toast.success('Joined team successfully!');
      setJoinCode('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join team');
    }
  };

  const handleSubmitAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (agentForm.shortDescription && (agentForm.shortDescription.length < 50 || agentForm.shortDescription.length > 200)) {
      toast.error('If provided, short description must be between 50 and 200 characters.');
      return;
    }

    try {
      const payload = {
        ...agentForm,
        techStack: agentForm.techStack.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingAgentId) {
        await api.put(`/agents/${editingAgentId}`, payload);
        toast.success('Agent updated!');
      } else {
        await api.post('/agents', payload);
        toast.success('Agent submitted for review!');
      }

      setAgentForm({
        agentName: '', theme: 'Smart Campus', shortDescription: '',
        githubUrl: '', techStack: '', liveDemoUrl: '',
        videoDemoUrl: '', documentationUrl: '', llmUsed: '',
        framework: '', facultyMentor: '',
      });
      setEditingAgentId(null);
      setIsAgentModalOpen(false); // Close Modal on success!
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit agent');
    }
  };

  const handleEditClick = (agent: Agent) => {
    setEditingAgentId(agent._id);
    setAgentForm({
      agentName: agent.agentName,
      theme: agent.theme,
      shortDescription: agent.shortDescription,
      githubUrl: agent.githubUrl,
      techStack: agent.techStack.join(', '),
      liveDemoUrl: agent.liveDemoUrl || '',
      videoDemoUrl: agent.videoDemoUrl || '',
      documentationUrl: agent.documentationUrl || '',
      llmUsed: agent.llmUsed || '',
      framework: agent.framework || '',
      facultyMentor: agent.facultyMentor || '',
    });
    setIsAgentModalOpen(true); // Open modal for editing!
  };

  const handleCancelEdit = () => {
    setEditingAgentId(null);
    setAgentForm({
      agentName: '', theme: 'Smart Campus', shortDescription: '',
      githubUrl: '', techStack: '', liveDemoUrl: '',
      videoDemoUrl: '', documentationUrl: '', llmUsed: '',
      framework: '', facultyMentor: '',
    });
    setIsAgentModalOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteAgentId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAgentId) return;
    try {
      await api.delete(`/agents/${deleteAgentId}`);
      toast.success('Agent deleted.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete agent');
    } finally {
      setIsConfirmOpen(false);
      setDeleteAgentId(null);
    }
  };

  const handleCopyCode = () => {
    if (!team?.joinCode) return;
    navigator.clipboard.writeText(team.joinCode);
    setCodeCopied(true);
    toast.success('Join code copied!');
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const openNewSubmission = () => {
    if (!team) {
      toast.error('You must join or create a team before submitting agents.');
      return;
    }
    if (isSubmissionDisabled) {
      toast.error('Submissions are currently closed.');
      return;
    }
    handleCancelEdit();
    setIsAgentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isLeader = team ? team.leaderId === user?._id : false;
  const isSubmissionDisabled = !eventStarted || eventEnded;
  const descLen = agentForm.shortDescription.length;

  const statusMap: Record<string, string> = {
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    submitted: 'badge-submitted',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* ── Top Navigation ── */}
      <nav className="navbar px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-9 h-9 object-contain" alt="Sri Eshwar Logo" />
          <div>
            <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Sri Eshwar Market Place</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Student Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Event Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0, 87, 168, 0.06)', border: '1px solid rgba(0, 87, 168, 0.15)' }}>
            <span className={`w-2 h-2 rounded-full pulse-dot ${eventStarted && !eventEnded ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              {!eventStarted ? 'Not Started' : eventEnded ? 'Event Ended' : 'Live Now'}
            </span>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{user?.department} · {user?.section}</p>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start flex-grow w-full">
        
        {/* ── Left Sidebar ── */}
        <div className="space-y-4">
          
          {/* Countdown */}
          <CountdownCard />

          {/* ── Team Widget ── */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>My Team</h2>
            </div>

            {team ? (
              <div className="space-y-4 animate-in">
                {/* Team header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Team Name</p>
                    <p className="text-lg font-black gradient-text-blue leading-tight">{team.name}</p>
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {team.department} · Sec {team.section} · Yr {team.year}
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 mt-1"
                    style={isLeader
                      ? { background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }
                      : { background: 'rgba(0, 87, 168, 0.08)', color: 'var(--primary)', border: '1px solid rgba(0, 87, 168, 0.15)' }
                    }
                  >
                    {isLeader ? '👑 Leader' : 'Member'}
                  </span>
                </div>

                {/* ── Join Code ── */}
                {isLeader ? (
                  <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0, 87, 168, 0.04)', border: '1px solid rgba(0, 87, 168, 0.15)' }}>
                    <div className="px-3 pt-3 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                        <Hash className="w-3 h-3" /> Team Invite Code
                      </p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        Share this with teammates to invite them.
                      </p>
                    </div>
                    <div className="flex items-center justify-between px-3 py-3" style={{ borderTop: '1px solid rgba(0, 87, 168, 0.1)' }}>
                      <code className="text-2xl font-black tracking-[0.25em] select-all" style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {team.joinCode}
                      </code>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        style={codeCopied
                          ? { background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.2)' }
                          : { background: 'rgba(0, 87, 168, 0.1)', color: 'var(--primary)', border: '1px solid rgba(0, 87, 168, 0.2)' }
                        }
                      >
                        {codeCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Member view — compact code */
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <Hash className="w-2.5 h-2.5" /> Team Code
                      </p>
                      <code className="text-base font-black tracking-widest" style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {team.joinCode}
                      </code>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg transition-all cursor-pointer"
                      style={{ background: 'rgba(0, 87, 168, 0.08)', color: codeCopied ? 'var(--success)' : 'var(--primary)' }}
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* ── Members List ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Team Members
                    </p>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0, 87, 168, 0.08)', color: 'var(--primary)' }}>
                      {team.members.length} / 3
                    </span>
                  </div>

                  <div className="space-y-2">
                    {team.members.map((m: any) => {
                      const isMe = m._id === user?._id;
                      const memberIsLeader = m._id === team.leaderId;
                      return (
                        <div
                          key={m._id}
                          className="flex items-center justify-between p-2.5 rounded-xl"
                          style={{
                            background: isMe ? 'rgba(0, 87, 168, 0.04)' : 'var(--bg-card)',
                            border: `1px solid ${isMe ? 'rgba(0, 87, 168, 0.15)' : 'var(--border)'}`,
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                              style={{
                                background: memberIsLeader
                                  ? 'linear-gradient(135deg, var(--accent), #F59E0B)'
                                  : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                color: memberIsLeader ? '#1F2937' : 'white',
                              }}
                            >
                              {m.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                {m.name}
                              </p>
                              {m.rollNumber && (
                                <p className="text-[10px] font-mono leading-tight" style={{ color: 'var(--text-secondary)' }}>
                                  {m.rollNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {memberIsLeader && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                👑
                              </span>
                            )}
                            {isMe && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(0, 87, 168, 0.08)', color: 'var(--primary)', border: '1px solid rgba(0, 87, 168, 0.15)' }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty slots */}
                    {Array.from({ length: Math.max(0, 3 - team.members.length) }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl animate-pulse"
                        style={{ background: 'rgba(0, 0, 0, 0.01)', border: '1px dashed var(--border)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>
                          +
                        </div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          Open slot · share the code
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* NO TEAM — Join/Create Toggle Forms */
              <div className="space-y-4 animate-in">
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setTeamMode('join')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer`}
                    style={teamMode === 'join'
                      ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }
                      : { color: 'var(--text-secondary)' }
                    }
                  >
                    Join Team
                  </button>
                  <button
                    onClick={() => setTeamMode('create')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer`}
                    style={teamMode === 'create'
                      ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }
                      : { color: 'var(--text-secondary)' }
                    }
                  >
                    Create Team
                  </button>
                </div>

                {teamMode === 'join' ? (
                  <form onSubmit={handleJoinTeam} className="space-y-3">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Enter the 6-character team invite code.
                    </p>
                    <input
                      required
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      className="input-dark font-mono tracking-widest text-center text-lg uppercase"
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                    <button type="submit" className="btn-primary w-full cursor-pointer">
                      Join Team <ChevronRight className="w-4 h-4 inline" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCreateTeam} className="space-y-3">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Create a team using a unique team name.
                    </p>
                    <input
                      required
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      className="input-dark"
                      placeholder="Team Name"
                    />
                    <button type="submit" className="btn-primary w-full cursor-pointer">
                      <Plus className="w-4 h-4 inline mr-1" /> Create Team
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>My Progress</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(0, 87, 168, 0.05)', border: '1px solid rgba(0, 87, 168, 0.15)' }}>
                <p className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{agents.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-secondary)' }}>Submitted</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <p className="text-2xl font-black" style={{ color: 'var(--success)' }}>{agents.filter(a => a.status === 'approved').length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-secondary)' }}>Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                Welcome back, <span className="gradient-text-blue">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {team
                  ? `Team: ${team.name} · ${isLeader ? 'You are the team leader' : 'You are a team member'}`
                  : 'Join or create a team to start submitting.'
                }
              </p>
            </div>
            
            {/* Submit Agent Button (Action Button) */}
            <button
              onClick={openNewSubmission}
              className="btn-primary flex items-center justify-center gap-1.5 text-sm cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Agent</span>
            </button>
          </div>

          {/* ── Submissions Section ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Award className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                My Submissions ({agents.length})
              </h2>
            </div>

            {agents.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0, 87, 168, 0.05)', border: '1px solid rgba(0, 87, 168, 0.15)' }}>
                  <Bot className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>No Submissions Yet</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>You haven't submitted any autonomous agents yet.</p>
                <button onClick={openNewSubmission} className="btn-primary mt-4 text-sm cursor-pointer">
                  <Plus className="w-4 h-4 inline mr-1" /> Submit your first Agent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {agents.map(agent => (
                  <div key={agent._id} className="glass-card p-5 card-hover relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>{agent.agentName}</h3>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(0, 87, 168, 0.05)', color: 'var(--primary)', border: '1px solid rgba(0, 87, 168, 0.15)' }}>
                            {agent.theme}
                          </span>
                          <span className={statusMap[agent.status] || 'badge-submitted'}>
                            {agent.status}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{agent.shortDescription}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {agent.techStack?.map((tech: string) => (
                            <span key={tech} className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs font-bold pt-1">
                          <a href={agent.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline transition-opacity hover:opacity-80" style={{ color: 'var(--primary)' }}>
                            <Code className="w-3.5 h-3.5" /> GitHub
                          </a>
                          {agent.liveDemoUrl && (
                            <a href={agent.liveDemoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline transition-opacity hover:opacity-80" style={{ color: 'var(--success)' }}>
                              <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                            </a>
                          )}
                          {agent.videoDemoUrl && (
                            <a href={agent.videoDemoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline transition-opacity hover:opacity-80" style={{ color: 'var(--warning)' }}>
                              <Video className="w-3.5 h-3.5" /> Video
                            </a>
                          )}
                          {agent.documentationUrl && (
                            <a href={agent.documentationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline transition-opacity hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                              <FileText className="w-3.5 h-3.5" /> Docs
                            </a>
                          )}
                        </div>
                      </div>

                      {agent.status !== 'approved' && !eventEnded && (
                        <div className="flex sm:flex-col gap-2">
                          <button
                            onClick={() => handleEditClick(agent)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            style={{ background: 'rgba(0, 87, 168, 0.08)', color: 'var(--primary)', border: '1px solid rgba(0, 87, 168, 0.15)' }}
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(agent._id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Agent Submission Modal ── */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 relative animate-in">
            {/* Close Button */}
            <button 
              onClick={handleCancelEdit} 
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {editingAgentId ? '✏️ Edit Agent Submission' : '🤖 Submit AI Agent'}
              </h2>
              <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
                Provide precise details about your autonomous agent build.
              </p>
            </div>

            <form onSubmit={handleSubmitAgent} className="space-y-4">
              {/* Row 1: Name + Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Agent Name *</label>
                  <input required value={agentForm.agentName} onChange={e => setAgentForm({...agentForm, agentName: e.target.value})} className="input-dark" placeholder="e.g. HealthBot Pro" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Domain / Theme *</label>
                  <CustomSelect
                    value={agentForm.theme}
                    onChange={val => setAgentForm({...agentForm, theme: val})}
                    options={[
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
                    ]}
                  />
                </div>
              </div>

              {/* Row 2: LLM + Framework + Mentor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>LLM Used *</label>
                  <CustomSelect
                    value={agentForm.llmUsed}
                    onChange={val => setAgentForm({...agentForm, llmUsed: val})}
                    placeholder="Select LLM"
                    required
                    options={['OpenAI', 'Claude', 'Gemini', 'Llama', 'DeepSeek', 'Other']}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Framework *</label>
                  <CustomSelect
                    value={agentForm.framework}
                    onChange={val => setAgentForm({...agentForm, framework: val})}
                    placeholder="Select Framework"
                    required
                    options={['LangChain', 'CrewAI', 'AutoGen', 'Vercel AI SDK', 'Custom', 'None']}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Faculty Mentor *</label>
                  <input required value={agentForm.facultyMentor} onChange={e => setAgentForm({...agentForm, facultyMentor: e.target.value})} placeholder="Faculty Mentor Name" className="input-dark" />
                </div>
              </div>

              {/* GitHub + TechStack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Github className="w-3 h-3 inline mr-1" />GitHub URL *
                  </label>
                  <input required type="url" value={agentForm.githubUrl} onChange={e => setAgentForm({...agentForm, githubUrl: e.target.value})} placeholder="https://github.com/..." className="input-dark" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tech Stack * (comma-separated)</label>
                  <input required value={agentForm.techStack} onChange={e => setAgentForm({...agentForm, techStack: e.target.value})} placeholder="React, Node.js, LangChain" className="input-dark" />
                </div>
              </div>

              {/* Required Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Live Demo URL *</label>
                  <input required type="url" value={agentForm.liveDemoUrl} onChange={e => setAgentForm({...agentForm, liveDemoUrl: e.target.value})} placeholder="https://..." className="input-dark" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Video Demo URL *</label>
                  <input required type="url" value={agentForm.videoDemoUrl} onChange={e => setAgentForm({...agentForm, videoDemoUrl: e.target.value})} placeholder="https://..." className="input-dark" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Docs URL *</label>
                  <input required type="url" value={agentForm.documentationUrl} onChange={e => setAgentForm({...agentForm, documentationUrl: e.target.value})} placeholder="https://..." className="input-dark" />
                </div>
              </div>

              {/* Description (Optional, moved to the bottom) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Short Description (50–200 chars)</label>
                  <span className={`text-[11px] font-black ${descLen === 0 || (descLen >= 50 && descLen <= 200) ? 'text-green-500' : 'text-amber-500'}`}>
                    {descLen}/200
                  </span>
                </div>
                <textarea
                  value={agentForm.shortDescription}
                  onChange={e => setAgentForm({...agentForm, shortDescription: e.target.value})}
                  placeholder="Describe what your AI agent does, its core autonomy loop, and key use cases (Optional)..."
                  className="input-dark resize-none"
                  rows={3}
                />
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (descLen / 200) * 100)}%`,
                      background: descLen === 0 || (descLen >= 50 && descLen <= 200) ? 'linear-gradient(90deg, var(--success), var(--primary))' : 'var(--danger)'
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1 cursor-pointer">
                  {editingAgentId ? '✓ Update Agent' : '🚀 Submit Agent'}
                </button>
                <button type="button" onClick={handleCancelEdit} className="btn-secondary cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Delete Agent Submission"
        message="Are you sure you want to delete this agent? This action is permanent and cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeleteAgentId(null);
        }}
      />
      <Footer />
    </div>
  );
}
