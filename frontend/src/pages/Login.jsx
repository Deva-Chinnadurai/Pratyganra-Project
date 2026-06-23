import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-center bg-surface-900 w-5/12 xl:w-1/2 px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#4f46e5_0%,_transparent_60%)] opacity-40" />
        <div className="relative z-10">
          <div className="bg-brand-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-brand-500/40">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Your city, <br/> your voice.
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Report public service issues, track their resolution, and help your community thrive.
          </p>
          <div className="mt-12 space-y-4">
            {['Road Damage', 'Water Leakage', 'Street Light Issue', 'Drainage Problem'].map(c => (
              <div key={c} className="flex items-center gap-3 text-indigo-200 text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign in</h2>
            <p className="mt-2 text-slate-500">Access your citizen service account</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email" required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition shadow-sm text-slate-900 placeholder-slate-400"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password" required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition shadow-sm text-slate-900 placeholder-slate-400"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition-all active:scale-[0.98] shadow-brand-500/30 mt-2"
            >
              {isLoading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 transition">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
