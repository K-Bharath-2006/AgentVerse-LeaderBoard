import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, User, Hash, BookOpen, Layers, Zap, AlertCircle, ArrowLeft } from 'lucide-react';
import CustomSelect from '../../components/ui/Select';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    year: '1',
    department: '',
    section: ''
  });
  
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/student');
    } catch (err) {
      // Handled in store
    }
  };

  const fields: Array<{
    label: string;
    icon: React.ReactNode;
    name: string;
    type?: string;
    placeholder: string;
    isSelect?: boolean;
    options?: string[];
  }> = [
    { label: 'Full Name', icon: <User className="h-4 w-4" />, name: 'name', placeholder: 'John Doe' },
    { label: 'College Email', icon: <Mail className="h-4 w-4" />, name: 'email', type: 'email', placeholder: 'name@sece.ac.in' },
    { label: 'Password', icon: <Lock className="h-4 w-4" />, name: 'password', type: 'password', placeholder: 'Minimum 6 characters' },
    { label: 'Roll Number', icon: <Hash className="h-4 w-4" />, name: 'rollNumber', placeholder: 'e.g. 21CS001' },
    { 
      label: 'Department', 
      icon: <BookOpen className="h-4 w-4" />, 
      name: 'department', 
      placeholder: 'Select Department',
      isSelect: true,
      options: ['CSE', 'AIDS', 'AIML', 'IT', 'CYBER', 'CCE', 'CSBS', 'ECE', 'EEE', 'MECH']
    },
    { label: 'Section', icon: <Layers className="h-4 w-4" />, name: 'section', placeholder: 'e.g. A, B, C' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Animated Background bubbles */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }}></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}></div>
      </div>

      <div className="w-full max-w-lg space-y-4 relative z-10">
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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}>
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-black gradient-text-blue" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AgentVerse 2026</span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Create Account</h1>
            <p className="mt-1 text-xs font-semibold text-slate-500">Register as a student participant</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {(error as any)?.response?.data?.message || (error as any)?.message || 'Registration failed'}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {field.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                      {field.icon}
                    </div>
                    {field.isSelect ? (
                      <CustomSelect
                        value={(formData as any)[field.name]}
                        onChange={val => setFormData({ ...formData, [field.name]: val })}
                        options={field.options || []}
                        placeholder={field.placeholder}
                        required
                        buttonClassName="input-with-icon"
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type || 'text'}
                        required
                        className="input-dark input-with-icon"
                        placeholder={field.placeholder}
                        value={(formData as any)[field.name]}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Year - full width */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Year of Study</label>
                <CustomSelect
                  value={formData.year}
                  onChange={val => setFormData({ ...formData, year: val })}
                  options={[
                    { value: '1', label: '1st Year' },
                    { value: '2', label: '2nd Year' },
                    { value: '3', label: '3rd Year' },
                    { value: '4', label: '4th Year' }
                  ]}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-2">
              {isLoading ? '⏳ Registering...' : '🎓 Create Student Account'}
            </button>

            <div className="text-center pt-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Already registered?{' '}
                <Link to="/login" className="font-black hover:underline" style={{ color: '#818cf8' }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
