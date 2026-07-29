import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Key, AlertCircle, ArrowLeft } from 'lucide-react';
import Footer from '../../components/common/Footer';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'email' | 'juryId'>('email');
  
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = loginType === 'email' 
        ? { email: identifier, password }
        : { juryId: identifier, password };
        
      await login(payload);
      
      const user = useAuthStore.getState().user;
      if (user?.role === 'student') navigate('/student');
      else if (user?.role === 'admin') navigate('/admin');
      else navigate('/jury');
    } catch (err) {
      // Handled in store
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Animated Background bubbles */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }}></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}></div>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center px-6 py-12 relative z-10 w-full">
        <div className="w-full max-w-md space-y-4">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider mb-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-premium space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-9 h-9 object-contain" alt="Sri Eshwar Logo" />
            <span className="text-xl font-black gradient-text-blue" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sri Eshwar Market Place</span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
            <p className="mt-1 text-xs font-semibold text-slate-500">Sign in to access your hackathon portal</p>
          </div>

          {/* Tab switch */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-50 border border-slate-100">
            <button
              type="button"
              onClick={() => { setLoginType('email'); setIdentifier(''); }}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              style={loginType === 'email'
                ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', boxShadow: '0 4px 12px rgba(0, 87, 168, 0.2)' }
                : { color: 'var(--text-secondary)' }
              }
            >
              🎓 Student / Admin
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('juryId'); setIdentifier(''); }}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              style={loginType === 'juryId'
                ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', boxShadow: '0 4px 12px rgba(0, 87, 168, 0.2)' }
                : { color: 'var(--text-secondary)' }
              }
            >
              ⚖️ Jury Member
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {(error as any)?.response?.data?.message || (error as any)?.message || 'Invalid credentials'}
              </div>
            )}

            {/* Identifier */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                {loginType === 'email' ? 'Email Address' : 'Jury ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {loginType === 'email' ? <Mail className="h-4 w-4" style={{ color: 'var(--text-muted)' }} /> : <Key className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />}
                </div>
                <input
                  id="identifier"
                  type={loginType === 'email' ? 'email' : 'text'}
                  required
                  className="input-dark input-with-icon"
                  placeholder={loginType === 'email' ? 'yourname@sece.ac.in' : 'FAC100, ALU100, IND100'}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="input-dark input-with-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">
              {isLoading ? '⏳ Signing in...' : '🚀 Sign in to Portal'}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                New to Sri Eshwar Market Place?{' '}
                <Link to="/register" className="font-black hover:underline" style={{ color: '#818cf8' }}>
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
