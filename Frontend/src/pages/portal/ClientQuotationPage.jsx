import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Calendar, ShieldCheck, ArrowRight, ChevronDown, ChevronUp, RefreshCw, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationService } from '../../api/quotationService';
import SignaturePadModal from '../../components/common/SignaturePadModal';

export default function ClientQuotationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDecline = async () => {
    setDeclining(true);
    setError('');
    try {
      await quotationService.updateQuotationStatus(id, 'CANCELLED');
      setSuccess('Quotation proposal has been declined.');
      setQuotation(prev => prev ? { ...prev, status: 'CANCELLED' } : prev);
    } catch (err) {
      console.error(err);
      setError('Failed to decline quotation.');
    } finally {
      setDeclining(false);
    }
  };

  const fetchQuotation = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await quotationService.getQuotationById(id);
      setQuotation(data);
    } catch (err) {
      console.error(err);
      setLoadError('Failed to load quotation details or quotation access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleDownloadPDF = async () => {
    setError('');
    try {
      await quotationService.downloadQuotationPDF(id);
    } catch (err) {
      console.error(err);
      setError('Failed to download PDF quotation.');
    }
  };

  const handleSignatureConfirm = async (signatureData) => {
    setShowSignModal(false);
    setAccepting(true);
    setError('');
    try {
      const res = await quotationService.acceptQuotation(id, signatureData);
      setSuccess('Quotation accepted and confirmed into a live rental order!');
      setQuotation(prev => prev ? { ...prev, status: 'CONFIRMED' } : prev);
      
      // Redirect to Order Detail after 2 seconds
      setTimeout(() => {
        if (res.order?.id) {
          navigate(`/account/orders/${res.order.id}`);
        } else {
          navigate('/orders');
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to confirm quotation.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (loadError || !quotation) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-text-main">Quotation Unavailable</h2>
        <p className="text-sm text-text-muted">{loadError || 'Unable to load quotation.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const isConfirmed = quotation.status === 'CONFIRMED';
  const vendorName = quotation.vendor?.companyName || 'Rental Operations';

  const agreementDataForModal = quotation ? {
    orderNumber: quotation.id.slice(0, 8).toUpperCase(),
    vendorName: vendorName,
    clientName: quotation.client ? `${quotation.client.firstName} ${quotation.client.lastName}` : 'Client',
    rentalPeriod: quotation.items?.[0] 
      ? `${new Date(quotation.items[0].rentalStart).toLocaleDateString()} to ${new Date(quotation.items[0].rentalEnd).toLocaleDateString()}` 
      : 'Specified Rental Dates',
    items: (quotation.items || []).map(it => ({
      productName: it.product?.name || 'Equipment',
      quantity: it.quantity,
      totalPrice: Number(it.product?.price || 0) * Number(it.quantity || 1)
    })),
    financialSummary: {
      securityDepositAmount: Number(quotation.items?.reduce((sum, item) => sum + (Number(item.product?.price || 0) * Number(item.quantity || 1)), 0) || 0) * (Number(quotation.paymentTermsPercent || 100) / 100)
    },
    clauses: [
      {
        title: "1. Acceptance of Proposal",
        text: "I confirm my acceptance of the commercial proposal, the rental duration, and the listed rental items."
      },
      {
        title: "2. Downpayment & Confirmation",
        text: `I agree to the required downpayment of ${quotation.paymentTermsPercent || 100}% upon acceptance.`
      },
      {
        title: "3. Conversion to Rental Order",
        text: "Upon signature, this quotation proposal is automatically accepted and converted to an active Sales Order."
      }
    ]
  } : null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Top Notification */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Action Error Notification */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm font-bold flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clean Header */}
      <div className="bg-bg-card border border-border-main rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <FileText className="h-40 w-40 text-primary" />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-primary">Commercial Proposal</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main mt-1">
              Quotation #{quotation.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-text-muted mt-1">Issued by <strong className="text-text-main">{vendorName}</strong></p>
          </div>

          <div className="flex items-center space-x-2">
            {quotation.status === 'CONFIRMED' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                <CheckCircle className="h-4 w-4" />
                <span>CONFIRMED & SIGNED</span>
              </span>
            ) : quotation.status === 'CANCELLED' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
                <XCircle className="h-4 w-4" />
                <span>CANCELLED / DECLINED</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center space-x-1.5">
                <Clock className="h-4 w-4" />
                <span>PENDING APPROVAL</span>
              </span>
            )}
          </div>
        </div>

        {/* Clean Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-bg-main/50 border border-border-main rounded-2xl p-4 text-xs">
          <div>
            <span className="text-text-muted font-bold block">Quotation Validity</span>
            <span className="text-text-main font-semibold text-sm mt-0.5 block">{quotation.quotationValidityDays || 7} Days</span>
          </div>
          <div>
            <span className="text-text-muted font-bold block">Required Deposit</span>
            <span className="text-text-main font-semibold text-sm mt-0.5 block">{quotation.paymentTermsPercent || 100}%</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-text-muted font-bold block">Items Included</span>
            <span className="text-text-main font-semibold text-sm mt-0.5 block">{quotation.items?.length || 0} Line Items</span>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Rental Equipment & Dates</h3>
          <div className="divide-y divide-border-main border border-border-main rounded-2xl overflow-hidden bg-bg-main/30">
            {(quotation.items || []).map((item, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-text-main text-sm">{item.product?.name || 'Rental Item'}</div>
                  <div className="text-text-muted flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {item.rentalStart ? new Date(item.rentalStart).toLocaleDateString() : ''} ➔ {item.rentalEnd ? new Date(item.rentalEnd).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <span className="text-text-muted">Quantity</span>
                  <span className="font-extrabold text-text-main text-sm">{item.quantity} {item.unit || 'Unit'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accordion Terms & Conditions */}
        <div className="border border-border-main rounded-2xl overflow-hidden bg-bg-main/30">
          <button
            onClick={() => setShowTerms(v => !v)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-text-main hover:bg-bg-main/60 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Terms & Conditions & Rental Policies</span>
            </div>
            {showTerms ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showTerms && (
            <div className="p-5 border-t border-border-main text-xs text-text-muted space-y-2 bg-bg-main/80">
              <p>• Quotation valid for {quotation.quotationValidityDays || 7} days from issuance.</p>
              <p>• Downpayment requirement: {quotation.paymentTermsPercent || 100}% required upon confirmation.</p>
              <p>• Late returns beyond agreed rental end date incur standard hourly late fees as specified in vendor policy.</p>
              {quotation.quotationTemplate?.footerHtml && (
                <div className="pt-2 border-t border-border-main" dangerouslySetInnerHTML={{ __html: quotation.quotationTemplate.footerHtml }} />
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-5 py-3 bg-bg-main hover:bg-bg-main/80 text-text-main border border-border-main rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Official PDF</span>
          </button>

          {quotation.status !== 'CONFIRMED' && quotation.status !== 'CANCELLED' && (
            <>
              <button
                onClick={() => setShowDeclineConfirm(true)}
                disabled={declining || accepting}
                className="w-full sm:w-auto px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{declining ? 'Declining...' : 'Decline Proposal'}</span>
              </button>

              <button
                onClick={() => setShowSignModal(true)}
                disabled={accepting || declining}
                className="w-full sm:flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-bold transition-all shadow-xl shadow-primary/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{accepting ? 'Processing Confirmation...' : 'E-Sign & Accept Quotation'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-main rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-text-main">Decline Proposal</h3>
                <p className="text-[10px] text-text-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to decline this commercial proposal? The vendor will be notified that you turned down this quote, and it will be archived.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeclineConfirm(false)}
                className="px-4 py-2.5 bg-bg-main hover:bg-bg-main/80 text-text-main border border-border-main rounded-xl text-xs font-bold transition-all"
              >
                Keep Proposal
              </button>
              <button
                onClick={async () => {
                  setShowDeclineConfirm(false);
                  await handleDecline();
                }}
                disabled={declining}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                <span>{declining ? 'Declining...' : 'Yes, Decline Proposal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Signature Modal */}
      {showSignModal && (
        <SignaturePadModal
          isOpen={showSignModal}
          onClose={() => setShowSignModal(false)}
          agreementData={agreementDataForModal}
          onSignSuccess={handleSignatureConfirm}
        />
      )}
    </div>
  );
}
