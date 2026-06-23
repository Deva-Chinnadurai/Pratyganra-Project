import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  PlusCircle, FileText, Clock, Camera, Tag, MapPin, X, Shield,
  AlertTriangle, Star, MessageSquare, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

// ─── Star Rating Component ────────────────────────────────────────────────────
const StarRating = ({ value, onChange, readOnly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n} type="button"
        disabled={readOnly}
        onClick={() => onChange && onChange(n)}
        className={`text-2xl transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-125'} ${n <= value ? 'text-amber-400' : 'text-slate-200'}`}
      >
        ★
      </button>
    ))}
  </div>
);

// ─── Status / Priority Badges ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Pending':     'bg-amber-100 text-amber-800 border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Resolved':    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Rejected':    'bg-rose-100 text-rose-800 border-rose-200',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${map[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
};

const PriorityDot = ({ p }) => {
  const map = { High: 'bg-rose-500', Medium: 'bg-amber-400', Low: 'bg-slate-300' };
  return <span className={`inline-block w-2 h-2 rounded-full mr-1 ${map[p]}`} />;
};

// ─── Feedback Form (shown inside resolved cards) ──────────────────────────────
const FeedbackForm = ({ complaintId, existingFeedback, onSaved }) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!rating) { toast.error('Please select a star rating'); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/feedback`, { complaintId, rating, comment });
      toast.success('Thank you for your feedback!');
      onSaved && onSaved({ rating, comment });
    } catch (err) {
      console.error('[Feedback] Error:', err.response?.status, err.response?.data);
      const msg = err.response?.data?.message || err.message || 'Server error';
      toast.error(`Feedback error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-amber-500" />
        <span className="text-sm font-bold text-amber-800">
          {existingFeedback ? 'Your Submitted Feedback' : 'Rate this Resolution'}
        </span>
      </div>
      <StarRating value={rating} onChange={existingFeedback ? null : setRating} readOnly={!!existingFeedback} />
      <textarea
        disabled={!!existingFeedback}
        rows={2}
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Optional: share what worked or what could improve..."
        className="mt-3 w-full text-sm rounded-lg border border-amber-200 bg-white px-3 py-2 outline-none focus:border-amber-400 resize-none placeholder-slate-400 disabled:opacity-60"
      />
      {!existingFeedback && (
        <button
          onClick={handleSave} disabled={saving}
          className="mt-2 px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition disabled:opacity-60"
        >
          {saving ? 'Submitting...' : 'Submit Feedback'}
        </button>
      )}
    </div>
  );
};

