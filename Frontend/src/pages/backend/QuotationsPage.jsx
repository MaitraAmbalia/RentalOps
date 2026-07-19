import { useState, useEffect } from 'react';
import { FileText, Plus, Send, Download, CheckCircle, Clock, XCircle, Search, RefreshCw, AlertCircle, Calendar, User, ShoppingBag } from 'lucide-react';
import { quotationService } from '../../api/quotationService';
import { productService } from '../../api/productService';
import axiosInstance from '../../api/axiosInstance';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [validityDays, setValidityDays] = useState(7);
  const [paymentTermsPercent, setPaymentTermsPercent] = useState(100);
  const [editQuotationId, setEditQuotationId] = useState(null);
  const [rfqInfo, setRfqInfo] = useState(null);
  const [items, setItems] = useState([
    {
      productId: '',
      quantity: 1,
      unit: 'Unit',
      rentalStart: new Date().toISOString().split('T')[0],
      rentalEnd: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    }
  ]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [quotesRes, tplsRes, prodsRes, clientsRes] = await Promise.all([
        quotationService.getQuotations(),
        quotationService.getQuotationTemplates().catch(() => []),
        productService.getProducts().catch(() => []),
        axiosInstance.get('/clients').then(r => r.clients || r).catch(() => []),
      ]);

      setQuotations(Array.isArray(quotesRes) ? quotesRes : []);
      setTemplates(Array.isArray(tplsRes) ? tplsRes : []);
      setProducts(Array.isArray(prodsRes) ? prodsRes : []);
      setClients(Array.isArray(clientsRes) ? clientsRes : []);
    } catch (err) {
      console.error('Failed to load quotation page data:', err);
      showToast('Failed to load quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      if (tpl.quotationValidityDays) setValidityDays(tpl.quotationValidityDays);
      if (tpl.paymentTermsPercent) setPaymentTermsPercent(tpl.paymentTermsPercent);
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 1,
        unit: 'Unit',
        rentalStart: new Date().toISOString().split('T')[0],
        rentalEnd: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleEditClick = (q) => {
    setEditQuotationId(q.id);
    setSelectedClientId(q.clientId || '');
    setSelectedTemplateId(q.quotationTemplateId || '');
    setValidityDays(q.quotationValidityDays || 7);
    setPaymentTermsPercent(q.paymentTermsPercent || 100);
    
    if (q.status === 'RFQ') {
      setRfqInfo({
        categoryName: q.category?.name || 'Any Category',
        description: q.rfqDescription || 'No description provided',
        quantity: q.rfqQuantity || 1,
        rentalStart: q.rfqRentalStart ? q.rfqRentalStart.split('T')[0] : '',
        rentalEnd: q.rfqRentalEnd ? q.rfqRentalEnd.split('T')[0] : '',
      });
      setItems([
        {
          productId: '',
          quantity: q.rfqQuantity || 1,
          unit: 'Unit',
          rentalStart: q.rfqRentalStart ? q.rfqRentalStart.split('T')[0] : new Date().toISOString().split('T')[0],
          rentalEnd: q.rfqRentalEnd ? q.rfqRentalEnd.split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        }
      ]);
    } else {
      setRfqInfo(null);
      if (q.items && q.items.length > 0) {
        setItems(q.items.map(it => ({
          productId: it.productId,
          quantity: it.quantity,
          unit: it.unit || 'Unit',
          rentalStart: it.rentalStart ? it.rentalStart.split('T')[0] : new Date().toISOString().split('T')[0],
          rentalEnd: it.rentalEnd ? it.rentalEnd.split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        })));
      } else {
        setItems([
          {
            productId: '',
            quantity: 1,
            unit: 'Unit',
            rentalStart: new Date().toISOString().split('T')[0],
            rentalEnd: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          }
        ]);
      }
    }
    setShowModal(true);
  };

  const handleOpenCreateModal = () => {
    setEditQuotationId(null);
    setRfqInfo(null);
    setSelectedClientId('');
    setSelectedTemplateId('');
    setValidityDays(7);
    setPaymentTermsPercent(100);
    setItems([
      {
        productId: '',
        quantity: 1,
        unit: 'Unit',
        rentalStart: new Date().toISOString().split('T')[0],
        rentalEnd: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      }
    ]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditQuotationId(null);
    setRfqInfo(null);
  };

  const handleSaveSubmit = async (e, targetStatus) => {
    e.preventDefault();
    if (!selectedClientId) {
      showToast('Please select a client', 'error');
      return;
    }

    const validItems = items.filter(it => it.productId);
    if (validItems.length === 0) {
      showToast('Please add at least one valid product line', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clientId: selectedClientId,
        quotationTemplateId: selectedTemplateId || undefined,
        quotationValidityDays: Number(validityDays),
        paymentTermsPercent: Number(paymentTermsPercent),
        status: targetStatus || 'DRAFT',
        items: validItems.map(it => ({
          productId: it.productId,
          quantity: Number(it.quantity),
          unit: it.unit,
          rentalStart: new Date(it.rentalStart).toISOString(),
          rentalEnd: new Date(it.rentalEnd).toISOString(),
        }))
      };

      if (editQuotationId) {
        const updated = await quotationService.updateQuotation(editQuotationId, payload);
        setQuotations(prev => prev.map(q => q.id === editQuotationId ? updated : q));
        showToast(targetStatus === 'SENT' ? 'Quotation sent successfully!' : 'Quotation saved as draft!');
      } else {
        const created = await quotationService.createQuotation(payload);
        setQuotations(prev => [created, ...prev]);
        showToast('Quotation created successfully!');
      }
      setShowModal(false);
      setEditQuotationId(null);
      setRfqInfo(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save quotation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async (id) => {
    setSendingId(id);
    try {
      await quotationService.sendQuotationEmail(id);
      setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'SENT' } : q));
      showToast('Quotation PDF emailed to client successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to email quotation', 'error');
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await quotationService.downloadQuotationPDF(id);
      showToast('PDF downloaded');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PDF', 'error');
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const clientName = q.client ? `${q.client.firstName} ${q.client.lastName}` : '';
    const matchesSearch = !searchQuery || q.id.toLowerCase().includes(searchQuery.toLowerCase()) || clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1"><CheckCircle className="h-3 w-3" /><span>Confirmed & Signed</span></span>;
      case 'SENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center space-x-1"><Send className="h-3 w-3" /><span>Sent via Email</span></span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1"><XCircle className="h-3 w-3" /><span>Cancelled</span></span>;
      case 'RFQ':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center space-x-1"><FileText className="h-3 w-3" /><span>RFQ</span></span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1"><Clock className="h-3 w-3" /><span>Draft</span></span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-2xl animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-main pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Commercial Quotations</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Generate proposals, email PDF quotes to clients, and convert signed quotes into live orders.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-bg-card border border-border-main p-4 rounded-2xl">
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            placeholder="Search by client or Quote ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-bg-main border border-border-main rounded-xl pl-9 pr-4 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'RFQ', 'DRAFT', 'SENT', 'CONFIRMED', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-bg-main text-text-muted border border-border-main hover:text-text-main'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-20 bg-bg-card border border-border-main rounded-2xl">
          <FileText className="h-12 w-12 mx-auto text-text-muted opacity-40 mb-3" />
          <p className="font-bold text-text-main">No Quotations Found</p>
          <p className="text-xs text-text-muted mt-1">Create your first commercial quotation to start emailing clients.</p>
        </div>
      ) : (
        <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-main/50 border-b border-border-main text-text-muted font-bold uppercase">
                <tr>
                  <th className="px-5 py-3.5">Quotation ID</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Terms / Validity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {filteredQuotations.map(q => (
                  <tr key={q.id} className="hover:bg-bg-main/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-text-main">
                      #{q.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-text-main">
                        {q.client ? `${q.client.firstName} ${q.client.lastName}` : 'Direct Client'}
                      </div>
                      <div className="text-[11px] text-text-muted">{q.client?.email || 'No email attached'}</div>
                    </td>
                    <td className="px-5 py-4">
                      {q.status === 'RFQ' ? (
                        <div>
                          <span className="font-bold text-purple-500">RFQ Quote Request</span>
                          <div className="text-[11px] text-text-muted truncate max-w-[180px]">
                            {q.category?.name || 'Any Category'} - {q.rfqDescription}
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-text-main">{q.items?.length || 0} product(s)</span>
                          <div className="text-[11px] text-text-muted truncate max-w-[180px]">
                            {q.items?.map(it => it.product?.name).filter(Boolean).join(', ') || 'N/A'}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-4 text-text-muted">
                      <div>Validity: <strong className="text-text-main">{q.quotationValidityDays || 7} days</strong></div>
                      <div>Deposit: <strong className="text-text-main">{q.paymentTermsPercent || 100}%</strong></div>
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(q.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {['RFQ', 'DRAFT'].includes(q.status) && (
                          <button
                            onClick={() => handleEditClick(q)}
                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all flex items-center space-x-1"
                            title="Build or Edit Quotation"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>{q.status === 'RFQ' ? 'Build' : 'Edit'}</span>
                          </button>
                        )}
                        
                        {q.status !== 'RFQ' && (
                          <>
                            <button
                              onClick={() => handleDownloadPDF(q.id)}
                              className="px-2.5 py-1.5 bg-bg-main hover:bg-bg-main/80 border border-border-main rounded-lg text-text-muted hover:text-text-main font-bold transition-all flex items-center space-x-1"
                              title="Download PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">PDF</span>
                            </button>

                            <button
                              onClick={() => handleSendEmail(q.id)}
                              disabled={sendingId === q.id}
                              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg font-bold transition-all flex items-center space-x-1.5 disabled:opacity-50"
                              title="Send PDF to Client Email"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>{sendingId === q.id ? 'Sending...' : 'Send Email'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border-main rounded-2xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <h2 className="text-lg font-extrabold text-text-main flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>{editQuotationId ? (rfqInfo ? 'Build Quote Proposal from RFQ' : 'Edit Quotation Proposal') : 'New Quotation Proposal'}</span>
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-text-muted hover:text-text-main rounded-lg hover:bg-bg-main"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4">
              {rfqInfo && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-text-main space-y-2">
                  <div className="font-extrabold uppercase text-purple-400 tracking-wider flex items-center space-x-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Client Request for Quotation (RFQ)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-muted">
                    <div>Category: <strong className="text-text-main">{rfqInfo.categoryName}</strong></div>
                    <div>Requested Qty: <strong className="text-text-main">{rfqInfo.quantity}</strong></div>
                    <div className="col-span-2">Rental Dates: <strong className="text-text-main">{rfqInfo.rentalStart} to {rfqInfo.rentalEnd}</strong></div>
                  </div>
                  <div className="border-t border-purple-500/10 pt-2 text-text-muted">
                    Details: <span className="italic">"{rfqInfo.description}"</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Selection */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Target Client *</label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quotation Template */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Quotation Template (Optional)</label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleTemplateSelect(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Custom (No Template) --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.quotationValidityDays} days, {t.paymentTermsPercent}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validity Days */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Validity Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={e => setValidityDays(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Deposit Percent */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Required Deposit (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={paymentTermsPercent}
                    onChange={e => setPaymentTermsPercent(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-xs text-text-main focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t border-border-main pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-main uppercase">Rental Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Product Line</span>
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-bg-main/40 p-3 rounded-xl border border-border-main items-center">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-text-muted font-bold uppercase mb-0.5">Product</label>
                      <select
                        required
                        value={item.productId}
                        onChange={e => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full bg-bg-main border border-border-main rounded-lg p-1.5 text-xs text-text-main focus:outline-none"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (₹{Number(p.price || 0).toFixed(2)})</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-text-muted font-bold uppercase mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full bg-bg-main border border-border-main rounded-lg p-1.5 text-xs text-text-main focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-5 grid grid-cols-2 gap-1">
                      <div>
                        <label className="block text-[10px] text-text-muted font-bold uppercase mb-0.5">Start</label>
                        <input
                          type="date"
                          value={item.rentalStart}
                          onChange={e => handleItemChange(index, 'rentalStart', e.target.value)}
                          className="w-full bg-bg-main border border-border-main rounded-lg p-1 text-[11px] text-text-main focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-text-muted font-bold uppercase mb-0.5">End</label>
                        <input
                          type="date"
                          value={item.rentalEnd}
                          onChange={e => handleItemChange(index, 'rentalEnd', e.target.value)}
                          className="w-full bg-bg-main border border-border-main rounded-lg p-1 text-[11px] text-text-main focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-text-muted hover:text-rose-400"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Action Footer */}
              <div className="flex items-center justify-end space-x-3 border-t border-border-main pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-border-main text-text-muted hover:text-text-main rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveSubmit(e, 'DRAFT')}
                  disabled={saving}
                  className="px-4 py-2 bg-bg-main hover:bg-bg-main/80 border border-border-main text-text-main rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveSubmit(e, 'SENT')}
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? 'Sending...' : 'Send Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
