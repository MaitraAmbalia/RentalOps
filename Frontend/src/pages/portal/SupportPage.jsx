import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, HelpCircle, Package, MessageSquare, Send } from 'lucide-react';
import { queryService } from '../../api/queryService';
import { orderService } from '../../api/orderService';

export default function SupportPage() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.orderId ? 'DISPUTE' : 'GENERAL');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(location.state?.orderId || '');
  const [queryType, setQueryType] = useState('DAMAGED_GOOD');
  const [description, setDescription] = useState('');
  
  const [generalForm, setGeneralForm] = useState({
    name: '',
    email: '',
    category: 'RENTAL_EXTENSION',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [error, setError] = useState('');

  // First FAQ item open by default matching design
  const [expandedFaq, setExpandedFaq] = useState(0);

  useEffect(() => { 
    fetchOrdersList(); 
  }, []);

  const fetchOrdersList = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
      if (data && data.length > 0 && !selectedOrderId) {
        setSelectedOrderId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !description.trim()) {
      setError('Please select an order and describe the issue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const chosenOrder = orders.find(o => o.id === selectedOrderId);
      const res = await queryService.createQuery({
        orderId: selectedOrderId,
        orderNumber: chosenOrder?.orderNumber || 'SO0000',
        queryType,
        description
      });
      setTicketRef(res.id ? `TKT-${res.id.slice(0, 8).toUpperCase()}` : `TKT-${Date.now().toString().slice(-6)}`);
      setSuccess(true);
      setDescription('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    if (!generalForm.name.trim() || !generalForm.message.trim()) {
      setError('Please provide your name and message.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setTicketRef(`INQ-${Date.now().toString().slice(-6)}`);
      setSuccess(true);
      setGeneralForm({ name: '', email: '', category: 'RENTAL_EXTENSION', message: '' });
      setLoading(false);
    }, 500);
  };

  const ISSUE_TYPES = [
    { value: 'DAMAGED_GOOD', label: 'Damaged Product', Icon: AlertTriangle },
    { value: 'PRODUCT_MISSING', label: 'Missing Accessories', Icon: HelpCircle },
    { value: 'OTHER', label: 'Deposit / Other Query', Icon: MessageSquare },
  ];

  const FAQS = [
    {
      q: "How does the refundable security deposit work?",
      a: "Your security deposit is temporarily held during the rental period. Once equipment is returned and inspected, the deposit is refunded to your original payment method within 24 hours."
    },
    {
      q: "What do I need to present for pickup or delivery?",
      a: "Please present a valid government-issued photo ID matching the name entered during checkout. For deliveries, our courier will verify recipient identity upon handoff."
    },
    {
      q: "Can I extend my rental duration?",
      a: "Yes. You can request a rental extension directly through your account dashboard or submit an inquiry below at least 4 hours before your scheduled return time."
    },
    {
      q: "What happens if equipment gets damaged?",
      a: "Standard wear and tear is expected. For accidental or functional damage, please submit an issue report with photos. Repair costs will be assessed and deducted from the deposit, with any remaining balance refunded."
    },
    {
      q: "How do cancellations and refunds work?",
      a: "Orders cancelled prior to dispatch or pickup receive a 100% refund of both the rental fee and the security deposit to your original payment method."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-sans">

      {/* Main FAQ Section (Primary Visual Hierarchy) */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 uppercase">
          QUESTIONS
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main font-sans">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Everything you need to know before you rent equipment or manage your orders.
        </p>
      </div>

      {/* FAQ Accordion Card */}
      <div className="bg-bg-card border border-border-main rounded-2xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto">
        {FAQS.map((faq, idx) => {
          const isOpen = expandedFaq === idx;
          return (
            <div
              key={idx}
              className={`transition-all ${idx !== FAQS.length - 1 ? 'border-b border-border-main/60 pb-5 mb-5' : ''}`}
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(isOpen ? null : idx)}
                className="w-full text-left flex items-center justify-between gap-4 group cursor-pointer select-none"
              >
                <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                  {faq.q}
                </span>
                <span className="text-lg font-medium text-orange-500 shrink-0 w-6 text-right select-none leading-none">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed pt-3 pr-6">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact / Inquiries Section */}
      <div className="max-w-3xl mx-auto mt-16 pt-10 border-t border-border-main space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-text-main font-sans">Still have questions?</h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Can't find what you're looking for? Submit an inquiry or report an issue with an order.
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-bg-card border border-border-main rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('GENERAL'); setSuccess(false); setError(''); }}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'GENERAL' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
              }`}
            >
              General Inquiry
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('DISPUTE'); setSuccess(false); setError(''); }}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'DISPUTE' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Report Order Issue
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-bg-card border border-border-main rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-text-main">Request Submitted</h3>
              <p className="text-xs text-text-muted mt-1">
                Your reference ID is <span className="font-mono font-semibold text-text-main">{ticketRef}</span>. Our support team will get back to you shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Submit another request
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Forms */}
        {!success && (
          <div className="bg-bg-card border border-border-main rounded-2xl p-6 sm:p-8 shadow-sm">
            {activeTab === 'GENERAL' ? (
              <form onSubmit={handleGeneralSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-text-main text-[11px] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={generalForm.name}
                      onChange={e => setGeneralForm({ ...generalForm, name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full bg-bg-main border border-border-main text-text-main rounded-lg p-2.5 outline-none focus:border-primary transition-colors placeholder-text-muted"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-main text-[11px] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={generalForm.email}
                      onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full bg-bg-main border border-border-main text-text-main rounded-lg p-2.5 outline-none focus:border-primary transition-colors placeholder-text-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-main text-[11px] mb-1">Topic</label>
                  <select
                    value={generalForm.category}
                    onChange={e => setGeneralForm({ ...generalForm, category: e.target.value })}
                    className="w-full bg-bg-main border border-border-main text-text-main rounded-lg p-2.5 outline-none focus:border-primary transition-colors"
                  >
                    <option value="RENTAL_EXTENSION">Rental Extension Request</option>
                    <option value="DEPOT_PICKUP">Pickup & Identification</option>
                    <option value="DEPOSIT_QUERY">Security Deposit & Refund</option>
                    <option value="EQUIPMENT_SPEC">Equipment Specifications</option>
                    <option value="OTHER">Other Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-main text-[11px] mb-1">Message</label>
                  <textarea
                    rows="4"
                    required
                    value={generalForm.message}
                    onChange={e => setGeneralForm({ ...generalForm, message: e.target.value })}
                    placeholder="Describe your inquiry..."
                    className="w-full bg-bg-main border border-border-main text-text-main rounded-lg p-2.5 outline-none focus:border-primary transition-colors placeholder-text-muted"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Submitting...' : 'Send Inquiry'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleDisputeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-text-main text-[11px] mb-1">Associated Rental Order</label>
                  <select
                    value={selectedOrderId}
                    onChange={e => setSelectedOrderId(e.target.value)}
                    className="w-full bg-bg-main border border-border-main text-text-main rounded-lg p-2.5 outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select an order...</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        Order #{o.orderNumber || o.id.slice(0, 8).toUpperCase()} — {o.items?.[0]?.product?.name || o.product?.name || 'Rental'} ({new Date(o.rentalStartDate || o.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  {orders.length === 0 && (
                    <p className="text-[11px] text-text-muted mt-1">
                      No active orders found on your account. You can submit a general inquiry above.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-text-main text-[11px] mb-1">Issue Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ISSUE_TYPES.map(({ value, label, Icon }) => {
                      const isSelected = queryType === value;
                      return (
                        <label
                          key={value}
                          className={`flex items-center space-x-2.5 p-3 border rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-primary font-semibold'
                              : 'border-border-main text-text-muted hover:text-text-main'
                          }`}
                        >
                          <input
                            type="radio" 
                            name="queryType" 
                            value={value}
                            checked={isSelected} 
                            onChange={() => setQueryType(value)}
                            className="sr-only"
                          />
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="text-xs">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-main text-[11px] mb-1">Issue Description</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Please describe the issue in detail..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-bg-main border border-border-main text-text-main rounded-lg p-2.5 outline-none focus:border-primary transition-colors placeholder-text-muted"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedOrderId}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>{loading ? 'Submitting...' : 'Submit Issue Report'}</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