// ─── Single Request Card ──────────────────────────────────────────────────────
const RequestCard = ({ c }) => {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);

  useEffect(() => {
    if (c.status === 'Resolved' && expanded && !feedbackLoaded) {
      axios.get(`${API}/feedback/${c._id}`)
        .then(res => { setFeedback(res.data); setFeedbackLoaded(true); })
        .catch(() => setFeedbackLoaded(true));
    }
  }, [expanded, c._id, c.status, feedbackLoaded]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <PriorityDot p={c.priority} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{c.category}</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base mb-1 truncate">{c.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Clock size={11}/>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><MapPin size={11}/>{c.address}</span>
            <span className="font-mono opacity-60">#{c._id.slice(-6)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={c.status} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-brand-600 font-bold flex items-center gap-1 hover:underline"
          >
            {expanded ? <><ChevronUp size={13}/>Less</> : <><ChevronDown size={13}/>Details</>}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-50 px-5 pb-5 pt-4 space-y-4 animate-fade-in">
          <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>

          {c.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-100">
              <img src={c.imageUrl} alt="Attachment" className="w-full max-h-64 object-cover" />
            </div>
          )}

          {/* Admin Response */}
          {c.adminRemarks && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-800 mb-1">
                <Shield size={14}/> Official Admin Response
              </div>
              <p className="text-sm text-indigo-900">{c.adminRemarks}</p>
            </div>
          )}

          {/* SLA Warning */}
          {c.status === 'Pending' && (new Date() - new Date(c.createdAt)) > 3 * 86400000 && (
            <div className="flex items-center gap-2 text-xs bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 text-rose-700 font-semibold">
              <AlertTriangle size={13}/> This request has been pending for more than 3 days.
            </div>
          )}

          {/* Feedback Section (only for Resolved) */}
          {c.status === 'Resolved' && (
            feedbackLoaded
              ? <FeedbackForm complaintId={c._id} existingFeedback={feedback} onSaved={fb => setFeedback(fb)} />
              : <p className="text-xs text-slate-400 animate-pulse">Loading feedback status...</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Citizen Dashboard ───────────────────────────────────────────────────
export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Other', address: '', priority: 'Low', imageUrl: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const categories = ['Road Damage', 'Street Light Issue', 'Water Leakage', 'Garbage Collection', 'Drainage Problem', 'Electricity Problem', 'Public Park Issue', 'Other'];
  const statuses = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get(`${API}/complaints/my`);
      setComplaints(data);
    } catch (err) {}
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Please pick an image under 5MB'); return; }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, imageUrl: compressed }));
        toast.success(`Image ready (${(compressed.length / 1024).toFixed(0)} KB)`);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${API}/complaints`, formData);
      toast.success('Complaint submitted!');
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'Other', address: '', priority: 'Low', imageUrl: '' });
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition text-slate-900 text-sm placeholder-slate-400 shadow-sm";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  const filtered = filterStatus === 'All' ? complaints : complaints.filter(c => c.status === filterStatus);

  // Stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-surface-900 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] shadow-xl">
        <div className="p-6 flex-1">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-5">Citizen Panel</p>
          <nav className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <FileText size={17}/> My Requests
            </div>
          </nav>

          {/* Quick Stats */}
          <div className="mt-8 pt-6 border-t border-surface-700 space-y-3">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Your Activity</p>
            <div className="flex justify-between text-xs">
              <span className="text-indigo-300">Total Filed</span>
              <span className="font-bold text-white">{stats.total}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-300">Pending</span>
              <span className="font-bold text-white">{stats.pending}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-300">In Progress</span>
              <span className="font-bold text-white">{stats.inProgress}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-300">Resolved</span>
              <span className="font-bold text-white">{stats.resolved}</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/30 active:scale-95 text-sm"
            >
              <PlusCircle size={17}/> Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
        {/* Mobile Controls */}
        <div className="lg:hidden flex gap-2 mb-6">
          <button onClick={() => setShowModal(true)} className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-brand-500 text-white shadow-md">
            <PlusCircle size={14}/> Report Issue
          </button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">📋 My Requests</h1>
            <p className="text-sm text-slate-400 mt-1">Track and manage all your submitted service complaints.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterStatus === s ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'}`}
            >
              {s}
              {s !== 'All' && <span className="ml-1.5 opacity-60">({complaints.filter(c => c.status === s).length})</span>}
            </button>
          ))}
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <FileText className="mx-auto mb-3 text-slate-200" size={52}/>
              <p className="text-slate-400 font-semibold">No {filterStatus !== 'All' ? filterStatus : ''} requests found.</p>
              {filterStatus === 'All' && <p className="text-slate-300 text-sm mt-1">Click "Report Issue" to submit your first complaint.</p>}
            </div>
          ) : filtered.map(c => <RequestCard key={c._id} c={c} />)}
        </div>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-brand-500 to-violet-600">
              <div>
                <h2 className="text-lg font-extrabold text-white">Submit Service Request</h2>
                <p className="text-indigo-200 text-xs mt-0.5">Report a public issue in your area</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 max-h-[72vh] overflow-y-auto space-y-4">
              <div>
                <label className={labelCls}>Problem Title</label>
                <input required type="text" className={inputCls} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="E.g., Large pothole near bus stop" />
              </div>
              <div>
                <label className={labelCls}>Detailed Description</label>
                <textarea required rows="3" className={`${inputCls} resize-none`} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the issue clearly..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select className={inputCls} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
                  <select className={inputCls} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Incident Location / Address</label>
                <input required type="text" className={inputCls} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street name, ward, nearby landmark" />
              </div>
              <div>
                <label className={labelCls}>Attach Photo <span className="text-slate-400 font-normal">(Optional, max 5MB)</span></label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-brand-400 transition-all group">
                  <Camera className="text-slate-300 group-hover:text-brand-400 transition mb-1.5" size={26}/>
                  <span className="text-sm font-medium text-slate-400 group-hover:text-brand-500">
                    {formData.imageUrl ? '✅ Photo ready to submit' : 'Click to upload a photo'}
                  </span>
                  <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition disabled:opacity-70">
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
