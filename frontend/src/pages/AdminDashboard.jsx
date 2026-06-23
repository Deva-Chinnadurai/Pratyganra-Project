import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity, Users, CheckCircle, Clock, Search, X, Trash2, MapPin, Tag, Shield, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'users' | 'feedbacks'
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [statusInput, setStatusInput] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [compRes, statRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/complaints'),
        axios.get('http://localhost:5000/api/admin/analytics')
      ]);
      setComplaints(compRes.data);
      setAnalytics(statRes.data);
    } catch (err) { }
  };

  const fetchUsersData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(data);
    } catch (err) { }
  };

  const fetchFeedbacksData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/feedback/admin/all');
      setFeedbacks(data);
    } catch (err) { }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchDashboardData();
    if (activeTab === 'users') fetchUsersData();
    if (activeTab === 'feedbacks') fetchFeedbacksData();
  }, [activeTab]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/complaints/${selectedComplaint._id}`, { status: statusInput, adminRemarks: remarks });
      toast.success('Complaint updated!');
      setSelectedComplaint(null);
      fetchDashboardData();
    } catch (err) { toast.error('Update failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user and all their complaints?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      toast.success('User removed successfully');
      fetchUsersData();
    } catch (err) { toast.error('Failed to remove user'); }
  };

  const StatusBadge = ({ status }) => {
    const map = { 'Pending': 'bg-amber-100 text-amber-800', 'In Progress': 'bg-blue-100 text-blue-800', 'Resolved': 'bg-emerald-100 text-emerald-800', 'Rejected': 'bg-rose-100 text-rose-800' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status]}`}>{status}</span>;
  };

  const StatCard = ({ icon: Icon, label, value, color, accent }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 border-b-[3px] ${accent}`}>
      <div className={`${color} p-3.5 rounded-xl`}><Icon size={22} /></div>
      <div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="text-3xl font-extrabold text-slate-900">{value}</p></div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-surface-900 shadow-xl md:sticky top-16 md:h-[calc(100vh-4rem)] flex-shrink-0">
        <div className="p-6">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-5">Control Panel</p>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'requests' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-indigo-200 hover:bg-surface-800 hover:text-white'}`}>
              <Activity size={17}/> Service Requests
            </button>
            <button onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-indigo-200 hover:bg-surface-800 hover:text-white'}`}>
              <Users size={17}/> User Directory
            </button>
            <button onClick={() => setActiveTab('feedbacks')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'feedbacks' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-indigo-200 hover:bg-surface-800 hover:text-white'}`}>
              <Star size={17}/> Citizen Feedback
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Analytics */}
        {analytics && activeTab === 'requests' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={Activity} label="Total Requests" value={analytics.totalComplaints} color="bg-indigo-50 text-indigo-600" accent="border-b-brand-400" />
            <StatCard icon={CheckCircle} label="Resolved" value={analytics.statusCounts?.resolved || 0} color="bg-emerald-50 text-emerald-600" accent="border-b-emerald-400" />
            <StatCard icon={Clock} label="Pending" value={analytics.statusCounts?.pending || 0} color="bg-amber-50 text-amber-600" accent="border-b-amber-400" />
            <StatCard icon={Users} label="Citizens" value={analytics.totalCitizens} color="bg-violet-50 text-violet-600" accent="border-b-violet-400" />
          </div>
        )}

        {/* ── Feedbacks Panel ─────────────────────────────────────────── */}
        {activeTab === 'feedbacks' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">⭐ Citizen Feedback</h2>
                <p className="text-sm text-slate-400 mt-1">{feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} submitted by citizens</p>
              </div>
              {feedbacks.length > 0 && (
                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">Avg. Rating</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={`text-base ${n <= Math.round(feedbacks.reduce((s,f)=>s+f.rating,0)/feedbacks.length) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {feedbacks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <Star className="mx-auto mb-3 text-slate-200" size={48}/>
                <p className="text-slate-400 font-semibold">No feedback submitted yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks
                  .filter(f => (f.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (f.complaint?.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(f => (
                    <div key={f._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-amber-100 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(f.user?.name || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{f.user?.name || 'Citizen'}</p>
                            <p className="text-xs text-slate-400">{new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <span key={n} className={`text-lg ${n <= f.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Complaint</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{f.complaint?.title || 'Unknown'}</p>
                        <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">{f.complaint?.category || '—'}</span>
                      </div>
                      {f.comment ? (
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{f.comment}"</p>
                      ) : (
                        <p className="text-xs text-slate-300 italic">No comment provided.</p>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ── Requests & Users Table ──────────────────────────────────────── */}
        {activeTab !== 'feedbacks' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              {activeTab === 'requests' ? 'Service Requests' : 'User Directory'}
            </h2>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Search..."
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 w-full md:w-64 text-slate-900 bg-slate-50 shadow-sm"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {activeTab === 'requests' ? (
                    <>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Citizen</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3.5 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === 'requests' && complaints
                  .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c._id.includes(searchTerm))
                  .map(c => (
                    <tr key={c._id} className="hover:bg-indigo-50/30 transition border-l-2 border-l-transparent hover:border-l-brand-400">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {(c.user?.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{c.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-400 font-mono">#{c._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                          {c.title}
                          {c.imageUrl && <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">IMG</span>}
                        </div>
                        <div className="text-xs text-slate-400 max-w-sm truncate mb-1">{c.description}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={10}/>{c.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${c.priority === 'High' ? 'bg-rose-50 text-rose-700' : c.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>{c.priority}</span>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedComplaint(c); setRemarks(c.adminRemarks || ''); setStatusInput(c.status); }}
                          className="text-xs font-bold text-white bg-surface-900 hover:bg-brand-600 px-4 py-2 rounded-lg shadow-sm transition">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                }
                {activeTab === 'users' && users
                  .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.includes(searchTerm))
                  .map(u => (
                    <tr key={u._id} className="hover:bg-rose-50/30 transition border-l-2 border-l-transparent hover:border-l-rose-400">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {u.name[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{u.email}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm font-mono">{u.phone || '—'}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm max-w-[180px] truncate">{u.address || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteUser(u._id)}
                          className="flex ml-auto items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition">
                          <Trash2 size={14}/> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            {((activeTab === 'requests' && complaints.length === 0) || (activeTab === 'users' && users.length === 0)) && (
              <div className="p-10 text-center text-slate-400">No records found.</div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Admin Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-surface-900 to-brand-600">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2"><Shield size={18}/> Request #{selectedComplaint._id.slice(-6)}</h2>
                <p className="text-indigo-200 text-xs mt-0.5">Filed: {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-7 max-h-[75vh] overflow-y-auto">
              {selectedComplaint.imageUrl && (
                <div className="mb-5 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                  <img src={selectedComplaint.imageUrl} alt="Attachment" className="w-full max-h-48 object-cover" />
                </div>
              )}

              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-5 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700"><Tag size={14} className="text-indigo-500"/> <span className="font-semibold">Category:</span> {selectedComplaint.category}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-indigo-500 flex-shrink-0"/>
                  <span className="font-semibold text-slate-700">SLA:</span>
                  {selectedComplaint.status === 'Pending' && (new Date() - new Date(selectedComplaint.createdAt)) > 86400000
                    ? <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">⚠ Overdue</span>
                    : <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">✓ Within Limits</span>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Update Status</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                    value={statusInput} onChange={e => setStatusInput(e.target.value)}>
                    <option>Pending</option><option>In Progress</option><option>Resolved</option><option>Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Official Response <span className="text-slate-400 font-normal">(visible to citizen)</span></label>
                  <textarea rows="4" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-sm text-sm placeholder-slate-400"
                    value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="E.g., Engineering team deployed. Issue resolved."></textarea>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedComplaint(null)} className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 font-bold bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition active:scale-95">Update Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
