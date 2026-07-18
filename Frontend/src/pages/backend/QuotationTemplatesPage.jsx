import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Save, ChevronDown, ChevronUp, Star, StarOff, RefreshCw, AlertCircle } from 'lucide-react';
import { quotationService } from '../../api/quotationService';

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    name: '',
    headerHtml: '',
    footerHtml: '',
    quotationValidityDays: 7,
    paymentTermsPercent: 100,
    isDefault: false,
  };
  const [form, setForm] = useState(emptyForm);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await quotationService.getQuotationTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Template name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const created = await quotationService.createQuotationTemplate({
        ...form,
        quotationValidityDays: Number(form.quotationValidityDays),
        paymentTermsPercent: Number(form.paymentTermsPercent),
      });
      setTemplates(prev => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      showToast('Template created successfully');
    } catch (err) {
      showToast('Failed to create template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quotation template?')) return;
    try {
      await quotationService.deleteQuotationTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      showToast('Template deleted');
    } catch (err) {
      showToast('Failed to delete template', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-2xl animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between border-b border-border-main pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Quotation Templates</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Create reusable header/footer layouts for your rental quotations.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchTemplates}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-bg-card border border-border-main rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-text-main">New Quotation Template</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Template Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Home Rental Furniture"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Quotation Validity (days)</label>
              <input
                type="number"
                min="1"
                value={form.quotationValidityDays}
                onChange={e => setForm(p => ({ ...p, quotationValidityDays: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Payment Terms (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.paymentTermsPercent}
                onChange={e => setForm(p => ({ ...p, paymentTermsPercent: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Header HTML</label>
              <textarea
                rows={5}
                placeholder="<h1>Company Name</h1><p>Your header content here...</p>"
                value={form.headerHtml}
                onChange={e => setForm(p => ({ ...p, headerHtml: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main font-mono focus:border-primary focus:outline-none resize-y"
              />
              {form.headerHtml && (
                <details className="mt-2">
                  <summary className="text-xs text-primary cursor-pointer font-semibold">Preview Header</summary>
                  <div
                    className="mt-2 p-4 bg-white text-slate-900 rounded-xl border border-border-main text-sm"
                    dangerouslySetInnerHTML={{ __html: form.headerHtml }}
                  />
                </details>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Footer HTML</label>
              <textarea
                rows={4}
                placeholder="<p>Terms & Conditions | Contact: info@company.com</p>"
                value={form.footerHtml}
                onChange={e => setForm(p => ({ ...p, footerHtml: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main font-mono focus:border-primary focus:outline-none resize-y"
              />
              {form.footerHtml && (
                <details className="mt-2">
                  <summary className="text-xs text-primary cursor-pointer font-semibold">Preview Footer</summary>
                  <div
                    className="mt-2 p-4 bg-white text-slate-900 rounded-xl border border-border-main text-sm"
                    dangerouslySetInnerHTML={{ __html: form.footerHtml }}
                  />
                </details>
              )}
            </div>

            <div className="sm:col-span-2 flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
                className="w-4 h-4 accent-primary rounded"
              />
              <label htmlFor="isDefault" className="text-xs font-semibold text-text-muted cursor-pointer">
                Set as Default Template
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main bg-bg-main border border-border-main rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Creating…' : 'Create Template'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Template List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-text-main mb-1">No Templates Yet</p>
          <p className="text-sm">Create your first quotation template to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-bg-card border border-border-main rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-text-main text-sm">{tpl.name}</span>
                      {tpl.isDefault && (
                        <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-lg font-bold">DEFAULT</span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">
                      Valid {tpl.quotationValidityDays} days · {tpl.paymentTermsPercent}% payment terms
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
                  >
                    {expandedId === tpl.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedId === tpl.id && (
                <div className="border-t border-border-main px-5 py-4 space-y-4 bg-bg-main/50">
                  {tpl.headerHtml && (
                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase mb-2">Header Preview</p>
                      <div
                        className="p-4 bg-white text-slate-900 rounded-xl border border-border-main text-sm"
                        dangerouslySetInnerHTML={{ __html: tpl.headerHtml }}
                      />
                    </div>
                  )}
                  {tpl.footerHtml && (
                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase mb-2">Footer Preview</p>
                      <div
                        className="p-4 bg-white text-slate-900 rounded-xl border border-border-main text-sm"
                        dangerouslySetInnerHTML={{ __html: tpl.footerHtml }}
                      />
                    </div>
                  )}
                  {!tpl.headerHtml && !tpl.footerHtml && (
                    <div className="flex items-center space-x-2 text-xs text-text-muted">
                      <AlertCircle className="h-4 w-4" />
                      <span>No header or footer HTML configured for this template.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
