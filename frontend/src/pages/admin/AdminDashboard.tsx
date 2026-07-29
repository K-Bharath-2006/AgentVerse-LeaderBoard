import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';
import CustomSelect from '../../components/ui/Select';
import ConfirmationModal from '../../components/ui/Modal';
import { 
  Users, Layers, Calendar, BarChart3, 
  Download, Search, KeyRound, Ban, LogOut, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const toLocalDateTimeString = (dateInput: string | Date) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (num: number) => String(num).padStart(2, '0');
  
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'students' | 'teams' | 'reports' | 'event'>('analytics');

  // Common Data State
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Student Management State
  const [studentsData, setStudentsData] = useState<{ students: any[], total: number, page: number, pages: number }>({ students: [], total: 0, page: 1, pages: 1 });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [studentDept, setStudentDept] = useState('');
  const [studentSec, setStudentSec] = useState('');
  const [movingStudentId, setMovingStudentId] = useState<string | null>(null);
  const [moveTargetTeamId, setMoveTargetTeamId] = useState('');

  // Team Management State
  const [teamsData, setTeamsData] = useState<{ teams: any[], total: number, page: number, pages: number }>({ teams: [], total: 0, page: 1, pages: 1 });
  const [teamSearch, setTeamSearch] = useState('');
  const [teamPage, setTeamPage] = useState(1);
  const [teamDept, setTeamDept] = useState('');
  const [teamSec, setTeamSec] = useState('');



  // Event Control State
  const [eventConfig, setEventConfig] = useState<any>(null);
  const [eventDates, setEventDates] = useState({ startDate: '', endDate: '' });

  // Overall Report State
  const [overallReport, setOverallReport] = useState<any>(null);
  const [reportDept, setReportDept] = useState('');
  const [reportSec, setReportSec] = useState('');

  // Confirmation Modal State & Helpers
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isPrompt?: boolean;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (val?: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      isPrompt: false,
      confirmText: 'Confirm',
      onConfirm: () => {
        onConfirm();
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const openPrompt = (title: string, message: string, placeholder: string, onConfirm: (val: string) => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      isPrompt: true,
      placeholder,
      confirmText: 'Submit',
      onConfirm: (val) => {
        if (val) onConfirm(val);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const departments = ['CSE', 'AIDS', 'AIML', 'IT', 'CYBER', 'CCE', 'CSBS', 'ECE', 'EEE', 'MECH'];
  const sections = ['A', 'B', 'C', 'D'];

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get(`/admin/students?page=${studentPage}&search=${studentSearch}&department=${studentDept}&section=${studentSec}`);
      setStudentsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await api.get(`/admin/teams?page=${teamPage}&search=${teamSearch}&department=${teamDept}&section=${teamSec}`);
      setTeamsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvent = async () => {
    try {
      const { data } = await api.get('/admin/event');
      setEventConfig(data);
      if (data) {
        setEventDates({
          startDate: toLocalDateTimeString(data.startDate),
          endDate: toLocalDateTimeString(data.endDate)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOverallReport = async () => {
    try {
      const { data } = await api.get(`/admin/reports/overall?department=${reportDept}&section=${reportSec}`);
      setOverallReport(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchStudents(),
      fetchTeams(),
      fetchEvent(),
      fetchOverallReport()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const [timeLeft, setTimeLeft] = useState<{
    days: number; hours: number; minutes: number; seconds: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    if (!eventConfig || !eventConfig.isStarted) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(eventConfig.endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isEnded: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [eventConfig]);

  // Sync Student List when pagination/filter changes
  useEffect(() => {
    fetchStudents();
  }, [studentPage, studentDept, studentSec, studentSearch]);

  // Sync Team List when pagination/filter changes
  useEffect(() => {
    fetchTeams();
  }, [teamPage, teamDept, teamSec, teamSearch]);

  // Sync Overall Report when filters change
  useEffect(() => {
    fetchOverallReport();
  }, [reportDept, reportSec]);

  // Student Actions
  const handleBlockToggle = async (studentId: string, currentBlocked: boolean) => {
    try {
      await api.put(`/admin/students/${studentId}/block`, { isBlocked: !currentBlocked });
      toast.success(`Student ${currentBlocked ? 'unblocked' : 'blocked'} successfully.`);
      fetchStudents();
      fetchAnalytics();
    } catch (err) {
      toast.error('Failed to block/unblock student');
    }
  };

  const handleResetPassword = (studentId: string) => {
    openPrompt(
      'Reset Student Password',
      'Enter the new password (minimum 6 characters) for this student:',
      'New Password',
      async (newPassword) => {
        if (newPassword.length < 6) {
          toast.error('Password must be at least 6 characters.');
          return;
        }
        try {
          await api.put(`/admin/students/${studentId}/reset-password`, { newPassword });
          toast.success('Password reset successfully.');
        } catch (err) {
          toast.error('Failed to reset password.');
        }
      }
    );
  };

  const handleMoveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingStudentId || !moveTargetTeamId) return;
    try {
      await api.put('/admin/students/move', { studentId: movingStudentId, newTeamId: moveTargetTeamId });
      toast.success('Student moved successfully.');
      setMovingStudentId(null);
      setMoveTargetTeamId('');
      fetchStudents();
      fetchTeams();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to move student.');
    }
  };

  const handleRemoveFromTeam = (studentId: string) => {
    openConfirm(
      'Remove Student from Team',
      'Are you sure you want to remove this student from their team? This action is immediate.',
      async () => {
        try {
          await api.put('/admin/students/remove-team', { studentId });
          toast.success('Student removed from team.');
          fetchStudents();
          fetchTeams();
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to remove student.');
        }
      }
    );
  };



  // Event Actions
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(eventDates.startDate).getTime() >= new Date(eventDates.endDate).getTime()) {
      toast.error('Start date must be before the end date.');
      return;
    }
    try {
      await api.put('/admin/event', {
        startDate: new Date(eventDates.startDate).toISOString(),
        endDate: new Date(eventDates.endDate).toISOString()
      });
      toast.success('Event configuration updated.');
      fetchEvent();
    } catch (err) {
      toast.error('Failed to update event configuration.');
    }
  };

  const handleStartEvent = async () => {
    try {
      await api.post('/admin/event/start');
      toast.success('Event started successfully! Countdown initialized.');
      fetchEvent();
    } catch (err) {
      toast.error('Failed to start event.');
    }
  };

  const handleResetEvent = async () => {
    try {
      await api.post('/admin/event/reset');
      toast.success('Event reset successfully! Hackathon stopped.');
      fetchEvent();
    } catch (err) {
      toast.error('Failed to reset event.');
    }
  };

  // Export Downloads
  const handleExportStudents = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${apiUrl}/admin/reports/export/students?search=${studentSearch}&department=${studentDept}&section=${studentSec}`, '_blank');
  };

  const handleExportTeams = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${apiUrl}/admin/reports/export/teams?search=${teamSearch}&department=${teamDept}&section=${teamSec}`, '_blank');
  };

  const handleExportOverall = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${apiUrl}/admin/reports/export/overall`, '_blank');
  };

  if (loading) return <div className="p-8 text-slate-500 font-semibold text-center animate-pulse">Loading Admin Portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">V</div>
          <span className="text-xl font-black text-slate-900">Admin Control Center</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">System Admin</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.name}</p>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="flex items-center gap-1.5 text-sm bg-rose-50 text-rose-600 px-4 py-2 rounded-xl hover:bg-rose-100 transition-colors font-bold border border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Admin Panel Layout */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-premium space-y-2 h-fit">
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'analytics' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard / Analytics
          </button>
          
          <button 
            onClick={() => setActiveTab('students')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'students' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" /> Student Management
          </button>
          
          <button 
            onClick={() => setActiveTab('teams')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'teams' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" /> Team Management
          </button>

          <button 
            onClick={() => setActiveTab('reports')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Download className="w-4 h-4" /> Reports & Exports
          </button>

          <button 
            onClick={() => setActiveTab('event')} 
            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'event' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" /> Event Control
          </button>
        </div>

        {/* Tab Detail panel */}
        <div className="md:col-span-3 space-y-6">
          
          {/* TAB 1: Analytics Dashboard */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-black text-slate-900">Event Health Summary</h2>
                {eventConfig?.isStarted && (
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-full border border-emerald-150 text-[10px] uppercase tracking-wider">
                    🔴 Live Now
                  </div>
                )}
              </div>

              {/* Event Launcher / Countdown Box (Directly on Dashboard) */}
              {(!eventConfig || !eventConfig.isStarted) ? (
                <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-white p-6 md:p-8 shadow-premium text-center space-y-6 animate-in">
                  <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }}></div>
                  <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}></div>

                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider" style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      Initialization Console
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                      Sri Eshwar AgentVerse 2026
                    </h2>
                    
                    <p className="text-xs max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                      Start the hackathon to activate participant panels, initialize live event timers, and open agent submission gates.
                    </p>
                  </div>

                  <div>
                    <button 
                      onClick={handleStartEvent}
                      className="btn-primary text-xs px-8 py-3.5 rounded-xl glow-primary tracking-wider font-black uppercase transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}
                    >
                      🚀 INITIALIZE COUNTDOWN & START HACKATHON
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Live Countdown controls */
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-premium space-y-6 animate-in">
                  {/* Live Ticking Countdown Box */}
                  <div className="flex flex-col justify-center items-center p-5 rounded-2xl border border-blue-50 bg-slate-50 text-center relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 p-3 text-slate-200/60"><Clock className="w-12 h-12 stroke-[0.75]" /></div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3">Time Remaining</span>
                    
                    {timeLeft.isEnded ? (
                      <span className="text-xl font-black text-rose-500 uppercase tracking-wider animate-pulse">Hackathon Ended</span>
                    ) : (
                      <div className="flex gap-2">
                        {[
                          { value: timeLeft.days, label: 'Days' },
                          { value: timeLeft.hours, label: 'Hrs' },
                          { value: timeLeft.minutes, label: 'Min' },
                          { value: timeLeft.seconds, label: 'Sec' }
                        ].map((unit, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-premium border border-slate-100 flex items-center justify-center text-lg font-black text-slate-900">
                              {String(unit.value).padStart(2, '0')}
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{unit.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Students</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">{analytics.totalStudents}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Teams</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">{analytics.totalTeams}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Submitted Agents</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">{analytics.totalAgents}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Approved Agents</span>
                  <div className="text-3xl font-black text-blue-600 mt-2">{analytics.approvedAgents}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-premium">
                <h3 className="font-extrabold text-sm text-slate-800 mb-4 uppercase tracking-wider">Live System Overview</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  This dashboard gives a quick check of the overall registrations and approvals. Use the sidebar sections to manage student blocks, relocate team members, provision evaluations accounts, or export official Excel sheets for records.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Student Management */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-premium space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <h2 className="text-lg font-black text-slate-900">Student Directory ({studentsData.total})</h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Name, Roll, Team..." 
                      value={studentSearch}
                      onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }}
                      className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <CustomSelect
                    value={studentDept}
                    onChange={val => { setStudentDept(val); setStudentPage(1); }}
                    options={[{ value: '', label: 'All Depts' }, ...departments.map(d => ({ value: d, label: d }))]}
                    className="w-32"
                  />
                  <CustomSelect
                    value={studentSec}
                    onChange={val => { setStudentSec(val); setStudentPage(1); }}
                    options={[{ value: '', label: 'All Secs' }, ...sections.map(s => ({ value: s, label: s }))]}
                    className="w-32"
                  />
                </div>
              </div>

              {/* Move Student Modal Form (if active) */}
              {movingStudentId && (
                <form onSubmit={handleMoveStudent} className="bg-slate-50 border border-blue-200 p-4 rounded-xl space-y-3">
                  <h3 className="font-extrabold text-xs text-blue-700 uppercase tracking-wider">Move Student Team</h3>
                  <div className="flex gap-2 items-center">
                    <input 
                      required 
                      value={moveTargetTeamId}
                      onChange={e => setMoveTargetTeamId(e.target.value)}
                      placeholder="Enter Target Team ID"
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white"
                    />
                    <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Confirm Move</button>
                    <button type="button" onClick={() => setMovingStudentId(null)} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
                  </div>
                </form>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Roll & Email</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-50">
                    {studentsData.students.map((student: any) => (
                      <tr key={student._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">{student.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{student.department} • Sec {student.section}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono">{student.rollNumber}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{student.email}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-bold">
                          {student.teamId ? student.teamId.name : <span className="text-slate-400 italic font-medium">Teamless</span>}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            student.isBlocked ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {student.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          <button 
                            onClick={() => handleResetPassword(student._id)}
                            className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg hover:text-slate-900 transition-colors shadow-sm"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          
                          <button 
                            onClick={() => handleBlockToggle(student._id, student.isBlocked)}
                            className={`px-2 py-1 rounded-lg border transition-colors shadow-sm ${
                              student.isBlocked 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:text-emerald-700' 
                                : 'bg-rose-50 border-rose-200 text-rose-600 hover:text-rose-700'
                            }`}
                            title={student.isBlocked ? 'Unblock Student' : 'Block Student'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            onClick={() => setMovingStudentId(student._id)}
                            className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg hover:bg-slate-50 text-[10px] font-bold"
                          >
                            Move
                          </button>

                          {student.teamId && (
                            <button 
                              onClick={() => handleRemoveFromTeam(student._id)}
                              className="bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-100 text-[10px] font-bold"
                            >
                              Remove Team
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {studentsData.pages > 1 && (
                <div className="flex justify-center gap-1.5 pt-4">
                  {Array.from({ length: studentsData.pages }, (_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setStudentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        studentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Team Management */}
          {activeTab === 'teams' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-premium space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <h2 className="text-lg font-black text-slate-900">Teams Directory ({teamsData.total})</h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search team name..." 
                      value={teamSearch}
                      onChange={e => { setTeamSearch(e.target.value); setTeamPage(1); }}
                      className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs w-full focus:outline-none"
                    />
                  </div>
                  <CustomSelect
                    value={teamDept}
                    onChange={val => { setTeamDept(val); setTeamPage(1); }}
                    options={[{ value: '', label: 'All Depts' }, ...departments.map(d => ({ value: d, label: d }))]}
                    className="w-32"
                  />
                  <CustomSelect
                    value={teamSec}
                    onChange={val => { setTeamSec(val); setTeamPage(1); }}
                    options={[{ value: '', label: 'All Secs' }, ...sections.map(s => ({ value: s, label: s }))]}
                    className="w-32"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-2.5 px-3">Team Name</th>
                      <th className="py-2.5 px-3">Dept & Sec</th>
                      <th className="py-2.5 px-3">Members</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Team ID</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-50">
                    {teamsData.teams.map((team: any) => (
                      <tr key={team._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900 text-sm">{team.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Join Code: {team.joinCode}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            {team.department} • Sec {team.section}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <ul className="space-y-1">
                            {team.members.map((m: any) => (
                              <li key={m._id} className="flex justify-between w-full">
                                <span>{m.name}</span>
                                <button 
                                  onClick={() => handleRemoveFromTeam(m._id)}
                                  className="text-[10px] text-rose-500 hover:underline font-bold"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col text-[10px] font-bold uppercase gap-0.5">
                            <span className="text-emerald-600">{team.approvedCount} Approved</span>
                            <span className="text-slate-400">{team.submittedCount} Total</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                          {team._id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {teamsData.pages > 1 && (
                <div className="flex justify-center gap-1.5 pt-4">
                  {Array.from({ length: teamsData.pages }, (_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setTeamPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        teamPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}



          {/* TAB 5: Reports & Excel Exports */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              
              {/* Overall Report Standings */}
              {overallReport && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-premium space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-black text-slate-900">Overall Overview Report</h2>
                      <div className="flex gap-2">
                        <CustomSelect
                          value={reportDept}
                          onChange={setReportDept}
                          options={[{ value: '', label: 'All Depts' }, ...departments.map(d => ({ value: d, label: d }))]}
                          className="w-32"
                        />
                        <CustomSelect
                          value={reportSec}
                          onChange={setReportSec}
                          options={[{ value: '', label: 'All Secs' }, ...sections.map(s => ({ value: s, label: s }))]}
                          className="w-32"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleExportOverall} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Excel
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="block text-2xl font-black text-slate-900">{overallReport.summary.studentCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Students</span>
                    </div>
                    <div>
                      <span className="block text-2xl font-black text-slate-900">{overallReport.summary.teamCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Teams</span>
                    </div>
                    <div>
                      <span className="block text-2xl font-black text-blue-600">{overallReport.summary.approvedAgentCount}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Approved Agents</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-2 px-3">Department</th>
                          <th className="py-2 px-3 text-right">Students</th>
                          <th className="py-2 px-3 text-right">Teams</th>
                          <th className="py-2 px-3 text-right">Approved Agents</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-50">
                        {overallReport.breakdown.map((row: any) => (
                          <tr key={row.department}>
                            <td className="py-2.5 px-3 text-slate-900 font-extrabold">{row.department}</td>
                            <td className="py-2.5 px-3 text-right text-slate-500">{row.studentCount}</td>
                            <td className="py-2.5 px-3 text-right text-slate-500">{row.teamCount}</td>
                            <td className="py-2.5 px-3 text-right text-blue-600 font-extrabold">{row.approvedAgents}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Student Report Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Download Detailed Student Report</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Excel file with roll numbers, names, departments, sections, teams, and submissions status counts.</p>
                </div>
                <button 
                  onClick={handleExportStudents} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 h-4" /> Download Student List
                </button>
              </div>

              {/* Team Report Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Download Detailed Team Report</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Excel file with team names, departments, sections, active members, and submission counts.</p>
                </div>
                <button 
                  onClick={handleExportTeams} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 h-4" /> Download Team List
                </button>
              </div>

            </div>
          )}

          {/* TAB 6: Event Control */}
          {activeTab === 'event' && eventConfig && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-premium space-y-6 animate-in">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Event Timeline Settings
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">Configure or modify the official start date & time and end date & time for the hackathon event.</p>
                </div>

                <form onSubmit={handleUpdateEvent} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Hackathon Start Date & Time *</label>
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          required
                          value={eventDates.startDate} 
                          onChange={e => setEventDates({...eventDates, startDate: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all hover:bg-slate-100/50 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Hackathon End Date & Time *</label>
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          required
                          value={eventDates.endDate} 
                          onChange={e => setEventDates({...eventDates, endDate: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all hover:bg-slate-100/50 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full btn-primary py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mb-2"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}
                  >
                    ✓ Save Event Timeline Configuration
                  </button>
                </form>

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>Current Event Status:</span>
                    <span className={`font-black uppercase px-2.5 py-1 rounded-full text-[10px] tracking-wider ${eventConfig.isStarted ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 animate-pulse' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                      {eventConfig.isStarted ? '🔴 Live / Started' : '⚪ Not Started'}
                    </span>
                  </div>
                  {eventConfig.isStarted && (
                    <button 
                      onClick={handleResetEvent}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-rose-200"
                    >
                      🛑 Reset Event & Stop Countdown
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        isPrompt={modalConfig.isPrompt}
        placeholder={modalConfig.placeholder}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
