import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Mail, Edit3, Save, X, FileText, CheckCircle2, Clock, AlertCircle, Shield } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, rejected: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    }
    // Load complaint stats
    axios.get(`${API}/complaints/my`)
      .then(({ data }) => {
        setStats({
          total: data.length,
          resolved: data.filter(c => c.status === 'Resolved').length,
          pending: data.filter(c => c.status === 'Pending').length,
          rejected: data.filter(c => c.status === 'Rejected').length,
        });
      })
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // For now we persist changes to user via re-registering a profile update
      // Since we don't have a PUT /auth/profile yet, we patch it via a custom endpoint
      await axios.put(`${API}/auth/profile`, formData);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition text-slate-900 text-sm shadow-sm";

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-surface-900 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] shadow-xl">
        <div className="p-6">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-5">Citizen Panel</p>
          <nav className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <User size={17}/> My Profile
            </div>
          </nav>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 px-4 sm:px-6 py-10 max-w-3xl mx-auto w-full animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">👤 My Profile</h1>
          <p className="text-sm text-slate-400 mt-1">View and manage your personal account information.</p>
        </div>

        {/* Avatar + Identity Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-brand-500 to-violet-600 px-8 py-8 flex items-end gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl">
              <span className="text-white font-extrabold text-3xl">{user?.name?.[0]?.toUpperCase() || 'C'}</span>
            </div>
            <div className="pb-1">
              <h2 className="text-2xl font-extrabold text-white">{user?.name}</h2>
              <span className="text-indigo-200 text-sm flex items-center gap-1 mt-0.5">
                <Shield size={13}/> Verified Citizen
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Personal Details</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition">
                  <Edit3 size={14}/> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-2 rounded-xl transition">
                    <X size={14}/> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-xl shadow-sm transition disabled:opacity-70">
                    <Save size={14}/> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2"><User size={12}/> Full Name</label>
                  {editing
                    ? <input className={inputCls} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    : <p className="text-slate-900 font-semibold">{user?.name || '—'}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2"><Mail size={12}/> Email</label>
                  <p className="text-slate-900 font-semibold">{user?.email || '—'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Email cannot be changed.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2"><Phone size={12}/> Phone Number</label>
                {editing
                  ? <input className={inputCls} placeholder="Your phone number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  : <p className="text-slate-900 font-semibold">{user?.phone || <span className="text-slate-300">Not provided</span>}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2"><MapPin size={12}/> Residential Address</label>
                {editing
                  ? <textarea rows={2} className={`${inputCls} resize-none`} placeholder="Your home address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  : <p className="text-slate-900 font-semibold">{user?.address || <span className="text-slate-300">Not provided</span>}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-6">📊 My Activity Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-2xl p-5 text-center border border-indigo-100">
              <FileText className="mx-auto text-indigo-500 mb-2" size={22}/>
              <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Total Filed</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100">
              <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={22}/>
              <p className="text-3xl font-extrabold text-slate-900">{stats.resolved}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Resolved</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 text-center border border-amber-100">
              <Clock className="mx-auto text-amber-500 mb-2" size={22}/>
              <p className="text-3xl font-extrabold text-slate-900">{stats.pending}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Pending</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-5 text-center border border-rose-100">
              <AlertCircle className="mx-auto text-rose-500 mb-2" size={22}/>
              <p className="text-3xl font-extrabold text-slate-900">{stats.rejected}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Rejected</p>
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution Rate</p>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-brand-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((stats.resolved / stats.total) * 100)}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{Math.round((stats.resolved / stats.total) * 100)}% of your requests have been resolved</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
