import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Welcome aboard!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition shadow-sm text-slate-900 placeholder-slate-400 text-sm";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="bg-surface-900 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-surface-900/30">
            <Shield className="text-brand-400 w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Your Account</h2>
          <p className="mt-2 text-slate-500">Join the platform to report and track civic issues</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-slate-100 p-8 animate-fade-in">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" name="name" required className={inputCls} placeholder="Ravi Kumar" onChange={handleChange} />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" name="email" required className={inputCls} placeholder="ravi@example.com" onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" name="password" required minLength={6} className={inputCls} placeholder="At least 6 characters" onChange={handleChange} />
            </div>
            <div>
              <label className={labelCls}>Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" name="phone" className={inputCls} placeholder="+91 98765 43210" onChange={handleChange} />
            </div>
            <div>
              <label className={labelCls}>Residential Address <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea name="address" rows="2" className={`${inputCls} resize-none`} placeholder="12, Park Street, Chennai" onChange={handleChange}></textarea>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all active:scale-[0.98] mt-2 shadow-brand-500/30"
            >
              {isLoading ? 'Creating account...' : <><span>Register as Citizen</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
