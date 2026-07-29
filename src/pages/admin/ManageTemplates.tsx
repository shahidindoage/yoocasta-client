import { useState, useEffect } from 'react';
import { getEmailTemplates, getEmailTemplateByKey, updateEmailTemplate } from '../../api/admin.api';
import HtmlEditor from '../../components/HtmlEditor';

interface Template {
  id: string;
  templateKey: string;
  subject: string;
  body: string;
  description: string;
}

const ManageTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getEmailTemplates()
      .then((res) => setTemplates(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (key: string) => {
    try {
      const res = await getEmailTemplateByKey(key);
      const tpl = res.data.data;
      setSelected(tpl);
      setSubject(tpl.subject);
      setBody(tpl.body);
      setSuccess('');
    } catch {}
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSuccess('');
    try {
      await updateEmailTemplate(selected.templateKey, { subject, body });
      setSuccess('Template updated successfully');
      setTemplates((prev) => prev.map((t) => t.id === selected.id ? { ...t, subject } : t));
    } catch {
      setSuccess('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="w-72 shrink-0 bg-white border border-stone-200 overflow-y-auto">
        <div className="p-4 border-b border-stone-100">
          <h2 className="text-sm font-black text-[#3835A4]">Email Templates</h2>
          <p className="text-[10px] text-stone-400 mt-1">{templates.length} templates</p>
        </div>
        {loading ? (
          <div className="p-4 text-xs text-stone-400 font-bold">Loading...</div>
        ) : (
          templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelect(tpl.templateKey)}
              className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer ${
                selected?.templateKey === tpl.templateKey ? 'bg-[#3835A4]/5 border-l-2 border-l-[#3835A4]' : ''
              }`}
            >
              <div className="text-xs font-bold text-stone-700 capitalize">{tpl.templateKey.replace(/_/g, ' ')}</div>
              <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{tpl.subject}</div>
            </button>
          ))
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white border border-stone-200 p-6 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-stone-400 text-sm font-bold">
            Select a template to edit
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl">
            <div>
              <h3 className="text-lg font-black text-[#3835A4] capitalize">{selected.templateKey.replace(/_/g, ' ')}</h3>
              <p className="text-xs text-stone-500 mt-1">{selected.description}</p>
            </div>

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Subject</label>
              <input
                type="text" value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Email Body (HTML)</label>
              <HtmlEditor key={selected.templateKey} value={body} onChange={setBody} />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave} disabled={saving}
                className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTemplates;
