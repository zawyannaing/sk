import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  Calendar,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';
import { AnnouncementItem } from '../types';
import { SupabaseService } from '../../../utils/supabaseClient';
import { Language } from '../../../types';

interface AnnouncementsModuleProps {
  language: Language;
}

export const AnnouncementsModule: React.FC<AnnouncementsModuleProps> = ({ language }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<AnnouncementItem['type']>('info');
  const [placement, setPlacement] = useState<AnnouncementItem['placement']>('banner');
  const [audience, setAudience] = useState<AnnouncementItem['audience']>('all');
  const [languageTarget, setLanguageTarget] = useState<AnnouncementItem['language']>('both');
  const [isActive, setIsActive] = useState(true);
  const [dismissible, setDismissible] = useState(true);
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseService.fetchAllAnnouncements();
      setAnnouncements(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setBody('');
    setType('info');
    setPlacement('banner');
    setAudience('all');
    setLanguageTarget('both');
    setIsActive(true);
    setDismissible(true);
    setCtaLabel('');
    setCtaUrl('');
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setBody(item.body);
    setType(item.type);
    setPlacement(item.placement);
    setAudience(item.audience);
    setLanguageTarget(item.language);
    setIsActive(item.is_active);
    setDismissible(item.dismissible);
    setCtaLabel(item.cta_label || '');
    setCtaUrl(item.cta_url || '');
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFormError('Title and body are required fields.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      title: title.trim(),
      body: body.trim(),
      type,
      placement,
      audience,
      language: languageTarget,
      is_active: isActive,
      dismissible,
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      starts_at: new Date().toISOString()
    };

    try {
      if (editingItem) {
        const res = await SupabaseService.updateAnnouncement(editingItem.id, payload);
        if (!res.success) {
          setFormError(res.error || 'Failed to update announcement');
          return;
        }
      } else {
        const res = await SupabaseService.createAnnouncement(payload);
        if (!res.success) {
          setFormError(res.error || 'Failed to create announcement');
          return;
        }
      }

      setIsEditorOpen(false);
      window.dispatchEvent(new CustomEvent('supabase-announcements-refresh'));
      loadAnnouncements();
    } catch (err: any) {
      setFormError(err?.message || 'Error saving announcement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    await SupabaseService.deleteAnnouncement(id);
    window.dispatchEvent(new CustomEvent('supabase-announcements-refresh'));
    loadAnnouncements();
  };

  const handleToggleActive = async (item: AnnouncementItem) => {
    await SupabaseService.updateAnnouncement(item.id, { is_active: !item.is_active });
    window.dispatchEvent(new CustomEvent('supabase-announcements-refresh'));
    loadAnnouncements();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif">
            Live Announcements & Broadcasts
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create real-time notification banners, modal alerts, and targeted messages across user sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="rounded-2xl bg-[#0a0d14] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e121b] border-b border-white/5 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Title & Message</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Placement</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    <span>Loading announcements...</span>
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                    No active or scheduled announcements found. Click "New Announcement" to create one.
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-bold text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.body}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          item.type === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : item.type === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : item.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300 capitalize">
                      {item.placement}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 capitalize">
                      {item.audience.replace('_', ' ')} ({item.language})
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                          item.is_active
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal with Live Preview */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full rounded-3xl bg-[#0d111a] border border-white/10 p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scheduled System Upgrade"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase">Type / Severity</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="info">Info (Cyan)</option>
                    <option value="success">Success (Emerald)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="critical">Critical (Rose)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-zinc-300 uppercase">Message Body</label>
                <textarea
                  required
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Detailed announcement content presented to creators..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase">Placement</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="banner">Sticky Top Banner</option>
                    <option value="modal">Centered Modal</option>
                    <option value="toast">Bottom Floating Toast</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="all">Everyone</option>
                    <option value="logged_in">Logged-in Creators Only</option>
                    <option value="logged_out">Logged-out Visitors Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase">Language Target</label>
                  <select
                    value={languageTarget}
                    onChange={(e) => setLanguageTarget(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="both">Both (EN & မြန်မာ)</option>
                    <option value="en">English Only</option>
                    <option value="my">မြန်မာစာ Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase">CTA Label (Optional)</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="e.g. Learn More / Read Guide"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-zinc-300 uppercase">CTA Target URL (Optional)</label>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://example.com/guide"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span>Active immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={dismissible}
                    onChange={(e) => setDismissible(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span>Allow users to dismiss</span>
                </label>
              </div>

              {/* Live Preview Box */}
              <div className="pt-2">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Real-time User Preview</span>
                </label>
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      type === 'critical'
                        ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                        : type === 'warning'
                        ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                        : type === 'success'
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                        : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {type === 'critical' || type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 shrink-0" />
                      )}
                      <span className="font-bold text-white shrink-0">{title || 'Preview Title'}:</span>
                      <span className="truncate">{body || 'Preview message body will appear here...'}</span>
                    </div>

                    {ctaLabel && (
                      <span className="px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-[10px] shrink-0">
                        {ctaLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
